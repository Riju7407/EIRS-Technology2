import fs from 'fs';

const websiteApi = 'https://eirs-technology2-2.onrender.com';
const crmApi = 'https://eirs-technology-crm.onrender.com/api';

const envText = fs.readFileSync('server/.env', 'utf8');
const getEnv = (name) => {
  const match = envText.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
};

const crmEmail = getEnv('CRM_EMAIL');
const crmPassword = getEnv('CRM_PASSWORD');

if (!crmEmail || !crmPassword) {
  throw new Error('CRM_EMAIL/CRM_PASSWORD not found in server/.env');
}

const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const email = `liveverify${ts}@example.com`;
const password = 'Test@123456';
const phone = '9876543210';

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
};

const main = async () => {
  console.log(`EMAIL=${email}`);

  await request(`${websiteApi}/health`);
  await request(`${crmApi}/health`);

  await request(`${websiteApi}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Live Verify User',
      phoneNumber: phone,
      address: 'Test Address Kolkata',
      email,
      password,
      confirmPassword: password,
    }),
  });

  const signin = await request(`${websiteApi}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const websiteToken = signin?.token;
  if (!websiteToken) throw new Error('No website token returned from signin');

  const productsResp = await request(`${websiteApi}/auth/products?page=1&limit=1`, {
    headers: { Authorization: `Bearer ${websiteToken}` },
  });
  const product = productsResp?.data?.[0];
  if (!product?._id) throw new Error('No product found for order creation');

  const contact = await request(`${websiteApi}/auth/contact`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${websiteToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Live Verify User',
      email,
      phoneNumber: phone,
      subject: 'Live CRM sync contact test',
      message: 'Website contact to CRM live verification',
    }),
  });

  const order = await request(`${websiteApi}/auth/orders/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${websiteToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [
        {
          productId: product._id,
          productName: product.productName,
          category: product.category,
          brand: product.brand,
          price: Number(product.price || 0),
          quantity: 1,
          image: product.image,
        },
      ],
      totalPrice: Number(product.price || 0),
      totalItems: 1,
      shippingAddress: {
        fullName: 'Live Verify User',
        email,
        phone,
        houseNo: '1A',
        address: 'Test Street',
        city: 'Kolkata',
        state: 'WB',
        zipCode: '700001',
      },
      paymentMethod: 'CashOnDelivery',
      notes: 'Live CRM sync verification order',
    }),
  });

  const crmLogin = await request(`${crmApi}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: crmEmail, password: crmPassword }),
  });
  const crmToken = crmLogin?.token;
  if (!crmToken) throw new Error('No CRM token returned from CRM login');

  let matchedProspect = null;
  let matchedClient = null;

  for (let i = 0; i < 8; i += 1) {
    const prospects = await request(`${crmApi}/service-management?search=${encodeURIComponent(email)}&limit=50`, {
      headers: { Authorization: `Bearer ${crmToken}` },
    });
    const clients = await request(`${crmApi}/clients?search=${encodeURIComponent(email)}&limit=50`, {
      headers: { Authorization: `Bearer ${crmToken}` },
    });

    matchedProspect = (prospects?.prospects || []).find((p) => p.email === email) || matchedProspect;
    matchedClient = (clients?.clients || []).find((c) => c.email === email) || matchedClient;

    if (matchedProspect && matchedClient) break;
  }

  console.log(`CONTACT_CREATED=${contact?.success === true ? 'YES' : 'NO'}`);
  console.log(`ORDER_CREATED=${order?.success === true ? 'YES' : 'NO'}`);
  console.log(`ORDER_ID=${order?.data?._id || ''}`);
  console.log(`CRM_PROSPECT_FOUND=${matchedProspect ? 'YES' : 'NO'}`);
  console.log(`CRM_CLIENT_FOUND=${matchedClient ? 'YES' : 'NO'}`);
  console.log(`CRM_PROSPECT_ID=${matchedProspect?._id || ''}`);
  console.log(`CRM_CLIENT_ID=${matchedClient?._id || ''}`);
  console.log(`CRM_CLIENT_PURCHASE_COUNT=${Array.isArray(matchedClient?.purchaseHistory) ? matchedClient.purchaseHistory.length : 0}`);
  console.log(`CRM_PROSPECT_SOURCE=${matchedProspect?.source || ''}`);
  console.log(`CRM_CLIENT_SOURCE=${matchedClient?.source || ''}`);
};

main().catch((err) => {
  console.error(`VERIFY_ERROR=${err.message}`);
  process.exit(1);
});
