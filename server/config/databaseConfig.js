const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGO_URL 

const databaseconnect = () => {
    mongoose
        .connect(MONGODB_URL)
        .then((conn) => console.log(`MongoDB connected: ${conn.connection.host}`))
        .catch((err) => console.log(`MongoDB connection error: ${err}`));
}

module.exports = databaseconnect;