# Review System - Troubleshooting Guide

## Steps to Debug the Error

### 1. **Check Browser Console for Detailed Errors**
When you try to submit a review:
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Submit a review
4. Look for logs starting with 📤, ❌
5. Note the exact error message shown
6. Share that message for precise fix

### 2. **Check API Request/Response**
1. In DevTools, go to Network tab
2. Filter for requests containing "reviews"
3. Look for POST request to `/auth/reviews/add`
4. Click on it and check:
   - **Headers**: Verify Authorization header with Bearer token
   - **Request body**: Should contain productId, rating, comment
   - **Response**: Check status code and response body

### 3. **Common Error Messages & Solutions**

#### Error: "User ID not found in token"
- **Cause**: JWT doesn't have _id field
- **Fix**: Already applied in user schema (added name field)
- **Action**: Re-login after server restart

#### Error: "User name not found in token"
- **Cause**: JWT was created without name
- **Fix**: Already applied (updated user schema)
- **Action**: Re-login after server restart

#### Error: "User email not found in token"
- **Cause**: JWT missing email field
- **Fix**: Check if user has email in database
- **Action**: Update user in database if needed

#### Error: "Product not found"
- **Cause**: Invalid productId sent
- **Fix**: Verify product exists in database
- **Action**: Use a product that exists in your products list

#### Error: "Rating must be a number between 1 and 5"
- **Cause**: Rating is not a valid number
- **Fix**: Ensure rating is 1, 2, 3, 4, or 5
- **Action**: Select a star rating before submitting

#### Error: "Comment must be at least 10 characters"
- **Cause**: Comment is too short
- **Fix**: Write at least 10 characters
- **Action**: Add more detail to your review

#### Error: "Invalid product ID format"
- **Cause**: MongoDB ObjectId format is invalid
- **Fix**: Check if product ID is correct
- **Action**: Use products from your product list

### 4. **Server Console Debugging**
Start your server with:
```bash
cd server
npm start
```

Watch for logs with these prefixes:
- 📝 = Review request received
- ✅ = Success
- ❌ = Error
- 🔍 = Checking data
- ✍️ = Creating

### 5. **MongoDB Database Check**

Check if Review collection exists:
```javascript
// In MongoDB
db.reviews.find()
db.reviews.find().pretty()

// Check if Review collection has indexes
db.reviews.getIndexes()
```

### 6. **Step-by-Step Test**

#### Step 1: Verify Login Works
- [ ] Go to signin page
- [ ] Login with valid credentials
- [ ] Check localStorage has "token"

#### Step 2: Decode JWT Token
Open browser console and run:
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decode (without verification - for debugging only)
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Decoded JWT:', decoded);

// Should show: { id, email, isAdmin, name }
```

#### Step 3: Navigate to Product
- [ ] Go to Products page
- [ ] Click on any product
- [ ] Wait for product details to load
- [ ] Check console for any errors

#### Step 4: Submit Review
- [ ] Select a star rating
- [ ] Type a comment (at least 10 characters)
- [ ] Click Submit Review
- [ ] Check console for error logs

### 7. **Enable Verbose Logging**

Edit `ReviewForm.js` and add more logs:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('=== FORM SUBMISSION START ===');
  console.log('Rating:', rating, typeof rating);
  console.log('Comment:', comment, 'Length:', comment.length);
  console.log('ProductId:', productId);
  console.log('=== FORM SUBMISSION END ===');
  // ... rest of code
}
```

### 8. **Test with curl (Command Line)**

```bash
# Get JWT token first (after login, copy from localStorage)
export TOKEN="your-token-here"
export PRODUCT_ID="product-id-here"

# Test review submission
curl -X POST http://localhost:5000/auth/reviews/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "rating": 5,
    "comment": "This is a test review with at least ten characters"
  }'
```

### 9. **Verify Database Schema**

```javascript
// Check Review schema validation
db.reviews.insertOne({
  productId: ObjectId("..."),
  userId: ObjectId("..."),
  userName: "Test User",
  userEmail: "test@example.com",
  rating: 5,
  comment: "This is a test review"
})
```

### 10. **Network Request Inspection**

In Network tab, look for:
- **Request URL**: Should be `http://localhost:5000/auth/reviews/add`
- **Request Method**: POST
- **Status Code**: 201 (success) or 400-500 (error)
- **Headers**: Authorization header must be present
- **Body**: Check if all fields are present and correct types

## Quick Fix Checklist

- [ ] Server restarted after changes
- [ ] User re-logged in after server restart
- [ ] Product exists in database
- [ ] Rating is 1-5
- [ ] Comment is 10-500 characters
- [ ] Browser console shows actual error
- [ ] Network tab shows request/response
- [ ] MongoDB connection is active

## If Still Not Working

1. **Check Server Logs**: Look for error messages with ❌ prefix
2. **Restart Everything**:
   ```bash
   # Stop server (Ctrl+C)
   # Stop client (Ctrl+C)
   npm start  # in client folder
   npm start  # in server folder
   ```
3. **Clear Cache**:
   ```bash
   # Browser: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   # Clear all cache and cookies
   ```
4. **Check .env Files**:
   - Verify `JWT_SECRET` is set
   - Verify `MONGODB_URI` is correct
   - Verify `NODE_ENV` is set correctly

## Error Log Example

When you see this in console:
```
====== REVIEW SUBMISSION START ======
Request body: {productId: "...", rating: 5, comment: "..."}
User from JWT: {_id: "...", name: "John", email: "john@example.com"}
✅ Validation passed
User ID: 65abc123...
User Name: John Doe
User Email: john@example.com
🔍 Checking if product exists with ID: 65def456...
✅ Product found: Product Name
✅ Review saved successfully: 65ghi789...
====== REVIEW SUBMISSION END ======
```

**This means everything worked correctly!**

If you see ❌ logs, that's where the problem is. Report those logs for a quick fix.
