require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./model/productSchema');

const dbUri = process.env.MONGO_URL || 'mongodb://localhost:27017/test';

async function migrateProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB');

    // Get all products and update them
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products`);

    let updateCount = 0;
    for (const product of products) {
      let needsUpdate = false;

      // Set default price if missing
      if (product.price === null || product.price === undefined) {
        product.price = 0;
        needsUpdate = true;
      }

      // Set default stock if missing
      if (product.stock === null || product.stock === undefined) {
        product.stock = 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await product.save();
        updateCount++;
      }
    }

    console.log(`✅ Updated ${updateCount} products with default values`);

    // Get sample of updated products
    const sampleProducts = await Product.find().limit(3);
    console.log('\n📋 Sample of products:');
    sampleProducts.forEach(p => {
      console.log(`  - ${p.productName}: Price=₹${p.price}, Stock=${p.stock}`);
    });

    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrateProducts();
