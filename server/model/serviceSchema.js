const mongoose = require('mongoose');
const { Schema } = mongoose;

const serviceSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Service price is required'],
        min: [0, 'Price cannot be negative']
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('Service', serviceSchema);
