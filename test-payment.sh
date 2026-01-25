#!/bin/bash
# Payment endpoint test script for testing order creation

# First, you need a valid JWT token. Get it from local storage after login.
# Then replace TOKEN with the actual token value below.

TOKEN="your_jwt_token_here"
API_URL="http://localhost:5000"

# Test data - adjust values as needed
curl -X POST "$API_URL/payment/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "currency": "INR",
    "items": [
      {
        "productId": "123456789",
        "_id": "123456789",
        "name": "Test Product",
        "quantity": 1,
        "price": 10000,
        "category": "Electronics",
        "brand": "TestBrand",
        "image": "https://via.placeholder.com/200"
      }
    ],
    "userId": "user_id_here",
    "email": "user@example.com",
    "phone": "9876543210",
    "shippingAddress": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "paymentMethod": "razorpay"
  }'

echo ""
echo "Test complete. Check server logs for details."
