require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Initialize Express app
const app = express();

// Import routes and middleware
const databaseconnect = require('../server/config/databaseConfig');
const { authRouter } = require('../server/router/authRouter');
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

// CORS configuration - CRITICAL for fixing 405 errors
const corsOptions = {
    origin: function (origin, callback) {
        // Allow localhost for development and any vercel domain for production
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            /\.vercel\.app$/
        ];
        
        const isAllowed = allowedOrigins.some(o => {
            if (o instanceof RegExp) {
                return o.test(origin);
            }
            return o === origin;
        });

        if (isAllowed || !origin) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 86400
};

// Apply CORS middleware BEFORE routes
app.use(cors(corsOptions));

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

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, '../client/build')));

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

// Serve React index.html for all non-API routes (React Router)
app.get('*', (req, res) => {
    // If it's not an API call, serve the React app
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
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
