import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaPlus, FaImage, FaBars, FaTimes, FaChartBar, FaUsers, FaPhone, FaBox, FaTools, FaSignOutAlt, FaTags, FaStar } from 'react-icons/fa';
import { productService, authService, reviewService } from '../services/api';
import ProductReviewsSection from '../components/ProductReviewsSection';
import '../styles/AdminPages.css';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [submenus, setSubmenus] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    subcategory: '',
    submenu: '',
    channels: '',
    brand: '',
    description: '',
    modelNo: '',
    image: '',
    images: ['', '', '', '', ''], // Support for 5 images
    price: '',
    stock: '',
    cameraResolution: '',
    nvrChannels: '',
    poeSwitch: '',
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
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      fetchSubcategoriesByCategory(formData.category);
      // Only clear subcategory if we're changing category (not on initial edit load)
      // Check if the current subcategory exists in the new category's subcategories
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      if (selectedCategory && selectedCategory.subcategories) {
        const subcategoryExists = selectedCategory.subcategories.includes(formData.subcategory);
        if (!subcategoryExists) {
          setFormData(prev => ({ ...prev, subcategory: '', submenu: '', channels: '' }));
        }
      }
    } else {
      setSubcategories([]);
      setSubmenus([]);
      setChannels([]);
      setFormData(prev => ({ ...prev, subcategory: '', submenu: '', channels: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.category]);

  // Handle submenu options when HD Camera, IP Camera Solutions, or Camera subcategory is selected
  useEffect(() => {
    if (formData.subcategory === 'HD Camera (Analog CCTV)') {
      setSubmenus(['Camera', 'SMPS', 'DVR']);
      // Only reset channels, not submenu
      setChannels([]);
    } else if (formData.subcategory === 'IP Camera Solutions') {
      setSubmenus(['Camera', 'NVR', 'POE']);
      // Only reset channels, not submenu
      setChannels([]);
    } else if (formData.subcategory === 'Camera') {
      setSubmenus(['2MP', '4MP', '6MP']);
      // Only reset channels, not submenu
      setChannels([]);
    } else {
      setSubmenus([]);
      setChannels([]);
      setFormData(prev => ({ ...prev, submenu: '', channels: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.subcategory]);

  // Handle channel options based on submenu selection
  useEffect(() => {
    if (formData.submenu === 'Camera') {
      setChannels(['2MP', '4MP', '6MP']);
    } else if (formData.submenu === 'SMPS') {
      setChannels(['4CH', '8CH', '16CH']);
    } else if (formData.submenu === 'NVR') {
      setChannels(['4CH', '8CH', '16CH', '32CH']);
    } else if (formData.submenu === 'DVR') {
      setChannels(['4CH', '8CH', '16CH', '32CH']);
    } else if (formData.submenu === 'POE') {
      setChannels(['4CH', '8CH', '16CH']);
    } else {
      setChannels([]);
    }
    // Don't reset channels value here - let user select it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.submenu]);

  const fetchSubcategoriesByCategory = async (category) => {
    try {
      // First try to get from local categories array
      const selectedCategory = categories.find(cat => cat.name === category);
      if (selectedCategory && selectedCategory.subcategories) {
        setSubcategories(selectedCategory.subcategories.map(subcat => ({ name: subcat })));
        return;
      }

      // If not found in local array, try to fetch from API
      const response = await productService.getSubcategoriesByCategory(category);
      
      if (Array.isArray(response)) {
        setSubcategories(response);
      } else if (response && response.data) {
        setSubcategories(Array.isArray(response.data) ? response.data : []);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      // Fallback to local categories array
      const selectedCategory = categories.find(cat => cat.name === category);
      if (selectedCategory && selectedCategory.subcategories) {
        setSubcategories(selectedCategory.subcategories.map(subcat => ({ name: subcat })));
      } else {
        setSubcategories([]);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      setProducts(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // If 401 Unauthorized, redirect to signin
      if (error.status === 401 || error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ Field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        // Convert image to Base64 URL
        const base64String = event.target.result;
        setFormData(prev => {
          const newImages = [...prev.images];
          newImages[index] = base64String;
          return {
            ...prev,
            images: newImages,
            // Also set as primary image if it's the first image
            image: index === 0 ? base64String : prev.image,
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e, index) => {
    const url = e.target.value.trim();
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = url;
      return {
        ...prev,
        images: newImages,
        // Also set as primary image if it's the first image
        image: index === 0 ? url : prev.image,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.productName || !formData.category || !formData.description) {
      alert('Please fill in all required fields (Product Name, Category, Description)');
      return;
    }

    // Prepare data with proper types
    const submitData = {
      productName: formData.productName,
      category: formData.category,
      subcategory: formData.subcategory || '',
      submenu: formData.submenu || '',
      channels: formData.channels || '',
      brand: formData.brand || '',
      description: formData.description,
      modelNo: formData.modelNo || '',
      image: formData.image || '', // Primary image
      images: formData.images.filter(img => img !== ''), // Filter out empty images
      price: formData.price !== '' ? parseFloat(formData.price) : 0,
      stock: formData.stock !== '' ? parseInt(formData.stock, 10) : 0,
      cameraResolution: formData.cameraResolution || '',
      nvrChannels: formData.nvrChannels || '',
      poeSwitch: formData.poeSwitch || '',
    };

    console.log('📤 Full Form Data Before Submit:', formData);
    console.log('📤 Submitting product data:', submitData);
    console.log('📌 ModelNo being sent:', submitData.modelNo);

    try {
      if (editingId) {
        await productService.updateProduct(editingId, submitData);
        alert('Product updated successfully!');
      } else {
        await productService.createProduct(submitData);
        alert('Product added successfully!');
      }
      // Clear product cache to ensure new/updated products appear immediately on homepage
      productService.clearProductCache();
      fetchProducts();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    // Prepare images array - pad with empty strings to reach 5 slots
    const imagesList = product.images || [];
    const paddedImages = [...imagesList];
    while (paddedImages.length < 5) {
      paddedImages.push('');
    }
    
    setFormData({
      productName: product.productName,
      category: product.category,
      subcategory: product.subcategory || '',
      submenu: product.submenu || '',
      channels: product.channels || '',
      brand: product.brand,
      description: product.description,
      modelNo: product.modelNo || '',
      image: product.image,
      images: paddedImages,
      price: product.price !== null && product.price !== undefined ? product.price : '',
      stock: product.stock !== null && product.stock !== undefined ? product.stock : '',
      cameraResolution: product.cameraResolution || '',
      nvrChannels: product.nvrChannels || '',
      poeSwitch: product.poeSwitch || '',
    });
    // Fetch subcategories for the product's category
    if (product.category) {
      fetchSubcategoriesByCategory(product.category);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('🗑️ Deleting product with ID:', id);
        const response = await productService.deleteProduct(id);
        console.log('✅ Delete response:', response);
        
        // Remove from UI immediately
        setProducts(products.filter(p => p._id !== id));
        
        // Clear product cache for fresh data
        productService.clearProductCache();
        
        alert('✅ Product deleted successfully!');
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        alert('❌ Error deleting product: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      category: '',
      subcategory: '',
      submenu: '',
      channels: '',
      brand: '',
      description: '',
      modelNo: '',
      image: '',
      images: ['', '', '', '', ''], // Reset images array
      price: '',
      stock: '',
      cameraResolution: '',
      nvrChannels: '',
      poeSwitch: '',
    });
    setSubmenus([]);
    setChannels([]);
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

  const categories = [
    {
      name: 'CCTV Cameras',
      subcategories: [
        'IP Camera Solutions',
        'HD Camera (Analog CCTV)',
        'Camera',
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
  ];

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
          <Link to="/admin/products" className="nav-item active">
            <FaBox /> Products
          </Link>
          <Link to="/admin/subcategories" className="nav-item">
            <FaTags /> Subcategories
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

        {/* Page Content */}
        <div className="admin-content">
          <div className="page-header">
            <h1>Products Management</h1>
            <p>Manage your product catalog</p>
          </div>

          <button className="btn btn-primary" onClick={() => {
            if (!showForm) {
              resetForm(); // Clear form data when opening the form
            }
            setShowForm(!showForm);
          }}>
            <FaPlus /> {showForm ? 'Cancel' : 'Add New Product'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subcategory</label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    disabled={!formData.category}
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((subcat, idx) => (
                      <option key={subcat._id || idx} value={typeof subcat === 'string' ? subcat : subcat.name}>
                        {typeof subcat === 'string' ? subcat : subcat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {submenus.length > 0 && (
                  <div className="form-group">
                    <label>Submenu (Type)</label>
                    <select
                      name="submenu"
                      value={formData.submenu}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a submenu</option>
                      {submenus.map((submenu, idx) => (
                        <option key={idx} value={submenu}>{submenu}</option>
                      ))}
                    </select>
                  </div>
                )}

                {channels.length > 0 && (
                  <div className="form-group">
                    <label>Channels</label>
                    <select
                      name="channels"
                      value={formData.channels}
                      onChange={handleInputChange}
                    >
                      <option value="">Select channels</option>
                      {channels.map((channel, idx) => (
                        <option key={idx} value={channel}>{channel}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Product Images (Up to 5 images)</label>
                  <div className="multiple-images-container">
                    {formData.images && [0, 1, 2, 3, 4].map((index) => (
                      <div key={index} className="image-upload-slot">
                        <h4>Image {index + 1} {index === 0 ? '(Primary)' : ''}</h4>
                        <div className="image-upload-option">
                          <input
                            type="file"
                            id={`imageInput-${index}`}
                            onChange={(e) => handleImageUpload(e, index)}
                            accept="image/*"
                            style={{ display: 'none' }}
                          />
                          <label htmlFor={`imageInput-${index}`} className="image-upload-label">
                            <FaImage /> Upload Image {index + 1}
                          </label>
                        </div>

                        <div className="image-url-option">
                          <input
                            type="text"
                            placeholder="Or paste image URL here"
                            value={formData.images[index] || ''}
                            onChange={(e) => handleImageUrlChange(e, index)}
                            className="image-url-input"
                          />
                        </div>

                        {formData.images[index] && (
                          <div className="image-preview-small">
                            <img src={formData.images[index]} alt={`Preview ${index + 1}`} />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => {
                                setFormData(prev => {
                                  const newImages = [...prev.images];
                                  newImages[index] = '';
                                  return {
                                    ...prev,
                                    images: newImages,
                                    image: index === 0 ? '' : prev.image,
                                  };
                                });
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label>Model No</label>
                <input
                  type="text"
                  name="modelNo"
                  value={formData.modelNo}
                  onChange={handleInputChange}
                  placeholder="Enter Model Number (e.g., XYZ-2024-01)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter product price"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label><strong>Stock Quantity *</strong></label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="Enter stock quantity"
                    min="0"
                    required
                    style={{ borderColor: '#ff6b6b', borderWidth: '2px' }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>Required: Enter 0 to mark as out of stock</small>
                </div>
              </div>


              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length > 0 ? (
            <div className="products-admin-grid">
              {products.map(product => (
                <div key={product._id} className="product-admin-card">
                  {product.image && <img src={product.image} alt={product.productName} />}
                  <h3>{product.productName}</h3>
                  <p className="category">{product.category}</p>
                  {product.brand && <p className="brand">{product.brand}</p>}
                  <p className="description">{product.description?.substring(0, 100)}...</p>
                  <div className="price-stock-display">
                    <span className="price">₹{product.price || 0}</span>
                    <span className="stock">{product.stock !== undefined && product.stock !== null ? `📦 Stock: ${product.stock}` : '📦 Stock: 0'}</span>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(product)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(product._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                    <button
                      className="action-btn reviews"
                      onClick={() => setSelectedProductForReviews(product._id)}
                      title="View customer reviews"
                    >
                      <FaStar /> Reviews
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No products found. Create your first product!</p>
            </div>
          )}
        </div>
      </main>

      {/* Product Reviews Modal */}
      {selectedProductForReviews && (
        <ProductReviewsSection 
          productId={selectedProductForReviews}
          onClose={() => setSelectedProductForReviews(null)}
        />
      )}
    </div>
  );
};

export default AdminProducts;
