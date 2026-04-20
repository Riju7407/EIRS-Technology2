require('dotenv').config();
const express = require('express');
const compression = require('compression');
const app = express();
const port = process.env.PORT || 5000;
const {authRouter} = require('./router/authRouter.js');
const paymentRouter = require('./router/paymentRouter.js');
const categoryRouter = require('./router/categoryRouter.js');
const locationRouter = require('./router/locationRouter.js');
const websiteSyncRouter = require('./router/websiteSyncRouter.js');
const crmOpsRouter = require('./router/crmOpsRouter.js');
const databaseconnect = require('./config/databaseConfig.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const User = require('./model/userSchema');
const bcrypt = require('bcrypt');
const { getCrmSyncStatus } = require('./services/crmSyncService');

// Start database connection immediately (non-blocking)
let dbConnected = false;
databaseconnect().then(() => {
    dbConnected = true;
    console.log('✅ Database connected successfully');
}).catch(err => {
    console.error('⚠️ Database connection will retry:', err.message);
});

// Enable compression for all responses with aggressive optimization for Render free plan
app.use(compression({
    level: 9, // Maximum compression for Render free plan
    threshold: 512, // Compress responses larger than 512 bytes
    filter: (req, res) => {
        // Compress all JSON and text responses
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Auto-create admin user on server startup if it doesn't exist (non-blocking)
let adminCreated = false;
const createAdminOnStartup = async () => {
    if (adminCreated) return;
    try {
        const adminEmail = 'admin@eirtech.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (!existingAdmin) {
            const adminUser = new User({
                name: 'EIRS Admin',
                email: adminEmail,
                phoneNumber: '9999999999',
                address: 'EIRS Technology, Tech City',
                password: 'Admin@123',
                isAdmin: true
            });
            
            await adminUser.save();
            console.log('✅ Admin user created successfully on startup');
            console.log('Admin Email: admin@eirtech.com');
            console.log('Admin Password: Admin@123');
        } else {
            console.log('✅ Admin user already exists');
        }
    } catch (error) {
        console.error('⚠️ Error creating admin on startup:', error.message);
    }
    adminCreated = true;
};

// Call admin creation after startup (non-blocking)
setTimeout(createAdminOnStartup, 1000);

// CORS configuration - Updated for production
const parseOrigins = (value) => String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const envOrigins = [
    ...parseOrigins(process.env.FRONTEND_URL),
    ...parseOrigins(process.env.ALLOWED_ORIGINS)
];

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://192.168.0.147:3000',
            'http://192.168.0.147:3001',
            'https://eirstechnology.com',
            ...envOrigins
        ];

        // Check if origin matches allowed list or regex patterns
        const isAllowed = allowedOrigins.some(o => o === origin) || 
                         /^https:\/\/.*\.vercel\.app$/.test(origin);

        if (isAllowed || !origin) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// Capture raw body for Razorpay webhook signature verification
app.use(express.json({
    limit: '50mb',
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Request logging middleware with timing (only log slow requests)
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        if (duration > 100 || res.statusCode >= 400) {
            console.log(`[${res.statusCode}] ${req.method} ${req.path} - ${duration}ms`);
        }
    });
    next();
});

app.use('/auth/', authRouter);
app.use('/api/auth', authRouter);

app.use('/payment', paymentRouter);
app.use('/api/payment', paymentRouter);

app.use('/api', categoryRouter);
app.use('/api/website-sync', websiteSyncRouter);
app.use('/api', crmOpsRouter);

// Geospatial location routes – POST /api/location, GET /api/location/nearby
app.use('/api', locationRouter);

// Health check endpoints - Critical for Render to keep server awake
app.get('/health', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbConnected ? 'connected' : 'connecting'
    });
});

app.get('/', (req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ 
        message: 'EIRS Technology API Server', 
        status: 'running',
        version: '2.0.0'
    });
});

app.get('/api', (req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ message: 'EIRS Technology API', version: '1.0.0' });
});

app.get('/api/integrations/crm/status', (_req, res) => {
    res.status(200).json({
        success: true,
        crm: getCrmSyncStatus()
    });
});

app.get('/about', (req, res) => {
    res.set('Cache-Control', 'public, max-age=3600');
    res.json({ message: 'About EIRS Technology' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// Only listen in development/local environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

module.exports = app;

module.exports = app;