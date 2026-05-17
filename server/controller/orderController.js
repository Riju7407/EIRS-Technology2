const Order = require('../model/orderSchema.js');
const { syncOrderToCrm, fireAndForget } = require('../services/crmSyncService');

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

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-create:${order._id}`
        );

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

const isWithinSevenDays = (deliveredAt) => {
    if (!deliveredAt) return false;
    return (new Date() - new Date(deliveredAt)) <= 7 * 24 * 60 * 60 * 1000;
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

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        if (status === 'Delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-status:${order._id}`
        );

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
        const orders = await Order.find()
            .populate('userId', 'name email')
            .sort({ orderDate: -1 });

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

// Allow users to delete their own pending/failed orders (not admin-only)
exports.deleteUserOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Only owner can delete
        if (order.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Disallow deleting completed payments
        if (order.paymentStatus === 'Completed') {
            return res.status(400).json({ success: false, message: 'Cannot delete a completed order' });
        }

        await Order.findByIdAndDelete(orderId);
        return res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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

        // For Cash on Delivery / pending payments, mark payment as Cancelled too
        if (['Pending', 'Failed'].includes(order.paymentStatus) || order.paymentMethod === 'CashOnDelivery') {
            order.paymentStatus = 'Cancelled';
        }

        await order.save();

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-cancel:${order._id}`
        );

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

        // Can only request refund for Cancelled orders paid online
        if (order.status !== 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Can only request refund for cancelled orders'
            });
        }
        if (order.paymentStatus !== 'Completed' || order.paymentMethod === 'CashOnDelivery') {
            return res.status(400).json({
                success: false,
                message: 'Refund request is only available for completed online payments'
            });
        }

        // Check if refund already requested
        if (order.refundInfo.status !== 'None') {
            return res.status(400).json({
                success: false,
                message: `Refund already ${order.refundInfo.status.toLowerCase()}`
            });
        }

        // Validate refund method and details
        const { returnPaymentMethod, returnPaymentDetails } = req.body;
        if (!returnPaymentMethod || !['UPI', 'Bank Transfer', 'Net Banking'].includes(returnPaymentMethod)) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid return payment method'
            });
        }
        if (!returnPaymentDetails || !String(returnPaymentDetails).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide return payment details for the selected method'
            });
        }

        // Update refund info
        order.refundInfo.status = 'Requested';
        order.refundInfo.reason = reason;
        order.refundInfo.refundAmount = order.totalPrice;
        order.refundInfo.requestedAt = new Date();
        order.refundInfo.returnPaymentMethod = returnPaymentMethod;
        order.refundInfo.returnPaymentDetails = String(returnPaymentDetails).trim();

        await order.save();

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-refund-request:${order._id}`
        );

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

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-refund-approve:${order._id}`
        );

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

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-refund-reject:${order._id}`
        );

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

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-refund-process:${order._id}`
        );

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

// Request after-delivery return or replace
exports.requestAfterDeliveryAction = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { type, reason, returnPaymentMethod, returnPaymentDetails } = req.body;
        const userId = req.user.id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to request after-delivery action for this order'
            });
        }

        if (order.status !== 'Delivered' || !order.deliveredAt) {
            return res.status(400).json({
                success: false,
                message: 'After-delivery requests are available only for delivered orders'
            });
        }

        if (!isWithinSevenDays(order.deliveredAt)) {
            return res.status(400).json({
                success: false,
                message: 'Eligibility for return or replace has expired'
            });
        }

        if (!['Return', 'Replace'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request type; choose Return or Replace'
            });
        }

        if (order.afterDeliveryRequest.status !== 'None') {
            return res.status(400).json({
                success: false,
                message: `After-delivery action already ${order.afterDeliveryRequest.status.toLowerCase()}`
            });
        }

        if (type === 'Return') {
            if (!returnPaymentMethod || !['UPI', 'Bank Transfer', 'Net Banking'].includes(returnPaymentMethod)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select a valid return payment method'
                });
            }
            if (!returnPaymentDetails || !String(returnPaymentDetails).trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide return payment details for the selected method'
                });
            }
            order.afterDeliveryRequest.returnPaymentMethod = returnPaymentMethod;
            order.afterDeliveryRequest.returnPaymentDetails = String(returnPaymentDetails).trim();
        }

        order.afterDeliveryRequest.type = type;
        order.afterDeliveryRequest.status = 'Requested';
        order.afterDeliveryRequest.reason = reason;
        order.afterDeliveryRequest.requestedAt = new Date();

        await order.save();

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-after-delivery-request:${order._id}`
        );

        res.json({
            success: true,
            message: `${type} request submitted successfully`,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Approve after-delivery request (Admin Only)
exports.approveAfterDeliveryRequest = async (req, res) => {
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

        if (order.afterDeliveryRequest.status !== 'Requested') {
            return res.status(400).json({
                success: false,
                message: 'After-delivery request is not in Requested status'
            });
        }

        order.afterDeliveryRequest.status = 'Approved';
        order.afterDeliveryRequest.approvedAt = new Date();
        order.afterDeliveryRequest.adminNotes = adminNotes || '';

        await order.save();

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-after-delivery-approve:${order._id}`
        );

        res.json({
            success: true,
            message: 'After-delivery request approved successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reject after-delivery request (Admin Only)
exports.rejectAfterDeliveryRequest = async (req, res) => {
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

        if (order.afterDeliveryRequest.status !== 'Requested') {
            return res.status(400).json({
                success: false,
                message: 'After-delivery request is not in Requested status'
            });
        }

        order.afterDeliveryRequest.status = 'Rejected';
        order.afterDeliveryRequest.adminNotes = adminNotes || '';

        await order.save();

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-after-delivery-reject:${order._id}`
        );

        res.json({
            success: true,
            message: 'After-delivery request rejected successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Process after-delivery request (Admin Only)
exports.processAfterDeliveryRequest = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.afterDeliveryRequest.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'After-delivery request must be approved before processing'
            });
        }

        order.afterDeliveryRequest.status = 'Processed';
        order.afterDeliveryRequest.processedAt = new Date();

        await order.save();

        fireAndForget(
            () => syncOrderToCrm(order),
            `order-after-delivery-process:${order._id}`
        );

        res.json({
            success: true,
            message: 'After-delivery request processed successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
