/**
 * Seed Website Data Script
 * This script populates the database with sample data for:
 * - Website Users
 * - Website Orders
 * - Website Bookings
 * - Website Contacts
 */

require('dotenv').config();
const mongoose = require('mongoose');
const databaseconnect = require('./config/databaseConfig');
const User = require('./model/userSchema');
const Order = require('./model/orderSchema');
const ServiceBooking = require('./model/serviceBookingSchema');
const Contact = require('./model/contactSchema');
const Product = require('./model/productSchema');
const Service = require('./model/serviceSchema');

const seedData = async () => {
    try {
        await databaseconnect();
        console.log('✅ Database connected');

        // Clear existing data
        await User.deleteMany({});
        await Order.deleteMany({});
        await ServiceBooking.deleteMany({});
        await Contact.deleteMany({});
        console.log('✅ Cleared existing data');

        // Sample Users (Website Customers)
        const sampleUsers = [
            {
                name: 'Raj Kumar Singh',
                email: 'raj.kumar@example.com',
                phoneNumber: '9876543210',
                address: '123 Main Street, Bangalore',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
                password: 'Password@123',
                isAdmin: false
            },
            {
                name: 'Priya Sharma',
                email: 'priya.sharma@example.com',
                phoneNumber: '9876543211',
                address: '456 Oak Avenue, Delhi',
                city: 'Delhi',
                state: 'Delhi',
                pincode: '110001',
                password: 'Password@123',
                isAdmin: false
            },
            {
                name: 'Amit Patel',
                email: 'amit.patel@example.com',
                phoneNumber: '9876543212',
                address: '789 Market Road, Mumbai',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                password: 'Password@123',
                isAdmin: false
            },
            {
                name: 'Neha Gupta',
                email: 'neha.gupta@example.com',
                phoneNumber: '9876543213',
                address: '321 Park Lane, Pune',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411001',
                password: 'Password@123',
                isAdmin: false
            },
            {
                name: 'Vikram Reddy',
                email: 'vikram.reddy@example.com',
                phoneNumber: '9876543214',
                address: '654 Tech Park, Hyderabad',
                city: 'Hyderabad',
                state: 'Telangana',
                pincode: '500001',
                password: 'Password@123',
                isAdmin: false
            }
        ];

        const users = await User.insertMany(sampleUsers);
        console.log(`✅ Created ${users.length} website users`);

        // Sample Orders
        const sampleOrders = [
            {
                userId: users[0]._id,
                items: [{
                    productId: new mongoose.Types.ObjectId(),
                    productName: 'Enterprise Service Package',
                    category: 'Services',
                    brand: 'EIRS',
                    price: 5000,
                    quantity: 1,
                }],
                totalPrice: 5000,
                totalItems: 1,
                status: 'Confirmed',
                paymentStatus: 'Completed',
                paymentMethod: 'Card',
                customerEmail: 'raj.kumar@example.com',
                customerPhone: '9876543210',
                shippingAddress: {
                    fullName: 'Raj Kumar Singh',
                    email: 'raj.kumar@example.com',
                    phone: '9876543210'
                },
                notes: 'Fast delivery requested'
            },
            {
                userId: users[1]._id,
                items: [{
                    productId: new mongoose.Types.ObjectId(),
                    productName: 'Professional Consultation',
                    category: 'Services',
                    brand: 'EIRS',
                    price: 3000,
                    quantity: 2,
                }],
                totalPrice: 6000,
                totalItems: 2,
                status: 'Shipped',
                paymentStatus: 'Completed',
                paymentMethod: 'NetBanking',
                customerEmail: 'priya.sharma@example.com',
                customerPhone: '9876543211',
                shippingAddress: {
                    fullName: 'Priya Sharma',
                    email: 'priya.sharma@example.com',
                    phone: '9876543211'
                },
                notes: 'Scheduled for delivery'
            },
            {
                userId: users[2]._id,
                items: [{
                    productId: new mongoose.Types.ObjectId(),
                    productName: 'Premium Support Package',
                    category: 'Services',
                    brand: 'EIRS',
                    price: 2500,
                    quantity: 1,
                }],
                totalPrice: 2500,
                totalItems: 1,
                status: 'Pending',
                paymentStatus: 'Pending',
                paymentMethod: 'CashOnDelivery',
                customerEmail: 'amit.patel@example.com',
                customerPhone: '9876543212',
                shippingAddress: {
                    fullName: 'Amit Patel',
                    email: 'amit.patel@example.com',
                    phone: '9876543212'
                },
                notes: 'Payment pending'
            },
            {
                userId: users[3]._id,
                items: [{
                    productId: new mongoose.Types.ObjectId(),
                    productName: 'Training Program',
                    category: 'Services',
                    brand: 'EIRS',
                    price: 8000,
                    quantity: 1,
                }],
                totalPrice: 8000,
                totalItems: 1,
                status: 'Delivered',
                paymentStatus: 'Completed',
                paymentMethod: 'UPI',
                customerEmail: 'neha.gupta@example.com',
                customerPhone: '9876543213',
                shippingAddress: {
                    fullName: 'Neha Gupta',
                    email: 'neha.gupta@example.com',
                    phone: '9876543213'
                },
                notes: 'Successfully delivered'
            }
        ];

        const orders = await Order.insertMany(sampleOrders);
        console.log(`✅ Created ${orders.length} website orders`);

        // Sample Service Bookings
        const sampleBookings = [
            {
                userId: users[0]._id,
                serviceId: new mongoose.Types.ObjectId(),
                serviceName: 'System Integration Service',
                servicePrice: 10000,
                customerName: 'Raj Kumar Singh',
                phoneNumber: '9876543210',
                email: 'raj.kumar@example.com',
                address: '123 Main Street, Bangalore',
                preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'Confirmed',
                notes: 'Urgent service required for Q1'
            },
            {
                userId: users[1]._id,
                serviceId: new mongoose.Types.ObjectId(),
                serviceName: 'Cloud Migration Service',
                servicePrice: 15000,
                customerName: 'Priya Sharma',
                phoneNumber: '9876543211',
                email: 'priya.sharma@example.com',
                address: '456 Oak Avenue, Delhi',
                preferredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: 'Pending',
                notes: 'Migration from on-premise to cloud'
            },
            {
                userId: users[2]._id,
                serviceId: new mongoose.Types.ObjectId(),
                serviceName: 'Custom Development',
                servicePrice: 50000,
                customerName: 'Amit Patel',
                phoneNumber: '9876543212',
                email: 'amit.patel@example.com',
                address: '789 Market Road, Mumbai',
                preferredDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                status: 'Pending',
                notes: 'Custom ERP development for enterprise'
            },
            {
                userId: users[3]._id,
                serviceId: new mongoose.Types.ObjectId(),
                serviceName: 'Maintenance & Support',
                servicePrice: 5000,
                customerName: 'Neha Gupta',
                phoneNumber: '9876543213',
                email: 'neha.gupta@example.com',
                address: '321 Park Lane, Pune',
                preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                status: 'Confirmed',
                notes: 'Monthly maintenance package'
            },
            {
                userId: users[4]._id,
                serviceId: new mongoose.Types.ObjectId(),
                serviceName: 'Consulting Service',
                servicePrice: 12000,
                customerName: 'Vikram Reddy',
                phoneNumber: '9876543214',
                email: 'vikram.reddy@example.com',
                address: '654 Tech Park, Hyderabad',
                preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                status: 'Confirmed',
                notes: 'Business strategy consultation'
            }
        ];

        const bookings = await ServiceBooking.insertMany(sampleBookings);
        console.log(`✅ Created ${bookings.length} website service bookings`);

        // Sample Contacts
        const sampleContacts = [
            {
                name: 'John Anderson',
                email: 'john.anderson@example.com',
                phoneNumber: '9876543215',
                subject: 'Integration Inquiry',
                message: 'We are interested in integrating your ERP system with our existing infrastructure. Please provide detailed pricing and timeline.'
            },
            {
                name: 'Sarah Mitchell',
                email: 'sarah.mitchell@example.com',
                phoneNumber: '9876543216',
                subject: 'Support Request',
                message: 'Our current system is experiencing performance issues. We need immediate technical support to resolve this matter.'
            },
            {
                name: 'Michael Brown',
                email: 'michael.brown@example.com',
                phoneNumber: '9876543217',
                subject: 'Customization Services',
                message: 'We need customization for our specific business requirements. Can you provide a quote for custom development?'
            },
            {
                name: 'Emily Zhang',
                email: 'emily.zhang@example.com',
                phoneNumber: '9876543218',
                subject: 'Demo Request',
                message: 'I would like to schedule a demo of your CRM system. Our team is evaluating different solutions.'
            },
            {
                name: 'David Lopez',
                email: 'david.lopez@example.com',
                phoneNumber: '9876543219',
                subject: 'Partnership Opportunity',
                message: 'Our company is interested in exploring partnership opportunities with EIRS Technologies.'
            },
            {
                name: 'Lisa Wang',
                email: 'lisa.wang@example.com',
                phoneNumber: '9876543220',
                subject: 'Training Inquiry',
                message: 'We need training for our staff on how to use your platform effectively. Please provide available dates and rates.'
            }
        ];

        const contacts = await Contact.insertMany(sampleContacts);
        console.log(`✅ Created ${contacts.length} website contacts`);

        console.log('\n📊 Summary:');
        console.log(`✅ Website Users: ${users.length}`);
        console.log(`✅ Website Orders: ${orders.length}`);
        console.log(`✅ Website Service Bookings: ${bookings.length}`);
        console.log(`✅ Website Contacts: ${contacts.length}`);
        console.log('\n✨ Database seeding completed successfully!');
        console.log('\n📍 Access these endpoints from the CRM:\n');
        console.log('GET  /api/website-sync/users      - List all website users');
        console.log('GET  /api/website-sync/orders     - List all website orders');
        console.log('GET  /api/website-sync/bookings   - List all website service bookings');
        console.log('GET  /api/website-sync/contacts   - List all website contacts');
        console.log('\n(These endpoints require admin authentication)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
