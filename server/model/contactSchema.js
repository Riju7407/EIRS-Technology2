const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
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