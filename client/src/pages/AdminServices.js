import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import { serviceService } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import '../styles/AdminPages.css';

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [serviceBookings, setServiceBookings] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchServices();
    fetchServiceBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    try {
      const r = await serviceService.getAllServices();
      setServices(Array.isArray(r) ? r : r.data || []);
    } catch (e) {
      if (e.status === 401 || e.response?.status === 401) navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceBookings = async () => {
    try {
      const r = await serviceService.getAllBookings();
      setServiceBookings(Array.isArray(r.data) ? r.data : r.data || []);
    } catch (e) {
      if (e.status === 401 || e.response?.status === 401) navigate('/signin');
      setServiceBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.name || !formData.description || !formData.price) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      if (editingId) {
        await serviceService.updateService(editingId, formData);
        setSuccess('Service updated successfully!');
      } else {
        await serviceService.addService(formData);
        setSuccess('Service added successfully!');
      }
      fetchServices(); resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message || 'Error saving service');
    }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setFormData({ name: s.name, description: s.description, price: s.price || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await serviceService.deleteService(id);
      setServices(services.filter(s => s._id !== id));
      setSuccess('Service deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message || 'Error deleting service');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '' });
    setShowForm(false);
  };

  const filtered = services.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = serviceBookings.filter((booking) => {
    const query = bookingSearch.toLowerCase();
    if (!query) return true;
    return (
      booking.serviceName?.toLowerCase().includes(query) ||
      booking.customerName?.toLowerCase().includes(query) ||
      booking.phoneNumber?.toLowerCase().includes(query) ||
      booking.userId?.email?.toLowerCase().includes(query)
    );
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getBookingStatusClass = (status) => {
    if (status === 'Confirmed') return 'ap-badge-blue';
    if (status === 'Completed') return 'ap-badge-green';
    if (status === 'Cancelled') return 'ap-badge-red';
    return 'ap-badge-yellow';
  };

  return (
    <AdminLayout pageTitle="Services" breadcrumbs={[{ label: 'Services' }]}>
      <div className="ap-page">
        <div className="ap-header">
          <div className="ap-header-text">
            <h1>Services Management</h1>
            <p>Add, edit and manage your business services.</p>
          </div>
          <div className="ap-header-actions">
            <button className="ap-btn ap-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
              <FaPlus /> Add Service
            </button>
          </div>
        </div>

        {error && <div className="ap-alert ap-alert-error">{error}</div>}
        {success && <div className="ap-alert ap-alert-success">{success}</div>}

        {showForm && (
          <div className="ap-form-panel">
            <div className="ap-form-panel-header">
              <h2>{editingId ? 'Edit Service' : 'Add New Service'}</h2>
              <button className="ap-btn ap-btn-secondary ap-btn-sm" onClick={resetForm}>
                <FaTimes /> Close
              </button>
            </div>
            <form onSubmit={handleSubmit} className="ap-form-body">
              <div className="ap-form-row">
                <div className="ap-form-group">
                  <label>Service Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. CCTV Installation" required />
                </div>
                <div className="ap-form-group">
                  <label>Price *</label>
                  <input name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 2500" required />
                </div>
              </div>
              <div className="ap-form-row">
                <div className="ap-form-group full-width">
                  <label>Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the service..." required rows={4} />
                </div>
              </div>
              <div className="ap-form-actions">
                <button type="submit" className="ap-btn ap-btn-primary">
                  {editingId ? <><FaEdit /> Update Service</> : <><FaPlus /> Add Service</>}
                </button>
                <button type="button" className="ap-btn ap-btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="ap-toolbar">
          <div className="ap-search">
            <FaSearch className="ap-search-icon" />
            <input type="text" placeholder="Search services..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <span className="ap-results-count">{filtered.length} service{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="ap-loading"><div className="ap-spinner" /><p>Loading services...</p></div>
        ) : filtered.length > 0 ? (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr><th>Service Name</th><th>Description</th><th>Price</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id}>
                    <td><span style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</span></td>
                    <td><span className="ap-enquiry-msg">{s.description}</span></td>
                    <td><span className="ap-price">{s.price}</span></td>
                    <td>
                      <div className="ap-actions">
                        <button className="ap-btn ap-btn-warning ap-btn-sm" onClick={() => handleEdit(s)}>
                          <FaEdit /> Edit
                        </button>
                        <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => handleDelete(s._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ap-empty">
            <div className="ap-empty-icon">🔧</div>
            <h3>No services found</h3>
            <p>{searchTerm ? 'No services match your search.' : 'Add your first service above.'}</p>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <div className="ap-header" style={{ marginBottom: 16 }}>
            <div className="ap-header-text">
              <h2 style={{ marginBottom: 4 }}>Service Bookings</h2>
              <p>Bookings created by users from the services page.</p>
            </div>
          </div>

          <div className="ap-toolbar">
            <div className="ap-search">
              <FaSearch className="ap-search-icon" />
              <input
                type="text"
                placeholder="Search bookings by service, customer or phone..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
              />
            </div>
            <span className="ap-results-count">{filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</span>
          </div>

          {bookingsLoading ? (
            <div className="ap-loading"><div className="ap-spinner" /><p>Loading bookings...</p></div>
          ) : filteredBookings.length > 0 ? (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Booked On</th>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Preferred Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{formatDate(booking.createdAt)}</td>
                      <td><strong>{booking.serviceName || booking.serviceId?.name || 'Service'}</strong></td>
                      <td>{booking.customerName || booking.userId?.name || 'N/A'}</td>
                      <td>{booking.phoneNumber || booking.userId?.phoneNumber || 'N/A'}</td>
                      <td>{booking.email || booking.userId?.email || 'N/A'}</td>
                      <td><span className="ap-enquiry-msg">{booking.address || 'N/A'}</span></td>
                      <td>{formatDate(booking.preferredDate)}</td>
                      <td>
                        <span className={`ap-badge ${getBookingStatusClass(booking.status)}`}>
                          {booking.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ap-empty">
              <div className="ap-empty-icon">📅</div>
              <h3>No service bookings yet</h3>
              <p>{bookingSearch ? 'No bookings match your search.' : 'User bookings will appear here.'}</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
