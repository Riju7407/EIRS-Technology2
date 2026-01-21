const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt =  require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [5, 'Name must be at least 5 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
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
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods = {
    jwtToken() {
        return jwt.sign({ id: this._id, email: this.email, isAdmin: this.isAdmin }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });
    }
}

module.exports = mongoose.model('User', userSchema);