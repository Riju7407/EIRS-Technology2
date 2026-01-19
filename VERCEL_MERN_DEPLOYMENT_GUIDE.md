# Comprehensive Guide: MERN Stack Deployment on Vercel

A complete guide covering 405 errors, CORS configuration, best practices, and common mistakes when deploying full-stack MERN applications on Vercel's serverless platform.

---

## Table of Contents

1. [Understanding 405 Method Not Allowed Errors](#1-understanding-405-method-not-allowed-errors)
2. [CORS Configuration Guide](#2-cors-configuration-guide)
3. [Best Practices for Serverless Deployment](#3-best-practices-for-serverless-deployment)
4. [Common Mistakes and Fixes](#4-common-mistakes-and-fixes)

---

## 1. Understanding 405 Method Not Allowed Errors

### Root Cause

A 405 error occurs when:
- The HTTP method (GET, POST, PUT, DELETE, etc.) sent by the client is not supported by the endpoint
- API routes don't have handlers for the specific method
- Routes are misconfigured or missing the required method handler
- On Vercel, function exports don't match the incoming request method

### Solution 1: Proper API Route Handling in Serverless Functions

**Correct Pattern for Vercel Serverless Functions:**

```javascript
// api/users/[id].js - CORRECT PATTERN
export default function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getUser(id, res);
    case 'PUT':
      return updateUser(id, req.body, res);
    case 'DELETE':
      return deleteUser(id, res);
    default:
      // Important: Handle unsupported methods
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getUser(id, res) {
  res.status(200).json({ id, name: 'User' });
}

function updateUser(id, body, res) {
  res.status(200).json({ id, ...body, updated: true });
}

function deleteUser(id, res) {
  res.status(204).end();
}
```

**❌ INCORRECT - Missing Method Handlers:**

```javascript
// This causes 405 errors for POST, PUT, DELETE
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ data: 'ok' });
  }
  // POST, PUT, DELETE have no handler - results in 405
}
```

### Solution 2: Express.js Server in Serverless Function

If you're running Express as a serverless function:

```javascript
// api/server.js
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Routes
app.get('/api/products', (req, res) => {
  res.json([{ id: 1, name: 'Product' }]);
});

app.post('/api/products', (req, res) => {
  res.status(201).json({ id: 2, ...req.body });
});

app.put('/api/products/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/products/:id', (req, res) => {
  res.status(204).end();
});

// Handle OPTIONS for CORS preflight
app.options('*', cors());

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

export default app;
```

### Solution 3: Check the ALLOW Header in Response

Add proper `Allow` header in responses:

```javascript
export default function handler(req, res) {
  // Always set Allow header for OPTIONS and error cases
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', allowedMethods.join(', '));
    res.status(200).end();
    return;
  }

  if (!allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods.join(', '));
    res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      allowed: allowedMethods
    });
    return;
  }

  // Handle the request
  res.status(200).json({ success: true });
}
```

---

## 2. CORS Configuration Guide

### CORS Fundamentals

CORS (Cross-Origin Resource Sharing) allows cross-domain requests. Browsers enforce Same-Origin Policy and require CORS headers.

**Key Points:**
- **Simple Requests**: GET, HEAD, POST (no preflight needed)
- **Preflighted Requests**: PUT, DELETE, PATCH, or custom headers (OPTIONS preflight required)
- Browser sends `Origin` header; server responds with `Access-Control-Allow-*` headers

### Solution 1: Node.js Express CORS Middleware

**Recommended - Use `cors` Package:**

```javascript
import express from 'express';
import cors from 'cors';

const app = express();

// Option 1: Simple CORS (development only)
app.use(cors());

// Option 2: Restrict to specific origins (production)
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://localhost:3000' // development
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight
app.options('*', cors(corsOptions));
```

### Solution 2: Manual CORS Headers in Vercel Serverless Functions

**For Single API Routes:**

```javascript
// api/products.js
export default function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://yourdomain.com',
    'http://localhost:3000'
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json([{ id: 1, name: 'Product' }]);
  } else if (req.method === 'POST') {
    res.status(201).json({ id: 2, ...req.body });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
```

**For All Routes (Middleware Pattern):**

```javascript
// lib/cors.js
export function withCORS(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://yourdomain.com',
      'http://localhost:3000'
    ];

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 
      'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 
      'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}

// Usage in api/users.js
import { withCORS } from '../../lib/cors';

async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json([{ id: 1, name: 'User' }]);
  } else if (req.method === 'POST') {
    res.status(201).json({ id: 2, ...req.body });
  }
}

export default withCORS(handler);
```

### Solution 3: Frontend Fetch Configuration

**Correct Fetch with Credentials:**

```javascript
// services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  'http://localhost:3001';

export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include' // Important for cookies
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API Error');
  }

  return response.json();
}

// Usage
export function getProducts() {
  return apiCall('/api/products', { method: 'GET' });
}

export function createProduct(data) {
  return apiCall('/api/products', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateProduct(id, data) {
  return apiCall(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function deleteProduct(id) {
  return apiCall(`/api/products/${id}`, {
    method: 'DELETE'
  });
}
```

### Solution 4: Vercel.json Configuration

**Control CORS at Project Level:**

```json
{
  "buildCommand": "cd client && npm run build && cd .. && npm run build:server",
  "outputDirectory": "server/dist",
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,POST,PUT,DELETE,OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type,Authorization"
        }
      ]
    }
  ]
}
```

---

## 3. Best Practices for Serverless Deployment

### 3.1 Directory Structure for Vercel

**Optimal MERN Stack Structure:**

```
project/
├── api/                          # Vercel serverless functions
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   └── logout.js
│   ├── users/
│   │   ├── index.js
│   │   └── [id].js
│   ├── products/
│   │   ├── index.js
│   │   └── [id].js
│   └── middleware/
│       ├── cors.js
│       └── auth.js
├── client/                       # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
├── server/                       # Optional: shared utilities
│   ├── lib/
│   ├── models/
│   ├── config/
│   └── package.json
├── package.json
├── vercel.json
└── .env.local
```

### 3.2 Environment Variables Configuration

**Vercel Environment Setup:**

```bash
# .env.local (development)
REACT_APP_API_URL=http://localhost:3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
NODE_ENV=development

# Vercel Dashboard: Set these for production
# REACT_APP_API_URL=https://yourdomain.com
# MONGODB_URI=...
# JWT_SECRET=...
# NODE_ENV=production
```

**Frontend .env Configuration:**

```javascript
// client/.env.production
REACT_APP_API_URL=https://yourdomain.com

// Alternative: Auto-detect based on deployment
// client/src/config/api.js
const API_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' && window.location.origin) || 
  'http://localhost:3001';

export default API_URL;
```

### 3.3 Optimized Serverless Function Pattern

**Best Practice Handler:**

```javascript
// api/handler.js
import { validateAuth } from './middleware/auth';
import { withCORS } from './middleware/cors';

async function handler(req, res) {
  // Validate HTTP method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: allowedMethods 
    });
  }

  try {
    // Validate authentication if needed
    if (req.headers.authorization) {
      const user = await validateAuth(req.headers.authorization);
      req.user = user;
    }

    // Route to appropriate handler
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
    }
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleGet(req, res) {
  // Get logic
  res.status(200).json({ data: [] });
}

async function handlePost(req, res) {
  // Create logic
  res.status(201).json({ created: true });
}

async function handlePut(req, res) {
  // Update logic
  res.status(200).json({ updated: true });
}

async function handleDelete(req, res) {
  // Delete logic
  res.status(204).end();
}

export default withCORS(handler);
```

### 3.4 Database Connection Management

**MongoDB Connection with Pooling:**

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
  const db = client.db(process.env.MONGODB_DB || 'eirs');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Usage in API routes
import { connectToDatabase } from '../../server/lib/mongodb';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection('products').find({}).toArray();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 3.5 Cold Start Optimization

**Reduce Cold Start Time:**

```javascript
// api/utils/logger.js - Lightweight logging
export function log(message, level = 'info') {
  console.log(`[${level.toUpperCase()}] ${message}`);
}

// api/products/index.js - Minimal imports
import { connectToDatabase } from '../../server/lib/mongodb';
import { withCORS } from '../middleware/cors';

async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    if (req.method === 'GET') {
      const products = await db
        .collection('products')
        .find({ active: true })
        .limit(20)
        .toArray();
      
      return res.status(200).json(products);
    }

    res.status(405).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCORS(handler);
```

### 3.6 Deployment Configuration

**vercel.json - Complete Configuration:**

```json
{
  "name": "eirs-mern",
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
    "NODE_ENV"
  ],
  "envFiles": [".env.production"],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
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

---

## 4. Common Mistakes and Fixes

### Mistake 1: Incorrect API URL Configuration

**❌ WRONG:**
```javascript
// Hard-coded URLs
const API_URL = 'http://localhost:3001'; // Works locally, fails in production
```

**✅ CORRECT:**
```javascript
// client/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' ? window.location.origin : '');

// Or use relative paths
const response = await fetch('/api/products');

// .env.production
REACT_APP_API_URL=https://yourdomain.com
```

### Mistake 2: Not Handling CORS Preflight Requests

**❌ WRONG:**
```javascript
// No OPTIONS handler
export default function handler(req, res) {
  if (req.method === 'POST') {
    res.json({ ok: true });
  }
  // OPTIONS requests are rejected!
}
```

**✅ CORRECT:**
```javascript
export default function handler(req, res) {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    res.json({ ok: true });
  }
}
```

### Mistake 3: Wildcard CORS with Credentials

**❌ WRONG:**
```javascript
// This combination doesn't work!
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

**✅ CORRECT:**
```javascript
const origin = req.headers.origin;
const allowedOrigins = ['https://yourdomain.com', 'http://localhost:3000'];

if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
```

### Mistake 4: Missing Error Handling in Async Functions

**❌ WRONG:**
```javascript
export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const data = await db.collection('users').findOne({});
  res.json(data); // No error handling!
}
```

**✅ CORRECT:**
```javascript
export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const data = await db.collection('users').findOne({});
    res.status(200).json(data);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

### Mistake 5: Not Setting Appropriate Status Codes

**❌ WRONG:**
```javascript
// Returns 200 for all scenarios
export default function handler(req, res) {
  if (req.method === 'POST') {
    res.json({ id: 1 }); // Should be 201
  }
  if (!data) {
    res.json({ error: 'Not found' }); // Should be 404
  }
}
```

**✅ CORRECT:**
```javascript
export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(201).json({ id: 1 }); // Created
  }
  if (!data) {
    res.status(404).json({ error: 'Not found' }); // Not Found
  }
  if (error) {
    res.status(500).json({ error: 'Server error' }); // Server Error
  }
}
```

### Mistake 6: Incorrect Body Parsing

**❌ WRONG:**
```javascript
// Assuming body is already parsed
export default function handler(req, res) {
  console.log(req.body); // Undefined!
}
```

**✅ CORRECT:**
```javascript
// For JSON body
export default function handler(req, res) {
  let body = '';
  
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON' });
    }
  });
}

// Or use a middleware
import bodyParser from 'body-parser';

const jsonParser = bodyParser.json();

export default function handler(req, res) {
  return new Promise((resolve, reject) => {
    jsonParser(req, res, () => {
      console.log(req.body); // Now it's parsed!
      res.json(req.body);
      resolve();
    });
  });
}
```

### Mistake 7: Environment Variables Not Accessible

**❌ WRONG:**
```javascript
// Frontend
const API_URL = process.env.API_URL; // Undefined!

// Need to prefix with REACT_APP_
const API_URL = process.env.REACT_APP_API_URL; // Works!
```

**✅ CORRECT:**
```javascript
// .env.production (Vercel)
REACT_APP_API_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secret

// Vercel Dashboard Settings:
// 1. Go to Project Settings
// 2. Select "Environment Variables"
// 3. Add REACT_APP_API_URL, MONGODB_URI, JWT_SECRET
// 4. Select which environments (Production, Preview, Development)
```

### Mistake 8: Timeout Issues with Long Operations

**❌ WRONG:**
```javascript
// Default timeout is 30s, complex operations might exceed this
export default async function handler(req, res) {
  // Long running database operation (>30s)
  await processMassData();
  res.json({ ok: true });
}
```

**✅ CORRECT:**
```javascript
// vercel.json
{
  "functions": {
    "api/process.js": {
      "maxDuration": 300 // 5 minutes (max)
    }
  }
}

// Use background jobs for very long operations
export default async function handler(req, res) {
  // Queue job and return immediately
  await queueBackgroundJob(req.body);
  res.status(202).json({ message: 'Processing started' });
}
```

### Mistake 9: Not Validating Request Data

**❌ WRONG:**
```javascript
export default async function handler(req, res) {
  const { name, email } = req.body;
  
  // No validation!
  await db.collection('users').insertOne({ name, email });
  res.json({ ok: true });
}
```

**✅ CORRECT:**
```javascript
// lib/validation.js
export function validateUser(data) {
  const errors = {};
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }
  
  return Object.keys(errors).length === 0 ? null : errors;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// api/users.js
import { validateUser } from '../lib/validation';

export default async function handler(req, res) {
  const errors = validateUser(req.body);
  
  if (errors) {
    return res.status(400).json({ errors });
  }
  
  const { name, email } = req.body;
  const result = await db.collection('users').insertOne({ name, email });
  res.status(201).json({ id: result.insertedId });
}
```

### Mistake 10: Hardcoded Secrets in Code

**❌ WRONG:**
```javascript
const JWT_SECRET = 'super-secret-key'; // Visible in git!
```

**✅ CORRECT:**
```javascript
// vercel.json or Vercel Dashboard
// Add JWT_SECRET as environment variable

// api/auth.js
import jwt from 'jsonwebtoken';

export function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
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
```

---

## Complete Working Example: User Management API

### Project Structure
```
project/
├── api/
│   ├── middleware/
│   │   ├── cors.js
│   │   └── auth.js
│   ├── users/
│   │   ├── index.js
│   │   └── [id].js
│   └── health.js
├── server/
│   ├── lib/
│   │   ├── mongodb.js
│   │   └── validation.js
│   ├── package.json
│   └── models/
├── client/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   └── components/
│   └── package.json
├── vercel.json
├── package.json
└── .env.production
```

### Implementation Files

**api/middleware/cors.js:**
```javascript
export function withCORS(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://yourdomain.com',
      'http://localhost:3000'
    ];

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'development') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 
      'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 
      'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}
```

**api/middleware/auth.js:**
```javascript
import jwt from 'jsonwebtoken';

export async function verifyAuth(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}
```

**api/users/index.js:**
```javascript
import { connectToDatabase } from '../../server/lib/mongodb';
import { validateUser } from '../../server/lib/validation';
import { withCORS } from '../middleware/cors';
import { verifyAuth } from '../middleware/auth';

async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    switch (req.method) {
      case 'GET':
        return handleGetUsers(db, req, res);
      case 'POST':
        return handleCreateUser(db, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetUsers(db, req, res) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const users = await db
    .collection('users')
    .find({})
    .project({ password: 0 })
    .toArray();

  res.status(200).json(users);
}

async function handleCreateUser(db, req, res) {
  let body = '';
  
  return new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const errors = validateUser(data);
        
        if (errors) {
          res.status(400).json({ errors });
          resolve();
          return;
        }

        const existingUser = await db
          .collection('users')
          .findOne({ email: data.email });

        if (existingUser) {
          res.status(409).json({ error: 'Email already exists' });
          resolve();
          return;
        }

        const result = await db.collection('users').insertOne({
          ...data,
          createdAt: new Date()
        });

        res.status(201).json({
          id: result.insertedId,
          ...data,
          password: undefined
        });
        resolve();
      } catch (error) {
        res.status(400).json({ error: 'Invalid request' });
        resolve();
      }
    });
  });
}

export default withCORS(handler);
```

**api/users/[id].js:**
```javascript
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../server/lib/mongodb';
import { withCORS } from '../middleware/cors';
import { verifyAuth } from '../middleware/auth';

async function handler(req, res) {
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const { db } = await connectToDatabase();

    switch (req.method) {
      case 'GET':
        return handleGetUser(db, id, req, res);
      case 'PUT':
        return handleUpdateUser(db, id, req, res);
      case 'DELETE':
        return handleDeleteUser(db, id, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetUser(db, id, req, res) {
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(id) },
    { projection: { password: 0 } }
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json(user);
}

async function handleUpdateUser(db, id, req, res) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  let body = '';
  
  return new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        const result = await db.collection('users').updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...data, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({ error: 'User not found' });
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

async function handleDeleteUser(db, id, req, res) {
  const user = await verifyAuth(req, res);
  if (!user) return;

  const result = await db.collection('users').deleteOne(
    { _id: new ObjectId(id) }
  );

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(204).end();
}

export default withCORS(handler);
```

**client/src/services/api.js:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' ? window.location.origin : '');

export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include'
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const userAPI = {
  getAll: () => apiCall('/api/users', { method: 'GET' }),
  getById: (id) => apiCall(`/api/users/${id}`, { method: 'GET' }),
  create: (data) => apiCall('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/api/users/${id}`, { method: 'DELETE' })
};
```

---

## Deployment Checklist

- [ ] Environment variables configured in Vercel Dashboard
- [ ] CORS headers properly set for both development and production URLs
- [ ] All API routes have OPTIONS handler for preflight requests
- [ ] Error handling and status codes properly implemented
- [ ] Database connection pooling configured
- [ ] Frontend API URL uses environment variable
- [ ] vercel.json properly configured with rewrites and headers
- [ ] All secrets stored as environment variables (not in code)
- [ ] Request/response validation implemented
- [ ] Testing performed with production-like environment
- [ ] Monitoring and logging set up
- [ ] Rate limiting considered for API endpoints
- [ ] HTTPS enforced in production
- [ ] CSRF protection implemented if using cookies

---

## Quick Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| 405 Method Not Allowed | No handler for HTTP method | Add method handler or OPTIONS case |
| CORS error | Missing CORS headers | Add Access-Control-Allow-* headers |
| Undefined req.body | Body not parsed | Parse JSON in request or use middleware |
| 500 Internal Error | Database connection fails | Check MONGODB_URI environment variable |
| Timeout | Operation takes >30s | Increase maxDuration in vercel.json |
| 401 Unauthorized | Invalid/missing token | Check JWT_SECRET, verify token logic |
| Cannot find module | Missing dependency | Run npm install, check import paths |
| Hard to debug | env variables missing | Check Vercel Dashboard settings |

---

## Additional Resources

- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [CORS MDN Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

