# Razorpay Payment Gateway Setup

## Issue Resolution

The error "Failed to create order: Failed to create order" with "Authentication failed" indicates that the Razorpay API credentials are incorrect or invalid.

## Solution

### Step 1: Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/dashboard)
2. Sign up or Log in to your Razorpay account
3. Navigate to **Settings** → **API Keys**
4. You'll see two types of keys:
   - **Test Mode Keys** (for development/testing)
   - **Live Mode Keys** (for production)

### Step 2: Copy Test Credentials

For **Testing/Development**:
- Copy your **Test Key ID** (starts with `rzp_test_`)
- Copy your **Test Key Secret** (a long alphanumeric string)

### Step 3: Update .env File

In `/server/.env`, update:

```env
RAZORPAY_KEY_ID=YOUR_TEST_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_TEST_KEY_SECRET
```

**Example:**
```env
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=AbQTOYZasB7s6xZ6xZ6xZ6xZ
```

### Step 4: Restart Server

After updating the .env file:
```bash
# Stop the current server (Ctrl+C)
# Navigate to server directory
cd server

# Start the server again
npm start
```

### Step 5: Test Payment

1. Add a product to cart
2. Click "Buy Now" or "Proceed to Checkout"
3. Fill in shipping address
4. Click "Proceed to Payment"
5. You'll be redirected to Razorpay checkout

### Test Card Details

For testing in Razorpay Test Mode:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits

## Troubleshooting

### Error: "Authentication failed"
**Cause:** Invalid Razorpay credentials
**Fix:** Double-check your Key ID and Key Secret from Razorpay dashboard

### Error: "Network Error" or "Failed to load payment gateway"
**Cause:** Razorpay script not loading or credentials not set
**Fix:** 
1. Check internet connection
2. Verify credentials in .env file
3. Restart the server

### Error: "Order not found"
**Cause:** Razorpay Order ID not matching database order
**Fix:** Ensure database connection is working and orders are being saved

## Payment Flow

1. **Frontend**: Sends order details with shipping address
2. **Backend**: Creates Razorpay order API call
3. **Razorpay**: Returns order ID if credentials are valid
4. **Frontend**: Opens Razorpay checkout with order ID
5. **User**: Completes payment in Razorpay modal
6. **Razorpay**: Sends payment confirmation
7. **Backend**: Verifies payment signature
8. **Database**: Order marked as "Completed"

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to Git (it's in .gitignore)
- Never share your Key Secret publicly
- Always use Test Keys during development
- Switch to Live Keys only after thorough testing
- Store keys securely in production (use environment variables)

## Current Implementation

✅ **Features Implemented:**
- Address collection during checkout
- Razorpay SDK integration
- Payment verification
- Order creation with complete details
- Error handling and logging

## Files Modified

- `/server/router/paymentRouter.js` - Payment order creation & verification
- `/server/.env` - Razorpay credentials
- `/client/src/components/CheckoutModal.js` - Address form & payment UI
- `/client/src/styles/CheckoutModal.css` - Styling for checkout

---

**Last Updated:** January 25, 2026
**Status:** Ready for testing with valid Razorpay credentials
