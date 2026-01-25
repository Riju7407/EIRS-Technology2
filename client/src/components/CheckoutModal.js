import React, { useState, useEffect } from 'react';
import { FaTimes, FaCreditCard, FaWallet, FaMobile, FaMapMarkerAlt, FaBuilding, FaMoneyBillWave } from 'react-icons/fa';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import '../styles/CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cartItems, totalAmount, userId, userName, userEmail }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [paymentSubMethod, setPaymentSubMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Address state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || userName || '',
    email: userEmail || user?.email || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const [addressErrors, setAddressErrors] = useState({});

  // Ensure the payment method stays synced
  useEffect(() => {
    console.log('Payment method state updated:', paymentMethod);
  }, [paymentMethod]);
  
  // Update shipping address with user info when component loads
  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
        address: user.address || prev.address
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  const validateAddress = () => {
    const errors = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shippingAddress.email.trim()) errors.email = 'Email is required';
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone number is required';
    if (shippingAddress.phone.length < 10) errors.phone = 'Phone number must be at least 10 digits';
    if (!shippingAddress.address.trim()) errors.address = 'Address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State is required';
    if (!shippingAddress.zipCode.trim()) errors.zipCode = 'Zip code is required';
    if (shippingAddress.zipCode.length < 5) errors.zipCode = 'Zip code must be at least 5 digits';
    
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (addressErrors[field]) {
      setAddressErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePayment = async () => {
    // Validate address first
    if (!validateAddress()) {
      setError('Please fill in all required address fields');
      return;
    }

    // Auto-select Card if not already selected
    if (!paymentMethod) {
      setPaymentMethod('Card');
    }

    setLoading(true);
    setError('');

    try {
      // Create order on backend
      console.log('Creating order on backend...');
      let orderResponse;
      try {
        const orderData = {
          amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
          currency: 'INR',
          items: cartItems.map(item => ({
            productId: item._id,
            name: item.name || item.productName || 'Product',
            quantity: item.quantity,
            price: item.price,
            category: item.category || '',
            brand: item.brand || '',
            image: item.image || item.productImage || ''
          })),
          userId,
          email: userEmail,
          phone: shippingAddress.phone,
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod || 'Card',
          paymentSubMethod: paymentSubMethod
        };
        console.log('Sending order data to backend:', orderData);
        orderResponse = await paymentService.createOrder(orderData);
      } catch (orderError) {
        console.error('❌ Order creation error:', orderError);
        setError('Failed to create order: ' + (orderError.message || JSON.stringify(orderError)));
        setLoading(false);
        return;
      }

      console.log('Order created:', orderResponse);
      const { orderId, mongoOrderId } = orderResponse;

      if (!orderId || !mongoOrderId) {
        throw new Error('No order ID received from server');
      }

      // Handle Cash on Delivery separately (no Razorpay needed)
      if (paymentMethod === 'CashOnDelivery') {
        try {
          const verifyResponse = await paymentService.verifyPayment({
            orderId: mongoOrderId,
            razorpay_order_id: orderId,
            razorpay_payment_id: 'cod_' + mongoOrderId,
            razorpay_signature: 'cod_verified_' + Date.now(),
            paymentMethod: 'CashOnDelivery'
          });

          console.log('COD Verification response:', verifyResponse);
          if (verifyResponse.success) {
            alert('✓ Order placed successfully! You will pay when the order is delivered.');
            localStorage.removeItem('cart');
            onClose();
            window.location.href = '/orders';
          } else {
            setError(verifyResponse.message || 'Failed to place order. Please try again.');
          }
        } catch (err) {
          console.error('❌ Order confirmation error:', err);
          setError('Order confirmation failed: ' + (err.message || 'Unknown error'));
        } finally {
          setLoading(false);
        }
        return;
      }

      // For online payment methods, use Razorpay
      const res = await paymentService.loadRazorpayScript();
      
      if (!res || typeof window.Razorpay === 'undefined') {
        console.error('❌ Razorpay SDK failed to load');
        setError('Payment gateway unavailable. Please try Cash on Delivery or contact support.');
        setLoading(false);
        return;
      }

      console.log('✓ Razorpay SDK loaded successfully');

      // Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        name: 'EIRS',
        description: `Purchase of ${cartItems.length} product(s)`,
        order_id: orderId,
        handler: async (response) => {
          try {
            console.log('Payment handler called with response:', response);
            // Verify payment
            const verifyResponse = await paymentService.verifyPayment({
              orderId: mongoOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log('Verification response:', verifyResponse);
            if (verifyResponse.success) {
              alert('✓ Payment successful! Your order has been placed.');
              localStorage.removeItem('cart'); // Clear cart after successful payment
              onClose();
              window.location.href = '/orders'; // Redirect to orders page
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('❌ Payment verification error:', err);
            setError('Payment verification failed: ' + (err.message || 'Unknown error'));
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#667eea',
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
      };

      console.log('Opening Razorpay checkout with options:', options);
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', (response) => {
        console.error('❌ Payment failed:', response.error);
        setError('Payment failed: ' + (response.error?.description || 'Unknown reason'));
        setLoading(false);
      });
    } catch (err) {
      console.error('❌ Payment initialization error:', err);
      setError(err.message || 'Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-header">
          <h2>Checkout</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="checkout-content">
          {/* Order Summary */}
          <div className="order-summary-section">
            <h3>Order Summary</h3>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item._id} className="order-item">
                  <div className="item-info">
                    <p className="item-name">{item.name || item.productName}</p>
                    <p className="item-quantity">Qty: {item.quantity}</p>
                  </div>
                  <p className="item-total">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>Total Amount:</span>
              <span className="total-amount">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="shipping-address-section">
            <h3><FaMapMarkerAlt /> Shipping Address</h3>
            <div className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={shippingAddress.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    className={addressErrors.fullName ? 'error' : ''}
                  />
                  {addressErrors.fullName && <span className="error-text">{addressErrors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={shippingAddress.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    className={addressErrors.email ? 'error' : ''}
                  />
                  {addressErrors.email && <span className="error-text">{addressErrors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={shippingAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className={addressErrors.phone ? 'error' : ''}
                  />
                  {addressErrors.phone && <span className="error-text">{addressErrors.phone}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    placeholder="Enter complete address"
                    value={shippingAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    className={addressErrors.address ? 'error' : ''}
                    rows="2"
                  />
                  {addressErrors.address && <span className="error-text">{addressErrors.address}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className={addressErrors.city ? 'error' : ''}
                  />
                  {addressErrors.city && <span className="error-text">{addressErrors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    placeholder="Enter state"
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className={addressErrors.state ? 'error' : ''}
                  />
                  {addressErrors.state && <span className="error-text">{addressErrors.state}</span>}
                </div>
                <div className="form-group">
                  <label>Zip Code *</label>
                  <input
                    type="text"
                    placeholder="Enter zip code"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    className={addressErrors.zipCode ? 'error' : ''}
                  />
                  {addressErrors.zipCode && <span className="error-text">{addressErrors.zipCode}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="payment-method-section">
            <h3>Select Payment Method</h3>
            <div className="payment-methods">
              {/* UPI Option */}
              <div 
                className={`payment-option-box ${paymentMethod === 'UPI' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  id="upi-option"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPaymentSubMethod('UPI');
                  }}
                />
                <label htmlFor="upi-option" className="payment-label">
                  <FaMobile className="icon upi" />
                  <div className="payment-details">
                    <p className="method-name">UPI</p>
                    <p className="method-desc">Google Pay, PhonePe, Paytm</p>
                  </div>
                </label>
              </div>

              {/* Card Option */}
              <div 
                className={`payment-option-box ${paymentMethod === 'Card' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  id="card-option"
                  name="payment"
                  value="Card"
                  checked={paymentMethod === 'Card'}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPaymentSubMethod('Card');
                  }}
                />
                <label htmlFor="card-option" className="payment-label">
                  <FaCreditCard className="icon card" />
                  <div className="payment-details">
                    <p className="method-name">Credit/Debit Card</p>
                    <p className="method-desc">Visa, Mastercard, RuPay</p>
                  </div>
                </label>
              </div>

              {/* Net Banking Option */}
              <div 
                className={`payment-option-box ${paymentMethod === 'NetBanking' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  id="netbanking-option"
                  name="payment"
                  value="NetBanking"
                  checked={paymentMethod === 'NetBanking'}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPaymentSubMethod('NetBanking');
                  }}
                />
                <label htmlFor="netbanking-option" className="payment-label">
                  <FaBuilding className="icon bank" />
                  <div className="payment-details">
                    <p className="method-name">Net Banking</p>
                    <p className="method-desc">All major banks supported</p>
                  </div>
                </label>
              </div>

              {/* Wallet Option */}
              <div 
                className={`payment-option-box ${paymentMethod === 'Wallet' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  id="wallet-option"
                  name="payment"
                  value="Wallet"
                  checked={paymentMethod === 'Wallet'}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPaymentSubMethod('Wallet');
                  }}
                />
                <label htmlFor="wallet-option" className="payment-label">
                  <FaWallet className="icon wallet" />
                  <div className="payment-details">
                    <p className="method-name">Digital Wallet</p>
                    <p className="method-desc">Paytm, PhonePe, Google Pay</p>
                  </div>
                </label>
              </div>

              {/* Cash on Delivery Option */}
              <div 
                className={`payment-option-box ${paymentMethod === 'CashOnDelivery' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  id="cod-option"
                  name="payment"
                  value="CashOnDelivery"
                  checked={paymentMethod === 'CashOnDelivery'}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPaymentSubMethod('COD');
                  }}
                />
                <label htmlFor="cod-option" className="payment-label">
                  <FaMoneyBillWave className="icon cod" />
                  <div className="payment-details">
                    <p className="method-name">Cash on Delivery</p>
                    <p className="method-desc">Pay when you receive your order</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Action Buttons */}
          <div className="checkout-actions">
            <button
              className="btn btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn btn-pay"
              onClick={handlePayment}
              disabled={loading || cartItems.length === 0}
            >
              {loading ? 'Processing...' : `Proceed to Payment (₹${totalAmount.toLocaleString()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
