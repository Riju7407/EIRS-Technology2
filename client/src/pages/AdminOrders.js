import React, { useState, useEffect } from 'react';
import {
  FaBox, FaTruck, FaCheckCircle, FaClock, FaTimesCircle, FaTrash, FaEdit,
  FaChevronDown, FaChevronUp, FaUndo, FaMoneyBillWave, FaCheckDouble, FaBan,
  FaSearch, FaMapMarkerAlt, FaCreditCard, FaExclamationTriangle,
  FaBoxOpen, FaTimes, FaSort
} from 'react-icons/fa';
import { orderService } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import '../styles/AdminOrders.css';

const STATUS_META = {
  Pending:   { color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', label: 'Pending'   },
  Confirmed: { color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', label: 'Confirmed' },
  Shipped:   { color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', label: 'Shipped'   },
  Delivered: { color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', label: 'Delivered' },
  Cancelled: { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', label: 'Cancelled' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [refundActionLoading, setRefundActionLoading] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => { fetchAllOrders(); }, []);

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

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getStatusMeta = (status) =>
    STATUS_META[status] || { color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db', label: status };

  const getOrderStatus = (order) => order.status || order.orderStatus || 'Pending';
  const getOrderTotal = (order) => order.totalPrice ?? order.totalAmount ?? 0;

  const getRefundBadge = (refundInfo) => {
    if (!refundInfo || refundInfo.status === 'None') return null;
    const map = {
      Requested: { color: '#f59e0b', bg: '#fffbeb', label: 'Refund Requested' },
      Approved:  { color: '#3b82f6', bg: '#eff6ff', label: 'Refund Approved'  },
      Processed: { color: '#10b981', bg: '#f0fdf4', label: 'Refund Processed' },
      Rejected:  { color: '#ef4444', bg: '#fef2f2', label: 'Refund Rejected'  },
    };
    return map[refundInfo.status] || null;
  };

  const getAfterDeliveryBadge = (request) => {
    if (!request || request.status === 'None') return null;
    const map = {
      Requested: { color: '#f59e0b', bg: '#fffbeb', label: `${request.type} Requested` },
      Approved:  { color: '#3b82f6', bg: '#eff6ff', label: `${request.type} Approved`  },
      Processed: { color: '#10b981', bg: '#f0fdf4', label: `${request.type} Processed` },
      Rejected:  { color: '#ef4444', bg: '#fef2f2', label: `${request.type} Rejected`  },
    };
    return map[request.status] || null;
  };

  const getStats = () => ({
    total: orders.length,
    pending: orders.filter(o => getOrderStatus(o) === 'Pending').length,
    confirmed: orders.filter(o => getOrderStatus(o) === 'Confirmed').length,
    shipped: orders.filter(o => getOrderStatus(o) === 'Shipped').length,
    delivered: orders.filter(o => getOrderStatus(o) === 'Delivered').length,
    cancelled: orders.filter(o => getOrderStatus(o) === 'Cancelled').length,
    revenue: orders.reduce((sum, o) => sum + getOrderTotal(o), 0),
    pendingRefunds: orders.filter(o => o.refundInfo?.status === 'Requested').length,
    pendingAfterDeliveryRequests: orders.filter(o => o.afterDeliveryRequest?.status === 'Requested').length,
  });

  const handleDeleteOrder = async () => {
    const orderId = deleteModal;
    setDeleteModal(null);
    try {
      await orderService.deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o._id !== orderId));
      showToast('Order deleted successfully.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete order', 'error');
    }
  };

  const handleUpdateStatus = async (orderId) => {
    if (!newStatus) { showToast('Please select a status', 'error'); return; }
    setStatusLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status: newStatus, orderStatus: newStatus } : o
      ));
      setEditingOrderId(null);
      setNewStatus('');
      showToast('Order status updated successfully.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleApproveRefund = async (orderId) => {
    setRefundActionLoading(orderId + '_approve');
    try {
      await orderService.approveRefund(orderId, { adminNotes: adminNotes[orderId] || '' });
      await fetchAllOrders();
      setAdminNotes(prev => ({ ...prev, [orderId]: '' }));
      showToast('Refund approved successfully.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve refund', 'error');
    } finally {
      setRefundActionLoading(null);
    }
  };

  const handleRejectRefund = async (orderId) => {
    if (!adminNotes[orderId]?.trim()) {
      showToast('Please provide a rejection reason in admin notes.', 'error');
      return;
    }
    setRefundActionLoading(orderId + '_reject');
    try {
      await orderService.rejectRefund(orderId, { adminNotes: adminNotes[orderId] });
      await fetchAllOrders();
      setAdminNotes(prev => ({ ...prev, [orderId]: '' }));
      showToast('Refund rejected.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reject refund', 'error');
    } finally {
      setRefundActionLoading(null);
    }
  };

  const handleApproveAfterDeliveryRequest = async (orderId) => {
    setRefundActionLoading(orderId + '_afterApprove');
    try {
      await orderService.approveAfterDeliveryRequest(orderId, { adminNotes: adminNotes[orderId] || '' });
      await fetchAllOrders();
      setAdminNotes(prev => ({ ...prev, [orderId]: '' }));
      showToast('After-delivery request approved successfully.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve after-delivery request', 'error');
    } finally {
      setRefundActionLoading(null);
    }
  };

  const handleRejectAfterDeliveryRequest = async (orderId) => {
    if (!adminNotes[orderId]?.trim()) {
      showToast('Please provide a rejection reason in admin notes.', 'error');
      return;
    }
    setRefundActionLoading(orderId + '_afterReject');
    try {
      await orderService.rejectAfterDeliveryRequest(orderId, { adminNotes: adminNotes[orderId] });
      await fetchAllOrders();
      setAdminNotes(prev => ({ ...prev, [orderId]: '' }));
      showToast('After-delivery request rejected.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reject after-delivery request', 'error');
    } finally {
      setRefundActionLoading(null);
    }
  };

  const handleProcessAfterDeliveryRequest = async (orderId) => {
    setRefundActionLoading(orderId + '_afterProcess');
    try {
      await orderService.processAfterDeliveryRequest(orderId);
      await fetchAllOrders();
      showToast('After-delivery request marked as processed.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to process after-delivery request', 'error');
    } finally {
      setRefundActionLoading(null);
    }
  };

  const handleProcessRefund = async (orderId) => {
    setRefundActionLoading(orderId + '_process');
    try {
      await orderService.processRefund(orderId);
      await fetchAllOrders();
      showToast('Refund marked as processed.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to process refund', 'error');
    } finally {
      setRefundActionLoading(null);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const formatCurrency = (amount) =>
    `Rs.${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  const getInitials = (name) =>
    (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const statusOptions = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  const stats = getStats();

  const filtered = (() => {
    let list = orders;
    if (filter === 'Refund Requests') {
      list = list.filter(o => o.refundInfo?.status === 'Requested');
    } else if (filter === 'After Delivery Requests') {
      list = list.filter(o => o.afterDeliveryRequest?.status === 'Requested');
    } else if (filter !== 'All') {
      list = list.filter(o => getOrderStatus(o) === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(o =>
        o._id.toLowerCase().includes(q) ||
        o.userId?.name?.toLowerCase().includes(q) ||
        o.userId?.email?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'recent')  return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest')  return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return getOrderTotal(b) - getOrderTotal(a);
      if (sortBy === 'lowest')  return getOrderTotal(a) - getOrderTotal(b);
      return 0;
    });
  })();

  const FILTER_TABS = [
    { key: 'All',             label: 'All Orders', count: stats.total         },
    { key: 'Pending',         label: 'Pending',    count: stats.pending       },
    { key: 'Confirmed',       label: 'Confirmed',  count: stats.confirmed     },
    { key: 'Shipped',         label: 'Shipped',    count: stats.shipped       },
    { key: 'Delivered',       label: 'Delivered',  count: stats.delivered     },
    { key: 'Cancelled',       label: 'Cancelled',  count: stats.cancelled     },
    { key: 'Refund Requests', label: 'Refunds',    count: stats.pendingRefunds},
    { key: 'After Delivery Requests', label: 'Return/Replace', count: stats.pendingAfterDeliveryRequests},
  ];

  const STAT_CARDS = [
    { key: 'total',    label: 'Total Orders',    value: stats.total,                icon: <FaBoxOpen />,      color: '#6366f1' },
    { key: 'pending',  label: 'Pending',         value: stats.pending,              icon: <FaClock />,        color: '#f59e0b' },
    { key: 'shipped',  label: 'Shipped',         value: stats.shipped,              icon: <FaTruck />,        color: '#8b5cf6' },
    { key: 'delivered',label: 'Delivered',       value: stats.delivered,            icon: <FaCheckCircle />,  color: '#10b981' },
    { key: 'cancelled',label: 'Cancelled',       value: stats.cancelled,            icon: <FaTimesCircle />,  color: '#ef4444' },
    { key: 'revenue',  label: 'Total Revenue',   value: formatCurrency(stats.revenue), icon: <FaMoneyBillWave />, color: '#06b6d4', wide: true },
    { key: 'refunds',  label: 'Pending Refunds', value: stats.pendingRefunds,       icon: <FaUndo />,         color: '#f97316' },
  ];

  if (loading) {
    return (
      <AdminLayout pageTitle="Orders" breadcrumbs={[{ label: 'Orders' }]}>
        <div className="ao-loading">
          <div className="ao-spinner" />
          <p>Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Orders" breadcrumbs={[{ label: 'Orders' }]}>
      <div className="ao-page">
        {/* Toast */}
        {toast && (
          <div className={`ao-toast ao-toast--${toast.type}`}>
            {toast.type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{toast.msg}</span>
          </div>
        )}

        {/* Header */}
        <div className="ao-header">
          <div className="ao-header-text">
            <h1>Order Management</h1>
            <p>Track, update and manage all customer orders</p>
          </div>
          <div className="ao-header-badge">{stats.total} Total Orders</div>
        </div>

        {/* Stats Row */}
        <div className="ao-stats">
          {STAT_CARDS.map(s => (
            <div key={s.key}
              className={`ao-stat${s.wide ? ' ao-stat--wide' : ''}`}
              style={{ borderTopColor: s.color }}>
              <div className="ao-stat-icon" style={{ background: s.color + '18', color: s.color }}>
                {s.icon}
              </div>
              <div className="ao-stat-body">
                <div className="ao-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="ao-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="ao-controls">
          <div className="ao-search">
            <FaSearch className="ao-search-icon" />
            <input
              type="text"
              placeholder="Search order ID, customer name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="ao-search-input"
            />
            {searchQuery && (
              <button className="ao-search-clear" onClick={() => setSearchQuery('')}>
                <FaTimes />
              </button>
            )}
          </div>
          <div className="ao-sort">
            <FaSort className="ao-sort-icon" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="ao-sort-select">
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
          <span className="ao-count">{filtered.length} of {stats.total} orders</span>
        </div>

        {/* Filter Tabs */}
        <div className="ao-tabs">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              className={`ao-tab${filter === tab.key ? ' ao-tab--active' : ''}${tab.key === 'Refund Requests' && stats.pendingRefunds > 0 ? ' ao-tab--alert' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span className="ao-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="ao-empty">
            <FaBoxOpen size={56} color="#d1d5db" />
            <h3>No orders found</h3>
            <p>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No ${filter === 'All' ? '' : filter + ' '}orders yet.`}
            </p>
          </div>
        ) : (
          <div className="ao-list">
            {filtered.map(order => {
              const meta = getStatusMeta(getOrderStatus(order));
              const refundBadge = getRefundBadge(order.refundInfo);
              const afterDeliveryBadge = getAfterDeliveryBadge(order.afterDeliveryRequest);
              const isExpanded = expandedOrderId === order._id;

              return (
                <div key={order._id} className="ao-card">
                  <div className="ao-card-bar" style={{ background: meta.color }} />

                  {/* Card Header */}
                  <div className="ao-card-head">
                    <div className="ao-card-customer">
                      <div className="ao-avatar" style={{ background: meta.color + '22', color: meta.color }}>
                        {getInitials(order.userId?.name)}
                      </div>
                      <div>
                        <p className="ao-customer-name">{order.userId?.name || order.shippingAddress?.fullName || 'Unknown Customer'}</p>
                        <p className="ao-customer-email">{order.userId?.email || order.shippingAddress?.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="ao-card-meta">
                      <div className="ao-order-id">#{order._id.slice(-8).toUpperCase()}</div>
                      <div className="ao-order-date">{formatDate(order.createdAt)}</div>
                      <div className="ao-item-count">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        {' · '}
                        {order.items?.reduce((s, i) => s + i.quantity, 0) || 0} qty
                      </div>
                    </div>

                    <div className="ao-card-right">
                      <div className="ao-amount">{formatCurrency(getOrderTotal(order))}</div>
                      <div className="ao-pills">
                        <span className="ao-status-pill"
                          style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
                          {meta.label}
                        </span>
                        {refundBadge && (
                          <span className="ao-refund-pill"
                            style={{ color: refundBadge.color, background: refundBadge.bg }}>
                            <FaUndo /> {refundBadge.label}
                          </span>
                        )}
                        {afterDeliveryBadge && (
                          <span className="ao-refund-pill"
                            style={{ color: afterDeliveryBadge.color, background: afterDeliveryBadge.bg }}>
                            <FaUndo /> {afterDeliveryBadge.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="ao-card-info">
                    <span><FaCreditCard /> {order.paymentMethod || 'N/A'}</span>
                    <span className={`ao-pay-status ao-pay-status--${(order.paymentStatus || '').toLowerCase()}`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                    {order.createdAt && <span>Placed {formatDate(order.createdAt)}</span>}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="ao-details">
                      {/* Items Table */}
                      <div className="ao-section">
                        <h4 className="ao-section-title"><FaBox /> Order Items</h4>
                        <div className="ao-items-table-wrap">
                          <table className="ao-items-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items?.map((item, i) => (
                                <tr key={i}>
                                  <td>
                                    <div className="ao-item-cell">
                                      {item.image
                                        ? <img src={item.image} alt={item.productName} className="ao-item-thumb" />
                                        : <div className="ao-item-thumb ao-item-thumb--ph"><FaBox /></div>
                                      }
                                      <span className="ao-item-name">{item.productName || 'Product'}</span>
                                    </div>
                                  </td>
                                  <td>{item.category || '—'}</td>
                                  <td><span className="ao-qty-badge">{item.quantity}</span></td>
                                  <td>Rs.{item.price?.toLocaleString('en-IN') || '0'}</td>
                                  <td className="ao-item-total">
                                    Rs.{((item.quantity || 0) * (item.price || 0)).toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="ao-detail-cols">
                        {/* Shipping */}
                        <div className="ao-section">
                          <h4 className="ao-section-title"><FaMapMarkerAlt /> Shipping Address</h4>
                          <div className="ao-addr-box">
                            {order.shippingAddress ? (
                              <>
                                {order.shippingAddress.fullName && (
                                  <p><strong>{order.shippingAddress.fullName}</strong></p>
                                )}
                                {order.shippingAddress.houseNo && (
                                  <p>{order.shippingAddress.houseNo}</p>
                                )}
                                {order.shippingAddress.address
                                  ? <p>{order.shippingAddress.address}</p>
                                  : order.shippingAddress.street
                                    ? <p>{order.shippingAddress.street}</p>
                                    : null
                                }
                                <p>
                                  {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode]
                                    .filter(Boolean).join(', ')}
                                </p>
                                {order.shippingAddress.phone && <p>Ph: {order.shippingAddress.phone}</p>}
                                {order.shippingAddress.email && <p>Email: {order.shippingAddress.email}</p>}
                              </>
                            ) : <p>No address on file</p>}
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="ao-section">
                          <h4 className="ao-section-title"><FaCreditCard /> Payment Summary</h4>
                          <div className="ao-price-box">
                            <div className="ao-price-row">
                              <span>Subtotal ({order.totalItems || order.items?.length} items)</span>
                              <span>{formatCurrency(getOrderTotal(order))}</span>
                            </div>
                            <div className="ao-price-row">
                              <span>Shipping</span>
                              <span className="ao-free">FREE</span>
                            </div>
                            <div className="ao-price-row ao-price-row--total">
                              <strong>Total</strong>
                              <strong>{formatCurrency(getOrderTotal(order))}</strong>
                            </div>
                            <div className="ao-price-row">
                              <span>Payment Method</span>
                              <span style={{ fontWeight: 600, color: '#6366f1' }}>{order.paymentMethod || 'N/A'}</span>
                            </div>
                            {order.paymentSubMethod && order.paymentSubMethod !== order.paymentMethod && (
                              <div className="ao-price-row">
                                <span>Sub-Method</span>
                                <span>{order.paymentSubMethod}</span>
                              </div>
                            )}
                            <div className="ao-price-row">
                              <span>Payment Status</span>
                              <span className={`ao-pay-status ao-pay-status--${(order.paymentStatus || '').toLowerCase()}`}>
                                {order.paymentStatus || 'Pending'}
                              </span>
                            </div>
                            {order.razorpayPaymentId && (
                              <div className="ao-price-row">
                                <span>Payment ID</span>
                                <span style={{ fontSize: '0.78rem', color: '#64748b', wordBreak: 'break-all' }}>{order.razorpayPaymentId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {order.cancellationReason && (
                        <div className="ao-section">
                          <h4 className="ao-section-title"><FaBan /> Cancellation Reason</h4>
                          <div className="ao-addr-box">
                            <p>{order.cancellationReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Refund Management */}
                      {order.refundInfo && order.refundInfo.status !== 'None' && (
                        <div className="ao-section ao-section--refund">
                          <h4 className="ao-section-title">
                            <FaUndo /> Refund Management
                            <span className="ao-refund-status-chip" style={{
                              background: order.refundInfo.status === 'Requested' ? '#fffbeb' :
                                          order.refundInfo.status === 'Approved'  ? '#eff6ff' :
                                          order.refundInfo.status === 'Processed' ? '#f0fdf4' : '#fef2f2',
                              color:      order.refundInfo.status === 'Requested' ? '#d97706' :
                                          order.refundInfo.status === 'Approved'  ? '#2563eb' :
                                          order.refundInfo.status === 'Processed' ? '#059669' : '#dc2626',
                            }}>
                              {order.refundInfo.status}
                            </span>
                          </h4>
                          <div className="ao-refund-grid">
                            <div><label>Amount</label>
                              <p>{formatCurrency(order.refundInfo.refundAmount || getOrderTotal(order))}</p></div>
                            {order.refundInfo.reason && (
                              <div><label>Customer Reason</label><p>{order.refundInfo.reason}</p></div>
                            )}
                            {order.refundInfo.returnPaymentMethod && (
                              <div><label>Return Method</label><p>{order.refundInfo.returnPaymentMethod}</p></div>
                            )}
                            {order.refundInfo.returnPaymentDetails && (
                              <div><label>Payment Details</label><p>{order.refundInfo.returnPaymentDetails}</p></div>
                            )}
                            {order.refundInfo.requestedAt && (
                              <div><label>Requested</label><p>{formatDate(order.refundInfo.requestedAt)}</p></div>
                            )}
                            {order.refundInfo.approvedAt && (
                              <div><label>Approved</label><p>{formatDate(order.refundInfo.approvedAt)}</p></div>
                            )}
                            {order.refundInfo.processedAt && (
                              <div><label>Processed</label><p>{formatDate(order.refundInfo.processedAt)}</p></div>
                            )}
                            {order.refundInfo.adminNotes && (
                              <div style={{ gridColumn: '1/-1' }}>
                                <label>Admin Notes</label><p>{order.refundInfo.adminNotes}</p>
                              </div>
                            )}
                          </div>

                          {(order.refundInfo.status === 'Requested' || order.refundInfo.status === 'Approved') && (
                            <div className="ao-refund-actions">
                              <div className="ao-notes-field">
                                <label>
                                  Admin Notes
                                  {order.refundInfo.status === 'Requested'
                                    ? <span> (required to reject)</span>
                                    : <span> (optional)</span>
                                  }
                                </label>
                                <textarea
                                  value={adminNotes[order._id] || ''}
                                  onChange={e => setAdminNotes(prev => ({ ...prev, [order._id]: e.target.value }))}
                                  placeholder="Add a note visible to the customer..."
                                  rows={2}
                                />
                              </div>
                              <div className="ao-refund-btns">
                                {order.refundInfo.status === 'Requested' && (
                                  <>
                                    <button className="ao-btn ao-btn--approve"
                                      onClick={() => handleApproveRefund(order._id)}
                                      disabled={refundActionLoading === order._id + '_approve'}>
                                      <FaCheckDouble />{' '}
                                      {refundActionLoading === order._id + '_approve' ? 'Approving...' : 'Approve Refund'}
                                    </button>
                                    <button className="ao-btn ao-btn--reject"
                                      onClick={() => handleRejectRefund(order._id)}
                                      disabled={refundActionLoading === order._id + '_reject'}>
                                      <FaBan />{' '}
                                      {refundActionLoading === order._id + '_reject' ? 'Rejecting...' : 'Reject Refund'}
                                    </button>
                                  </>
                                )}
                                {order.refundInfo.status === 'Approved' && (
                                  <button className="ao-btn ao-btn--process"
                                    onClick={() => handleProcessRefund(order._id)}
                                    disabled={refundActionLoading === order._id + '_process'}>
                                    <FaMoneyBillWave />{' '}
                                    {refundActionLoading === order._id + '_process' ? 'Processing...' : 'Mark as Processed'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {order.afterDeliveryRequest && order.afterDeliveryRequest.status !== 'None' && (
                        <div className="ao-section ao-section--refund">
                          <h4 className="ao-section-title">
                            <FaUndo /> {order.afterDeliveryRequest.type} Request Management
                            <span className="ao-refund-status-chip" style={{
                              background: order.afterDeliveryRequest.status === 'Requested' ? '#fffbeb' :
                                          order.afterDeliveryRequest.status === 'Approved'  ? '#eff6ff' :
                                          order.afterDeliveryRequest.status === 'Processed' ? '#f0fdf4' : '#fef2f2',
                              color:      order.afterDeliveryRequest.status === 'Requested' ? '#d97706' :
                                          order.afterDeliveryRequest.status === 'Approved'  ? '#2563eb' :
                                          order.afterDeliveryRequest.status === 'Processed' ? '#059669' : '#dc2626',
                            }}>
                              {order.afterDeliveryRequest.status}
                            </span>
                          </h4>
                          <div className="ao-refund-grid">
                            {order.afterDeliveryRequest.reason && (
                              <div><label>Customer Reason</label><p>{order.afterDeliveryRequest.reason}</p></div>
                            )}
                            {order.afterDeliveryRequest.type === 'Return' && order.afterDeliveryRequest.returnPaymentMethod && (
                              <div><label>Return Method</label><p>{order.afterDeliveryRequest.returnPaymentMethod}</p></div>
                            )}
                            {order.afterDeliveryRequest.type === 'Return' && order.afterDeliveryRequest.returnPaymentDetails && (
                              <div><label>Payment Details</label><p>{order.afterDeliveryRequest.returnPaymentDetails}</p></div>
                            )}
                            {order.afterDeliveryRequest.requestedAt && (
                              <div><label>Requested</label><p>{formatDate(order.afterDeliveryRequest.requestedAt)}</p></div>
                            )}
                            {order.afterDeliveryRequest.approvedAt && (
                              <div><label>Approved</label><p>{formatDate(order.afterDeliveryRequest.approvedAt)}</p></div>
                            )}
                            {order.afterDeliveryRequest.processedAt && (
                              <div><label>Processed</label><p>{formatDate(order.afterDeliveryRequest.processedAt)}</p></div>
                            )}
                            {order.afterDeliveryRequest.adminNotes && (
                              <div style={{ gridColumn: '1/-1' }}>
                                <label>Admin Notes</label><p>{order.afterDeliveryRequest.adminNotes}</p>
                              </div>
                            )}
                          </div>

                          {(order.afterDeliveryRequest.status === 'Requested' || order.afterDeliveryRequest.status === 'Approved') && (
                            <div className="ao-refund-actions">
                              <div className="ao-notes-field">
                                <label>
                                  Admin Notes
                                  {order.afterDeliveryRequest.status === 'Requested'
                                    ? <span> (required to reject)</span>
                                    : <span> (optional)</span>
                                  }
                                </label>
                                <textarea
                                  value={adminNotes[order._id] || ''}
                                  onChange={e => setAdminNotes(prev => ({ ...prev, [order._id]: e.target.value }))}
                                  placeholder="Add a note visible to the customer..."
                                  rows={2}
                                />
                              </div>
                              <div className="ao-refund-btns">
                                {order.afterDeliveryRequest.status === 'Requested' && (
                                  <>
                                    <button className="ao-btn ao-btn--approve"
                                      onClick={() => handleApproveAfterDeliveryRequest(order._id)}
                                      disabled={refundActionLoading === order._id + '_afterApprove'}>
                                      <FaCheckDouble />{' '}
                                      {refundActionLoading === order._id + '_afterApprove' ? 'Approving...' : `Approve ${order.afterDeliveryRequest.type}`}
                                    </button>
                                    <button className="ao-btn ao-btn--reject"
                                      onClick={() => handleRejectAfterDeliveryRequest(order._id)}
                                      disabled={refundActionLoading === order._id + '_afterReject'}>
                                      <FaBan />{' '}
                                      {refundActionLoading === order._id + '_afterReject' ? 'Rejecting...' : `Reject ${order.afterDeliveryRequest.type}`}
                                    </button>
                                  </>
                                )}
                                {order.afterDeliveryRequest.status === 'Approved' && (
                                  <button className="ao-btn ao-btn--process"
                                    onClick={() => handleProcessAfterDeliveryRequest(order._id)}
                                    disabled={refundActionLoading === order._id + '_afterProcess'}>
                                    <FaMoneyBillWave />{' '}
                                    {refundActionLoading === order._id + '_afterProcess' ? 'Processing...' : `Mark ${order.afterDeliveryRequest.type} Processed`}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status Update */}
                      <div className="ao-section">
                        <h4 className="ao-section-title"><FaEdit /> Update Order Status</h4>
                        {editingOrderId === order._id ? (
                          <div className="ao-status-edit">
                            <select
                              value={newStatus}
                              onChange={e => setNewStatus(e.target.value)}
                              className="ao-status-select">
                              <option value="">Select new status</option>
                              {statusOptions.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button className="ao-btn ao-btn--save"
                              onClick={() => handleUpdateStatus(order._id)}
                              disabled={statusLoading}>
                              {statusLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button className="ao-btn ao-btn--ghost"
                              onClick={() => { setEditingOrderId(null); setNewStatus(''); }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button className="ao-btn ao-btn--edit-status"
                            onClick={() => { setEditingOrderId(order._id); setNewStatus(getOrderStatus(order)); }}>
                            <FaEdit /> Change Status
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="ao-card-foot">
                    <button className="ao-btn-expand"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}>
                      {isExpanded
                        ? <><FaChevronUp /> Hide Details</>
                        : <><FaChevronDown /> View Details</>
                      }
                    </button>
                    <button className="ao-btn-delete" onClick={() => setDeleteModal(order._id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="ao-modal-overlay" onClick={() => setDeleteModal(null)}>
            <div className="ao-modal" onClick={e => e.stopPropagation()}>
              <div className="ao-modal-head">
                <FaExclamationTriangle />
                <h3>Delete Order</h3>
                <button onClick={() => setDeleteModal(null)}><FaTimes /></button>
              </div>
              <div className="ao-modal-body">
                <p>Are you sure you want to permanently delete order <strong>#{deleteModal.slice(-8).toUpperCase()}</strong>?</p>
                <p>This action cannot be undone.</p>
              </div>
              <div className="ao-modal-foot">
                <button className="ao-btn ao-btn--ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
                <button className="ao-btn ao-btn--danger" onClick={handleDeleteOrder}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;