import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import CheckoutModal from '../components/CheckoutModal';
import '../styles/CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const totalAmount = getTotalPrice() * 1.18; // Include 18% tax

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/products" className="btn-continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Shopping Cart</h1>

        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-header">
              <span className="col-product">Product</span>
              <span className="col-price">Price</span>
              <span className="col-stock">Stock</span>
              <span className="col-quantity">Quantity</span>
              <span className="col-subtotal">Subtotal</span>
              <span className="col-action">Action</span>
            </div>

            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-product">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="item-image" />
                  )}
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                  </div>
                </div>

                <div className="item-price">
                  ₹{parseFloat(item.price).toLocaleString()}
                </div>

                <div className="item-stock">
                  <span className={`stock-status ${item.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {item.stock > 0 ? `${item.stock} Available` : 'Out of Stock'}
                  </span>
                </div>

                <div className="item-quantity">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <FaMinus />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    <FaPlus />
                  </button>
                </div>

                <div className="item-subtotal">
                  ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                </div>

                <div className="item-action">
                  <button
                    className="btn-delete"
                    onClick={() => removeFromCart(item._id)}
                    title="Remove from cart"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>₹0 (Free)</span>
              </div>

              <div className="summary-row">
                <span>Tax (18%)</span>
                <span>₹{(getTotalPrice() * 0.18).toLocaleString()}</span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>

              {user ? (
                <button 
                  className="btn-checkout"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </button>
              ) : (
                <Link to="/signin" className="btn-checkout" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  Login to Checkout
                </Link>
              )}

              <button
                className="btn-continue-shopping-secondary"
                onClick={() => window.location.href = '/products'}
              >
                Continue Shopping
              </button>

              <button
                className="btn-clear-cart"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {user && (
        <CheckoutModal 
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          cartItems={cartItems}
          totalAmount={totalAmount}
          userId={user.id || user._id}
          userName={user.name}
          userEmail={user.email}
        />
      )}
    </div>
  );
};

export default CartPage;
