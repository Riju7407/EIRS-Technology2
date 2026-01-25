require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./model/serviceSchema');

const dbUri = process.env.MONGO_URL || 'mongodb://localhost:27017/test';

const services = [
  {
    name: 'Installation & Setup',
    description: 'Professional installation and configuration of security systems, cameras, and automation equipment at your premises with minimal downtime.',
    price: 5000
  },
  {
    name: 'AMC & Maintenance',
    description: 'Annual Maintenance Contracts with regular inspections, preventive maintenance, and emergency support to ensure optimal system performance.',
    price: 3000
  },
  {
    name: 'Expert Consultation',
    description: 'Free consultation with our security experts to assess your needs, recommend optimal solutions, and create a customized security plan.',
    price: 0
  },
  {
    name: 'Technical Support',
    description: '24/7 technical support with remote assistance, on-site troubleshooting, and quick resolution for all your security system issues.',
    price: 2000
  },
  {
    name: 'Training Programs',
    description: 'Comprehensive training sessions for your staff on system operation, maintenance, troubleshooting, and best practices for security management.',
    price: 10000
  }
];

async function addServices() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing services
    console.log('🗑️  Clearing existing services...');
    await Service.deleteMany({});
    console.log('✅ Cleared existing services');

    console.log('\n📝 Adding services...');
    for (const service of services) {
      await Service.create(service);
      console.log(`✅ Added: ${service.name} - ₹${service.price}`);
    }

    // Get all services
    const allServices = await Service.find();
    console.log(`\n📋 All services in database:`);
    allServices.forEach((s, index) => {
      console.log(`  ${index + 1}. ${s.name} - ₹${s.price}`);
    });

    console.log('\n✅ Service setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addServices();
