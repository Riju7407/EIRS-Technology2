const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        phone: { type: String, default: '' },
        role: { type: String, required: [true, 'Role is required'], trim: true },
        department: { type: String, trim: true, default: '' },
        region: { type: String, trim: true, default: '' },
        status: {
            type: String,
            enum: ['active', 'on-leave', 'inactive'],
            default: 'active',
        },
        joinedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

employeeSchema.index({ name: 'text', email: 'text', role: 'text', region: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);