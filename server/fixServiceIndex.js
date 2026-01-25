require('dotenv').config();
const mongoose = require('mongoose');

const dbUri = process.env.MONGO_URL || 'mongodb://localhost:27017/test';

async function fixIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop all indexes on services collection
    console.log('🔧 Dropping indexes...');
    try {
      await db.collection('services').dropIndexes();
      console.log('✅ Dropped all indexes');
    } catch (err) {
      console.log('⚠️  No indexes to drop or error:', err.message);
    }

    // Delete all documents
    console.log('🗑️  Clearing all documents...');
    await db.collection('services').deleteMany({});
    console.log('✅ Cleared all documents');

    console.log('\n✅ Index fix complete! You can now run addServices.js');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixIndex();
