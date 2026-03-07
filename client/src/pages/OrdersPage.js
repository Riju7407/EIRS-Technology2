import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBox, FaTruck, FaCheckCircle, FaClock, FaTimesCircle, FaTimes,
  FaShoppingBag, FaMapMarkerAlt, FaCreditCard, FaUndo, FaBan,
  FaChevronDown, FaChevronUp, FaReceipt, FaHeadset, FaExclamationTriangle,
  FaMoneyBillWave, FaTag
} from 'react-icons/fa';
import { orderService } from '../services/api';
import '../styles/OrdersPage.css';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

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

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const getStatusStep = (status) => STATUS_STEPS.indexOf(status);

  const getStatusMeta = (status) => {
    const map = {
      Pending:   { color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', label: 'Order Placed' },
      Confirmed: { color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', label: 'Confirmed'    },
      Shipped:   { color: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd', label: 'Shipped'       },
      Delivered: { color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', label: 'Delivered'     },
      Cancelled: { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', label: 'Cancelled'     },
    };
    return map[status] || { color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db', label: status };
  };

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

  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(o => o.status === filter);

  const handleCancelOrder = async () => {
    if (!reason.trim()) { showToast('Please provide a cancellation reason', 'error'); return; }
    setActionLoading(true);
    try {
      await orderService.cancelOrder(selectedOrder._id, { reason });
      await fetchOrders();
      setShowCancelModal(false);
      setReason('');
      const wasPaid = selectedOrder.paymentStatus === 'Completed';
      showToast(wasPaid
        ? 'Order cancelled. Refund request raised automatically.'
        : 'Order cancelled successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!reason.trim()) { showToast('Please provide a refund reason', 'error'); return; }
    setActionLoading(true);
    try {
      await orderService.requestRefund(selectedOrder._id, { reason });
      await fetchOrders();
      setShowRefundModal(false);
      setReason('');
      showToast('Refund request submitted. Processed within 5-7 business days.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request refund', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="op-page">
        <div className="op-loading">
          <div className="op-spinner" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="op-page">
      {toast && (
        <div className={`op-toast op-toast--${toast.type}`}>
          {toast.type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="op-container">
        {/* Header */}
        <div className="op-header">
          <div className="op-header-left">
            <FaShoppingBag className="op-header-icon" />
            <div>
              <h1>My Orders</h1>
              <p>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
            </div>
          </div>
          <Link to="/products" className="op-shop-btn">Continue Shopping</Link>
        </div>

        {/* Filter Pills */}
        <div className="op-filters">
          {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
            <button
              key={s}
              className={`op-filter${filter === s ? ' op-filter--active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}
              <span className="op-filter-count">
                {s === 'All' ? orders.length : orders.filter(o => o.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="op-empty">
            <FaBox size={60} color="#d1d5db" />
            <h2>No orders found</h2>
            <p>{filter === 'All' ? "You haven't placed any orders yet." : `No ${filter} orders.`}</p>
            <Link to="/products" className="op-shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="op-list">
            {filteredOrders.map(order => {
              const meta = getStatusMeta(order.status);
              const refundBadge = getRefundBadge(order.refundInfo);
              const isExpanded = expandedOrderId === order._id;
              const stepIdx = getStatusStep(order.status);
              const isCancelled = order.status === 'Cancelled';
              const canCancel = ['Pending', 'Confirmed'].includes(order.status);
              const canRefund = order.status === 'Delivered' &&
                (!order.refundInfo || order.refundInfo.status === 'None');

              return (
                <div key={order._id} className="op-card">
                  {/* Top Bar */}
                  <div className="op-card-topbar" style={{ borderTopColor: meta.color }}>
                    <div className="op-card-topbar-left">
                      <span className="op-order-id">
                        <FaReceipt /> Order #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="op-order-date">
                        {formatDate(order.orderDate || order.createdAt)}
                      </span>
                    </div>
                    <div className="op-card-topbar-right">
                      {refundBadge && (
                        <span className="op-refund-badge"
                          style={{ color: refundBadge.color, background: refundBadge.bg }}>
                          <FaUndo /> {refundBadge.label}
                        </span>
                      )}
                      <span className="op-status-pill"
                        style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="op-items-preview">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="op-item-row">
                        {item.image
                          ? <img src={item.image} alt={item.productName} className="op-item-img" />
                          : <div className="op-item-img op-item-img--placeholder"><FaBox /></div>
                        }
                        <div className="op-item-meta">
                          <p className="op-item-name">{item.productName}</p>
                          {item.category && (
                            <span className="op-item-cat"><FaTag /> {item.category}</span>
                          )}
                          <span className="op-item-qty">Qty: {item.quantity}</span>
                        </div>
                        <p className="op-item-price">
                          Rs.{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="op-more-items">+{order.items.length - 3} more item(s)</p>
                    )}
                  </div>

                  {/* Summary Row */}
                  <div className="op-summary-row">
                    <div className="op-summary-info">
                      <span><FaCreditCard /> {order.paymentMethod}</span>
                      <span className={`op-pay-status op-pay-status--${(order.paymentStatus || '').toLowerCase()}`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </div>
                    <div className="op-summary-total">
                      <span>Total</span>
                      <strong>Rs.{order.totalPrice?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* Timeline (active orders only) */}
                  {!isCancelled && (
                    <div className="op-timeline">
                      {STATUS_STEPS.map((step, i) => (
                        <React.Fragment key={step}>
                          <div className={`op-step${i <= stepIdx ? ' op-step--done' : ''}${i === stepIdx ? ' op-step--current' : ''}`}>
                            <div className="op-step-dot">
                              {i <= stepIdx ? <FaCheckCircle /> : <span>{i + 1}</span>}
                            </div>
                            <span className="op-step-label">{step}</span>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`op-step-line${i < stepIdx ? ' op-step-line--done' : ''}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {isCancelled && order.cancellationReason && (
                    <div className="op-cancel-reason">
                      <FaBan /> Cancelled: {order.cancellationReason}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="op-actions">
                    <button className="op-btn-ghost"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}>
                      {isExpanded ? <><FaChevronUp /> Hide Details</> : <><FaChevronDown /> View Details</>}
                    </button>
                    <div className="op-actions-right">
                      {canCancel && (
                        <button className="op-btn-cancel" onClick={() => {
                          setSelectedOrder(order);
                          setShowCancelModal(true);
                          setReason('');
                        }}>
                          <FaBan /> Cancel Order
                        </button>
                      )}
                      {canRefund && (
                        <button className="op-btn-refund" onClick={() => {
                          setSelectedOrder(order);
                          setShowRefundModal(true);
                          setReason('');
                        }}>
                          <FaMoneyBillWave /> Request Refund
                        </button>
                      )}
                      <Link to="/contact" className="op-btn-help"><FaHeadset /> Help</Link>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="op-details">
                      {/* All Items */}
                      <div className="op-detail-section">
                        <h4>All Items</h4>
                        <div className="op-all-items">
                          {order.items.map((item, i) => (
                            <div key={i} className="op-detail-item">
                              {item.image
                                ? <img src={item.image} alt={item.productName} className="op-detail-img" />
                                : <div className="op-detail-img op-detail-img--placeholder"><FaBox /></div>
                              }
                              <div className="op-detail-item-meta">
                                <h5>{item.productName}</h5>
                                {item.category && <p className="op-detail-cat">{item.category}</p>}
                                {item.brand && <p className="op-detail-brand">{item.brand}</p>}
                              </div>
                              <div className="op-detail-item-price">
                                <p>Qty: {item.quantity}</p>
                                <p>Rs.{item.price?.toLocaleString('en-IN')} each</p>
                                <strong>Rs.{(item.price * item.quantity)?.toLocaleString('en-IN')}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="op-detail-cols">
                        {/* Address */}
                        {order.shippingAddress && (
                          <div className="op-detail-section">
                            <h4><FaMapMarkerAlt /> Delivery Address</h4>
                            <div className="op-addr-box">
                              <p><strong>{order.shippingAddress.fullName}</strong></p>
                              <p>{order.shippingAddress.address}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                              <p>Ph: {order.shippingAddress.phone}</p>
                              {order.shippingAddress.email && <p>Email: {order.shippingAddress.email}</p>}
                            </div>
                          </div>
                        )}

                        {/* Pricing */}
                        <div className="op-detail-section">
                          <h4><FaCreditCard /> Payment & Pricing</h4>
                          <div className="op-price-box">
                            <div className="op-price-row">
                              <span>Subtotal ({order.totalItems} items)</span>
                              <span>Rs.{order.totalPrice?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="op-price-row">
                              <span>Shipping</span>
                              <span className="op-free">FREE</span>
                            </div>
                            <div className="op-price-row op-price-row--total">
                              <strong>Total Paid</strong>
                              <strong>Rs.{order.totalPrice?.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="op-price-row">
                              <span>Payment Method</span>
                              <span>{order.paymentMethod}</span>
                            </div>
                            <div className="op-price-row">
                              <span>Payment Status</span>
                              <span className={`op-pay-status op-pay-status--${(order.paymentStatus || '').toLowerCase()}`}>
                                {order.paymentStatus || 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Refund Info */}
                      {order.refundInfo && order.refundInfo.status !== 'None' && (
                        <div className="op-detail-section op-refund-info">
                          <h4><FaUndo /> Refund Information</h4>
                          <div className="op-price-box">
                            <div className="op-price-row">
                              <span>Refund Status</span>
                              <span style={{ color: getRefundBadge(order.refundInfo)?.color, fontWeight: 700 }}>
                                {order.refundInfo.status}
                              </span>
                            </div>
                            <div className="op-price-row">
                              <span>Refund Amount</span>
                              <span>Rs.{(order.refundInfo.refundAmount || order.totalPrice)?.toLocaleString('en-IN')}</span>
                            </div>
                            {order.refundInfo.reason && (
                              <div className="op-price-row">
                                <span>Reason</span>
                                <span>{order.refundInfo.reason}</span>
                              </div>
                            )}
                            {order.refundInfo.requestedAt && (
                              <div className="op-price-row">
                                <span>Requested On</span>
                                <span>{formatDate(order.refundInfo.requestedAt)}</span>
                              </div>
                            )}
                            {order.refundInfo.processedAt && (
                              <div className="op-price-row">
                                <span>Processed On</span>
                                <span>{formatDate(order.refundInfo.processedAt)}</span>
                              </div>
                            )}
                            {order.refundInfo.adminNotes && (
                              <div className="op-price-row">
                                <span>Admin Note</span>
                                <span>{order.refundInfo.adminNotes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedOrder && (
        <div className="op-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="op-modal" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header op-modal-header--danger">
              <FaBan />
              <h3>Cancel Order</h3>
              <button onClick={() => setShowCancelModal(false)}><FaTimes /></button>
            </div>
            <div className="op-modal-body">
              <div className="op-modal-order-info">
                <p>Order <strong>#{selectedOrder._id.slice(-8).toUpperCase()}</strong></p>
                <p>Amount: <strong>Rs.{selectedOrder.totalPrice?.toLocaleString('en-IN')}</strong></p>
              </div>
              {selectedOrder.paymentStatus === 'Completed' && (
                <div className="op-modal-refund-notice">
                  <FaMoneyBillWave />
                  <p>Since you have already paid, a <strong>refund request will be raised automatically</strong> and processed within 5-7 business days.</p>
                </div>
              )}
              <label className="op-modal-label">
                Reason for cancellation <span>*</span>
              </label>
              <textarea
                className="op-modal-textarea"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Please tell us why you want to cancel this order..."
                rows={4}
              />
            </div>
            <div className="op-modal-footer">
              <button className="op-btn-ghost"
                onClick={() => setShowCancelModal(false)}
                disabled={actionLoading}>
                Keep Order
              </button>
              <button className="op-btn-cancel"
                onClick={handleCancelOrder}
                disabled={actionLoading}>
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="op-modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="op-modal" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header op-modal-header--refund">
              <FaMoneyBillWave />
              <h3>Request Refund</h3>
              <button onClick={() => setShowRefundModal(false)}><FaTimes /></button>
            </div>
            <div className="op-modal-body">
              <div className="op-modal-order-info">
                <p>Order <strong>#{selectedOrder._id.slice(-8).toUpperCase()}</strong></p>
                <p>Refund Amount: <strong>Rs.{selectedOrder.totalPrice?.toLocaleString('en-IN')}</strong></p>
              </div>
              <div className="op-modal-refund-notice">
                <FaCheckCircle />
                <p>Refunds are processed within <strong>5-7 business days</strong> to your original payment method.</p>
              </div>
              <label className="op-modal-label">
                Reason for refund <span>*</span>
              </label>
              <textarea
                className="op-modal-textarea"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Please describe why you are requesting a refund..."
                rows={4}
              />
            </div>
            <div className="op-modal-footer">
              <button className="op-btn-ghost"
                onClick={() => setShowRefundModal(false)}
                disabled={actionLoading}>
                Close
              </button>
              <button className="op-btn-refund"
                onClick={handleRequestRefund}
                disabled={actionLoading}>
                {actionLoading ? 'Submitting...' : 'Submit Refund Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default OrdersPage;