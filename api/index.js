require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');

// Initialize Express app
const app = express();

// Import routes and middleware
const databaseconnect = require('../server/config/databaseConfig');
const { authRouter } = require('../server/router/authRouter');
const categoryRouter = require('../server/router/categoryRouter');
const locationRouter = require('../server/router/locationRouter');
const paymentRouter  = require('../server/router/paymentRouter');
const User = require('../server/model/userSchema');
const bcrypt = require('bcrypt');

// Connect to database
databaseconnect();

// Auto-create admin user on first request
let adminCreated = false;
const ensureAdminExists = async () => {
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
            console.log('✅ Admin user created');
        }
        adminCreated = true;
    } catch (error) {
        console.error('Admin creation error:', error.message);
    }
};

// CORS configuration - CRITICAL for fixing CORS errors in production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow localhost for development and production domains
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'https://eirstechnology.com'
        ];
        
        // Check if origin matches allowed list
        const isAllowed = allowedOrigins.includes(origin) || 
                         !origin || // Allow requests without origin (like mobile apps, curl, etc)
                         /^https:\/\/.*\.vercel\.app$/.test(origin) || // Allow all Vercel domains
                         /^https:\/\/.*\.onrender\.com$/.test(origin); // Allow all Render domains

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    maxAge: 86400,
    preflightContinue: false
};

// Apply CORS middleware BEFORE routes
app.use(cors(corsOptions));

// Enable compression for production
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Vercel rewrite handler - reconstruct the original path BEFORE body parsing
app.use((req, res, next) => {
    // Vercel passes the original path in __path query parameter when rewriting
    if (req.query.__path) {
        req.url = req.query.__path;
        console.log(`[VERCEL REWRITE] Path reconstructed: ${req.method} ${req.url}`);
    }
    next();
});

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    ensureAdminExists();
    next();
});

// Resolve the correct path to React build
const clientBuildPath = path.resolve(__dirname, '..', 'client', 'build');
console.log(`📁 Serving static files from: ${clientBuildPath}`);

// Serve static files from React build folder
app.use(express.static(clientBuildPath));

// Health check route (NO auth required)
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'EIRS API', status: 'running' });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'EIRS Technology API', version: '1.0.0' });
});

// Mount authRouter at /auth - it handles all /auth/* routes
// Client calls /api/auth/signin, Vercel strips /api, becomes /auth/signin
app.use('/auth', authRouter);

// Category, subcategory and filter routes  →  /api/categories, /api/subcategories, /api/filters
app.use('/api', categoryRouter);

// Location routes  →  /api/location
app.use('/api', locationRouter);

// Payment routes  →  /payment and /api/payment
app.use('/payment', paymentRouter);
app.use('/api/payment', paymentRouter);

// Serve React index.html for all non-API routes (React Router) - BEFORE 404 handler
app.use((req, res, next) => {
    // Only serve index.html for non-API requests
    if (!req.path.startsWith('/auth') && !req.path.startsWith('/health') && !req.path.startsWith('/api') && !req.path.startsWith('/payment')) {
        res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
            if (err) {
                console.error('Error serving index.html:', err);
                res.status(404).json({ success: false, message: 'Not found' });
            }
        });
    } else {
        next();
    }
});

// 404 handler - only reached if no route matched
app.use((req, res) => {
    console.error(`Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ 
        success: false, 
        message: 'Route not found', 
        path: req.path,
        method: req.method 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

// Start server - listen on port for Render/production
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ EIRS API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Also export for serverless/Vercel compatibility
module.exports = app;
