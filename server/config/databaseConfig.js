const mongoose = require('mongoose');

const databaseconnect = () => {
    const MONGODB_URL = process.env.MONGO_URL;
    
    if (!MONGODB_URL) {
        console.error('❌ ERROR: MONGO_URL is not defined in environment variables!');
        return;
    }
    
    mongoose
        .connect(MONGODB_URL)
        .then((conn) => console.log(`✓ MongoDB connected: ${conn.connection.host}`))
        .catch((err) => console.log(`❌ MongoDB connection error: ${err}`));
}

module.exports = databaseconnect;