const mongoose = require('mongoose');
const { Schema } = mongoose;

const filterSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Filter name is required'],
        trim: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['brand', 'resolution', 'channels', 'priceRange', 'other'],
        required: true
    },
    options: [{
        label: {
            type: String,
            required: true,
            trim: true
        },
        value: {
            type: String,
            required: true,
            trim: true
        }
    }],
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Filter', filterSchema);
