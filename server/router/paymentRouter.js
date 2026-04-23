const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../model/orderSchema');
const ServiceBooking = require('../model/serviceBookingSchema');
const Service = require('../model/serviceSchema');
const jwtAuth = require('../middleware/jwtAuth');

const router = express.Router();

/* 
   Razorpay singleton initialisation (live keys)
 */
let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials missing. Set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env');
    }
    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    console.log('Razorpay initialised with key:', keyId);
  }
  return razorpay;
};

/* 
   POST /payment/orders  create Razorpay order
 */
router.post('/orders', jwtAuth, async (req, res) => {
  try {
    const { amount, currency = 'INR', items, email, phone, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: 'Cart items are required' });

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.phone)
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });

    const normMap = {
      upi: 'UPI', card: 'Card', 'credit card': 'Card', 'debit card': 'Card',
      netbanking: 'NetBanking', 'net banking': 'NetBanking',
      wallet: 'Wallet', cashondelivery: 'CashOnDelivery',
      'cash on delivery': 'CashOnDelivery', cod: 'CashOnDelivery',
    };
    const normalizedPaymentMethod = normMap[(paymentMethod || '').toLowerCase()] || 'Card';

    let razorpayOrderId;
    try {
      const rzpOrder = await getRazorpay().orders.create({
        amount: Math.round(amount),
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          userId: userId.toString(),
          email: email || shippingAddress.email || '',
          company: 'EIRS Technology',
          gst: '29AANCR6717K1ZN',
        },
      });
      razorpayOrderId = rzpOrder.id;
      console.log('Razorpay order created:', razorpayOrderId);
    } catch (rzpErr) {
      console.error('Razorpay create-order error:', rzpErr.message);
      return res.status(502).json({
        success: false,
        message: 'Payment gateway error: ' + (rzpErr.error?.description || rzpErr.message),
      });
    }

    const mappedItems = items.map((item, idx) => {
      const productId = item.productId || item._id || item.id;
      if (!productId) throw new Error(`Item[${idx}] is missing a productId`);
      return {
        productId,
        productName: item.productName || item.name || 'Product',
        category: item.category || '',
        brand: item.brand || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || item.productImage || '',
      };
    });

    const totalItems = mappedItems.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = amount / 100;

    const order = new Order({
      userId,
      items: mappedItems,
      totalPrice,
      totalItems,
      shippingAddress: {
        fullName: shippingAddress.fullName || '',
        email: shippingAddress.email || email || '',
        phone: shippingAddress.phone || phone || '',
        address: shippingAddress.address || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zipCode || '',
      },
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: 'Pending',
      razorpayOrderId,
      customerEmail: email || shippingAddress.email,
      customerPhone: phone || shippingAddress.phone,
      status: 'Pending',
      orderDate: new Date(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await order.save();
    console.log('Order saved:', order._id);

    return res.json({
      success: true,
      orderId: razorpayOrderId,
      mongoOrderId: order._id.toString(),
      key: process.env.RAZORPAY_KEY_ID,
      amount: Math.round(amount),
      currency,
    });
  } catch (err) {
    console.error('/orders error:', err.message);
    const isVal = err.message?.includes('validation') || err.message?.includes('missing');
    return res.status(isVal ? 400 : 500).json({ success: false, message: err.message || 'Failed to create order' });
  }
});

/* 
   POST /payment/verify-payment
 */
router.post('/verify-payment', jwtAuth, async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod } = req.body;
    const userId = req.user.id;

    if (paymentMethod === 'CashOnDelivery') {
      const order = await Order.findById(orderId);
      if (!order || order.userId.toString() !== userId.toString())
        return res.status(404).json({ success: false, message: 'Order not found' });
      order.paymentStatus = 'Pending';
      order.paymentMethod = 'CashOnDelivery';
      order.status = 'Confirmed';
      order.razorpayPaymentId = 'cod_' + orderId;
      await order.save();
      return res.json({ success: true, message: 'Order confirmed for Cash on Delivery', order });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      console.warn('Signature mismatch');
      return res.status(400).json({ success: false, message: 'Payment verification failed - invalid signature' });
    }

    const order = await Order.findById(orderId);
    if (!order || order.userId.toString() !== userId.toString())
      return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = 'Completed';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = 'Confirmed';
    order.paidAt = new Date();
    await order.save();

    console.log('Payment verified, order confirmed:', order._id);
    return res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (err) {
    console.error('/verify-payment error:', err.message);
    return res.status(500).json({ success: false, message: 'Payment verification failed', error: err.message });
  }
});

/*
  Service Booking Payments
  -----------------------
  Flow:
   1) client creates ServiceBooking via /auth/service-bookings
   2) client calls POST /payment/service-bookings/order with bookingId
   3) client opens Razorpay checkout
   4) client calls POST /payment/service-bookings/verify to confirm payment
*/

// POST /payment/service-bookings/order
router.post('/service-bookings/order', jwtAuth, async (req, res) => {
  try {
    const { bookingId, currency = 'INR' } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId is required' });

    const booking = await ServiceBooking.findById(bookingId);
    if (!booking || booking.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: 'Service booking not found' });
    }

    if (booking.paymentStatus === 'Completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed for this booking' });
    }

    // Ensure we have a valid price
    const service = await Service.findById(booking.serviceId).select('price name');
    const price = Number(booking.servicePrice ?? service?.price ?? 0);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, message: 'Service price is invalid for payment' });
    }

    const amountInPaise = Math.round(price * 100);

    let rzpOrder;
    try {
      rzpOrder = await getRazorpay().orders.create({
        amount: amountInPaise,
        currency,
        receipt: `svc_${booking._id}`,
        notes: {
          bookingId: booking._id.toString(),
          serviceId: booking.serviceId.toString(),
          serviceName: booking.serviceName || service?.name || 'Service',
          userId: req.user.id.toString(),
          company: 'EIRS Technology',
        },
      });
    } catch (rzpErr) {
      console.error('Razorpay service-booking create-order error:', rzpErr.message);
      return res.status(502).json({
        success: false,
        message: 'Payment gateway error: ' + (rzpErr.error?.description || rzpErr.message),
      });
    }

    booking.servicePrice = price;
    booking.currency = currency;
    booking.paymentMethod = 'Razorpay';
    booking.paymentStatus = 'Pending';
    booking.razorpayOrderId = rzpOrder.id;
    await booking.save();

    return res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: rzpOrder.id,
      bookingId: booking._id.toString(),
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err) {
    console.error('/service-bookings/order error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create service payment order' });
  }
});

// POST /payment/service-bookings/verify
router.post('/service-bookings/verify', jwtAuth, async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing required payment verification fields' });
    }

    const booking = await ServiceBooking.findById(bookingId);
    if (!booking || booking.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: 'Service booking not found' });
    }

    if (booking.razorpayOrderId && booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Order ID mismatch for this booking' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      booking.paymentStatus = 'Failed';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed - invalid signature' });
    }

    booking.paymentStatus = 'Completed';
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paidAt = new Date();
    booking.status = 'Confirmed';
    await booking.save();

    return res.json({ success: true, message: 'Service booking payment verified', booking });
  } catch (err) {
    console.error('/service-bookings/verify error:', err.message);
    return res.status(500).json({ success: false, message: 'Payment verification failed', error: err.message });
  }
});

/* 
   POST /payment/webhook  Razorpay Webhook (raw body)
   Register URL in Razorpay Dashboard -> Webhooks:
   https://<your-domain>/payment/webhook
   Add RAZORPAY_WEBHOOK_SECRET to .env
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSig = req.headers['x-razorpay-signature'];

    if (webhookSecret && receivedSig) {
      // Use rawBody captured by express.json verify callback
      const rawBody = req.rawBody;
      if (!rawBody) {
        console.warn('Webhook: rawBody not available for signature verification');
        return res.status(400).json({ success: false, message: 'Cannot verify webhook signature' });
      }
      const expectedSig = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (expectedSig !== receivedSig) {
        console.warn('Webhook signature invalid');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body; // already parsed by express.json
    console.log('Webhook event:', event.event);
    const entity = event?.payload?.payment?.entity;

    if (event.event === 'payment.captured' && entity) {
      const order = await Order.findOne({ razorpayOrderId: entity.order_id });
      if (order && order.paymentStatus !== 'Completed') {
        order.paymentStatus = 'Completed';
        order.razorpayPaymentId = entity.id;
        order.status = 'Confirmed';
        order.paidAt = new Date();
        await order.save();
        console.log('Webhook: order confirmed via payment.captured:', order._id);
      }
    }

    if (event.event === 'payment.failed' && entity) {
      const order = await Order.findOne({ razorpayOrderId: entity.order_id });
      if (order) {
        order.paymentStatus = 'Failed';
        order.status = 'Cancelled';
        await order.save();
        console.log('Webhook: payment failed for order:', order._id);
      }
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(500).json({ success: false });
  }
});

/* 
   GET /payment/payment-history
 */
router.get('/payment-history', jwtAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'productName price');
    return res.json({ success: true, orders });
  } catch (err) {
    console.error('/payment-history error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
});

/* 
   GET /payment/orders/:orderId
 */
router.get('/orders/:orderId', jwtAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id }).populate('items.productId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, order });
  } catch (err) {
    console.error('/orders/:id error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

/* 
   POST /payment/buy-now
 */
router.post('/buy-now', jwtAuth, async (req, res) => {
  try {
    const { productId, quantity = 1, shippingAddress } = req.body;
    const userId = req.user.id;

    const Product = require('../model/productSchema');
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const amountInPaise = Math.round(product.price * quantity * 100);
    const rzpOrder = await getRazorpay().orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `buynow_${Date.now()}`,
      notes: { userId: userId.toString(), company: 'EIRS Technology' },
    });

    const order = new Order({
      userId,
      items: [{
        productId: product._id,
        productName: product.productName || product.name || 'Product',
        category: product.category || '',
        brand: product.brand || '',
        price: product.price,
        quantity,
        image: product.image || product.productImage || '',
      }],
      totalPrice: product.price * quantity,
      totalItems: quantity,
      shippingAddress: shippingAddress || {},
      paymentMethod: 'Card',
      paymentStatus: 'Pending',
      razorpayOrderId: rzpOrder.id,
      status: 'Pending',
      orderDate: new Date(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await order.save();
    return res.json({
      success: true,
      orderId: rzpOrder.id,
      mongoOrderId: order._id.toString(),
      key: process.env.RAZORPAY_KEY_ID,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err) {
    console.error('/buy-now error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to process buy-now' });
  }
});

/* 
   GET /payment/razorpay-link
 */
router.get('/razorpay-link', (_req, res) => {
  return res.json({
    success: true,
    link: 'https://razorpay.me/@eirstechnology',
    upiId: 'eirstechnology@razorpay',
  });
});

module.exports = router;
