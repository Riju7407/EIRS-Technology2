import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome, FaShoppingCart } from 'react-icons/fa';
import paymentService from '../services/paymentService';
import '../styles/OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const isCod = searchParams.get('type') === 'cod';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      paymentService
        .getOrder(orderId)
        .then((res) => {
          if (res.success) setOrder(res.order);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  return (
    <div className="order-success-page">
      <div className="success-card">
        {/* Animated check */}
        <div className="check-wrapper">
          <FaCheckCircle className="check-icon" />
        </div>

        <h1>{isCod ? 'Order Placed!' : 'Payment Successful!'}</h1>

        <p className="success-tagline">
          {isCod
            ? 'Your order has been confirmed. Pay on delivery.'
            : 'Your payment has been received and your order is confirmed!'}
        </p>

        {paymentId && !isCod && (
          <div className="detail-row">
            <span className="label">Payment ID</span>
            <span className="value mono">{paymentId}</span>
          </div>
        )}

        {loading && <p className="loading-text">Loading order details…</p>}

        {order && (
          <div className="order-details-box">
            <div className="detail-row">
              <span className="label">Order ID</span>
              <span className="value mono">{order._id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status</span>
              <span className={`value status-badge status-${order.status?.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Total</span>
              <span className="value">₹{order.totalPrice?.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Items</span>
              <span className="value">{order.totalItems} item(s)</span>
            </div>
            {order.estimatedDelivery && (
              <div className="detail-row">
                <span className="label">Est. Delivery</span>
                <span className="value">
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="brand-note">
          Thank you for shopping with <strong>EIRS Technology</strong>
        </p>

        <div className="action-buttons">
          <Link to="/orders" className="btn btn-primary">
            <FaShoppingBag /> View My Orders
          </Link>
          <Link to="/products" className="btn btn-secondary">
            <FaShoppingCart /> Continue Shopping
          </Link>
          <Link to="/" className="btn btn-ghost">
            <FaHome /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
