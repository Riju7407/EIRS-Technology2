# Payment System Testing & Verification 🧪

## Current Status
✅ Server running on port 5000  
✅ Razorpay npm package installed  
✅ Environment variables configured  
✅ Payment routes active  
✅ Enhanced error handling implemented  

---

## How to Test Payment Flow

### Setup Complete ✅
Before testing, ensure:
1. ✅ Server running: `npm start` in `/server` folder
2. ✅ Client running: `npm start` in `/client` folder
3. ✅ Browser open: http://localhost:3000
4. ✅ Developer Console open: Press `F12`

---

## Test Scenario 1: Buy Now from ProductsPage

### Steps:
1. **Navigate to Products**
   - Open: http://localhost:3000/products
   - Expected: See product cards with "Buy Now" button

2. **Login (if not already logged in)**
   - Click "Sign In" link
   - Use test account or create new
   - Expected: Redirected back to products

3. **Click "Buy Now"**
   - Click "Buy Now" button on any product
   - Expected: CheckoutModal opens

4. **Select Payment Method**
   - Razorpay selected by default
   - Expected: Modal shows payment form

5. **Click "Proceed to Payment"**
   - Watch browser console for logs
   - Expected console logs:
     ```
     Starting payment initialization...
     Razorpay script load result: true window.Razorpay: true
     ✓ Razorpay SDK loaded successfully
     Creating order on backend...
     Order created: {orderId: "order_...", ...}
     Opening Razorpay checkout with options:...
     ```

6. **Razorpay Modal Opens**
   - Expected: Razorpay payment gateway modal appears
   - If not: Check console for errors

### ❌ If You See "Payment initialization failed"

Check console (F12) for these logs:

**Error Log Example:**
```
❌ Razorpay SDK failed to load. Script loaded: false
```

**Solutions:**
- [ ] Refresh page completely (Ctrl+Shift+R)
- [ ] Check internet connection
- [ ] Wait 3-5 seconds and try again
- [ ] Restart server (might be slow)

---

## Test Scenario 2: Complete Payment (Test Card)

### After Razorpay Modal Opens:

1. **Select Payment Method**
   - Choose "Credit Card" or "Debit Card" or "UPI"

2. **Fill Payment Details**
   - Card Number: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - Name: Any name (will be prefilled)
   - Email: Any email (will be prefilled)

3. **Complete Payment**
   - Click "Pay" button
   - Expected: Process starts

4. **Success Response**
   - Expected console log:
     ```
     Payment handler called with response: {...}
     Verification response: {success: true, ...}
     ✓ Payment successful! Your order has been placed.
     ```
   - Expected page: Redirected to /orders
   - Expected alert: "✓ Payment successful!"

---

## Console Monitoring Guide

### Open Console:
- Press `F12` (or right-click → Inspect)
- Click "Console" tab
- Keep visible while testing

### What to Look For:

#### ✅ SUCCESS INDICATORS
```
✓ Razorpay SDK loaded successfully
Order created: {orderId: "order_...")
Opening Razorpay checkout...
Payment handler called with response
Verification response: {success: true}
```

#### ❌ ERROR INDICATORS
```
❌ Razorpay SDK failed to load
Cannot read property 'Razorpay'
Failed to load Razorpay script
Payment verification error
```

#### 📊 INFO MESSAGES
```
Starting payment initialization...
Razorpay already loaded (if retrying)
Razorpay script load result
Creating order on backend...
```

---

## API Endpoint Testing (Advanced)

### Test Razorpay Script Loading:
```javascript
// In browser console:
await paymentService.loadRazorpayScript()
  .then(res => console.log('✓ Razorpay loaded:', res))
  .catch(err => console.error('✗ Failed:', err));
```

### Test Order Creation:
```javascript
// Make sure you're logged in first
await paymentService.createOrder({
  amount: 10000, // ₹100
  currency: 'INR',
  items: [{
    productId: '123',
    quantity: 1,
    price: 100
  }],
  userId: 'your-user-id',
  email: 'test@example.com',
  phone: '9999999999'
})
.then(res => console.log('✓ Order created:', res))
.catch(err => console.error('✗ Failed:', err));
```

---

## Environment Variables Verification

### Server (.env):
```
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag ✅
RAZORPAY_KEY_SECRET=test_secret_key ✅
MONGO_URL=mongodb+srv://... ✅
```

### Client (.env):
```
REACT_APP_API_URL=http://localhost:5000 ✅
REACT_APP_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag ✅
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Payment initialization failed" | Refresh page, wait 5s, try again |
| Razorpay script not loading | Check internet, restart server |
| "Cannot read property 'Razorpay'" | Script load failed, refresh page |
| Order not created | Check backend logs, verify JWT token |
| Modal opens but payment fails | Contact support, check error message |

---

## Quick Troubleshooting

### If Payment Still Fails:

**1. Check Server Logs:**
```bash
# Terminal where server is running
# Should show no errors, should show MongoDB connected
```

**2. Check Network (DevTools → Network tab):**
```
Look for:
- POST /orders (should be 200)
- POST /verify-payment (will be called after payment)
```

**3. Check Storage:**
```javascript
// In console:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

**4. Check Routes:**
```
Payment router should have:
- POST /orders
- POST /verify-payment
- GET /payment-history
- GET /orders/:id
- POST /buy-now
```

---

## Success Criteria ✅

When everything works correctly:

1. **"Buy Now" visible** on product cards
2. **CheckoutModal opens** without errors
3. **Console shows** "✓ Razorpay SDK loaded successfully"
4. **Razorpay modal opens** when clicking "Proceed to Payment"
5. **Payment completes** with success message
6. **Redirects to /orders** page

---

## Files We Enhanced

### 1. client/src/services/paymentService.js
- Enhanced script loading with duplicate prevention
- Better error handling
- Detailed logging

### 2. client/src/components/CheckoutModal.js
- Step-by-step detailed logging
- Better error messages
- Improved validation

### 3. server/.env (NEW)
- Added RAZORPAY_KEY_ID
- Added RAZORPAY_KEY_SECRET

### 4. client/.env (NEW)
- Added REACT_APP_API_URL
- Added REACT_APP_RAZORPAY_KEY_ID

---

## Next Steps

1. **Test Buy Now** following "Test Scenario 1"
2. **Monitor Console** for all logs
3. **Use Test Card** `4111 1111 1111 1111`
4. **Complete Payment** flow
5. **Verify Success** by checking /orders page

If you see any errors in console, let us know the exact error message!

---

**Ready to Test!** 🚀  
Start with the test scenarios above and monitor the browser console for detailed output.
