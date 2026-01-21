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
    serviceName: '',
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

    if (!formData.serviceName || !formData.description) {
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
      serviceName: service.serviceName,
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
      serviceName: '',
      description: '',
      price: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Manage Services</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <FaPlus /> Add Service
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? 'Edit Service' : 'Add New Service'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="serviceName">Service Name *</label>
              <input
                type="text"
                id="serviceName"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleInputChange}
                placeholder="Enter service name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter service description"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (Optional)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter service price"
                step="0.01"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? 'Update Service' : 'Add Service'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <p className="loading">Loading services...</p>
        ) : services.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id}>
                  <td>{service.serviceName}</td>
                  <td>{service.description?.substring(0, 50)}...</td>
                  <td>${service.price || 'N/A'}</td>
                  <td className="actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => handleEdit(service)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(service._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No services found. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServices;
