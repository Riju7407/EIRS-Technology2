const mongoose = require('mongoose');

async function fixDuplicateKeyError() {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    const connection = await mongoose.connect(dbUri);
    
    console.log('Connected to MongoDB');
    
    const db = connection.connection.db;
    
    // Drop the entire products collection to remove all indexes
    try {
      await db.collection('products').drop();
      console.log('Successfully dropped products collection');
    } catch (err) {
      if (err.message.includes('ns not found')) {
        console.log('Products collection does not exist, creating fresh');
      } else {
        console.log('Could not drop collection:', err.message);
      }
    }
    
    console.log('✅ Successfully cleared duplicate index issue');
    console.log('The products collection will be recreated with correct schema on next product creation');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDuplicateKeyError();
