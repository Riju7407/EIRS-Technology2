require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./model/userSchema');

console.log('MONGO_URL:', process.env.MONGO_URL ? 'Found' : 'Not found');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB connected');

        const adminEmail = 'admin@eirtech.com';
        const adminName = 'EIRS Admin';
        const adminPassword = 'Admin@123';
        const adminPhone = '9999999999';
        const adminAddress = 'EIRS Technology, Tech City';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin && existingAdmin.isAdmin) {
            console.log('Admin user already exists:', adminEmail);
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            name: adminName,
            email: adminEmail,
            phoneNumber: adminPhone,
            address: adminAddress,
            password: adminPassword,
            isAdmin: true
        });

        const savedAdmin = await adminUser.save();
        console.log('✅ Admin user created successfully!');
        console.log('Admin Email:', adminEmail);
        console.log('Admin Password:', adminPassword);
        console.log('Admin ID:', savedAdmin._id);
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
