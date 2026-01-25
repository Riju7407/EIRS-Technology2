require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./model/productSchema');

const dbUri = process.env.MONGO_URL || 'mongodb://localhost:27017/test';

async function updateProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB');

    // Get all products and update with different prices
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products`);

    const priceList = [3500, 4500, 6500, 7500];
    const stockList = [25, 30, 40, 50];

    let updateCount = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newPrice = priceList[i] || 5000;
      const newStock = stockList[i] || 20;
      
      console.log(`\n📝 Updating: ${product.productName}`);
      console.log(`  Old - Price: ${product.price}, Stock: ${product.stock}`);
      console.log(`  New - Price: ${newPrice}, Stock: ${newStock}`);
      
      product.price = newPrice;
      product.stock = newStock;
      
      await product.save();
      updateCount++;
      
      // Verify after save
      const updated = await Product.findById(product._id);
      console.log(`  ✅ Verified - Price: ${updated.price}, Stock: ${updated.stock}`);
    }

    console.log(`\n✅ Updated ${updateCount} products`);

    // Get all products and display
    const allProducts = await Product.find();
    console.log('\n📋 All updated products:');
    allProducts.forEach(p => {
      console.log(`  - ${p.productName}: Price=₹${p.price}, Stock=${p.stock}`);
    });

    console.log('\n✅ Update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateProducts();

