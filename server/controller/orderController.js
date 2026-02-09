const Order = require('../model/orderSchema.js');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, totalPrice, totalItems, shippingAddress, paymentMethod, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        const order = new Order({
            userId,
            items,
            totalPrice,
            totalItems,
            shippingAddress,
            paymentMethod,
            notes,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).sort({ orderDate: -1 });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this order'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to cancel this order'
            });
        }

        // Can only cancel Pending or Confirmed orders
        if (!['Pending', 'Confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`
            });
        }

        // Update order status to Cancelled
        order.status = 'Cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = reason;
        
        // Auto-refund if payment was completed
        if (order.paymentStatus === 'Completed') {
            order.refundInfo.status = 'Requested';
            order.refundInfo.reason = reason;
            order.refundInfo.refundAmount = order.totalPrice;
            order.refundInfo.requestedAt = new Date();
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Request Refund
exports.requestRefund = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to request refund for this order'
            });
        }

        // Can only request refund for Delivered orders
        if (order.status !== 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Can only request refund for delivered orders'
            });
        }

        // Check if refund already requested
        if (order.refundInfo.status !== 'None') {
            return res.status(400).json({
                success: false,
                message: `Refund already ${order.refundInfo.status.toLowerCase()}`
            });
        }

        // Update refund info
        order.refundInfo.status = 'Requested';
        order.refundInfo.reason = reason;
        order.refundInfo.refundAmount = order.totalPrice;
        order.refundInfo.requestedAt = new Date();

        await order.save();

        res.json({
            success: true,
            message: 'Refund request submitted successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Approve Refund (Admin Only)
exports.approveRefund = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { adminNotes } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if refund is requested
        if (order.refundInfo.status !== 'Requested') {
            return res.status(400).json({
                success: false,
                message: 'Refund is not in Requested status'
            });
        }

        // Update refund info
        order.refundInfo.status = 'Approved';
        order.refundInfo.approvedAt = new Date();
        order.refundInfo.adminNotes = adminNotes || ' ';

        await order.save();

        res.json({
            success: true,
            message: 'Refund approved successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reject Refund (Admin Only)
exports.rejectRefund = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { adminNotes } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if refund is requested
        if (order.refundInfo.status !== 'Requested') {
            return res.status(400).json({
                success: false,
                message: 'Refund is not in Requested status'
            });
        }

        // Update refund info
        order.refundInfo.status = 'Rejected';
        order.refundInfo.adminNotes = adminNotes || '';

        await order.save();

        res.json({
            success: true,
            message: 'Refund rejected successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Process Refund (Admin Only) - Mark as Processed
exports.processRefund = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if refund is approved
        if (order.refundInfo.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Refund must be approved before processing'
            });
        }

        // Update refund info
        order.refundInfo.status = 'Processed';
        order.refundInfo.processedAt = new Date();

        await order.save();

        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
