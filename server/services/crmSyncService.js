const axios = require('axios');

const DEFAULT_TIMEOUT = 12000;
let cachedToken = null;
let tokenFetchedAt = 0;

const getConfig = () => ({
    baseURL: String(process.env.CRM_BASE_URL || '').replace(/\/$/, ''),
    email: process.env.CRM_EMAIL,
    password: process.env.CRM_PASSWORD,
    timeout: Number(process.env.CRM_TIMEOUT_MS || DEFAULT_TIMEOUT),
    enabled: String(process.env.CRM_SYNC_ENABLED || '').toLowerCase() === 'true'
});

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
    const response = await client.post('/api/auth/login', { email, password });
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
    const headers = await authHeaders();
    const response = await withRetry(
        () => client.get('/api/clients', { headers, params: { search: email, limit: 50 } }),
        'CRM client search'
    );

    const clients = response?.data?.clients || [];
    return clients.find((item) => String(item.email || '').toLowerCase() === String(email).toLowerCase()) || null;
};

const createOrGetClient = async ({ fullName, email, phone, addressText, source, notes }) => {
    const existing = await findClientByEmail(email);
    if (existing?._id) {
        return existing;
    }

    const { firstName, lastName } = splitName(fullName);
    const headers = await authHeaders();
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
        () => client.post('/api/clients', payload, { headers }),
        'CRM client create'
    );

    return response?.data?.client || null;
};

const createProspect = async ({ fullName, email, phone, company, notes, stage = 'new' }) => {
    const { firstName, lastName } = splitName(fullName);
    const headers = await authHeaders();
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

    await withRetry(() => client.post('/api/prospects', payload, { headers }), 'CRM prospect create');
};

const addClientPurchase = async ({ clientId, product, amount, status, notes, invoiceNumber }) => {
    const headers = await authHeaders();
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
        () => client.post(`/api/clients/${clientId}/purchase`, payload, { headers }),
        'CRM purchase add'
    );
};

const syncContactToCrm = async ({ name, email, phoneNumber, subject, message }) => {
    if (!isEnabledAndConfigured()) return;

    const notes = `Contact enquiry\nSubject: ${subject || ''}\nMessage: ${message || ''}`;
    await createProspect({
        fullName: name,
        email,
        phone: phoneNumber,
        company: '',
        notes,
        stage: 'new'
    });
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
};

const fireAndForget = (promiseFactory, label) => {
    promiseFactory().catch((error) => {
        console.error(`[CRM Sync] ${label} error:`, error.message);
    });
};

module.exports = {
    getCrmSyncStatus,
    syncContactToCrm,
    syncServiceBookingToCrm,
    syncOrderToCrm,
    fireAndForget
};
