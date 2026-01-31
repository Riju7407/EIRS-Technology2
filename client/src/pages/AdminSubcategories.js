import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChartBar, FaUsers, FaPhone, FaBox, FaTools, FaSignOutAlt, FaEdit, FaTrash, FaPlus, FaTags } from 'react-icons/fa';
import { authService } from '../services/api';
import axios from 'axios';
import '../styles/AdminPages.css';

const AdminSubcategories = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'subcategories'
  
  // Categories state - now loaded from API
  const [categories, setCategories] = useState([]);

  // Subcategories state
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // Error/Success state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category form data
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  // Subcategory form data
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    category: '',
    description: ''
  });

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/subcategories`)
      ]);
      setCategories(categoriesRes.data.data || []);
      setSubcategories(subcategoriesRes.data.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Category Management Functions
  const handleAddCategory = () => {
    setCategoryFormData({ name: '', description: '' });
    setEditingCategoryId(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingCategoryId(category._id);
    setShowForm(true);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        await axios.delete(`${API_BASE}/categories/${categoryId}`, { headers });
        setSuccess('Category deleted successfully');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting category');
        console.error('Error deleting category:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name.trim()) {
      setError('Please enter a category name');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingCategoryId) {
        await axios.put(
          `${API_BASE}/categories/${editingCategoryId}`,
          categoryFormData,
          { headers }
        );
        setSuccess('Category updated successfully');
      } else {
        await axios.post(
          `${API_BASE}/categories`,
          categoryFormData,
          { headers }
        );
        setSuccess('Category created successfully');
      }
      
      resetCategoryForm();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving category');
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', description: '' });
    setEditingCategoryId(null);
    setShowForm(false);
    setError('');
  };

  // Subcategory Management Functions
  const handleAddSubcategory = () => {
    setSubcategoryFormData({ name: '', category: '', description: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditSubcategory = (subcategory) => {
    setSubcategoryFormData({ 
      name: subcategory.name,
      category: subcategory.category,
      description: subcategory.description || ''
    });
    setEditingId(subcategory._id);
    setShowForm(true);
  };

  const handleDeleteSubcategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        await axios.delete(`${API_BASE}/subcategories/${id}`, { headers });
        setSuccess('Subcategory deleted successfully');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting subcategory');
        console.error('Error deleting subcategory:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    
    if (!subcategoryFormData.name.trim() || !subcategoryFormData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingId) {
        await axios.put(
          `${API_BASE}/subcategories/${editingId}`,
          {
            name: subcategoryFormData.name,
            category: subcategoryFormData.category,
            description: subcategoryFormData.description
          },
          { headers }
        );
        setSuccess('Subcategory updated successfully');
      } else {
        await axios.post(
          `${API_BASE}/subcategories`,
          {
            name: subcategoryFormData.name,
            category: subcategoryFormData.category,
            description: subcategoryFormData.description
          },
          { headers }
        );
        setSuccess('Subcategory created successfully');
      }
      
      resetSubcategoryForm();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving subcategory');
      console.error('Error saving subcategory:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetSubcategoryForm = () => {
    setSubcategoryFormData({ name: '', category: '', description: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item">
            <FaChartBar /> Dashboard
          </Link>
          <Link to="/admin/users" className="nav-item">
            <FaUsers /> Users
          </Link>
          <Link to="/admin/enquiries" className="nav-item">
            <FaPhone /> Enquiries
          </Link>
          <Link to="/admin/products" className="nav-item">
            <FaBox /> Products
          </Link>
          <Link to="/admin/subcategories" className="nav-item active">
            <FaTags /> Categories
          </Link>
          <Link to="/admin/services" className="nav-item">
            <FaTools /> Services
          </Link>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <div className="topbar-right">
            <div className="admin-profile">
              <span>{adminUser?.email || 'Admin'}</span>
              <button onClick={handleLogout} className="logout-icon">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          <div className="page-header">
            <h1>Manage Categories & Subcategories</h1>
            <p>Add, edit, and manage product categories and their subcategories</p>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('categories');
                setShowForm(false);
              }}
            >
              📁 Categories ({categories.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'subcategories' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('subcategories');
                setShowForm(false);
              }}
            >
              🏷️ Subcategories ({subcategories.length})
            </button>
          </div>

          {/* Alert Messages */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="tab-content">
              <button className="btn btn-primary" onClick={handleAddCategory} disabled={loading}>
                <FaPlus /> Add New Category
              </button>

              {showForm && activeTab === 'categories' && (
                <form onSubmit={handleSaveCategory} className="admin-form">
                  <h2>{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h2>
                  
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      placeholder="e.g., CCTV Cameras"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      placeholder="Enter category description"
                      rows="4"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-success" disabled={loading}>
                      {loading ? (editingCategoryId ? 'Updating...' : 'Creating...') : (editingCategoryId ? 'Update Category' : 'Create Category')}
                    </button>
                    <button type="button" className="btn-secondary" onClick={resetCategoryForm} disabled={loading}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Categories List */}
              <div className="table-section">
                <h2>All Categories ({categories.length})</h2>
                {categories.length === 0 ? (
                  <p className="no-data">No categories found.</p>
                ) : (
                  <div className="categories-grid">
                    {categories.map(category => (
                      <div key={category._id} className="category-card">
                        <div className="card-header">
                          <h3>{category.name}</h3>
                          <div className="card-actions">
                            <button 
                              className="btn-edit" 
                              onClick={() => handleEditCategory(category)}
                              title="Edit"
                              disabled={loading}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="btn-delete" 
                              onClick={() => handleDeleteCategory(category._id, category.name)}
                              title="Delete"
                              disabled={loading}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="card-body">
                          <p><strong>Description:</strong></p>
                          <p className="description">{category.description || 'No description'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBCATEGORIES TAB */}
          {activeTab === 'subcategories' && (
            <div className="tab-content">
              <button className="btn btn-primary" onClick={handleAddSubcategory} disabled={loading || categories.length === 0}>
                <FaPlus /> Add New Subcategory
              </button>

              {categories.length === 0 && !showForm && (
                <div className="info-message">
                  ℹ️ Please add categories first before adding subcategories.
                </div>
              )}

              {showForm && (
                <form onSubmit={handleSaveSubcategory} className="admin-form">
                  <h2>{editingId ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
                  
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={subcategoryFormData.category}
                      onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, category: e.target.value })}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Subcategory Name *</label>
                    <input
                      type="text"
                      value={subcategoryFormData.name}
                      onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                      placeholder="e.g., Dome Cameras"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={subcategoryFormData.description}
                      onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                      placeholder="Enter subcategory description"
                      rows="4"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-success" disabled={loading}>
                      {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update' : 'Create')} Subcategory
                    </button>
                    <button type="button" className="btn-secondary" onClick={resetSubcategoryForm} disabled={loading}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Subcategories List */}
              <div className="table-section">
                <h2>All Subcategories ({subcategories.length})</h2>
                {subcategories.length === 0 ? (
                  <p className="no-data">No subcategories found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Subcategory Name</th>
                          <th>Category</th>
                          <th>Description</th>
                          <th>Created Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subcategories.map(subcategory => (
                          <tr key={subcategory._id}>
                            <td><strong>{subcategory.name}</strong></td>
                            <td>{getCategoryName(subcategory.category)}</td>
                            <td className="description-cell">{subcategory.description || '-'}</td>
                            <td>{new Date(subcategory.createdAt).toLocaleDateString()}</td>
                            <td className="action-buttons">
                              <button
                                className="btn-edit"
                                onClick={() => handleEditSubcategory(subcategory)}
                                title="Edit"
                                disabled={loading}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteSubcategory(subcategory._id, subcategory.name)}
                                title="Delete"
                                disabled={loading}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .tab-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
        }

        .tab-btn {
          padding: 12px 24px;
          background: none;
          border: none;
          font-size: 16px;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
        }

        .tab-btn.active {
          color: #2874f0;
          border-bottom-color: #2874f0;
        }

        .tab-btn:hover:not(.active) {
          color: #374151;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .category-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: all 0.3s;
        }

        .category-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, #2874f0 0%, #1c5ac2 100%);
          color: white;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
        }

        .card-body {
          padding: 16px;
        }

        .card-body p {
          margin: 0 0 12px 0;
          font-weight: 600;
        }

        .card-body ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .card-body li {
          padding: 6px 0;
          color: #374151;
        }

        .card-body li.empty {
          color: #9ca3af;
          font-style: italic;
        }

        .subcategory-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 12px 0;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          min-height: 40px;
        }

        .subcat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #dbeafe;
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
        }

        .btn-remove {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-weight: bold;
          padding: 0;
          font-size: 16px;
        }

        .btn-remove:hover {
          color: #991b1b;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default AdminSubcategories;
