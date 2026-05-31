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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },

    description: {
        type: String,
        trim: true
    },

   
    isActive: {
    type: Boolean,
    default: true
}

}, {
    timestamps: true
});

module.exports = mongoose.model('Subcategory', subcategorySchema);