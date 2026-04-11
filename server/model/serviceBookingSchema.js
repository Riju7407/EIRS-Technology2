const mongoose = require('mongoose');
const { Schema } = mongoose;

const serviceBookingSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        },
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            required: [true, 'Service is required']
        },
        serviceName: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true
        },
        servicePrice: {
            type: Number,
            default: 0
        },
        customerName: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        email: {
            type: String,
            trim: true,
            default: ''
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true
        },
        preferredDate: {
            type: Date,
            default: null
        },
        notes: {
            type: String,
            trim: true,
            default: ''
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
            default: 'Pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('ServiceBooking', serviceBookingSchema);
