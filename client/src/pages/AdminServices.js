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
  const [formData, setFormData] = useState({ name: '', description: '', price: '', availableDates: [], newDate: '', image: null, features: [] });
  const [imagePreview, setImagePreview] = useState(null);
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

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      const file = e.target.files[0];
      if (file) {
        setFormData(p => ({ ...p, image: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    }
  };

  // eslint-disable-next-line no-unused-vars
  const addDate = () => {
    if (formData.newDate && !formData.availableDates.includes(formData.newDate)) {
      setFormData(p => ({
        ...p,
        availableDates: [...p.availableDates, formData.newDate].sort(),
        newDate: ''
      }));
    }
  };

  // eslint-disable-next-line no-unused-vars
  const removeDate = (dateToRemove) => {
    setFormData(p => ({
      ...p,
      availableDates: p.availableDates.filter(d => d !== dateToRemove)
    }));
  };

  const addFeaturePreset = (preset) => {
    setFormData(p => ({
      ...p,
      features: [...p.features, preset]
    }));
  };

  const removeFeature = (idx) => {
    setFormData(p => ({
      ...p,
      features: p.features.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.name || !formData.description || !formData.price) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      let dataToSend = formData;
      // If there's an image file, create FormData
      if (formData.image instanceof File) {
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('description', formData.description);
        fd.append('price', formData.price);
        formData.availableDates.forEach(date => fd.append('availableDates', date));
        fd.append('features', JSON.stringify(formData.features || []));
        fd.append('image', formData.image);
        dataToSend = fd;
      } else {
        // Send as JSON without image file
        dataToSend = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          availableDates: formData.availableDates,
          features: formData.features || [],
          image: formData.image
        };
      }
      
      if (editingId) {
        await serviceService.updateService(editingId, dataToSend);
        setSuccess('Service updated successfully!');
      } else {
        await serviceService.addService(dataToSend);
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
    setFormData({
      name: s.name,
      description: s.description,
      price: s.price || '',
      availableDates: s.availableDates || [],
      newDate: '',
      image: null,
      features: s.features || []
    });
    setImagePreview(s.image || null);
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
    setFormData({ name: '', description: '', price: '', availableDates: [], newDate: '', image: null, features: [] });
    setImagePreview(null);
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
      <div className="ap-page" style={{ maxWidth: 1400, margin: '0 auto', padding: 16 }}>
        {/* SERVICES SECTION */}
        <div className="ap-section-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e7ef', marginBottom: 32, padding: 24 }}>
          <div className="ap-header" style={{ marginBottom: 12 }}>
            <div className="ap-header-text">
              <h2 style={{ margin: 0 }}>Services</h2>
              <p style={{ margin: 0 }}>Add, edit and manage your business services.</p>
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
            <div className="ap-form-panel" style={{ marginBottom: 24 }}>
              <div className="ap-form-panel-header">
                <h3>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
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
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the service..." required rows={3} />
                  </div>
                </div>
                <div className="ap-form-row">
                  <div className="ap-form-group full-width">
                    <label>Available Booking Dates</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <input type="date" value={formData.newDate} onChange={(e) => setFormData(p => ({ ...p, newDate: e.target.value }))} />
                      <button type="button" className="ap-btn ap-btn-secondary" onClick={addDate}>Add Date</button>
                    </div>
                    {formData.availableDates.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {formData.availableDates.map(date => (
                          <div key={date} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dbeafe', padding: '6px 12px', borderRadius: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{new Date(date).toLocaleDateString('en-IN')}</span>
                            <button type="button" onClick={() => removeDate(date)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#dc2626' }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ap-form-row">
                  <div className="ap-form-group full-width">
                    <label>Service Features (What's Included)</label>
                    <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => addFeaturePreset({
                        title: 'Installation & Setup',
                        description: 'Site survey & planning\nProfessional installation\nSystem testing & handover\nPost-install walkthrough',
                        imageUrl: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697329/Install_nr4hg1.png'
                      })}>
                        + Installation
                      </button>
                      <button type="button" className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => addFeaturePreset({
                        title: 'AMC & Maintenance',
                        description: 'Scheduled inspections\nPreventive maintenance\nEmergency support\nPerformance reports',
                        imageUrl: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697310/AMC_tphu7z.png'
                      })}>
                        + AMC
                      </button>
                      <button type="button" className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => addFeaturePreset({
                        title: 'Technical Support & Expert Consultation',
                        description: 'Free site consultation\nRemote diagnostics\n24/7 helpdesk\nCustom security plan',
                        imageUrl: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697295/Technical_wdw9m2.png'
                      })}>
                        + Support
                      </button>
                    </div>
                    {formData.features && formData.features.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                        {formData.features.map((feat, idx) => (
                          <div key={idx} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, background: '#f9fafb', position: 'relative' }}>
                            {feat.imageUrl && <img src={feat.imageUrl} alt={feat.title} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />}
                            <h5 style={{ margin: '0 0 6px 0', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{feat.title}</h5>
                            <p style={{ margin: 0, fontSize: 12, color: '#666', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{feat.description}</p>
                            <button type="button" onClick={() => removeFeature(idx)} style={{ position: 'absolute', top: 8, right: 8, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ap-form-row">
                  <div className="ap-form-group full-width">
                    <label>Service Image</label>
                    <input type="file" name="image" accept="image/*" onChange={handleChange} />
                    {imagePreview && <img src={imagePreview} alt="Preview" style={{ marginTop: 12, maxWidth: 150, maxHeight: 150, borderRadius: 6 }} />}
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
          <div className="ap-toolbar" style={{ marginBottom: 20 }}>
            <div className="ap-search">
              <FaSearch className="ap-search-icon" />
              <input type="text" placeholder="Search services..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <span className="ap-results-count">{filtered.length} service{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          {loading ? (
            <div className="ap-loading"><div className="ap-spinner" /><p>Loading services...</p></div>
          ) : filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filtered.map(s => (
                <div key={s._id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px #0000080d', transition: 'all 0.3s' }}>
                  <div style={{ padding: 16, minHeight: 180 }}>
                    <h4 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: 16, fontWeight: 700 }}>{s.name}</h4>
                    <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13, lineHeight: 1.5, maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>₹ {s.price}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>Dates: {s.availableDates?.length || 0}</span>
                    </div>
                  </div>
                  <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                    <button className="ap-btn ap-btn-warning ap-btn-sm" style={{ flex: 1 }} onClick={() => handleEdit(s)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="ap-btn ap-btn-danger ap-btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(s._id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ap-empty">
              <div className="ap-empty-icon">🔧</div>
              <h3>No services found</h3>
              <p>{searchTerm ? 'No services match your search.' : 'Add your first service above.'}</p>
            </div>
          )}
        </div>

        {/* BOOKINGS SECTION */}
        <div className="ap-section-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e7ef', marginBottom: 32, padding: 24 }}>
          <div className="ap-header" style={{ marginBottom: 12 }}>
            <div className="ap-header-text">
              <h2 style={{ margin: 0 }}>Service Bookings</h2>
              <p style={{ margin: 0 }}>Bookings created by users from the services page.</p>
            </div>
          </div>
          <div className="ap-toolbar" style={{ marginBottom: 8 }}>
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
                        <select
                          className={`ap-badge ${getBookingStatusClass(booking.status)}`}
                          value={booking.status || 'Pending'}
                          style={{ minWidth: 110, padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontWeight: 600 }}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              // Call API to update booking status
                              await serviceService.updateBookingStatus(booking._id, newStatus);
                              setServiceBookings((prev) => prev.map(b => b._id === booking._id ? { ...b, status: newStatus } : b));
                            } catch (err) {
                              setError('Failed to update status');
                            }
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
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
