require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./model/productSchema');

const createIndexes = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URL);
        
        console.log('📦 Connected to MongoDB');
        console.log('🔧 Creating indexes for Product collection...');
        
        // Create indexes
        await Product.createIndexes();
        
        console.log('✅ Indexes created successfully!');
        
        // Show indexes
        const indexes = await Product.collection.getIndexes();
        console.log('\n📊 Current indexes:');
        console.log(JSON.stringify(indexes, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
};

createIndexes();
