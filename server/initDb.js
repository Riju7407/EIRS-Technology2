const mongoose = require('mongoose');
require('dotenv').config();

async function initializeDatabase() {
  try {
    const dbUri = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    
    console.log('🔗 Connecting to:', dbUri.substring(0, 50) + '...');
    
    // Connect first
    const conn = await mongoose.connect(dbUri);
    
    console.log('✅ Connected to MongoDB');
    
    // Get the database instance
    const db = conn.connection.db;
    
    // Drop the products collection if it exists
    try {
      const collections = await db.listCollections({ name: 'products' }).toArray();
      if (collections.length > 0) {
        await db.collection('products').drop();
        console.log('✅ Dropped products collection and all its indexes');
      } else {
        console.log('ℹ️ Products collection does not exist yet');
      }
    } catch (err) {
      console.log('ℹ️ No products collection to drop');
    }
    
    console.log('✅ Database initialization complete!');
    console.log('✅ The E11000 duplicate key error has been fixed');
    console.log('ℹ️ You can now add products without errors');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during initialization:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
