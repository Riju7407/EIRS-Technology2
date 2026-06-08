import React from "react";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../styles/CartPage.css";

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalAmount = getTotalPrice() * 1.18;

  // =========================
  // EMPTY CART
  // =========================
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

  // =========================
  // STOCK SAFE UPDATE FUNCTION
  // =========================
  const handleIncrease = (item) => {
    const stock = item.stock || 0;

    if (item.quantity >= stock) {
      alert("⚠️ Only " + stock + " items available in stock");
      return;
    }

    updateQuantity(item._id, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    updateQuantity(item._id, item.quantity - 1);
  };
  console.log("Cart Items => ", cartItems);

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

            {cartItems.map((item) => {
              const stock = item.stock || 0;
              const isOutOfStock = stock === 0;
              const isMaxReached = item.quantity >= stock;

              return (
                <div key={item._id} className="cart-row">
                  {/* PRODUCT */}
                  <div className="item-product">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                      />
                    )}

                    <div className="item-details">
                      <h3>{item.productName || item.name}</h3>

                      <p className="item-category">
                        {typeof item.category === "object"
                          ? item.category?.name
                          : item.category}
                      </p>
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="item-price">
                    ₹{parseFloat(item.price).toLocaleString()}
                  </div>

                  {/* STOCK */}
                  <div className="item-stock">
                    <span
                      className={`stock-status ${
                        stock > 0 ? "in-stock" : "out-of-stock"
                      }`}
                    >
                      {stock > 0 ? `${stock} Available` : "Out of Stock"}
                    </span>
                  </div>

                  {/* QUANTITY */}
                  <div className="item-quantity">
                    <button
                      className="qty-btn"
                      onClick={() => handleDecrease(item)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>

                    <span className="qty-value">{item.quantity}</span>

                    <button
                      className="qty-btn"
                      onClick={() => handleIncrease(item)}
                      disabled={isOutOfStock || isMaxReached}
                      title={
                        isOutOfStock
                          ? "Out of Stock"
                          : isMaxReached
                            ? "Max stock reached"
                            : ""
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>

                  {/* SUBTOTAL */}
                  <div className="item-subtotal">
                    ₹
                    {(
                      (item.price - (item.price * (item.discount || 0)) / 100) *
                      (item.quantity || 1)
                    ).toLocaleString()}
                  </div>

                  {/* ACTION */}
                  <div className="item-action">
                    <button
                      className="btn-delete"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUMMARY */}
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
                  onClick={() =>
                    navigate("/checkout", {
                      state: {
                        cartItems,
                        totalAmount,
                        userId: user.id || user._id,
                        userName: user.name,
                        userEmail: user.email,
                      },
                    })
                  }
                >
                  Proceed to Checkout
                </button>
              ) : (
                <Link to="/signin" className="btn-checkout">
                  Login to Checkout
                </Link>
              )}

              <button
                className="btn-continue-shopping-secondary"
                onClick={() => (window.location.href = "/products")}
              >
                Continue Shopping
              </button>

              <button className="btn-clear-cart" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
