import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChartBar, FaUsers, FaPhone, FaBox, FaTools, FaSignOutAlt, FaEdit, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';
import { authService } from '../services/api';
import axios from 'axios';
import '../styles/AdminPages.css';

const AdminFilters = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  // Filters state
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'brand',
    options: [{ label: '', value: '' }],
    description: '',
    displayOrder: 0
  });

  const API_BASE = 'http://localhost:5000/api';
  const filterTypes = ['brand', 'resolution', 'channels', 'priceRange', 'other'];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/filters`);
      setFilters(response.data.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching filters:', error);
      setError('Error fetching filters: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddFilter = () => {
    setFormData({
      name: '',
      type: 'brand',
      options: [{ label: '', value: '' }],
      description: '',
      displayOrder: 0
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditFilter = (filter) => {
    setFormData({
      name: filter.name,
      type: filter.type,
      options: filter.options || [{ label: '', value: '' }],
      description: filter.description || '',
      displayOrder: filter.displayOrder || 0
    });
    setEditingId(filter._id);
    setShowForm(true);
  };

  const handleDeleteFilter = async (filterId, filterName) => {
    if (window.confirm(`Are you sure you want to delete "${filterName}"?`)) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        await axios.delete(`${API_BASE}/filters/${filterId}`, { headers });
        setSuccess('Filter deleted successfully');
        fetchFilters();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting filter');
        console.error('Error deleting filter:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? parseInt(value) : value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { label: '', value: '' }]
    }));
  };

  const handleRemoveOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Filter name is required');
      return;
    }

    if (!formData.type) {
      setError('Filter type is required');
      return;
    }

    // Validate options
    const validOptions = formData.options.filter(opt => opt.label.trim() && opt.value.trim());
    if (validOptions.length === 0) {
      setError('At least one option is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const submitData = {
        ...formData,
        options: validOptions
      };

      let response;
      if (editingId) {
        response = await axios.put(
          `${API_BASE}/filters/${editingId}`,
          submitData,
          { headers }
        );
        setSuccess('Filter updated successfully');
      } else {
        response = await axios.post(
          `${API_BASE}/filters`,
          submitData,
          { headers }
        );
        setSuccess('Filter created successfully');
      }

      resetForm();
      fetchFilters();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving filter');
      console.error('Error saving filter:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'brand',
      options: [{ label: '', value: '' }],
      description: '',
      displayOrder: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>EIRS Admin</h2>
          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item">
            <FaChartBar /> Dashboard
          </Link>
          <Link to="/admin/categories" className="nav-item">
            <FaBox /> Categories
          </Link>
          <Link to="/admin/subcategories" className="nav-item">
            <FaBox /> Subcategories
          </Link>
          <Link to="/admin/filters" className="nav-item active">
            <FaFilter /> Filters
          </Link>
          <Link to="/admin/products" className="nav-item">
            <FaBox /> Products
          </Link>
          <Link to="/admin/services" className="nav-item">
            <FaTools /> Services
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <FaPhone /> Orders
          </Link>
          <Link to="/admin/enquiries" className="nav-item">
            <FaPhone /> Enquiries
          </Link>
          <Link to="/admin/users" className="nav-item">
            <FaUsers /> Users
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
          <h1>Manage Filters</h1>
          <div className="header-user">
            {adminUser && <span>Welcome, {adminUser.firstName}</span>}
          </div>
        </header>

        <div className="admin-content">
          {/* Messages */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Add Button */}
          <div className="content-header">
            <button
              className="btn btn-primary"
              onClick={handleAddFilter}
              disabled={loading}
            >
              <FaPlus /> Add New Filter
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="form-container">
              <h2>{editingId ? 'Edit Filter' : 'Create New Filter'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Filter Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Brands, Resolutions, Price Ranges"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Filter Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {filterTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Optional description"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Filter Options *</label>
                  <div className="options-list">
                    {formData.options.map((option, index) => (
                      <div key={index} className="option-row">
                        <input
                          type="text"
                          placeholder="Label (e.g., 2MP)"
                          value={option.label}
                          onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g., 2mp)"
                          value={option.value}
                          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                        />
                        {formData.options.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveOption(index)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddOption}
                  >
                    <FaPlus /> Add Option
                  </button>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {editingId ? 'Update Filter' : 'Create Filter'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters List */}
          <div className="items-container">
            <h2>All Filters ({filters.length})</h2>
            {loading && !showForm ? (
              <p className="loading">Loading filters...</p>
            ) : filters.length > 0 ? (
              <div className="items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Options Count</th>
                      <th>Display Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filters.map(filter => (
                      <tr key={filter._id}>
                        <td>{filter.name}</td>
                        <td><span className="badge">{filter.type}</span></td>
                        <td>{filter.options?.length || 0}</td>
                        <td>{filter.displayOrder}</td>
                        <td>
                          <span className={`status ${filter.isActive ? 'active' : 'inactive'}`}>
                            {filter.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="actions">
                          <button
                            className="btn btn-edit"
                            onClick={() => handleEditFilter(filter)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => handleDeleteFilter(filter._id, filter.name)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No filters found. Create your first filter!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminFilters;
