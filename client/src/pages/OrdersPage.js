import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { orderService } from '../services/api';
import '../styles/OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      setOrders(Array.isArray(data.data) ? data.data : data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FaClock className="status-icon pending" />;
      case 'Confirmed':
        return <FaBox className="status-icon confirmed" />;
      case 'Shipped':
        return <FaTruck className="status-icon shipped" />;
      case 'Delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'Cancelled':
        return <FaTimesCircle className="status-icon cancelled" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b';
      case 'Confirmed':
        return '#3b82f6';
      case 'Shipped':
        return '#8b5cf6';
      case 'Delivered':
        return '#10b981';
      case 'Cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-spinner">Loading your orders...</div>
      </div>
    );
  }

  return (
    <main className="orders-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <FaBox size={60} color="#d1d5db" />
            <h2>No Orders Found</h2>
            <p>You haven't placed any orders yet. Start shopping now!</p>
            <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                {/* Order Header */}
                <div 
                  className="order-header-row"
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                >
                  <div className="order-info-left">
                    <div className="order-number">
                      Order ID: <span>{order._id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="order-date">{formatDate(order.orderDate)}</div>
                  </div>

                  <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>

                  <div className="order-price">₹{order.totalPrice.toFixed(2)}</div>

                  <div className="order-items-count">
                    {order.totalItems} item{order.totalItems > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {expandedOrderId === order._id && (
                  <div className="order-details">
                    {/* Items Section */}
                    <div className="details-section">
                      <h3>Items Ordered</h3>
                      <div className="items-list">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="item-detail">
                            {item.image && (
                              <img src={item.image} alt={item.productName} className="item-image" />
                            )}
                            <div className="item-info">
                              <h4>{item.productName}</h4>
                              <p className="item-category">{item.category}</p>
                              {item.brand && <p className="item-brand">{item.brand}</p>}
                              <div className="item-quantity">Qty: {item.quantity}</div>
                            </div>
                            <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="details-section">
                      <h3>Order Summary</h3>
                      <div className="summary-row">
                        <span>Subtotal ({order.totalItems} items):</span>
                        <span>₹{order.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="summary-row highlight">
                        <span>Total Price:</span>
                        <span>₹{order.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="details-section">
                        <h3>Shipping Address</h3>
                        <div className="address-box">
                          <p><strong>{order.shippingAddress.fullName}</strong></p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                          <p>Phone: {order.shippingAddress.phone}</p>
                          <p>Email: {order.shippingAddress.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Order Status & Delivery */}
                    <div className="details-section">
                      <h3>Delivery Information</h3>
                      <div className="delivery-info">
                        <div className="info-row">
                          <span>Order Status:</span>
                          <strong style={{ color: getStatusColor(order.status) }}>
                            {order.status}
                          </strong>
                        </div>
                        <div className="info-row">
                          <span>Payment Method:</span>
                          <strong>{order.paymentMethod}</strong>
                        </div>
                        <div className="info-row">
                          <span>Payment Status:</span>
                          <strong style={{ color: order.paymentStatus === 'Completed' ? '#10b981' : '#f59e0b' }}>
                            {order.paymentStatus}
                          </strong>
                        </div>
                        {order.estimatedDelivery && (
                          <div className="info-row">
                            <span>Estimated Delivery:</span>
                            <strong>{formatDate(order.estimatedDelivery)}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                      <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
                      <Link to="/contact" className="btn btn-secondary">Get Help</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default OrdersPage;
