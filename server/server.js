require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const {authRouter} = require('./router/authRouter.js');
const databaseconnect = require('./config/databaseConfig.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');

databaseconnect();

// CORS configuration - Updated for production
const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:3000', 'http://192.168.0.147:3001', 'https://*.vercel.app'],
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
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use('/auth/', authRouter);

app.get('/', (req, res) => {
    res.json({ message: 'EIRS Technology API Server', status: 'running' });
});

app.get('/api', (req, res) => {
    res.json({ message: 'EIRS Technology API', version: '1.0.0' });
});

app.get('/about', (req, res) => {
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