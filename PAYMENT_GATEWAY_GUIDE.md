# Payment Gateway Implementation Guide

## Overview
This document explains the complete payment gateway integration using Razorpay, supporting UPI, Debit Card, Credit Card, and more payment methods.

## Features Implemented

### 1. **Buy Now Button** (ProductDetailPage)
- ✅ Available only for logged-in users
- ✅ Quantity selector with +/- buttons
- ✅ Direct checkout modal opens
- ✅ Stock validation before purchase

### 2. **Cart Checkout** (CartPage)
- ✅ "Proceed to Checkout" button for logged-in users
- ✅ Full cart summary with tax calculation (18%)
- ✅ Integrated CheckoutModal for payment
- ✅ One-click payment processing

### 3. **Payment Methods Supported**
- ✅ UPI (Google Pay, PhonePe, Paytm, BHIM)
- ✅ Debit Card
- ✅ Credit Card
- ✅ Net Banking
- ✅ Digital Wallets

### 4. **Order Management**
- ✅ Order creation with Razorpay
- ✅ Payment verification with signature validation
- ✅ Order status tracking (pending → confirmed → shipped → delivered)
- ✅ Payment history retrieval

## Installation & Setup

### Backend Setup

#### 1. Install Dependencies
```bash
cd server
npm install
```

This installs the `razorpay` package automatically.

#### 2. Environment Variables
Create/update `.env` file in server directory:
```env
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=test_secret_key
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

**Note**: Replace test keys with production keys from Razorpay dashboard.

#### 3. Get Razorpay Keys
- Visit: https://dashboard.razorpay.com/
- Sign up or login
- Navigate to Settings → API Keys
- Copy "Key ID" and "Key Secret"

### Frontend Setup

#### 1. Install Dependencies
```bash
cd client
npm install
```

#### 2. Environment Variables
Create `.env` file in client directory:
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
REACT_APP_API_URL=http://localhost:5000
```

## API Endpoints

### 1. Create Order
```
POST /payment/orders
Headers: Authorization: Bearer {token}
Body: {
  amount: 5000,          // in paise (5000 paise = ₹50)
  currency: "INR",
  items: [{
    productId: "xxx",
    quantity: 1,
    price: 50
  }],
  email: "user@example.com",
  phone: "9999999999"
}
Response: {
  orderId: "order_1DP5mmOl...",
  key: "rzp_test_...",
  amount: 5000,
  currency: "INR"
}
```

### 2. Verify Payment
```
POST /payment/verify-payment
Headers: Authorization: Bearer {token}
Body: {
  orderId: "order_id",
  razorpay_order_id: "order_1DP5mmOl...",
  razorpay_payment_id: "pay_1DP5mmOl...",
  razorpay_signature: "signature_hash"
}
Response: {
  success: true,
  message: "Payment verified successfully",
  order: { ...orderDetails }
}
```

### 3. Get Payment History
```
GET /payment/payment-history
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  orders: [{...}, {...}]
}
```

### 4. Get Order Details
```
GET /payment/orders/:orderId
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  order: {...}
}
```

## User Flow

### 1. Product Purchase Flow
```
User browses product
    ↓
User clicks "Buy Now" button
    ↓
Product added to cart
    ↓
CheckoutModal opens
    ↓
User reviews order summary
    ↓
User selects payment method
    ↓
Razorpay payment window opens
    ↓
User completes payment
    ↓
Payment verification on server
    ↓
Order marked as confirmed
    ↓
Redirect to /orders page
    ↓
Cart cleared from localStorage
```

### 2. Cart Checkout Flow
```
User reviews cart items
    ↓
User clicks "Proceed to Checkout"
    ↓
CheckoutModal opens with all cart items
    ↓
Order summary shows:
  - All items with quantities
  - Subtotal
  - Shipping (Free)
  - Tax (18%)
  - Total
    ↓
User selects payment method
    ↓
Click "Proceed to Payment"
    ↓
[Same as above from Razorpay onwards]
```

## Payment Method Details

### UPI
- Works on all major Indian banks
- Apps: Google Pay, PhonePe, Paytm, BHIM
- Instant payment confirmation
- No additional charges

### Debit Card
- All Indian banks supported
- Secure OTP verification
- Processing time: Instant
- Charges: May apply per bank

### Credit Card
- Visa, Mastercard, RuPay
- 3D Secure authentication
- Processing time: Instant
- Cashback/Rewards applicable

### Net Banking
- All major Indian banks
- Bank login required
- Processing time: Instant
- Security: Bank-level

## Database Schema

### Order Document
```javascript
{
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentMethod: String,      // 'razorpay', 'upi', 'card', etc.
  paymentStatus: String,       // 'pending', 'completed', 'failed', 'refunded'
  orderStatus: String,         // 'pending', 'confirmed', 'shipped', 'delivered'
  razorpayOrderId: String,     // Razorpay order ID
  razorpayPaymentId: String,   // Razorpay payment ID
  razorpaySignature: String,   // Payment signature
  customerEmail: String,
  customerPhone: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  paidAt: Date,
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

### 1. Payment Signature Verification
- All payments verified with HMAC-SHA256 signature
- Signature created using order ID + payment ID + secret key
- Prevents tampering and fraudulent transactions

### 2. JWT Authentication
- All payment endpoints require valid JWT token
- User ID extracted from token for verification
- Orders can only be accessed by the user who created them

### 3. Unique Order IDs
- Each order has unique razorpayOrderId
- Prevents duplicate payments
- Sparse indexing for efficient queries

## Testing Payment Gateway

### Test Mode
The system uses Razorpay test keys by default:
- Key ID: `rzp_test_1DP5mmOlF5G5ag`
- Key Secret: `test_secret_key`

### Test Payment Options
In test mode, use these test card details:

**Card Success (4111 1111 1111 1111)**
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

**Card Failure (4222 2222 2222 2222)**
- Card: 4222 2222 2222 2222
- Expiry: Any future date
- CVV: Any 3 digits

### UPI Testing
Test UPI IDs (Test Mode):
- `success@razorpay` - Payment succeeds
- `failure@razorpay` - Payment fails
- `pending@razorpay` - Payment pending

## Troubleshooting

### Issue: Payment modal doesn't open
**Solution**: 
- Verify Razorpay script is loaded: `window.Razorpay` should exist
- Check browser console for errors
- Ensure REACT_APP_RAZORPAY_KEY_ID is set

### Issue: Payment verification fails
**Solution**:
- Check signature matches on backend
- Verify order exists in database
- Check timestamp - orders expire after 15 minutes

### Issue: Cart not clearing after payment
**Solution**:
- Verify localStorage.removeItem('cart') is called
- Check browser's localStorage in DevTools
- Hard refresh page after payment

### Issue: Orders not appearing in history
**Solution**:
- Verify user is logged in (check token in localStorage)
- Check MongoDB connection
- Verify orderStatus is 'confirmed'

## Production Checklist

- [ ] Replace test keys with production keys from Razorpay
- [ ] Update environment variables in `.env` (server & client)
- [ ] Enable HTTPS (required for production Razorpay)
- [ ] Test payment flow end-to-end
- [ ] Set up payment failure notifications
- [ ] Configure webhook for automatic payment status updates
- [ ] Set up order confirmation emails
- [ ] Test with real cards (if approved by bank)
- [ ] Monitor transaction logs
- [ ] Set up customer support process for failed payments

## Files Modified/Created

### Backend
- ✅ `server/router/paymentRouter.js` - Payment routes (NEW)
- ✅ `server/model/orderSchema.js` - Added payment fields
- ✅ `server/package.json` - Added razorpay dependency
- ✅ `server/server.js` - Added payment routes

### Frontend
- ✅ `client/src/services/paymentService.js` - Payment API calls (NEW)
- ✅ `client/src/components/CheckoutModal.js` - Payment modal (NEW)
- ✅ `client/src/styles/CheckoutModal.css` - Modal styles (NEW)
- ✅ `client/src/pages/ProductDetailPage.js` - Buy Now button
- ✅ `client/src/pages/CartPage.js` - Checkout integration
- ✅ `client/src/styles/ProductDetailPage.css` - Quantity selector styling
- ✅ `client/package.json` - Added razorpay dependency

## Next Steps

1. **Email Notifications**
   - Send order confirmation emails
   - Send payment success/failure notifications

2. **Order Tracking**
   - Create order status tracking page
   - Add order history with filters

3. **Admin Dashboard**
   - View all orders
   - Update order status
   - Process refunds

4. **Webhook Implementation**
   - Set up Razorpay webhook for real-time updates
   - Automatic status updates without polling

5. **Analytics**
   - Track payment success rate
   - Monitor transaction values
   - Generate revenue reports

## Support & Resources

- Razorpay Docs: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Integration Guide: https://razorpay.com/docs/integration/

---

**Last Updated**: January 25, 2026
**Version**: 1.0.0
