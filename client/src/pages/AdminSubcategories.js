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
  
  // Categories state
  const [categories, setCategories] = useState([
    {
      name: 'CCTV Cameras',
      subcategories: [
        'IP Camera Solutions',
        'HD Camera (Analog CCTV)',
        'CCTV Bundle Packs',
        'Wi-Fi / 4G Camera'
      ]
    },
    {
      name: 'CCTV Components',
      subcategories: [
        'NVR (Network Video Recorder)',
        'DVR (Digital Video Recorder)',
        'POE Switch',
        'SMPS (Power Supply)',
        'Hard Disk',
        'Cables & Accessories'
      ]
    },
    {
      name: 'Biometric Devices',
      subcategories: [
        'Fingerprint Biometric',
        'Face Recognition Biometric',
        'Card + Fingerprint Devices',
        'Time Attendance with Payroll Integration'
      ]
    },
    {
      name: 'Intercom System',
      subcategories: [
        'Landline Phones',
        'Intercom Devices',
        'EPABX System',
        'PBX System'
      ]
    },
    {
      name: 'Home & Office Security',
      subcategories: [
        'Video Door Phone (VDP/VPP)',
        'Smart Door Locks',
        'Access Control System',
        'Alarm Systems',
        'Motion Sensors'
      ]
    },
    {
      name: 'IoT Solutions',
      subcategories: [
        'Smart Sensors',
        'IoT Devices',
        'Connected Systems',
        'Wireless Modules'
      ]
    },
    {
      name: 'Automation Systems',
      subcategories: [
        'Smart Lighting',
        'Climate Control',
        'Access Control',
        'Integration Modules'
      ]
    },
    {
      name: 'Fire Alarm Systems',
      subcategories: [
        'Smoke Detectors',
        'Heat Detectors',
        'Manual Call Points',
        'Control Panels'
      ]
    }
  ]);

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState(null);

  // Category form data
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    subcategories: []
  });

  // Subcategory form data
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    category: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/subcategories');
      setSubcategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Category Management Functions
  const handleAddCategory = () => {
    setCategoryFormData({ name: '', subcategories: [] });
    setEditingCategoryName(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setCategoryFormData(category);
    setEditingCategoryName(category.name);
    setShowForm(true);
  };

  const handleDeleteCategory = (categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This will remove all associated subcategories.`)) {
      setCategories(categories.filter(cat => cat.name !== categoryName));
      alert('Category deleted successfully');
    }
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (editingCategoryName) {
      // Update existing category
      setCategories(categories.map(cat => 
        cat.name === editingCategoryName ? categoryFormData : cat
      ));
      alert('Category updated successfully');
    } else {
      // Add new category
      if (categories.some(cat => cat.name === categoryFormData.name)) {
        alert('Category already exists');
        return;
      }
      setCategories([...categories, { name: categoryFormData.name, subcategories: [] }]);
      alert('Category added successfully');
    }
    
    resetCategoryForm();
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', subcategories: [] });
    setEditingCategoryName(null);
    setShowForm(false);
  };

  // Subcategory Management Functions
  const handleAddSubcategory = () => {
    setSubcategoryFormData({ name: '', category: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditSubcategory = (subcategory) => {
    setSubcategoryFormData({ 
      name: subcategory.name,
      category: subcategory.category
    });
    setEditingId(subcategory._id);
    setShowForm(true);
  };

  const handleDeleteSubcategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await axios.delete(`/api/subcategories/${id}`);
        alert('Subcategory deleted successfully');
        fetchSubcategories();
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        alert('Error deleting subcategory');
      }
    }
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    
    if (!subcategoryFormData.name.trim() || !subcategoryFormData.category) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/api/subcategories/${editingId}`, {
          name: subcategoryFormData.name,
          category: subcategoryFormData.category
        });
        alert('Subcategory updated successfully');
      } else {
        await axios.post('/api/subcategories', {
          name: subcategoryFormData.name,
          category: subcategoryFormData.category
        });
        alert('Subcategory created successfully');
      }
      
      resetSubcategoryForm();
      fetchSubcategories();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Error saving subcategory: ' + error.response?.data?.message);
    }
  };

  const resetSubcategoryForm = () => {
    setSubcategoryFormData({ name: '', category: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddSubcategoryToCategory = () => {
    const newSubcategoryName = prompt('Enter subcategory name:');
    if (newSubcategoryName && newSubcategoryName.trim()) {
      setCategoryFormData(prev => ({
        ...prev,
        subcategories: [...prev.subcategories, newSubcategoryName.trim()]
      }));
    }
  };

  const handleRemoveSubcategoryFromCategory = (index) => {
    setCategoryFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index)
    }));
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

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="tab-content">
              <button className="btn btn-primary" onClick={handleAddCategory}>
                <FaPlus /> Add New Category
              </button>

              {showForm && editingCategoryName === null && (
                <form onSubmit={handleSaveCategory} className="admin-form">
                  <h2>Add New Category</h2>
                  
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
                    <label>Subcategories</label>
                    <div className="subcategory-list">
                      {categoryFormData.subcategories.map((subcat, idx) => (
                        <div key={idx} className="subcat-item">
                          <span>{subcat}</span>
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => handleRemoveSubcategoryFromCategory(idx)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleAddSubcategoryToCategory}
                    >
                      + Add Subcategory
                    </button>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-success">Create Category</button>
                    <button type="button" className="btn-secondary" onClick={resetCategoryForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {showForm && editingCategoryName && (
                <form onSubmit={handleSaveCategory} className="admin-form">
                  <h2>Edit Category: {editingCategoryName}</h2>
                  
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
                    <label>Subcategories</label>
                    <div className="subcategory-list">
                      {categoryFormData.subcategories.map((subcat, idx) => (
                        <div key={idx} className="subcat-item">
                          <span>{subcat}</span>
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => handleRemoveSubcategoryFromCategory(idx)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleAddSubcategoryToCategory}
                    >
                      + Add Subcategory
                    </button>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-success">Update Category</button>
                    <button type="button" className="btn-secondary" onClick={resetCategoryForm}>
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
                      <div key={category.name} className="category-card">
                        <div className="card-header">
                          <h3>{category.name}</h3>
                          <div className="card-actions">
                            <button 
                              className="btn-edit" 
                              onClick={() => handleEditCategory(category)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="btn-delete" 
                              onClick={() => handleDeleteCategory(category.name)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="card-body">
                          <p><strong>Subcategories ({category.subcategories?.length || 0}):</strong></p>
                          <ul>
                            {category.subcategories && category.subcategories.length > 0 ? (
                              category.subcategories.map((subcat, idx) => (
                                <li key={idx}>• {subcat}</li>
                              ))
                            ) : (
                              <li className="empty">No subcategories</li>
                            )}
                          </ul>
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
              <button className="btn btn-primary" onClick={handleAddSubcategory}>
                <FaPlus /> Add New Subcategory
              </button>

              {showForm && (
                <form onSubmit={handleSaveSubcategory} className="admin-form">
                  <h2>{editingId ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
                  
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
                    <label>Category *</label>
                    <select
                      value={subcategoryFormData.category}
                      onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, category: e.target.value })}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-success">
                      {editingId ? 'Update' : 'Create'} Subcategory
                    </button>
                    <button type="button" className="btn-secondary" onClick={resetSubcategoryForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Subcategories List */}
              <div className="table-section">
                <h2>All Subcategories ({subcategories.length})</h2>
                {loading ? (
                  <p className="loading">Loading subcategories...</p>
                ) : subcategories.length === 0 ? (
                  <p className="no-data">No subcategories found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Subcategory Name</th>
                          <th>Category</th>
                          <th>Created Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subcategories.map(subcategory => (
                          <tr key={subcategory._id}>
                            <td><strong>{subcategory.name}</strong></td>
                            <td>{subcategory.category}</td>
                            <td>{new Date(subcategory.createdAt).toLocaleDateString()}</td>
                            <td className="action-buttons">
                              <button
                                className="btn-edit"
                                onClick={() => handleEditSubcategory(subcategory)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteSubcategory(subcategory._id)}
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
