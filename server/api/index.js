require('dotenv').config();
const express = require('express');
const { authRouter } = require('../router/authRouter.js');
const databaseconnect = require('../config/databaseConfig.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');

// Create Express app for serverless function
const app = express();

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
            console.log('✅ Admin user created successfully');
        }
        adminCreated = true;
    } catch (error) {
        console.error('Error creating admin:', error.message);
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

// Request logging middleware
app.use((req, res, next) => {
    console.log(`API Request - ${new Date().toISOString()} - ${req.method} ${req.path}`);
    ensureAdminExists();
    next();
});

// Mount authRouter - handle both /auth and /api/auth paths
app.use('/auth', authRouter);
app.use('/api/auth', authRouter);

// Health check endpoints
app.get('/', (req, res) => {
    res.json({ message: 'EIRS Technology API', status: 'running' });
});

app.get('/api', (req, res) => {
    res.json({ message: 'EIRS Technology API', version: '1.0.0' });
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
