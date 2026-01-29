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
    subcategory: {
        type: String,
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
    },
    cameraResolution: {
        type: String,
        trim: true,
        enum: {
            values: ['2mp', '4mp', '6mp', ''],
            message: '{VALUE} is not a valid camera resolution'
        },
        default: ''
    },
    nvrChannels: {
        type: String,
        trim: true,
        enum: {
            values: ['4ch', '8ch', '16ch', '32ch', ''],
            message: '{VALUE} is not a valid NVR channel option'
        },
        default: ''
    },
    poeSwitch: {
        type: String,
        trim: true,
        enum: {
            values: ['4port', '8port', '16port', ''],
            message: '{VALUE} is not a valid POE switch option'
        },
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);