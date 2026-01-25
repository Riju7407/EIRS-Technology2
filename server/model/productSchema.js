const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true
    },
    brand: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative'],
        get: (value) => value === null || value === undefined ? 0 : value,
        set: (value) => {
            if (value === '' || value === null || value === undefined) return 0;
            return parseFloat(value);
        }
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative'],
        get: (value) => value === null || value === undefined ? 0 : value,
        set: (value) => {
            if (value === '' || value === null || value === undefined) return 0;
            return parseInt(value, 10);
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);