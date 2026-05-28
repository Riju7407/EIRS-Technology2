import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaCheckCircle,
  FaShoppingBag,
  FaHome,
  FaShoppingCart,
  FaFilePdf
} from 'react-icons/fa';

import paymentService from '../services/paymentService';
import '../styles/OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const isCod = searchParams.get('type') === 'cod';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    setLoading(true);

    paymentService
      .getOrder(orderId)
      .then((res) => {
        if (res.success) {
          setOrder(res.order);
        }
      })
      .catch((err) => {
        console.error('Order fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  // ✅ BILL DOWNLOAD
  const downloadBill = async () => {
    if (!order?._id) return;

    try {
      setDownloading(true);

      const API_BASE = process.env.REACT_APP_API || 'http://localhost:5000';

      const token = localStorage.getItem('token');

      const url = `${API_BASE}/payment/orders/${order._id}/bill/download`;

      // simplest & most reliable way
      const link = document.createElement('a');
      link.href = url;

      // optional token support (if backend supports query token)
      if (token) {
        link.href = `${url}?token=${token}`;
      }

      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error('Bill download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="order-success-page">
      <div className="success-card">

        {/* ICON */}
        <div className="check-wrapper">
          <FaCheckCircle className="check-icon" />
        </div>

        {/* TITLE */}
        <h1>{isCod ? 'Order Placed!' : 'Payment Successful!'}</h1>

        {/* SUBTITLE */}
        <p className="success-tagline">
          {isCod
            ? 'Your order has been confirmed. Pay on delivery.'
            : 'Your payment has been received and your order is confirmed!'}
        </p>

        {/* PAYMENT ID */}
        {paymentId && !isCod && (
          <div className="detail-row">
            <span className="label">Payment ID</span>
            <span className="value mono">{paymentId}</span>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <p className="loading-text">Loading order details…</p>
        )}

        {/* ORDER DETAILS */}
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

            {/* BILL DOWNLOAD */}
            <div className="detail-row" style={{ marginTop: '15px' }}>
              <span className="label">Invoice</span>

              <button
                onClick={downloadBill}
                disabled={downloading}
                className="btn btn-success"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaFilePdf />
                {downloading ? 'Preparing...' : 'Download Bill'}
              </button>
            </div>

          </div>
        )}

        {/* BRAND NOTE */}
        <p className="brand-note">
          Thank you for shopping with <strong>EIRS Technology</strong>
        </p>

        {/* ACTION BUTTONS */}
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