const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        category: {
            type: String
        },
        brand: {
            type: String
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        image: {
            type: String
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    estimatedDelivery: {
        type: Date
    },
    shippingAddress: {
        fullName: String,
        email: String,
        phone: String,
        houseNo: String,
        address: String,
        city: String,
        state: String,
        zipCode: String
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Card', 'NetBanking', 'Wallet', 'CashOnDelivery'],
        default: 'Card'
    },
    paymentSubMethod: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled'],
        default: 'Pending'
    },
    razorpayOrderId: {
        type: String,
        sparse: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true
    },
    razorpaySignature: {
        type: String,
        sparse: true
    },
    customerEmail: {
        type: String
    },
    customerPhone: {
        type: String
    },
    paidAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancellationReason: {
        type: String
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    refundInfo: {
        status: {
            type: String,
            enum: ['None', 'Requested', 'Approved', 'Rejected', 'Processed'],
            default: 'None'
        },
        reason: {
            type: String
        },
        refundAmount: {
            type: Number,
            default: 0
        },
        requestedAt: {
            type: Date
        },
        approvedAt: {
            type: Date
        },
        processedAt: {
            type: Date
        },
        returnPaymentMethod: {
            type: String,
            enum: ['UPI', 'Bank Transfer', 'Net Banking'],
            default: null
        },
        returnPaymentDetails: {
            type: String
        },
        adminNotes: {
            type: String
        }
    },
    afterDeliveryRequest: {
        type: {
            type: String,
            enum: ['None', 'Return', 'Replace'],
            default: 'None'
        },
        status: {
            type: String,
            enum: ['None', 'Requested', 'Approved', 'Rejected', 'Processed'],
            default: 'None'
        },
        reason: {
            type: String
        },
        returnPaymentMethod: {
            type: String,
            enum: ['UPI', 'Bank Transfer', 'Net Banking'],
            default: null
        },
        returnPaymentDetails: {
            type: String
        },
        requestedAt: {
            type: Date
        },
        approvedAt: {
            type: Date
        },
        processedAt: {
            type: Date
        },
        adminNotes: {
            type: String
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
