# Vercel MERN: Visual Reference & Decision Trees

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           Your EIRS MERN on Vercel                      │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   React Frontend     │         │   Vercel CDN        │
│   (client/)          │◄───────►│   (Static Files)     │
│                      │         │                      │
│  - HomePage.js       │         │  - index.html        │
│  - ProductsPage.js   │         │  - CSS, JS, Images   │
│  - AdminDashboard.js │         └──────────────────────┘
└──────────────────────┘

         │ API Calls
         │ fetch('/api/products')
         ▼

┌──────────────────────────────────────────────────────────┐
│        Vercel Serverless Functions (api/)                │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │ api/products/  │  │ api/auth/      │                 │
│  │ - index.js     │  │ - login.js     │                 │
│  │ - [id].js      │  │ - register.js  │                 │
│  └────────────────┘  └────────────────┘                 │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │ api/contact/   │  │ api/admin/     │                 │
│  │ - submit.js    │  │ - products.js  │                 │
│  └────────────────┘  └────────────────┘                 │
│                                                           │
│  All functions route through:                           │
│  - api/middleware/cors.js    (CORS headers)            │
│  - api/middleware/auth.js    (JWT validation)          │
│  - api/middleware/db.js      (Database access)         │
│                                                           │
└──────────────────────────────────────────────────────────┘

         │ All requests
         │ return JSON
         ▼

┌──────────────────────────────────────────────────────────┐
│        MongoDB Atlas (Database)                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Collections:                                           │
│  - users (authentication)                               │
│  - products (e-commerce)                                │
│  - contacts (inquiries)                                 │
│  - services (service info)                              │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Request/Response Flow

```
BROWSER (Frontend)
    │
    │ 1. User clicks "Get Products"
    │
    ├─► fetch('/api/products', {
    │        method: 'GET',
    │        headers: {'Content-Type': 'application/json'}
    │     })
    │
    │ 2. Browser sends HTTP GET request
    ▼
VERCEL EDGE
    │
    │ 3. Route analysis
    │    - Check if /api/* → route to serverless
    │    - Check CORS origin
    │
    ├─► rewrites: { source: '/api/(.*)', destination: '/api/$1' }
    │
    ▼
SERVERLESS FUNCTION (api/products/index.js)
    │
    │ 4. Execute handler(req, res)
    │
    ├─► Middleware 1: CORS
    │   res.setHeader('Access-Control-Allow-Origin', '*')
    │
    ├─► Middleware 2: Auth (if needed)
    │   const user = await verifyAuth(req, res)
    │
    ├─► Middleware 3: Database
    │   const { db } = await connectToDatabase()
    │
    ├─► Route handler
    │   const products = await db.collection('products').find().toArray()
    │
    ├─► Response
    │   res.status(200).json(products)
    │
    ▼
DATABASE (MongoDB)
    │
    │ 5. Query: find all products
    │    Result: [{ id: 1, name: 'Product' }, ...]
    │
    ▼
SERVERLESS FUNCTION
    │
    │ 6. Format response
    │    [{ id: 1, name: 'Product' }, ...]
    │
    ▼
VERCEL EDGE
    │
    │ 7. Add response headers
    │    Access-Control-Allow-Origin: *
    │    Content-Type: application/json
    │
    ▼
BROWSER (Frontend)
    │
    │ 8. Receive response
    │    Response.ok = true
    │    Response.status = 200
    │
    ├─► response.json()
    │   [{ id: 1, name: 'Product' }, ...]
    │
    ├─► setState(products)
    │
    ▼
REACT COMPONENT
    │
    │ 9. Render products
    │    <div>{products.map(...)}</div>
```

---

## Decision Trees for Common Issues

### Issue: Getting 405 Error

```
405 Method Not Allowed
    │
    ├─ Am I sending correct method?
    │  ├─ No → Set method: 'POST' / 'PUT' / 'DELETE'
    │  │
    │  └─ Yes → Continue
    │
    ├─ Does API route handle this method?
    │  ├─ No → Add case in switch statement
    │  │
    │  └─ Yes → Continue
    │
    ├─ Is OPTIONS preflight handled?
    │  ├─ No → Add if (req.method === 'OPTIONS')
    │  │
    │  └─ Yes → Continue
    │
    └─ Check Vercel logs: vercel logs --follow
```

### Issue: CORS Error in Browser

```
CORS Error
    │
    ├─ Is Access-Control-Allow-Origin header present?
    │  ├─ No → Add CORS middleware
    │  │
    │  └─ Yes → Continue
    │
    ├─ Does origin match allowed origins?
    │  ├─ No → Add origin to allowedOrigins array
    │  │
    │  └─ Yes → Continue
    │
    ├─ Is request using credentials?
    │  ├─ Yes → Verify Access-Control-Allow-Credentials: true
    │  │
    │  └─ No → Continue
    │
    └─ Check browser Network tab → select request → Response Headers
       Look for Access-Control-Allow-*
```

### Issue: 404 API Not Found

```
404 Not Found
    │
    ├─ Is file in api/ folder?
    │  ├─ No → Create file: api/products/index.js
    │  │
    │  └─ Yes → Continue
    │
    ├─ Is file committed to git?
    │  ├─ No → git add api/ && git commit
    │  │
    │  └─ Yes → Continue
    │
    ├─ Is vercel.json rewrite correct?
    │  ├─ No → Check rewrites section
    │  │
    │  └─ Yes → Continue
    │
    └─ Redeploy: vercel --prod --force
```

### Issue: 401 Unauthorized

```
401 Unauthorized
    │
    ├─ Is token present in localStorage?
    │  ├─ No → User not logged in → redirect to login
    │  │
    │  └─ Yes → Continue
    │
    ├─ Is token being sent in Authorization header?
    │  ├─ No → Add Authorization: Bearer TOKEN
    │  │
    │  └─ Yes → Continue
    │
    ├─ Is JWT_SECRET correct in Vercel?
    │  ├─ No → Update in Vercel Dashboard
    │  │
    │  └─ Yes → Continue
    │
    └─ Is token expired?
       └─ Yes → Clear localStorage and re-login
```

---

## Error Code Flowchart

```
HTTP Response
    │
    ├─ 2xx (Success)
    │  ├─ 200 OK ................. Request succeeded
    │  ├─ 201 Created ............ Resource created
    │  └─ 204 No Content ......... Delete succeeded
    │
    ├─ 3xx (Redirect) ........... Rarely used in APIs
    │
    ├─ 4xx (Client Error)
    │  ├─ 400 Bad Request ........ Invalid input data
    │  ├─ 401 Unauthorized ...... Missing/invalid token
    │  ├─ 403 Forbidden ......... User not admin
    │  ├─ 404 Not Found ......... Resource doesn't exist
    │  └─ 405 Method Not Allowed  Wrong HTTP method
    │
    └─ 5xx (Server Error)
       ├─ 500 Internal Error .... Unhandled exception
       ├─ 502 Bad Gateway ....... Deployment issue
       └─ 503 Service Unavailable Database down
```

---

## Middleware Stack Diagram

```
┌─────────────────────────────────────────────┐
│  1. HTTP Request Arrives                    │
│     GET /api/products                       │
│     Host: yourdomain.com                    │
│     Origin: https://yourdomain.com          │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│  2. Middleware: CORS                        │
│     res.setHeader('Access-Control-Allow-*')│
│     Handle OPTIONS preflight                │
└─────────────────────────────────────────────┘
           │
           ▼ (if OPTIONS, send 200 and exit)
           │ (otherwise, continue)
           │
┌─────────────────────────────────────────────┐
│  3. Middleware: Auth (if protected route)   │
│     Check Authorization header              │
│     Verify JWT token                        │
│     req.user = decoded token                │
└─────────────────────────────────────────────┘
           │
           ▼ (if unauthorized, send 401 and exit)
           │ (otherwise, continue)
           │
┌─────────────────────────────────────────────┐
│  4. Middleware: Database                    │
│     Connect to MongoDB                      │
│     req.db = database instance              │
└─────────────────────────────────────────────┘
           │
           ▼ (if connection fails, send 503 and exit)
           │ (otherwise, continue)
           │
┌─────────────────────────────────────────────┐
│  5. Route Handler                           │
│     Execute business logic                  │
│     Query database                          │
│     Format response                         │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│  6. Error Handling                          │
│     Try-catch block                         │
│     Send error response with status code    │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│  7. HTTP Response Sent                      │
│     Status: 200 OK                          │
│     Headers: Content-Type, CORS headers     │
│     Body: JSON data                         │
└─────────────────────────────────────────────┘
```

---

## Request Validation Pyramid

```
                    ┌─────────────────┐
                    │ Execute Handler │ (Query DB, etc)
                    └────────┬────────┘
                             ▲
                    ┌────────┴────────┐
                    │  Database OK?   │ (Connection pooling)
                    └────────┬────────┘
                             ▲
                    ┌────────┴────────┐
                    │  User Authed?   │ (JWT verification)
                    └────────┬────────┘
                             ▲
                    ┌────────┴────────┐
                    │ Body Valid?     │ (JSON parsing)
                    └────────┬────────┘
                             ▲
                    ┌────────┴────────┐
                    │ Method Allowed? │ (OPTIONS handler)
                    └────────┬────────┘
                             ▲
                    ┌────────┴────────┐
                    │ CORS Valid?     │ (Origin check)
                    └────────┬────────┘
                             ▲
                    ┌────────┴────────┐
                    │ HTTP Request    │ (Browser)
                    └─────────────────┘
```

---

## Environment Setup Flowchart

```
START
  │
  ├─ Create vercel.json
  │  └─ Add rewrites & headers
  │
  ├─ Create .env.production
  │  └─ Add MONGODB_URI, JWT_SECRET, etc.
  │
  ├─ Create api/ folder structure
  │  ├─ api/middleware/
  │  ├─ api/auth/
  │  ├─ api/products/
  │  └─ api/contact/
  │
  ├─ Add CORS middleware
  │  └─ All routes use withCORS
  │
  ├─ Add error handling
  │  └─ Try-catch in all handlers
  │
  ├─ Configure Frontend
  │  └─ Use REACT_APP_API_URL
  │
  ├─ Commit to Git
  │  └─ git add . && git commit
  │
  ├─ Deploy to Vercel
  │  └─ vercel --prod
  │
  ├─ Set Environment Variables
  │  ├─ Vercel Dashboard → Environment Variables
  │  ├─ MONGODB_URI
  │  ├─ JWT_SECRET
  │  ├─ NODE_ENV=production
  │  └─ REACT_APP_API_URL=https://yourdomain.com
  │
  ├─ Test API Endpoints
  │  ├─ curl https://yourdomain.com/api/products
  │  ├─ Test OPTIONS preflight
  │  ├─ Test authentication
  │  └─ Check Vercel logs
  │
  └─ Troubleshoot Issues
     ├─ CORS error? → Check cors middleware
     ├─ 405 error? → Check method handlers
     ├─ 404 error? → Check file paths
     ├─ 401 error? → Check JWT token
     └─ 500 error? → Check Vercel logs
```

---

## Performance Optimization Levels

```
LEVEL 1: Basic (Working)
├─ API returns data
├─ CORS configured
├─ Authentication works
└─ Database connected

        ↓ Add

LEVEL 2: Production Ready
├─ Error handling
├─ Input validation
├─ Proper status codes
├─ Environment variables
└─ Logging

        ↓ Add

LEVEL 3: Optimized
├─ Connection pooling
├─ Query indexing
├─ Response caching
├─ Cold start reduction
└─ Pagination

        ↓ Add

LEVEL 4: Enterprise
├─ Rate limiting
├─ Request throttling
├─ Monitoring/Alerts
├─ Analytics tracking
├─ Background jobs
└─ API versioning
```

---

## Testing Checklist Visual

```
┌─────────────────────────────────────────────┐
│ LOCAL TESTING                               │
├─────────────────────────────────────────────┤
│ ✓ npm start (frontend)                      │
│ ✓ Test with curl / Postman                  │
│ ✓ Check browser console                     │
│ ✓ Verify env variables work                 │
└─────────────────────────────────────────────┘

        ↓ If all pass

┌─────────────────────────────────────────────┐
│ DEPLOYMENT                                  │
├─────────────────────────────────────────────┤
│ ✓ vercel --prod                             │
│ ✓ Set env vars in Vercel Dashboard          │
│ ✓ Redeploy after env changes                │
└─────────────────────────────────────────────┘

        ↓ If deployed

┌─────────────────────────────────────────────┐
│ PRODUCTION TESTING                          │
├─────────────────────────────────────────────┤
│ ✓ Test CORS with curl                       │
│ ✓ Test each API endpoint                    │
│ ✓ Test authentication flow                  │
│ ✓ Check Vercel logs                         │
│ ✓ Monitor error rate                        │
└─────────────────────────────────────────────┘

        ↓ If all tests pass

┌─────────────────────────────────────────────┐
│ READY FOR PRODUCTION                        │
├─────────────────────────────────────────────┤
│ ✓ Set custom domain                         │
│ ✓ Enable HTTPS                              │
│ ✓ Monitor continuously                      │
│ ✓ Plan for scaling                          │
└─────────────────────────────────────────────┘
```

---

## API Call Flow (React to Database)

```
React Component
    │
    ├─ setState(loading: true)
    │
    ▼
Fetch API Service
    │
    ├─ GET /api/products
    ├─ Headers:
    │  ├─ Content-Type: application/json
    │  ├─ Authorization: Bearer TOKEN
    │  └─ Origin: https://yourdomain.com
    │
    ▼
Browser Makes Request
    │
    ├─ Sends OPTIONS preflight first
    │
    ▼
Vercel Receives Request
    │
    ├─ Check CORS origin
    ├─ Route to /api/products/index.js
    │
    ▼
Middleware: CORS
    │
    ├─ Add CORS headers
    ├─ Handle OPTIONS → return 200
    │
    ▼
Middleware: Auth
    │
    ├─ Verify JWT token
    ├─ Extract user info
    │
    ▼
Middleware: Database
    │
    ├─ Connect to MongoDB
    │
    ▼
Handler: GET /api/products
    │
    ├─ Query: db.collection('products').find()
    │
    ▼
MongoDB Returns
    │
    ├─ [{ id: 1, name: 'Product' }, ...]
    │
    ▼
Format Response
    │
    ├─ res.status(200).json(products)
    │
    ▼
Vercel Returns
    │
    ├─ 200 OK
    ├─ Headers: Content-Type: application/json
    ├─ Body: [{ id: 1, name: 'Product' }, ...]
    │
    ▼
Browser Receives
    │
    ├─ response.ok = true
    ├─ response.json() parses body
    │
    ▼
React Handler
    │
    ├─ setState(products: [...])
    ├─ setState(loading: false)
    │
    ▼
React Renders
    │
    ├─ <ProductList products={products} />
```

---

## Quick Debugging Flowchart

```
┌─ Something's Not Working ─┐
│                            │
├─ Check Browser Console    │
│  (F12 → Console tab)       │
│  ├─ CORS error? YES → Fix CORS in API
│  ├─ 404 error? YES → Fix URL/route
│  ├─ 401 error? YES → Check token
│  └─ 500 error? YES → Check server logs
│                            │
├─ Check Network Tab        │
│  (F12 → Network tab)       │
│  ├─ Request headers OK?    │
│  ├─ Response headers OK?   │
│  └─ Response body OK?      │
│                            │
├─ Check Vercel Logs        │
│  (vercel logs --follow)    │
│  ├─ Function called?       │
│  ├─ Error logged?          │
│  └─ Response sent?         │
│                            │
├─ Test with curl           │
│  (curl https://...)        │
│  ├─ API responding?        │
│  ├─ Headers correct?       │
│  └─ Data returned?         │
│                            │
└─ Redeploy                 │
   (vercel --prod)           │
```

---

These visual references should help you quickly understand the deployment architecture, identify issues, and know what to check when things go wrong!

