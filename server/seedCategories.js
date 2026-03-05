const mongoose = require('mongoose');
const Category = require('./model/categorySchema');
const Subcategory = require('./model/subcategorySchema');

// New hierarchical categories structure
const newCategoriesData = [
  {
    mainCategory: 'CCTV Camera',
    subcategories: [
      {
        name: 'IP Camera',
        children: [
          { name: 'Camera', items: ['2 MP IP Camera', '4 MP IP Camera', '6 MP IP Camera'] },
          { name: 'NVR', items: ['4 CH', '8 CH', '16 CH', '22 CH'] },
          { name: 'POE', items: ['4 CH', '8 CH', '16 CH'] }
        ]
      },
      {
        name: 'HD Camera',
        children: [
          { name: 'Camera', items: ['2 MP', '4 MP', '6 MP'] },
          { name: 'SMPS', items: ['4 CH', '8 CH', '16 CH'] },
          { name: 'DVR', items: ['4 CH', '8 CH', '16 CH', '32 CH'] }
        ]
      },
      {
        name: 'Wi-Fi/4G Camera',
        children: []
      },
      {
        name: 'CCTV Bundle Pack',
        children: []
      }
    ]
  },
  {
    mainCategory: 'Biometric Devices',
    subcategories: [
      { name: 'Fingerprint Biometric', children: [] },
      { name: 'Face Recognition Biometric', children: [] },
      { name: 'Card + Fingerprint Devices', children: [] },
      { name: 'Time Attendance with Payroll Integration', children: [] }
    ]
  },
  {
    mainCategory: 'Intercom System',
    subcategories: [
      {
        name: 'EPBX',
        children: []
      },
      {
        name: 'IPBX',
        children: []
      }
    ]
  },
  {
    mainCategory: 'Home & Office Security',
    subcategories: [
      { name: 'Video Door Phone (VDP/VPP)', children: [] },
      { name: 'Smart Door Locks', children: [] },
      { name: 'Access Control System', children: [] },
      { name: 'Alarm Systems', children: [] },
      { name: 'Motion Sensors', children: [] }
    ]
  },
  {
    mainCategory: 'Fire Alarm Systems',
    subcategories: [
      { name: 'Smoke Detectors', children: [] },
      { name: 'Heat Detectors', children: [] },
      { name: 'Manual Call Points', children: [] },
      { name: 'Control Panels', children: [] }
    ]
  },
  {
    mainCategory: 'Networking Device',
    subcategories: [
      { name: 'Routers', children: [] },
      { name: 'Switches', children: [] },
      { name: 'Access Points', children: [] },
      { name: 'Patch Panels', children: [] },
      { name: 'Network Cables & Accessories', children: [] },
      { name: 'Modems', children: [] }
    ]
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eirs', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed categories
const seedCategories = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    console.log('Cleared existing categories and subcategories');

    // Create categories and subcategories
    for (const categoryData of newCategoriesData) {
      const category = new Category({
        name: categoryData.mainCategory,
        description: `${categoryData.mainCategory} products and solutions`,
        subcategories: []
      });

      const savedCategory = await category.save();
      console.log(`Created category: ${categoryData.mainCategory}`);

      // Create subcategories
      for (const subData of categoryData.subcategories) {
        const flatSubcategoryName = subData.name;
        
        const subcategory = new Subcategory({
          name: flatSubcategoryName,
          category: categoryData.mainCategory,
          description: `${flatSubcategoryName} under ${categoryData.mainCategory}`,
          icon: ''
        });

        await subcategory.save();
        console.log(`  Created subcategory: ${flatSubcategoryName}`);

        // If there are child items, create them as variations
        if (subData.children && subData.children.length > 0) {
          for (const child of subData.children) {
            const childSubcategoryName = `${subData.name} - ${child.name}`;
            
            const childSubcategory = new Subcategory({
              name: childSubcategoryName,
              category: categoryData.mainCategory,
              description: `${child.name} variants of ${subData.name}`,
              icon: ''
            });

            await childSubcategory.save();
            console.log(`    Created subcategory: ${childSubcategoryName}`);

            // Create items as well
            if (child.items && child.items.length > 0) {
              for (const item of child.items) {
                const itemSubcategoryName = `${childSubcategoryName} - ${item}`;
                
                const itemSubcategory = new Subcategory({
                  name: itemSubcategoryName,
                  category: categoryData.mainCategory,
                  description: item,
                  icon: ''
                });

                await itemSubcategory.save();
                console.log(`      Created subcategory: ${itemSubcategoryName}`);
              }
            }
          }
        }
      }
    }

    console.log('\n✅ Categories and subcategories seeded successfully!');
    
    // Display summary
    const totalCategories = await Category.countDocuments();
    const totalSubcategories = await Subcategory.countDocuments();
    
    console.log(`\nSummary:`);
    console.log(`  Total Categories: ${totalCategories}`);
    console.log(`  Total Subcategories: ${totalSubcategories}`);
    
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
connectDB().then(() => seedCategories());
