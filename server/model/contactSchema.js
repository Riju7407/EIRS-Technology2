const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        minlength: [10, 'Phone number must be at least 10 digits'],
        maxlength: [15, 'Phone number cannot exceed 15 digits'],
        match: [/^\d{10,15}$/, 'Phone number must contain only digits and be between 10-15 characters'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        minlength: [3, 'Subject must be at least 3 characters long'],
        maxlength: [100, 'Subject must be at most 100 characters long'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        minlength: [10, 'Message must be at least 10 characters long'],
        maxlength: [500, 'Message must be at most 500 characters long'],
        trim: true
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('Contact', contactSchema);