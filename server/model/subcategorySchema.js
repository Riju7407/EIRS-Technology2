const mongoose = require('mongoose');
const { Schema } = mongoose;

const subcategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Subcategory name is required'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subcategory', subcategorySchema);
