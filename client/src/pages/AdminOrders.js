import React, { useState, useEffect } from 'react';
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaTimesCircle, FaTrash, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { orderService } from '../services/api';
import '../styles/AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
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

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#fffbeb';
      case 'Confirmed':
        return '#eff6ff';
      case 'Shipped':
        return '#f5f3ff';
      case 'Delivered':
        return '#f0fdf4';
      case 'Cancelled':
        return '#fef2f2';
      default:
        return '#f3f4f6';
    }
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === 'Pending').length,
      confirmed: orders.filter(o => o.orderStatus === 'Confirmed').length,
      shipped: orders.filter(o => o.orderStatus === 'Shipped').length,
      delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
      cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderService.deleteOrder(orderId);
        setOrders(orders.filter(order => order._id !== orderId));
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };

  const handleUpdateStatus = async (orderId) => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
      setEditingOrderId(null);
      setNewStatus('');
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const statusOptions = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(order => order.orderStatus === filter);

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'highest') return b.totalAmount - a.totalAmount;
    if (sortBy === 'lowest') return a.totalAmount - b.totalAmount;
    return 0;
  });

  const stats = getOrderStats();

  return (
    <div className="admin-orders-page">
      {/* Header Section */}
      <div className="admin-orders-header">
        <div className="header-content">
          <h1>Order Management</h1>
          <p>Manage and track all customer orders efficiently</p>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="orders-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
        <div className="stat-card confirmed">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>{stats.confirmed}</h3>
            <p>Confirmed Orders</p>
          </div>
        </div>
        <div className="stat-card shipped">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>{stats.shipped}</h3>
            <p>Shipped Orders</p>
          </div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.delivered}</h3>
            <p>Delivered Orders</p>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toFixed(0)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="orders-controls">
        <div className="controls-left">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="All">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        <div className="controls-right">
          <span className="results-count">Showing {sortedOrders.length} of {stats.total} orders</span>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Orders Found</h3>
          <p>There are no orders matching your filters</p>
        </div>
      ) : (
        <div className="orders-list">
          {sortedOrders.map((order) => (
            <div key={order._id} className="order-card-new">
              {/* Order Card Header */}
              <div className="order-card-header">
                <div className="order-header-left">
                  <div className="order-id-section">
                    <h3 className="order-id">#{order._id.substring(0, 8).toUpperCase()}</h3>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="customer-details">
                    <p className="customer-name"><strong>{order.userId?.name || 'Unknown Customer'}</strong></p>
                    <p className="customer-email">{order.userId?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="order-header-right">
                  <div className="order-amount">
                    <span className="amount-label">Total Amount</span>
                    <span className="amount-value">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="status-badge" style={{ backgroundColor: getStatusBgColor(order.orderStatus), borderColor: getStatusColor(order.orderStatus) }}>
                    {getStatusIcon(order.orderStatus)}
                    <span>{order.orderStatus}</span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="order-quick-info">
                <div className="info-item">
                  <span className="info-label">Items</span>
                  <span className="info-value">{order.items?.length || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Quantity</span>
                  <span className="info-value">{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</span>
                </div>
              </div>

              {/* Expandable Details */}
              {expandedOrderId === order._id && (
                <div className="order-details-expanded">
                  {/* Order Items Table */}
                  <div className="details-section">
                    <h4>Order Items</h4>
                    <div className="items-table-wrapper">
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((item, index) => (
                            <tr key={index}>
                              <td>{item.productName || 'Product'}</td>
                              <td><span className="qty-badge">{item.quantity}</span></td>
                              <td>₹{item.price?.toFixed(2) || '0.00'}</td>
                              <td className="total-cell">₹{(item.quantity * item.price)?.toFixed(2) || '0.00'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="details-section">
                    <h4>Shipping Address</h4>
                    <div className="address-card">
                      <p className="address-line">{order.shippingAddress?.street || 'N/A'}</p>
                      <p className="address-line">{order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''} {order.shippingAddress?.zipCode || ''}</p>
                      <p className="address-line phone">📱 {order.shippingAddress?.phone || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Status Update Section */}
                  <div className="details-section">
                    <h4>Update Order Status</h4>
                    {editingOrderId === order._id ? (
                      <div className="status-edit-form">
                        <div className="edit-inputs">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="status-select-input"
                          >
                            <option value="">Select Status</option>
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button
                            className="btn-save-status"
                            onClick={() => handleUpdateStatus(order._id)}
                          >
                            Save Status
                          </button>
                          <button
                            className="btn-cancel-edit"
                            onClick={() => {
                              setEditingOrderId(null);
                              setNewStatus('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn-edit-status"
                        onClick={() => {
                          setEditingOrderId(order._id);
                          setNewStatus(order.orderStatus);
                        }}
                      >
                        <FaEdit /> Edit Status
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action Footer */}
              <div className="order-card-footer">
                <button
                  className={`btn-expand-details ${expandedOrderId === order._id ? 'expanded' : ''}`}
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                >
                  {expandedOrderId === order._id ? (
                    <>
                      <FaChevronUp /> Hide Details
                    </>
                  ) : (
                    <>
                      <FaChevronDown /> View Details
                    </>
                  )}
                </button>
                <button
                  className="btn-delete-order"
                  onClick={() => handleDeleteOrder(order._id)}
                  title="Delete this order"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
