const axios = require('axios');

const DEFAULT_TIMEOUT = 12000;
let cachedToken = null;
let tokenFetchedAt = 0;

const normalizeBaseUrl = (value) => String(value || '')
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/i, '');

const getConfig = () => ({
    baseURL: normalizeBaseUrl(process.env.CRM_BASE_URL),
    email: process.env.CRM_EMAIL,
    password: process.env.CRM_PASSWORD,
    timeout: Number(process.env.CRM_TIMEOUT_MS || DEFAULT_TIMEOUT),
    enabled: String(process.env.CRM_SYNC_ENABLED || '').toLowerCase() === 'true'
});

const isWebsiteEntitySyncEnabled = () =>
    String(process.env.CRM_SYNC_WEBSITE_ENTITIES || '').toLowerCase() === 'true';

const isEnabledAndConfigured = () => {
    const { enabled, baseURL, email, password } = getConfig();
    return Boolean(enabled && baseURL && email && password);
};

const getCrmSyncStatus = () => {
    const config = getConfig();
    return {
        enabled: config.enabled,
        configured: isEnabledAndConfigured(),
        baseURL: config.baseURL || null,
        timeout: config.timeout
    };
};

const extractList = (response, key) => {
    const data = response?.data || response || {};
    return Array.isArray(data?.[key]) ? data[key] : [];
};

const splitName = (fullName = '') => {
    const value = String(fullName || '').trim();
    if (!value) return { firstName: 'Customer', lastName: '-' };

    const parts = value.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return { firstName: parts[0], lastName: '-' };

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' ')
    };
};

const getHttpClient = () => {
    const { baseURL, timeout } = getConfig();
    return axios.create({
        baseURL,
        timeout,
        headers: { 'Content-Type': 'application/json' }
    });
};

const getCrmToken = async () => {
    const { email, password } = getConfig();
    const now = Date.now();

    if (cachedToken && now - tokenFetchedAt < 45 * 60 * 1000) {
        return cachedToken;
    }

    const client = getHttpClient();
    let response;
    try {
        response = await client.post('/api/auth/login', { email, password });
    } catch (legacyLoginError) {
        response = await client.post('/auth/signin', { email, password });
    }
    const token = response?.data?.token;

    if (!token) {
        throw new Error('CRM auth token missing in login response');
    }

    cachedToken = token;
    tokenFetchedAt = now;
    return token;
};

const authHeaders = async () => {
    const token = await getCrmToken();
    return { Authorization: `Bearer ${token}` };
};

const withRetry = async (fn, label, retries = 2) => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const unauthorized = error?.response?.status === 401;
            if (unauthorized) {
                cachedToken = null;
                tokenFetchedAt = 0;
            }
            if (attempt < retries) {
                // retry silently
                continue;
            }
        }
    }
    throw new Error(`${label} failed: ${lastError?.response?.data?.message || lastError?.message}`);
};

const findClientByEmail = async (email) => {
    if (!email) return null;

    const client = getHttpClient();
    const response = await withRetry(
        async () => {
            const headers = await authHeaders();
            return client.get('/api/clients', { headers, params: { search: email, limit: 50 } });
        },
        'CRM client search'
    );

    const clients = extractList(response, 'clients');
    return clients.find((item) => String(item.email || '').toLowerCase() === String(email).toLowerCase()) || null;
};

const createOrGetClient = async ({ fullName, email, phone, addressText, source, notes }) => {
    const existing = await findClientByEmail(email);
    if (existing?._id) {
        return existing;
    }

    const { firstName, lastName } = splitName(fullName);
    const client = getHttpClient();

    const payload = {
        firstName,
        lastName,
        email,
        phone,
        source: source || 'website',
        status: 'lead',
        notes: notes || '',
        address: {
            street: addressText || '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
        }
    };

    const response = await withRetry(
        async () => {
            const headers = await authHeaders();
            return client.post('/api/clients', payload, { headers });
        },
        'CRM client create'
    );

    return response?.data?.client || null;
};

const createProspect = async ({ fullName, email, phone, company, notes, stage = 'new' }) => {
    const { firstName, lastName } = splitName(fullName);
    const client = getHttpClient();

    const payload = {
        firstName,
        lastName,
        email,
        phone,
        company: company || '',
        source: 'website',
        stage,
        notes: notes || ''
    };

    await withRetry(
        async () => {
            const headers = await authHeaders();
            return client.post('/api/prospects', payload, { headers });
        },
        'CRM prospect create'
    );
};

const addClientPurchase = async ({ clientId, product, amount, status, notes, invoiceNumber }) => {
    const client = getHttpClient();

    const payload = {
        product,
        amount,
        status,
        notes,
        invoiceNumber,
        date: new Date()
    };

    await withRetry(
        async () => {
            const headers = await authHeaders();
            return client.post(`/api/clients/${clientId}/purchase`, payload, { headers });
        },
        'CRM purchase add'
    );
};

const upsertWebsiteSyncEntity = async ({ path, payload, label }) => {
    const client = getHttpClient();

    await withRetry(
        async () => {
            const headers = await authHeaders();
            return client.post(path, payload, { headers });
        },
        label
    );
};

const getCrmSyncOverview = async () => {
    const status = getCrmSyncStatus();
    if (!status.configured) {
        return {
            configured: false,
            enabled: status.enabled,
            baseURL: status.baseURL,
            totals: {
                websiteProspects: 0,
                websiteClients: 0,
                websitePurchases: 0
            },
            recentProspects: [],
            recentClients: []
        };
    }

    const client = getHttpClient();

    const [prospectsResp, clientsResp] = await Promise.all([
        withRetry(
            async () => {
                const headers = await authHeaders();
                return client.get('/api/service-management', {
                    headers,
                    params: { source: 'website', page: 1, limit: 10 }
                });
            },
            'CRM website prospects fetch'
        ),
        withRetry(
            async () => {
                const headers = await authHeaders();
                return client.get('/api/clients', {
                    headers,
                    params: { source: 'website', page: 1, limit: 10 }
                });
            },
            'CRM website clients fetch'
        )
    ]);

    const prospects = extractList(prospectsResp, 'prospects');
    const clients = extractList(clientsResp, 'clients');

    const totalProspects = Number(prospectsResp?.data?.total || prospects.length || 0);
    const totalClients = Number(clientsResp?.data?.total || clients.length || 0);
    const totalPurchases = clients.reduce(
        (count, item) => count + (Array.isArray(item?.purchaseHistory) ? item.purchaseHistory.length : 0),
        0
    );

    const pickProspect = (item) => ({
        id: item?._id,
        name: [item?.firstName, item?.lastName].filter(Boolean).join(' ').trim() || 'Unknown',
        email: item?.email || '',
        stage: item?.stage || '',
        source: item?.source || '',
        createdAt: item?.createdAt || null
    });

    const pickClient = (item) => ({
        id: item?._id,
        name: [item?.firstName, item?.lastName].filter(Boolean).join(' ').trim() || 'Unknown',
        email: item?.email || '',
        status: item?.status || '',
        source: item?.source || '',
        purchaseCount: Array.isArray(item?.purchaseHistory) ? item.purchaseHistory.length : 0,
        createdAt: item?.createdAt || null
    });

    return {
        configured: true,
        enabled: status.enabled,
        baseURL: status.baseURL,
        totals: {
            websiteProspects: totalProspects,
            websiteClients: totalClients,
            websitePurchases: totalPurchases
        },
        recentProspects: prospects.map(pickProspect),
        recentClients: clients.map(pickClient)
    };
};

const syncUserToCrm = async (user) => {
    if (!isEnabledAndConfigured()) return;

    const payload = {
        externalUserId: String(user?._id || user?.id || ''),
        name: user?.name || 'Website User',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || '',
        isAdmin: Boolean(user?.isAdmin),
        source: 'website'
    };

    if (!payload.externalUserId) return;

    if (isWebsiteEntitySyncEnabled()) {
        await upsertWebsiteSyncEntity({
            path: '/api/website-sync/users',
            payload,
            label: 'CRM website user sync'
        });
    }
};

const syncContactToCrm = async (contact) => {
    if (!isEnabledAndConfigured()) return;

    const { name, email, phoneNumber, subject, message } = contact || {};
    const externalContactId = String(contact?._id || contact?.id || '').trim();

    const notes = `Contact enquiry\nSubject: ${subject || ''}\nMessage: ${message || ''}`;
    await createProspect({
        fullName: name,
        email,
        phone: phoneNumber,
        company: '',
        notes,
        stage: 'new'
    });

    if (externalContactId && isWebsiteEntitySyncEnabled()) {
        await upsertWebsiteSyncEntity({
            path: '/api/website-sync/contacts',
            payload: {
                externalContactId,
                name: name || 'Website Contact',
                email: email || '',
                phoneNumber: phoneNumber || '',
                subject: subject || '',
                message: message || '',
                source: 'website'
            },
            label: 'CRM website contact sync'
        });
    }
};

const syncServiceBookingToCrm = async (booking) => {
    if (!isEnabledAndConfigured()) return;

    const notes = [
        `Service booking for: ${booking.serviceName || ''}`,
        booking.preferredDate ? `Preferred date: ${new Date(booking.preferredDate).toLocaleDateString('en-IN')}` : '',
        booking.notes ? `Booking notes: ${booking.notes}` : '',
        `Local booking id: ${booking._id}`
    ].filter(Boolean).join('\n');

    await createProspect({
        fullName: booking.customerName,
        email: booking.email,
        phone: booking.phoneNumber,
        company: '',
        notes,
        stage: 'qualified'
    });

    if (isWebsiteEntitySyncEnabled()) {
        await upsertWebsiteSyncEntity({
            path: '/api/website-sync/bookings',
            payload: {
                externalBookingId: String(booking?._id || ''),
                externalUserId: String(booking?.userId || ''),
                serviceId: String(booking?.serviceId || ''),
                serviceName: booking?.serviceName || '',
                servicePrice: Number(booking?.servicePrice || 0),
                customerName: booking?.customerName || '',
                email: booking?.email || '',
                phoneNumber: booking?.phoneNumber || '',
                address: booking?.address || '',
                preferredDate: booking?.preferredDate || null,
                notes: booking?.notes || '',
                source: 'website'
            },
            label: 'CRM website booking sync'
        });
    }
};

const syncOrderToCrm = async (order) => {
    if (!isEnabledAndConfigured()) return;

    const name = order?.shippingAddress?.fullName || 'Website Customer';
    const email = order?.shippingAddress?.email || order?.customerEmail || '';
    const phone = order?.shippingAddress?.phone || order?.customerPhone || '';
    const addressText = [
        order?.shippingAddress?.houseNo,
        order?.shippingAddress?.address,
        order?.shippingAddress?.city,
        order?.shippingAddress?.state,
        order?.shippingAddress?.zipCode
    ].filter(Boolean).join(', ');

    if (!email) return;

    const client = await createOrGetClient({
        fullName: name,
        email,
        phone,
        addressText,
        source: 'website',
        notes: `Created from website order ${order._id}`
    });

    if (!client?._id) return;

    const itemsText = (order.items || [])
        .map((item) => `${item.productName} x${item.quantity}`)
        .join(', ');

    await addClientPurchase({
        clientId: client._id,
        product: itemsText || `Website order ${order._id}`,
        amount: Number(order.totalPrice || 0),
        status: order.status === 'Cancelled' ? 'cancelled' : 'pending',
        notes: `Order status: ${order.status}. Payment status: ${order.paymentStatus || 'Pending'}`,
        invoiceNumber: String(order._id)
    });

    if (isWebsiteEntitySyncEnabled()) {
        await upsertWebsiteSyncEntity({
            path: '/api/website-sync/orders',
            payload: {
                externalOrderId: String(order?._id || ''),
                externalUserId: String(order?.userId || ''),
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                totalPrice: Number(order?.totalPrice || 0),
                totalItems: Number(order?.totalItems || 0),
                status: order?.status || 'Pending',
                paymentStatus: order?.paymentStatus || 'Pending',
                paymentMethod: order?.paymentMethod || '',
                notes: order?.notes || '',
                orderDate: order?.orderDate || new Date(),
                items: Array.isArray(order?.items) ? order.items.map((item) => ({
                    productId: String(item?.productId || ''),
                    productName: item?.productName || '',
                    quantity: Number(item?.quantity || 0),
                    price: Number(item?.price || 0)
                })) : [],
                shippingAddress: order?.shippingAddress || {},
                source: 'website'
            },
            label: 'CRM website order sync'
        });
    }
};

const fireAndForget = (promiseFactory, label) => {
    promiseFactory().catch((error) => {
        console.error(`[CRM Sync] ${label} error:`, error.message);
    });
};

module.exports = {
    getCrmSyncStatus,
    getCrmSyncOverview,
    syncUserToCrm,
    syncContactToCrm,
    syncServiceBookingToCrm,
    syncOrderToCrm,
    fireAndForget
};
