# Vercel MERN: Real-World Issues & Solutions

## Issue #1: "Cannot find module" error during deployment

### Problem
```
Error: Cannot find module 'express'
Error: Cannot find module 'mongodb'
```

### Root Cause
Dependencies not installed or package.json missing dependencies.

### Solution

**Step 1: Check root package.json**
```json
{
  "name": "eirs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "echo 'Server ready'",
    "start": "cd client && npm start"
  },
  "dependencies": {
    "mongodb": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5"
  }
}
```

**Step 2: Install dependencies**
```bash
npm install mongodb jsonwebtoken cors
```

**Step 3: Verify node_modules exists in deployment**

**Step 4: Redeploy**
```bash
vercel --prod
```

---

## Issue #2: "CORS policy: No 'Access-Control-Allow-Origin' header"

### Problem
Browser error:
```
Access to XMLHttpRequest at 'https://api.yourdomain.com/api/products' from origin 
'https://yourdomain.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' 
header is present on the requested resource.
```

### Root Cause
- CORS headers not set in API response
- API endpoint doesn't handle OPTIONS requests
- Wrong domain in CORS configuration

### Solution

**Step 1: Add CORS to all API routes**

```javascript
// api/products/index.js - BEFORE (Wrong)
export default function handler(req, res) {
  res.json([{ id: 1, name: 'Product' }]); // No CORS!
}

// api/products/index.js - AFTER (Correct)
export default function handler(req, res) {
  const origin = req.headers.origin;
  const allowed = ['https://yourdomain.com', 'http://localhost:3000'];
  
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.json([{ id: 1, name: 'Product' }]);
}
```

**Step 2: Use CORS middleware for all routes**

```javascript
// lib/cors.js
export function withCORS(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    const allowed = [
      'https://yourdomain.com',
      'https://www.yourdomain.com',
      'http://localhost:3000'
    ];

    if (allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}

// Use in every API route:
export default withCORS(handler);
```

**Step 3: Verify frontend uses correct origin**

```javascript
// src/services/api.js - BEFORE (Wrong)
const API_URL = 'http://localhost:3001'; // Hard-coded!

// src/services/api.js - AFTER (Correct)
const API_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' ? window.location.origin : '');
```

**Step 4: Verify Vercel environment variable**

In Vercel Dashboard:
- Project Settings → Environment Variables
- Add `REACT_APP_API_URL=https://yourdomain.com`
- Redeploy

---

## Issue #3: "405 Method Not Allowed" for POST/PUT/DELETE

### Problem
```
POST https://yourdomain.com/api/products → 405 Method Not Allowed
PUT https://yourdomain.com/api/products/123 → 405 Method Not Allowed
DELETE https://yourdomain.com/api/products/123 → 405 Method Not Allowed
```

### Root Cause
- API handler only handles GET
- Missing method handlers
- No OPTIONS preflight handler

### Solution

**Step 1: Add method handlers**

```javascript
// api/products/index.js - WRONG
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json([]);
  }
  // POST, PUT, DELETE not handled!
}

// api/products/index.js - CORRECT
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  switch (req.method) {
    case 'GET':
      res.json([]);
      break;
    case 'POST':
      res.status(201).json({ created: true });
      break;
    case 'PUT':
      res.json({ updated: true });
      break;
    case 'DELETE':
      res.status(204).end();
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
```

**Step 2: Verify client sends correct method**

```javascript
// src/services/api.js - WRONG
fetch('/api/products', {
  // method defaults to GET, but we're sending data!
  body: JSON.stringify(data)
});

// src/services/api.js - CORRECT
fetch('/api/products', {
  method: 'POST', // Explicitly set method!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

---

## Issue #4: "Unexpected end of JSON input" or "SyntaxError: Unexpected token"

### Problem
```javascript
Error: Unexpected end of JSON input
Error: Unexpected token in JSON at position 0
```

### Root Cause
- Request body not properly parsed
- Sending empty body
- Content-Type not set to application/json

### Solution

**Step 1: Parse request body correctly**

```javascript
// api/products/index.js - WRONG
export default function handler(req, res) {
  const data = req.body; // Undefined!
  console.log(data);
}

// api/products/index.js - CORRECT (Option 1: Manual parsing)
export default function handler(req, res) {
  if (req.method === 'POST') {
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
}

// api/products/index.js - CORRECT (Option 2: Helper function)
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const data = await parseBody(req);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

**Step 2: Ensure frontend sends Content-Type header**

```javascript
// src/services/api.js - WRONG
fetch('/api/products', {
  method: 'POST',
  body: JSON.stringify(data)
  // No Content-Type header!
});

// src/services/api.js - CORRECT
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json' // Required!
  },
  body: JSON.stringify(data)
});
```

---

## Issue #5: "Cannot connect to database" or MongoDB connection timeout

### Problem
```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

### Root Cause
- MONGODB_URI not set
- Connection string incorrect
- Database IP not whitelisted
- Connection timeout too short

### Solution

**Step 1: Verify environment variable in Vercel Dashboard**

```
Project Settings → Environment Variables
- MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname
```

**Step 2: Check MongoDB connection string**

```javascript
// server/lib/mongodb.js
console.log('MongoDB URI:', process.env.MONGODB_URI);
```

**Step 3: Increase connection timeout**

```javascript
// server/lib/mongodb.js
const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // 10 seconds (was 5000)
  socketTimeoutMS: 45000,
  maxPoolSize: 10
});
```

**Step 4: Whitelist Vercel IPs**

In MongoDB Atlas:
1. Go to Network Access → IP Whitelist
2. Add: 0.0.0.0/0 (or specific Vercel IPs)
3. Wait for changes to propagate

**Step 5: Test connection locally first**

```bash
# Test with mongosh
mongosh "mongodb+srv://username:password@cluster.mongodb.net/dbname"
```

---

## Issue #6: "undefined is not a function" or "Cannot read property of undefined"

### Problem
```
TypeError: Cannot read property 'findOne' of undefined
TypeError: db.collection is not a function
```

### Root Cause
- Database object not properly initialized
- Connection failed silently
- Async/await not used correctly

### Solution

**Step 1: Verify database connection returns properly**

```javascript
// server/lib/mongodb.js - WRONG
let cachedClient;
let cachedDb;

export async function connectToDatabase() {
  if (cachedDb) return { db: cachedDb }; // No error handling!
  
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db('eirs');
  return { db: cachedDb };
}

// server/lib/mongodb.js - CORRECT
let cachedClient;
let cachedDb;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    await client.connect();
    
    cachedClient = client;
    cachedDb = client.db('eirs');
    
    console.log('✓ Database connected');
    return { client, db: cachedDb };
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    throw error;
  }
}
```

**Step 2: Use try-catch in API routes**

```javascript
// api/products/index.js
export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection('products').find({}).toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}
```

---

## Issue #7: "ERR_NAME_NOT_RESOLVED" or "Network request failed"

### Problem
```
ERR_NAME_NOT_RESOLVED
TypeError: Failed to fetch
```

### Root Cause
- API URL DNS doesn't resolve
- Frontend API URL incorrect
- Network connectivity issue

### Solution

**Step 1: Verify API URL in frontend**

```javascript
// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL;
console.log('API URL:', API_URL); // Log it!

fetch(`${API_URL}/api/products`)
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error));
```

**Step 2: Test API URL directly**

```bash
# In browser console
fetch('https://yourdomain.com/api/products')
  .then(r => r.json())
  .then(data => console.log(data));

# Or with curl
curl https://yourdomain.com/api/products
```

**Step 3: Check if Vercel deployment is live**

```bash
# Ping your deployment
curl https://yourdomain.com

# View deployment status
vercel ls
```

**Step 4: Clear browser cache and redeploy**

```bash
# Hard refresh
Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)

# Redeploy to Vercel
vercel --prod
```

---

## Issue #8: "Unauthorized" (401) when calling protected routes

### Problem
```
401 Unauthorized
```

### Root Cause
- Token not sent
- Token expired
- JWT_SECRET mismatch
- Authorization header format incorrect

### Solution

**Step 1: Verify token is saved**

```javascript
// src/pages/SignInPage.js
const response = await fetch('/api/auth/login', { /* ... */ });
const data = await response.json();

console.log('Token:', data.token); // Should exist!
localStorage.setItem('authToken', data.token);
```

**Step 2: Verify token is sent in requests**

```javascript
// src/services/api.js - WRONG
fetch('/api/admin/products', {
  headers: { 'Content-Type': 'application/json' }
  // No Authorization header!
});

// src/services/api.js - CORRECT
const token = localStorage.getItem('authToken');
fetch('/api/admin/products', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Include token!
  }
});
```

**Step 3: Verify JWT_SECRET matches**

```javascript
// api/middleware/auth.js
import jwt from 'jsonwebtoken';

export async function verifyAuth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT error:', error.message); // Log the error!
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

**Step 4: Check JWT_SECRET in Vercel**

```bash
# Verify environment variable is set
vercel env list

# Should show JWT_SECRET
```

---

## Issue #9: "Function exceeded maximum allowed timeout of 30 seconds"

### Problem
```
Error: Function exceeded maximum allowed timeout of 30 seconds
```

### Root Cause
- Long-running operations (>30s)
- Database query taking too long
- Missing index on collection

### Solution

**Step 1: Increase timeout in vercel.json**

```json
{
  "functions": {
    "api/admin/process.js": {
      "maxDuration": 120 // 2 minutes (max allowed)
    }
  }
}
```

**Step 2: Optimize database queries**

```javascript
// WRONG: Slow query
const users = await db.collection('users')
  .find({})
  .toArray(); // Fetches all users!

// CORRECT: Add indexes and limits
await db.collection('users').createIndex({ email: 1 });
const users = await db.collection('users')
  .find({ active: true })
  .limit(100)
  .toArray();
```

**Step 3: Use background jobs for long operations**

```javascript
// api/import.js - BEFORE (times out)
export default async function handler(req, res) {
  for (let i = 0; i < 10000; i++) {
    await db.collection('users').insertOne({ data: i });
  }
  res.json({ ok: true });
}

// api/import.js - AFTER (queues job)
export default async function handler(req, res) {
  // Queue background job and return immediately
  queueBackgroundJob({
    type: 'import',
    data: req.body
  });
  
  res.status(202).json({ 
    message: 'Processing started' 
  });
}
```

---

## Issue #10: "Vercel deployment shows "ready" but API returns 404"

### Problem
```
GET https://yourdomain.com/api/products → 404 Not Found
```

### Root Cause
- API routes not deployed
- vercel.json rewrite rules incorrect
- .gitignore excludes api folder

### Solution

**Step 1: Check if api folder is in git**

```bash
# Verify api/ is tracked
git ls-files | grep "^api/"

# If empty, add it
git add api/
git commit -m "Add api folder"
```

**Step 2: Verify vercel.json rewrites**

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Step 3: Check deployment preview**

```bash
# List all functions
vercel ls

# Should show api/products/index.js, api/auth/login.js, etc.
```

**Step 4: Test specific function**

```bash
# Test specific endpoint
curl https://yourdomain.com/api/products
curl -X POST https://yourdomain.com/api/products

# Check logs
vercel logs api/products/index.js
```

**Step 5: Redeploy if needed**

```bash
vercel --prod --force
```

---

## Debugging Checklist

When something goes wrong:

- [ ] Check Vercel logs: `vercel logs --follow`
- [ ] Check browser Network tab (F12)
- [ ] Check browser Console tab (F12)
- [ ] Verify environment variables: Vercel Dashboard
- [ ] Test API with curl: `curl https://yourdomain.com/api/products`
- [ ] Check status at https://vercel.com/status
- [ ] Hard refresh: `Ctrl+Shift+Delete`
- [ ] Redeploy: `vercel --prod`
- [ ] Check git for uncommitted changes
- [ ] Verify MONGODB_URI and JWT_SECRET are set
- [ ] Clear browser local storage and try again

---

## Quick Status Code Guide

When debugging, check these HTTP status codes:

```
200 OK              - Request succeeded
201 Created         - Resource created successfully
204 No Content      - Deletion succeeded
400 Bad Request     - Invalid input (check request body)
401 Unauthorized    - Token missing/invalid (check Authorization header)
403 Forbidden       - Not enough permissions (check user role)
404 Not Found       - Endpoint doesn't exist or resource not found
405 Method Not Allowed - Wrong HTTP method (check switch statement)
500 Internal Server - Unhandled error (check function logs)
503 Service Unavailable - Database connection failed
```

---

