# Payment Gateway - Step-by-Step Installation & Testing Guide

## 📋 Prerequisites Checklist

Before you start, ensure you have:
- [x] Node.js 14+ installed
- [x] npm or yarn package manager
- [x] MongoDB connection (local or Atlas)
- [x] Git (for version control)
- [x] Text editor (VS Code recommended)
- [x] Browser with developer tools

---

## 🔧 Installation Steps

### Step 1: Update Backend Dependencies

**Terminal 1 - Backend Setup**
```bash
# Navigate to server directory
cd "c:\Users\rijus\Desktop\EIRS 2\server"

# Install Razorpay package
npm install razorpay

# Verify installation
npm list razorpay
```

**Expected Output:**
```
server@1.0.0 
└── razorpay@2.9.2
```

### Step 2: Update Frontend Dependencies

**Terminal 2 - Frontend Setup**
```bash
# Navigate to client directory
cd "c:\Users\rijus\Desktop\EIRS 2\client"

# Install Razorpay package
npm install razorpay

# Verify installation
npm list razorpay
```

**Expected Output:**
```
client@0.1.0
└── razorpay@2.9.2
```

### Step 3: Configure Environment Variables

#### Backend Configuration
Create/Update `.env` in server directory:

```bash
# Navigate to server folder
cd "c:\Users\rijus\Desktop\EIRS 2\server"

# Create .env file (if not exists)
type nul > .env
```

Add these lines to `.env`:
```env
# Razorpay Test Credentials (Pre-configured - No changes needed for testing)
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=test_secret_key

# MongoDB
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/eirs

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend Configuration
Create/Update `.env` in client directory:

```bash
# Navigate to client folder
cd "c:\Users\rijus\Desktop\EIRS 2\client"

# Create .env file (if not exists)
type nul > .env
```

Add these lines to `.env`:
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
REACT_APP_API_URL=http://localhost:5000
```

### Step 4: Start the Application

#### Terminal 1: Start Backend
```bash
cd "c:\Users\rijus\Desktop\EIRS 2\server"
npm start
```

**Expected Output:**
```
EIRS Technology API Server running on http://localhost:5000
Database connected: MongoDB connection successful
Listening on port 5000
```

#### Terminal 2: Start Frontend
```bash
cd "c:\Users\rijus\Desktop\EIRS 2\client"
npm start
```

**Expected Output:**
```
Compiled successfully!
Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

**Both terminals should show "compiled successfully" and the app should open in your browser.**

---

## 🧪 Testing the Payment Gateway

### Test 1: Login & Browse Products

1. **Open Application**
   - Browser: http://localhost:3000
   - App should load successfully

2. **Create Account or Login**
   ```
   Email: test@example.com
   Password: Test@123
   ```
   - If account exists, login
   - If not, signup first

3. **Navigate to Products**
   - Click "Products" in header
   - Products should load with prices

**✅ Expected Result**: You should see products with prices (₹3500, ₹4500, etc.)

---

### Test 2: Buy Now Button

1. **Select a Product**
   - Click on any product card
   - Product detail page opens

2. **Verify Elements**
   - [✓] Product price visible (e.g., ₹5000)
   - [✓] Stock available (e.g., "10 Available")
   - [✓] Quantity selector visible
   - [✓] "Buy Now" button visible (logged-in users)

3. **Test Quantity Selector**
   - Click "+" button to increase quantity
   - Click "−" button to decrease quantity
   - Verify min=1, max=stock
   - Try changing via input field

**✅ Expected Result**: Quantity controls work smoothly, limits enforced

---

### Test 3: Checkout Modal

1. **Click "Buy Now" Button**
   - Modal should appear with fadeIn animation
   - Should not be dismissible by clicking outside

2. **Verify Modal Content**
   - [✓] Order summary displays correctly
   - [✓] Product name visible
   - [✓] Quantity shows correct amount
   - [✓] Price calculation correct
   - [✓] Tax (18%) calculated correctly
   - [✓] Total amount = subtotal + tax

3. **Verify Payment Methods**
   - [✓] "All Payment Methods" option selected by default
   - [✓] Shows icons for UPI, Card, Wallet
   - [✓] Description: "UPI, Debit Card, Credit Card, Net Banking, Wallet"

4. **Verify User Info**
   - [✓] Your name displayed
   - [✓] Your email displayed
   - [✓] Note about phone number during payment

**✅ Expected Result**: Modal displays correctly with all information

---

### Test 4: Razorpay Payment Window

1. **Click "Proceed to Payment"**
   - Razorpay window should open (full screen or popup)
   - Takes 1-2 seconds to load

2. **Select Payment Method**
   - Default: UPI
   - Click to change payment method
   - Select "Credit Card" for testing

3. **Use Test Card (Success)**
   ```
   Card Number:    4111 1111 1111 1111
   Expiry:         12/25 (or any future date)
   CVV:            123
   Name:           Your Name
   OTP:            123456
   ```

4. **Click "Pay Now"**
   - Razorpay shows processing
   - Should succeed with test card
   - Modal closes

**✅ Expected Result**: Payment completes without errors

---

### Test 5: Order Confirmation

1. **After Payment Success**
   - Browser redirects to `/orders` page
   - Shows "Order confirmed" message
   - Modal closes

2. **Verify Cart is Cleared**
   - Click cart icon in header
   - Should show "0 items" or empty cart
   - Refresh page - cart still empty

3. **Check Order Details Page**
   - Navigate to Orders page (/orders)
   - Your order should appear:
     - Order ID
     - Total amount (with tax)
     - Payment status: "completed"
     - Order status: "confirmed"
     - Timestamp

**✅ Expected Result**: Order appears in history with correct details

---

### Test 6: Cart Checkout Flow

1. **Add Multiple Products**
   - Go to Products page
   - Click "Add to Cart" on 2-3 different products
   - Cart should show item count

2. **Navigate to Cart**
   - Click cart icon
   - See all items with quantities, prices
   - See subtotal, shipping, tax, total

3. **Click "Proceed to Checkout"**
   - CheckoutModal opens
   - Shows all items in order summary
   - Correct total calculation

4. **Complete Payment**
   - Use test card (4111 1111 1111 1111)
   - Complete payment process

5. **Verify Order**
   - Should appear in Orders page with all items
   - Subtotal = sum of all items
   - Total = subtotal + 18% tax

**✅ Expected Result**: Multi-item order works correctly

---

### Test 7: Payment Failure Scenario

1. **Click "Buy Now"**
   - Quantity: 1
   - Click "Proceed to Payment"

2. **Use Test Failure Card**
   ```
   Card Number:    4222 2222 2222 2222
   Expiry:         12/25
   CVV:            123
   OTP:            123456
   ```

3. **Click "Pay Now"**
   - Razorpay shows "Payment failed"
   - Error message appears

4. **Verify State**
   - Modal stays open
   - Can retry or cancel
   - Clicking outside closes modal

**✅ Expected Result**: Error handling works properly

---

### Test 8: Not Logged In User

1. **Logout if Logged In**
   - Click user menu
   - Click "Logout"

2. **Go to Product Detail**
   - Click any product
   - Should show "Login to Buy" button instead of "Buy Now"

3. **Click "Login to Buy"**
   - Redirects to login page
   - Can login and return

4. **Try Adding to Cart**
   - "Add to Cart" still works (no login needed)
   - Cart shows items

5. **Try Checking Out**
   - Click "Proceed to Checkout"
   - Should show "Login to Checkout" link
   - Clicking redirects to login

**✅ Expected Result**: Proper authentication checks in place

---

## 🔍 Database Verification

### Check MongoDB for Orders

1. **Connect to MongoDB Atlas**
   - Go to https://www.mongodb.com/cloud/atlas
   - Login to your account
   - Select your cluster

2. **Navigate to Collections**
   - Database: Select your database
   - Collection: Select "orders"

3. **View Documents**
   ```javascript
   {
     "_id": ObjectId("..."),
     "userId": ObjectId("..."),
     "items": [
       {
         "productId": ObjectId("..."),
         "quantity": 1,
         "price": 5000
       }
     ],
     "totalAmount": 5900,
     "paymentMethod": "razorpay",
     "paymentStatus": "completed",
     "orderStatus": "confirmed",
     "razorpayOrderId": "order_1DP5mmOl...",
     "razorpayPaymentId": "pay_1DP5mmOl...",
     "razorpaySignature": "signature_hash...",
     "customerEmail": "user@example.com",
     "paidAt": ISODate("2024-01-25T10:30:00Z"),
     "createdAt": ISODate("2024-01-25T10:29:00Z"),
     "updatedAt": ISODate("2024-01-25T10:30:00Z")
   }
   ```

**✅ Verification**: Order exists with payment details

---

## 📊 Browser Developer Tools Verification

### Console Logs
```javascript
// Should see these logs:
"API_BASE_URL configured as: http://localhost:5000"
"Razorpay script loaded successfully"
"Token added to request: POST http://localhost:5000/payment/orders"
"API Response successful: 201 http://localhost:5000/payment/orders"
```

### Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Perform payment
4. Should see:
   - `POST /payment/orders` → Status 200
   - `POST /verify-payment` → Status 200
   - `GET /orders` → Status 200

### LocalStorage
1. Open DevTools → Application
2. LocalStorage → localhost:3000
3. Should see:
   - `token` - JWT token (long string)
   - `user` - User object JSON
   - No `cart` key (cleared after payment)

---

## ✅ Complete Testing Checklist

### Functionality
- [ ] Login/Logout works
- [ ] Products display with prices
- [ ] "Buy Now" button appears for logged-in users
- [ ] Quantity selector works (+/- buttons)
- [ ] CheckoutModal opens with correct data
- [ ] Order summary shows correct calculations
- [ ] Payment method options visible
- [ ] Razorpay payment window opens
- [ ] Payment processing works
- [ ] Order confirmation appears
- [ ] Cart clears after payment
- [ ] Order appears in payment history

### Security
- [ ] Cannot access checkout without login
- [ ] Cannot modify order amount in frontend
- [ ] Signature verification on backend
- [ ] JWT token required for all payment endpoints
- [ ] Payment details stored securely

### Data Integrity
- [ ] Order saved to MongoDB
- [ ] Payment status correct
- [ ] Order status correct
- [ ] Razorpay IDs stored
- [ ] Signature stored
- [ ] Timestamps correct
- [ ] User relationship correct

### User Experience
- [ ] Modal animations smooth
- [ ] Error messages clear
- [ ] Feedback on button clicks
- [ ] Loading states visible
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Intuitive flow

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'razorpay'"
**Solution**:
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install razorpay --save
```

### Issue: Razorpay script not loading
**Solution**:
```javascript
// Check in browser console:
console.log(window.Razorpay); // Should not be undefined

// If undefined:
// 1. Hard refresh page (Ctrl+Shift+R)
// 2. Check network tab for CDN access
// 3. Try different browser
```

### Issue: "Payment verification failed"
**Solution**:
```
1. Verify RAZORPAY_KEY_SECRET in .env matches actual secret
2. Check order exists in MongoDB
3. Verify timestamp (orders expire in 15 minutes)
4. Check server logs for detailed error
```

### Issue: Cart not clearing after payment
**Solution**:
```javascript
// Manual fix - open browser console:
localStorage.removeItem('cart');
location.reload();
```

### Issue: Orders don't appear in history
**Solution**:
1. Verify you're logged in (token in localStorage)
2. Check order status is 'confirmed'
3. Check payment status is 'completed'
4. Check userId matches
5. Verify MongoDB connection

---

## 📈 Performance Testing

### Measure Load Times
```javascript
// In browser console:
console.time('Payment Order Creation');
// [Perform payment]
console.timeEnd('Payment Order Creation');
```

**Target Times**:
- Order creation: < 500ms
- Verification: < 1000ms
- Modal open: < 300ms
- Payment history load: < 2000ms

---

## 🎓 Learning Resources

### Understanding the Flow
1. Read `PAYMENT_GATEWAY_GUIDE.md` - Complete technical details
2. Read `PAYMENT_VISUAL_REFERENCE.md` - Visual diagrams
3. Check `PAYMENT_IMPLEMENTATION_SUMMARY.md` - Summary

### Razorpay Documentation
- Main Docs: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Integration Guide: https://razorpay.com/docs/integration/
- Test Mode: https://razorpay.com/docs/development/test-mode/

### Code Examples
- Check `server/router/paymentRouter.js` - Backend implementation
- Check `client/services/paymentService.js` - Frontend API calls
- Check `client/components/CheckoutModal.js` - UI component

---

## 🚀 Next Steps After Testing

1. **Run Full Test Suite**
   - Test all scenarios from this guide
   - Document any issues found
   - Fix issues if any

2. **Performance Optimization**
   - Monitor response times
   - Optimize database queries
   - Cache where applicable

3. **Production Deployment**
   - Get production Razorpay keys
   - Update environment variables
   - Enable HTTPS
   - Deploy to production server

4. **Post-Launch Monitoring**
   - Monitor payment success rate
   - Track error logs
   - Watch for fraud attempts
   - Monitor customer feedback

---

## 📞 Support Contact

- **Razorpay**: support@razorpay.com
- **Email**: Contact your administrator
- **Documentation**: See markdown files in project root

---

**Last Updated**: January 25, 2026  
**Version**: 1.0.0  
**Status**: ✅ Ready for Testing
