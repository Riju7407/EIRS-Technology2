const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
    {
        quoteNumber: { type: String, required: true, unique: true },
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        clientName: { type: String, default: '' },
        clientPhone: { type: String, default: '' },
        clientAddress: { type: String, default: '' },
        items: [
            {
                description: String,
                quantity: Number,
                rate: Number,
            },
        ],
        discount: { type: Number, default: 0 },
        taxPercent: { type: Number, default: 18 },
        notes: { type: String, default: '' },
        subtotal: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
            default: 'draft',
        },
        pdfData: mongoose.Schema.Types.Mixed,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        expiryDate: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Quotation', quotationSchema);