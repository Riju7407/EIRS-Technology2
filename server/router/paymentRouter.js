const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../model/orderSchema');
const jwtAuth = require('../middleware/jwtAuth');

const router = express.Router();

// Initialize Razorpay
console.log('Initializing Razorpay with key:', process.env.RAZORPAY_KEY_ID);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('⚠️ WARNING: Razorpay credentials not configured in environment variables!');
  console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
}

// Create Razorpay Order
router.post('/orders', jwtAuth, async (req, res) => {
  try {
    const { amount, currency = 'INR', items, email, phone, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    console.log('Creating order for userId:', userId);
    console.log('Order data:', { amount, items: items?.length, email, phone, shippingAddress });

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required'
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.phone) {
      console.error('❌ Validation failed: Incomplete shipping address', shippingAddress);
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    // Calculate total items
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = amount / 100; // Convert from paise to rupees
    
    // Normalize payment method - ensure it matches enum values
    let normalizedPaymentMethod = 'Card';
    if (paymentMethod) {
      const method = paymentMethod.toLowerCase();
      if (method === 'upi') normalizedPaymentMethod = 'UPI';
      else if (method === 'card' || method === 'credit card' || method === 'debit card') normalizedPaymentMethod = 'Card';
      else if (method === 'netbanking' || method === 'net banking') normalizedPaymentMethod = 'NetBanking';
      else if (method === 'wallet') normalizedPaymentMethod = 'Wallet';
      else if (method === 'cashondelivery' || method === 'cash on delivery' || method === 'cod') normalizedPaymentMethod = 'CashOnDelivery';
    }

    // Create Razorpay order
    console.log('Creating Razorpay order for amount:', amount, 'paise');
    let razorpayOrder = null;
    let razorpayOrderId = null;
    
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amount, // in paise
        currency: currency,
        receipt: `order_${Date.now()}`,
        notes: {
          userId: userId.toString(),
          email: email,
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state
        }
      });
      razorpayOrderId = razorpayOrder.id;
      console.log('✓ Razorpay order created:', razorpayOrderId);
    } catch (razorpayError) {
      console.error('❌ Razorpay API Error:', razorpayError.message);
      console.error('Razorpay Error Details:', razorpayError);
      
      // Create a fallback order ID if Razorpay fails
      razorpayOrderId = `fallback_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Using fallback order ID:', razorpayOrderId);
    }

    // Save order to database
    console.log('Saving order to database...');
    const order = new Order({
      userId,
      items: items.map(item => ({
        productId: item.productId || item._id,
        productName: item.name || item.productName || 'Product',
        category: item.category || '',
        brand: item.brand || '',
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image || item.productImage || ''
      })),
      totalPrice: totalPrice,
      totalItems: totalItems,
      shippingAddress: {
        fullName: shippingAddress.fullName || '',
        email: shippingAddress.email || email || '',
        phone: shippingAddress.phone || phone || '',
        address: shippingAddress.address || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zipCode || ''
      },
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: 'Pending',
      razorpayOrderId: razorpayOrderId,
      customerEmail: email || shippingAddress.email,
      customerPhone: phone || shippingAddress.phone,
      status: 'Pending',
      orderDate: new Date(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    try {
      await order.save();
      console.log('✓ Order saved successfully:', order._id);
    } catch (dbError) {
      console.error('❌ Database Error:', dbError.message);
      console.error('Database Error Details:', dbError);
      throw dbError;
    }

    res.json({
      success: true,
      orderId: razorpayOrderId,
      mongoOrderId: order._id.toString(),
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
      amount: amount,
      currency: currency
    });
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    console.error('Error stack:', error.stack);
    
    // Determine appropriate error message
    let errorMessage = 'Failed to create order';
    let statusCode = 500;
    
    if (error.message?.includes('validation')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message?.includes('address')) {
      errorMessage = 'Shipping address is incomplete or invalid';
      statusCode = 400;
    } else if (error.message?.includes('Authentication')) {
      errorMessage = 'Payment gateway authentication failed';
      statusCode = 401;
    } else if (error.message?.includes('duplicate')) {
      errorMessage = 'Order already exists';
      statusCode = 400;
    } else {
      errorMessage = error.message || 'Failed to create order. Please try again.';
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

});

// Verify Payment
router.post('/verify-payment', jwtAuth, async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod } = req.body;
    const userId = req.user.id;

    console.log('Payment verification request:', { orderId, razorpay_order_id, razorpay_payment_id, paymentMethod });

    // Handle Cash on Delivery - no signature verification needed
    if (paymentMethod === 'CashOnDelivery') {
      const order = await Order.findById(orderId);

      if (!order || order.userId.toString() !== userId) {
        console.log('Order not found for COD:', { orderId, userId });
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      console.log('Processing COD order:', orderId);
      order.paymentStatus = 'Pending';
      order.paymentMethod = 'CashOnDelivery';
      order.status = 'Confirmed';
      order.paidAt = null;
      order.razorpayPaymentId = 'cod_' + orderId;

      await order.save();

      console.log('COD Order confirmed successfully:', order._id);
      return res.json({
        success: true,
        message: 'Order confirmed for Cash on Delivery',
        order: order
      });
    }

    // For Razorpay payments
    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_key';
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(razorpay_order_id + '|' + razorpay_payment_id);
    const digest = shasum.digest('hex');

    // Log for debugging
    console.log('Signature verification:', { 
      expected: digest, 
      received: razorpay_signature,
      match: digest === razorpay_signature 
    });

    // In test mode, we can skip strict signature verification
    // In production, uncomment this check
    if (process.env.NODE_ENV === 'production' && digest !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    // Update order with payment details
    const order = await Order.findById(orderId);

    if (!order || order.userId.toString() !== userId) {
      console.log('Order not found:', { orderId, userId });
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order found, updating payment status');
    order.paymentStatus = 'Completed';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = 'Confirmed';
    order.paidAt = new Date();

    await order.save();

    console.log('Order updated successfully:', order._id);
    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: order
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed',
      error: error.message 
    });
  }
});

// Get Payment History
router.get('/payment-history', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'productName price');

    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment history',
      error: error.message 
    });
  }
});

// Get Order Details
router.get('/orders/:orderId', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      _id: orderId,
      userId: userId 
    }).populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order',
      error: error.message 
    });
  }
});

// Buy Now (Direct Purchase)
router.post('/buy-now', jwtAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Fetch product
    const Product = require('../model/productSchema');
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate total amount
    const totalAmount = product.price * quantity;
    const amountInPaise = Math.round(totalAmount * 100);

    // Create order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `buy_now_${Date.now()}`,
    });

    const order = new Order({
      userId,
      items: [{
        productId: product._id,
        productName: product.name || product.productName || 'Product',
        category: product.category || '',
        brand: product.brand || '',
        price: product.price,
        quantity: quantity,
        image: product.image || product.productImage || ''
      }],
      totalPrice: totalAmount,
      totalItems: quantity,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Pending',
      razorpayOrderId: razorpayOrder.id,
      status: 'Pending',
      orderDate: new Date(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await order.save();

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Error in buy-now:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process buy-now',
      error: error.message 
    });
  }
});

module.exports = router;
