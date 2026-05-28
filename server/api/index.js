const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config();

// Apply production defaults for any env vars still missing
const { applyProductionDefaults } = require('../config/productionEnv');
if (process.env.NODE_ENV !== 'development') {
    applyProductionDefaults();
}

const express = require('express');
const compression = require('compression');
const { authRouter } = require('../router/authRouter.js');
const categoryRouter = require('../router/categoryRouter.js');
const databaseconnect = require('../config/databaseConfig.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');

// Create Express app for serverless function
const app = express();

// Connect to database (non-blocking)
let dbConnected = false;
databaseconnect().then(() => {
    dbConnected = true;
    console.log('✅ Database connected successfully');
}).catch(err => {
    console.error('⚠️ Database connection will retry:', err.message);
});

// Enable compression with aggressive settings for Vercel
app.use(compression({
    level: 9, // Maximum compression
    threshold: 512, // Compress responses larger than 512 bytes
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Auto-create admin user on first request (non-blocking)
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
            console.log('✅ Admin user created successfully');
        }
        adminCreated = true;
    } catch (error) {
        console.error('⚠️ Error creating admin:', error.message);
    }
};

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:3000', 'http://192.168.0.147:3001', 'https://eirs-technology2-git-main-riju-sarkars-projects.vercel.app', 'https://*.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Request logging middleware (only log slow requests to reduce bandwidth)
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        if (duration > 100 || res.statusCode >= 400) {
            console.log(`[${res.statusCode}] ${req.method} ${req.path} - ${duration}ms`);
        }
    });
    ensureAdminExists();
    next();
});

// Health check endpoints - Critical for keeping Render/Vercel awake
app.get('/health', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbConnected ? 'connected' : 'connecting'
    });
});

// Health check endpoints
// app.get('/', (req, res) => {
//     res.set('Cache-Control', 'public, max-age=300');
//     res.json({ message: 'EIRS Technology API', status: 'running' });\n});

app.get('/', (req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ 
        message: 'EIRS Technology API', 
        status: 'running' 
    });
});

// Handle the Vercel rewrite: /api/(.*) → /api/index.js?__path=/$1
app.use((req, res, next) => {
    // If there's a __path query parameter (from Vercel rewrite), reconstruct the original path
    if (req.query.__path) {
        req.url = req.query.__path;
        console.log(`Vercel rewrite detected. URL reconstructed to: ${req.url}`);
    }
    next();
});

// Mount authRouter at /auth path
app.use('/auth', authRouter);

// Mount categoryRouter at root path (for /categories and /subcategories endpoints)
// The reconstructed path will be /categories or /subcategories, so mounting at / allows these routes to work
app.use('/', categoryRouter);

// Fallback health check for /api endpoint
app.get('/api', (req, res) => {
    res.json({ message: 'EIRS Technology API', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
    console.error(`Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err.message);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// Export as serverless function handler
module.exports = app;
