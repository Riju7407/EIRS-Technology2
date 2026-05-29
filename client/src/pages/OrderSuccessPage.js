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

    const fetchOrder = async () => {
      try {
        setLoading(true);

        const res = await paymentService.getOrder(orderId);

        if (res.success) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Order fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const downloadBill = async () => {
    if (!order?._id) return;

    try {
      setDownloading(true);

      const API_BASE =
        process.env.REACT_APP_API || 'http://localhost:5000';

      const token = localStorage.getItem('token');

      let url = `${API_BASE}/payment/orders/${order._id}/bill/download`;

      if (token) {
        url += `?token=${token}`;
      }

      window.open(url, '_blank');

    } catch (err) {
      console.error('Bill download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="order-success-page">

      <div className="success-card">

        {/* SUCCESS ICON */}
        <div className="check-wrapper">
          <FaCheckCircle className="check-icon" />
        </div>

        {/* TITLE */}
        <h1>
          {isCod ? 'Order Placed Successfully' : 'Payment Successful'}
        </h1>

        {/* SUBTITLE */}
        <p className="success-tagline">
          {isCod
            ? 'Your order has been confirmed. Please pay during delivery.'
            : 'Your payment has been received successfully and your order is now confirmed.'}
        </p>

        {/* PAYMENT ID */}
        {paymentId && !isCod && (
          <div className="order-details-box">
            <div className="detail-row">
              <span className="label">Payment ID</span>

              <span className="value mono">
                {paymentId}
              </span>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <p className="loading-text">
            Loading order details...
          </p>
        )}

        {/* ORDER DETAILS */}
        {order && (
          <div className="order-details-box">

            <div className="detail-row">
              <span className="label">Order ID</span>

              <span className="value mono">
                {order._id}
              </span>
            </div>

            <div className="detail-row">
              <span className="label">Order Status</span>

              <span
                className={`status-badge status-${order.status?.toLowerCase()}`}
              >
                {order.status}
              </span>
            </div>

            <div className="detail-row">
              <span className="label">Payment Status</span>

              <span
                className={`status-badge status-${order.paymentStatus?.toLowerCase()}`}
              >
                {order.paymentStatus}
              </span>
            </div>

            <div className="detail-row">
              <span className="label">Total Amount</span>

              <span className="value">
                ₹{order.totalPrice?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="detail-row">
              <span className="label">Total Items</span>

              <span className="value">
                {order.totalItems} Item(s)
              </span>
            </div>

            {order.estimatedDelivery && (
              <div className="detail-row">
                <span className="label">
                  Estimated Delivery
                </span>

                <span className="value">
                  {new Date(
                    order.estimatedDelivery
                  ).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {/* DOWNLOAD BILL */}
            <div className="detail-row">

              <span className="label">
                Invoice Bill
              </span>

              <button
                onClick={downloadBill}
                disabled={downloading}
                className="invoice-btn"
              >
                <FaFilePdf />

                {downloading
                  ? 'Preparing...'
                  : 'Download PDF'}
              </button>

            </div>

          </div>
        )}

        {/* BRAND */}
        <p className="brand-note">
          Thank you for shopping with{' '}
          <strong>EIRS Technology</strong>
        </p>

        {/* ACTION BUTTONS */}
        <div className="action-buttons">

          <Link to="/orders" className="btn btn-primary">
            <FaShoppingBag />
            View My Orders
          </Link>

          <Link to="/products" className="btn btn-secondary">
            <FaShoppingCart />
            Continue Shopping
          </Link>

          <Link to="/" className="btn btn-ghost">
            <FaHome />
            Go Home
          </Link>

        </div>

      </div>

    </div>
  );
};

export default OrderSuccessPage;