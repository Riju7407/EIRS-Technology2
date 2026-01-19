# EIRS Project: Vercel Deployment Implementation Guide

Specific implementation patterns for your MERN stack EIRS application.

---

## Your Project Structure

Convert your existing backend to serverless functions:

```
EIRS/
├── api/                      # NEW: Vercel Serverless Functions
│   ├── health.js
│   ├── middleware/
│   │   ├── cors.js
│   │   ├── auth.js
│   │   └── db.js
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   └── logout.js
│   ├── admin/
│   │   ├── enquiries.js
│   │   ├── products.js
│   │   └── dashboard.js
│   ├── contact/
│   │   └── submit.js
│   ├── products/
│   │   ├── index.js
│   │   └── [id].js
│   └── services/
│       └── index.js
├── server/                   # Shared backend utilities
│   ├── lib/
│   │   ├── mongodb.js
│   │   ├── validation.js
│   │   └── jwt.js
│   ├── models/
│   │   ├── userSchema.js
│   │   ├── productSchema.js
│   │   ├── contactSchema.js
│   │   └── serviceSchema.js
│   ├── controller/           # Keep existing controllers
│   └── package.json
├── client/                   # Existing React app
│   ├── src/
│   ├── public/
│   └── package.json
├── vercel.json              # NEW
├── .env.local               # Local development
├── .env.production          # Production (set in Vercel Dashboard)
└── package.json
```

---

## Step 1: Set Up Middleware Files

### api/middleware/cors.js

```javascript
// Configure CORS for your frontend domain
export function withCORS(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    
    const allowedOrigins = [
      'https://eirs.vercel.app',                    // Your Vercel domain
      'https://yourdomain.com',                     // Your custom domain
      'http://localhost:3000',                      // Local development
      'http://localhost:3001'                       // Alternative local
    ];

    // Allow in development, restrict in production
    const isAllowed = process.env.NODE_ENV === 'development' 
      ? true 
      : allowedOrigins.includes(origin);

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', 
        process.env.NODE_ENV === 'development' ? '*' : origin);
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Methods', 
      'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 
      'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}
```

### api/middleware/auth.js

```javascript
import jwt from 'jsonwebtoken';

export async function verifyAuth(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: 'Missing authorization header' 
    });
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
    return null;
  }
}

export async function verifyAdminAuth(req, res) {
  const user = await verifyAuth(req, res);
  
  if (!user) return null;
  
  if (user.role !== 'admin') {
    res.status(403).json({ 
      error: 'Admin access required' 
    });
    return null;
  }
  
  return user;
}
```

### api/middleware/db.js

```javascript
import { connectToDatabase } from '../../server/lib/mongodb';

export async function withDatabase(handler) {
  return async (req, res) => {
    try {
      const { db } = await connectToDatabase();
      req.db = db;
      return handler(req, res);
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(503).json({ 
        error: 'Database connection failed' 
      });
    }
  };
}
```

---

## Step 2: Create Auth API Routes

### api/auth/login.js

```javascript
import jwt from 'jsonwebtoken';
import { withCORS } from '../middleware/cors';
import { connectToDatabase } from '../../server/lib/mongodb';
import crypto from 'crypto';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = '';
  
  return new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);

        if (!email || !password) {
          res.status(400).json({ 
            error: 'Email and password required' 
          });
          resolve();
          return;
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne({ email });

        if (!user) {
          res.status(401).json({ 
            error: 'Invalid credentials' 
          });
          resolve();
          return;
        }

        // Hash password and compare
        const hashedPassword = crypto
          .createHash('sha256')
          .update(password)
          .digest('hex');

        if (user.password !== hashedPassword) {
          res.status(401).json({ 
            error: 'Invalid credentials' 
          });
          resolve();
          return;
        }

        // Generate JWT
        const token = jwt.sign(
          { 
            userId: user._id.toString(),
            email: user.email,
            role: user.role || 'user'
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(200).json({
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        });
        resolve();
      } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ 
          error: 'Invalid request' 
        });
        resolve();
      }
    });
  });
}

export default withCORS(handler);
```

### api/auth/register.js

```javascript
import jwt from 'jsonwebtoken';
import { withCORS } from '../middleware/cors';
import { connectToDatabase } from '../../server/lib/mongodb';
import crypto from 'crypto';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = '';
  
  return new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { name, email, password, role } = JSON.parse(body);

        // Validation
        if (!name || !email || !password) {
          res.status(400).json({ 
            error: 'Name, email, and password required' 
          });
          resolve();
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          res.status(400).json({ 
            error: 'Invalid email format' 
          });
          resolve();
          return;
        }

        if (password.length < 6) {
          res.status(400).json({ 
            error: 'Password must be at least 6 characters' 
          });
          resolve();
          return;
        }

        const { db } = await connectToDatabase();
        
        // Check if user exists
        const existingUser = await db.collection('users')
          .findOne({ email });

        if (existingUser) {
          res.status(409).json({ 
            error: 'Email already registered' 
          });
          resolve();
          return;
        }

        // Hash password
        const hashedPassword = crypto
          .createHash('sha256')
          .update(password)
          .digest('hex');

        // Create user
        const result = await db.collection('users').insertOne({
          name,
          email,
          password: hashedPassword,
          role: role || 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Generate JWT
        const token = jwt.sign(
          {
            userId: result.insertedId.toString(),
            email,
            role: role || 'user'
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          token,
          user: {
            id: result.insertedId,
            name,
            email,
            role: role || 'user'
          }
        });
        resolve();
      } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ 
          error: 'Registration failed' 
        });
        resolve();
      }
    });
  });
}

export default withCORS(handler);
```

---

## Step 3: Create Product API Routes

### api/products/index.js

```javascript
import { withCORS } from '../middleware/cors';
import { connectToDatabase } from '../../server/lib/mongodb';

async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      return handleGetProducts(db, req, res);
    } else if (req.method === 'POST') {
      return handleCreateProduct(db, req, res);
    }
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function handleGetProducts(db, req, res) {
  const { category, limit = 20, skip = 0 } = req.query;
  
  const query = { active: true };
  if (category) {
    query.category = category;
  }

  const products = await db
    .collection('products')
    .find(query)
    .sort({ createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .toArray();

  const total = await db.collection('products')
    .countDocuments(query);

  res.status(200).json({
    products,
    total,
    limit: parseInt(limit),
    skip: parseInt(skip)
  });
}

async function handleCreateProduct(db, req, res) {
  let body = '';
  
  return new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const productData = JSON.parse(body);

        // Validation
        if (!productData.name || !productData.price) {
          res.status(400).json({ 
            error: 'Name and price required' 
          });
          resolve();
          return;
        }

        const result = await db.collection('products').insertOne({
          ...productData,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        res.status(201).json({
          id: result.insertedId,
          ...productData
        });
        resolve();
      } catch (error) {
        res.status(400).json({ 
          error: 'Invalid request' 
        });
        resolve();
      }
    });
  });
}

export default withCORS(handler);
```

### api/products/[id].js

```javascript
import { ObjectId } from 'mongodb';
import { withCORS } from '../middleware/cors';
import { connectToDatabase } from '../../server/lib/mongodb';
import { verifyAdminAuth } from '../middleware/auth';

async function handler(req, res) {
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    switch (req.method) {
      case 'GET':
        return handleGetProduct(db, id, res);
      case 'PUT':
        return handleUpdateProduct(db, id, req, res);
      case 'DELETE':
        return handleDeleteProduct(db, id, req, res);
    }
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function handleGetProduct(db, id, res) {
  const product = await db.collection('products').findOne(
    { _id: new ObjectId(id) }
  );

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.status(200).json(product);
}

async function handleUpdateProduct(db, id, req, res) {
  const admin = await verifyAdminAuth(req, res);
  if (!admin) return;

  let body = '';
  
  return new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const updateData = JSON.parse(body);
        
        const result = await db.collection('products').updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: { 
              ...updateData, 
              updatedAt: new Date() 
            } 
          }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({ error: 'Product not found' });
          resolve();
          return;
        }

        res.status(200).json({ success: true });
        resolve();
      } catch (error) {
        res.status(400).json({ error: 'Invalid request' });
        resolve();
      }
    });
  });
}

async function handleDeleteProduct(db, id, req, res) {
  const admin = await verifyAdminAuth(req, res);
  if (!admin) return;

  const result = await db.collection('products').deleteOne(
    { _id: new ObjectId(id) }
  );

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.status(204).end();
}

export default withCORS(handler);
```

---

## Step 4: Contact Form API

### api/contact/submit.js

```javascript
import { withCORS } from '../middleware/cors';
import { connectToDatabase } from '../../server/lib/mongodb';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = '';
  
  return new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { name, email, message, subject } = JSON.parse(body);

        // Validation
        const errors = {};
        
        if (!name || name.trim().length === 0) {
          errors.name = 'Name is required';
        }
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.email = 'Valid email is required';
        }
        
        if (!message || message.trim().length < 10) {
          errors.message = 'Message must be at least 10 characters';
        }

        if (Object.keys(errors).length > 0) {
          res.status(400).json({ errors });
          resolve();
          return;
        }

        const { db } = await connectToDatabase();
        
        const result = await db.collection('contacts').insertOne({
          name: name.trim(),
          email: email.trim(),
          subject: subject?.trim() || 'General Inquiry',
          message: message.trim(),
          createdAt: new Date(),
          status: 'new',
          read: false
        });

        res.status(201).json({
          id: result.insertedId,
          message: 'Thank you for your inquiry. We will get back to you soon.'
        });
        resolve();
      } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ 
          error: 'Failed to submit contact form' 
        });
        resolve();
      }
    });
  });
}

export default withCORS(handler);
```

---

## Step 5: Frontend API Service

### client/src/services/api.js

```javascript
// Determine API URL based on environment
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiUrl();

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      },
      credentials: 'include'
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 - clear token
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/signin';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
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

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

const client = new APIClient(API_BASE_URL);

// Auth API
export const authAPI = {
  login: (email, password) => 
    client.post('/api/auth/login', { email, password }),
  
  register: (name, email, password) =>
    client.post('/api/auth/register', { name, email, password }),
  
  logout: () => {
    client.clearToken();
    return Promise.resolve();
  },

  setToken: (token) => client.setToken(token),
  getToken: () => client.token
};

// Products API
export const productsAPI = {
  getAll: (category, limit, skip) =>
    client.get(`/api/products?category=${category || ''}&limit=${limit || 20}&skip=${skip || 0}`),
  
  getById: (id) =>
    client.get(`/api/products/${id}`),
  
  create: (data) =>
    client.post('/api/products', data),
  
  update: (id, data) =>
    client.put(`/api/products/${id}`, data),
  
  delete: (id) =>
    client.delete(`/api/products/${id}`)
};

// Contact API
export const contactAPI = {
  submit: (data) =>
    client.post('/api/contact/submit', data)
};

export default client;
```

---

## Step 6: Configuration Files

### vercel.json

```json
{
  "name": "eirs-mern-app",
  "version": 2,
  "framework": "react",
  "buildCommand": "npm run build",
  "outputDirectory": "client/build",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "env": [
    "MONGODB_URI",
    "JWT_SECRET",
    "NODE_ENV",
    "REACT_APP_API_URL"
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### .env.production

```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your-strong-secret-key-min-32-chars

# Environment
NODE_ENV=production

# Frontend API URL (set this to your Vercel domain or custom domain)
REACT_APP_API_URL=https://yourdomain.com
```

### client/.env.production

```bash
REACT_APP_API_URL=https://yourdomain.com
```

---

## Step 7: Deployment Steps

### 1. Prepare Your Project

```bash
# Navigate to your EIRS directory
cd EIRS

# Install dependencies
npm install

# In client directory
cd client
npm install
cd ..
```

### 2. Set Up Git

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial EIRS setup for Vercel"
```

### 3. Push to GitHub

```bash
# Create repository on GitHub
git remote add origin https://github.com/yourusername/eirs.git
git push -u origin main
```

### 4. Deploy on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Answer prompts:
# - Use existing Vercel account
# - Select your project
# - Confirm project settings
```

### 5. Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   - `MONGODB_URI` (all environments)
   - `JWT_SECRET` (all environments)
   - `NODE_ENV=production` (production only)
   - `REACT_APP_API_URL=https://yourdomain.com` (production)

---

## Testing Your Deployment

### Test CORS

```bash
# Test OPTIONS request
curl -X OPTIONS https://yourdomain.com/api/products \
  -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should return 200 OK with CORS headers
```

### Test Authentication

```javascript
// In browser console
const loginResponse = await fetch('https://yourdomain.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'password' 
  })
});

const data = await loginResponse.json();
console.log(data);
```

### Test Products API

```javascript
// Get all products
const response = await fetch('https://yourdomain.com/api/products');
const products = await response.json();
console.log(products);
```

---

## Troubleshooting Production Issues

### Issue: 405 Method Not Allowed

**Check:**
- [ ] Verify OPTIONS handler exists in middleware
- [ ] Check vercel.json rewrites configuration
- [ ] Test with curl or Postman

**Fix:**
```bash
# Check logs in Vercel Dashboard
vercel logs https://yourdomain.com
```

### Issue: CORS Errors in Browser

**Check:**
- [ ] Frontend uses correct API URL from environment
- [ ] Backend sets proper CORS headers
- [ ] Origin is in allowedOrigins list

**Fix:**
```javascript
// Update client/src/services/api.js
console.log('API URL:', API_BASE_URL);
console.log('Origin:', window.location.origin);
```

### Issue: Database Connection Timeout

**Check:**
- [ ] MONGODB_URI is set in Vercel Dashboard
- [ ] Connection string is correct
- [ ] Database allows Vercel IP ranges (use 0.0.0.0/0 for testing)

**Fix:**
```javascript
// In server/lib/mongodb.js, add connection timeout
const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

### Issue: Undefined Environment Variables

**Check:**
- [ ] Variable name starts with REACT_APP_ for frontend
- [ ] Set in Vercel Dashboard, not just .env file
- [ ] Redeploy after setting variables

**Fix:**
```bash
# Redeploy to apply new environment variables
vercel --prod
```

---

## Performance Optimization

### Reduce Cold Start Time

```javascript
// ✅ Good: Minimal imports at top level
import { connectToDatabase } from '../../server/lib/mongodb';

// ❌ Bad: Heavy dependencies imported unnecessarily
import * as lodash from 'lodash';
import * as moment from 'moment';
```

### Use Caching Headers

```javascript
// Set cache headers for static content
res.setHeader('Cache-Control', 'public, max-age=3600');
```

### Database Connection Pooling

```javascript
// server/lib/mongodb.js
const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5
});
```

---

## Monitoring

### Enable Vercel Analytics

1. Install analytics package: `npm install @vercel/analytics`
2. Add to client/src/index.js:
```javascript
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Check Logs

```bash
# View deployment logs
vercel logs --since=1h

# View specific function logs
vercel logs api/products/index.js
```

