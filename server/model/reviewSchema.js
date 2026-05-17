const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    comment: {
        type: String,
        trim: true,
        default: '',
        validate: {
            validator: function(value) {
                const trimmed = String(value || '').trim();
                return trimmed.length === 0 || (trimmed.length >= 10 && trimmed.length <= 500);
            },
            message: 'Comment must be between 10 and 500 characters if provided'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index to ensure one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
