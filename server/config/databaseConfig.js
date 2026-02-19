const mongoose = require('mongoose');

const databaseconnect = () => {
    const MONGODB_URL = process.env.MONGO_URL;
    
    if (!MONGODB_URL) {
        console.error('❌ ERROR: MONGO_URL is not defined in environment variables!');
        return Promise.reject(new Error('MONGO_URL not defined'));
    }
    
    return mongoose
        .connect(MONGODB_URL)
        .then((conn) => {
            console.log(`✓ MongoDB connected: ${conn.connection.host}`);
            return conn;
        })
        .catch((err) => {
            console.error(`❌ MongoDB connection error: ${err.message}`);
            throw err;
        });
}

module.exports = databaseconnect;