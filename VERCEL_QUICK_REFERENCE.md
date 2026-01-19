# Vercel MERN Deployment: Quick Reference & Copy-Paste Solutions

## Quick Copy-Paste Solutions

### 1. Fix 405 Method Not Allowed - Minimal Example

Copy this to any API route that's returning 405:

```javascript
// api/your-route.js
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Route to handlers
  switch (req.method) {
    case 'GET':
      res.status(200).json({ message: 'GET works' });
      break;
    case 'POST':
      res.status(201).json({ message: 'POST works' });
      break;
    case 'PUT':
      res.status(200).json({ message: 'PUT works' });
      break;
    case 'DELETE':
      res.status(204).end();
      break;
    default:
      res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
```

---

### 2. Fix CORS Errors - Middleware Template

```javascript
// lib/cors.js
export function withCORS(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://yourdomain.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      res.setHeader('Access-Control-Allow-Origin', 
        process.env.NODE_ENV === 'development' ? '*' : origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}

// Usage in any API route:
// import { withCORS } from '../../lib/cors';
// export default withCORS(handler);
```

---

### 3. Fix Environment Variables

**✅ CORRECT - Frontend component:**

```javascript
// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' ? window.location.origin : '');

export function fetchData() {
  return fetch(`${API_URL}/api/products`);
}
```

**✅ CORRECT - .env.production:**

```
REACT_APP_API_URL=https://yourdomain.com
```

**✅ CORRECT - vercel.json:**

```json
{
  "env": ["REACT_APP_API_URL", "MONGODB_URI", "JWT_SECRET"],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 4. Database Connection Pool (MongoDB)

```javascript
// server/lib/mongodb.js
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });

  await client.connect();
  cachedClient = client;
  cachedDb = client.db('eirs');

  return { client, db: cachedDb };
}
```

---

### 5. JWT Authentication

```javascript
// server/lib/jwt.js
import jwt from 'jsonwebtoken';

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Usage in API:
// import { generateToken, verifyToken } from '../../server/lib/jwt';
// const token = generateToken({ userId: user._id, email: user.email });
```

---

### 6. Frontend API Service (React)

```javascript
// src/services/api.js
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const API_URL = process.env.REACT_APP_API_URL || '';
const api = new APIClient(API_URL);

export const userAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (data) => api.post('/api/auth/register', data),
  logout: () => { localStorage.removeItem('token'); }
};

export const productAPI = {
  getAll: () => api.get('/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`)
};

export default api;
```

---

### 7. Body Parser for Serverless (Handle POST Data)

```javascript
// lib/bodyParser.js
export async function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Usage:
// const data = await parseJSON(req);
```

---

### 8. Error Handler Wrapper

```javascript
// lib/errorHandler.js
export function errorHandler(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      
      const status = error.status || 500;
      const message = error.message || 'Internal Server Error';
      
      res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  };
}

// Usage:
// export default errorHandler(async (req, res) => {
//   // Your handler code
// });
```

---

### 9. Input Validation

```javascript
// lib/validation.js
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateUser(data) {
  const errors = {};
  
  if (!data.name?.trim()) errors.name = 'Name required';
  if (!validateEmail(data.email)) errors.email = 'Valid email required';
  if (!validatePassword(data.password)) errors.password = 'Password min 6 chars';
  
  return Object.keys(errors).length === 0 ? null : errors;
}

// Usage:
// const errors = validateUser(req.body);
// if (errors) return res.status(400).json({ errors });
```

---

### 10. Complete Working Example - Get All Products

```javascript
// api/products/index.js
import { connectToDatabase } from '../../server/lib/mongodb';
import { withCORS } from '../middleware/cors';

async function handler(req, res) {
  // Handle method
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get database connection
    const { db } = await connectToDatabase();
    
    // Query products
    const products = await db
      .collection('products')
      .find({ active: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    
    // Return response
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export default withCORS(handler);
```

---

## Configuration Checklists

### Before Deploying

- [ ] All API routes handle OPTIONS method
- [ ] CORS headers configured in middleware
- [ ] Error handling added to all async functions
- [ ] Environment variables prefixed with REACT_APP_ for frontend
- [ ] Database connection uses pooling
- [ ] JWT secret set as environment variable (not hardcoded)
- [ ] vercel.json created with correct rewrites
- [ ] .env.production file created
- [ ] All dependencies listed in package.json
- [ ] Git repository initialized and committed

### After Deploying to Vercel

- [ ] Set environment variables in Vercel Dashboard
- [ ] Test API endpoints with curl or Postman
- [ ] Verify CORS headers in response
- [ ] Check browser console for errors
- [ ] Test login/authentication flow
- [ ] Test database connectivity
- [ ] Check cold start time
- [ ] Monitor error logs

---

## Common Commands

### Development

```bash
# Start frontend
cd client && npm start

# Start backend (if using separate server)
npm run dev

# Test API locally
curl http://localhost:3001/api/products
```

### Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs --follow

# Delete deployment
vercel rm
```

### Testing

```bash
# Test CORS preflight
curl -X OPTIONS https://yourdomain.com/api/products \
  -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Test GET request
curl https://yourdomain.com/api/products

# Test POST with authentication
curl -X POST https://yourdomain.com/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","price":100}'
```

---

## Environment Variables Template

### Create `.env.production` file

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-32-character-secret-key-generated-above

# Environment
NODE_ENV=production

# Frontend API URL
REACT_APP_API_URL=https://yourdomain.com
```

### Set in Vercel Dashboard

1. Project Settings → Environment Variables
2. Add each variable
3. Select Production
4. Redeploy

---

## Status Codes Reference

```javascript
// Success
200 OK                 // GET, PUT succeeded
201 Created           // POST succeeded
204 No Content        // DELETE succeeded

// Client Error
400 Bad Request       // Invalid input
401 Unauthorized      // Missing/invalid auth
403 Forbidden         // Authenticated but no permission
404 Not Found         // Resource doesn't exist
405 Method Not Allowed // HTTP method not supported
409 Conflict          // Duplicate email, etc.

// Server Error
500 Internal Error    // Unexpected server error
503 Service Unavailable // DB connection failed
```

---

## HTTP Headers Reference

```javascript
// CORS Headers
'Access-Control-Allow-Origin': 'https://yourdomain.com'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
'Access-Control-Allow-Credentials': 'true'

// Caching
'Cache-Control': 'public, max-age=3600'
'Cache-Control': 'no-cache, no-store, must-revalidate'

// Security
'X-Content-Type-Options': 'nosniff'
'X-Frame-Options': 'DENY'
```

---

## Debugging Tips

### 1. Check if API URL is correct
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Origin:', window.location.origin);
```

### 2. Check CORS headers in browser
```javascript
// In browser Network tab, look for:
// Response Headers → Access-Control-Allow-Origin
```

### 3. Check if endpoint exists
```bash
curl https://yourdomain.com/api/products -v
```

### 4. Check environment variables
```bash
vercel env list
vercel env pull .env.production
```

### 5. View deployment logs
```bash
vercel logs --follow
```

---

## Performance Optimization

### Reduce bundle size
```javascript
// ❌ Bad: Import entire library
import _ from 'lodash';

// ✅ Good: Import specific function
import debounce from 'lodash/debounce';
```

### Use lazy loading in React
```javascript
// ✅ Good: Split code by route
const ProductPage = lazy(() => import('./pages/ProductPage'));
```

### Cache API responses
```javascript
// ✅ Good: Add Cache-Control header
res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
```

---

## Getting Help

If something doesn't work:

1. **Check Vercel Logs**: `vercel logs --follow`
2. **Check Browser Console**: Press F12 and look at Console/Network tabs
3. **Test with curl**: `curl https://yourdomain.com/api/products -v`
4. **Verify Environment Variables**: Set them in Vercel Dashboard
5. **Redeploy**: `vercel --prod`

---

