import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { serviceService } from '../services/api';
import '../styles/AdminPages.css';

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    try {
      const response = await serviceService.getAllServices();
      setServices(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      if (error.status === 401 || error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.description || !formData.price) {
      setError('Please fill in all required fields');
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
      fetchServices();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving service:', error);
      setError(error.message || 'Error saving service');
    }
  };

  const handleEdit = (service) => {
    setEditingId(service._id);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceService.deleteService(id);
        setServices(services.filter(s => s._id !== id));
        setSuccess('Service deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting service:', error);
        setError(error.message || 'Error deleting service');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Services</h1>
        <p>Create, edit, and manage your business services</p>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? 'Edit Service' : 'Add New Service'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Service Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Web Development, Consulting"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your service in detail..."
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter service price"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Service' : 'Add Service'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="admin-toolbar">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FaPlus /> Add New Service
          </button>
        </div>
      )}

      {error && <div style={{ color: 'red', padding: '10px', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', padding: '10px', marginBottom: '10px' }}>{success}</div>}

      {loading ? (
        <div className="loading">Loading services...</div>
      ) : services.length > 0 ? (
        <div className="products-admin-grid">
          {services.map(service => (
            <div key={service._id} className="product-admin-card">
              <div style={{ 
                padding: '16px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{service.name}</h3>
                <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>Service</p>
              </div>
              
              <p className="description" style={{ padding: '12px 16px' }}>
                {service.description?.substring(0, 100)}
                {service.description?.length > 100 ? '...' : ''}
              </p>
              
              <div className="price-stock-display">
                <span className="price">₹{service.price || 0}</span>
                <span className="stock">
                  {new Date(service.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <div className="admin-actions">
                <button
                  className="action-btn edit"
                  onClick={() => handleEdit(service)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(service._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <p>No services found. Create your first service!</p>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
