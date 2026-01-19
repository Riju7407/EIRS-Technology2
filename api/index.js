require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initialize Express app
const app = express();

// Import routes and middleware
const databaseconnect = require('../server/config/databaseConfig');
const { authRouter } = require('../server/router/authRouter');

// Connect to database
databaseconnect();

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

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check route (NO auth required)
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'EIRS API', status: 'running' });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'EIRS Technology API', version: '1.0.0' });
});

// Auth routes - all endpoints from authRouter
app.use('/', authRouter);

// 404 handler
app.use((req, res) => {
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

module.exports = app;
