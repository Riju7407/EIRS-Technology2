import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { productService } from '../services/api';
import '../styles/AdminPages.css';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    brand: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [navigate]);

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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productService.updateProduct(editingId, formData);
      } else {
        await productService.createProduct(formData);
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      productName: product.productName,
      category: product.category,
      brand: product.brand,
      description: product.description,
      image: product.image,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      category: '',
      brand: '',
      description: '',
      image: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const categories = [
    'CCTV Cameras',
    'IoT Solutions',
    'Home & Office Security',
    'Biometric Devices',
    'Intercom Systems',
    'Automation Systems',
    'Fire Alarm Systems',
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <p>Manage your product catalog</p>
      </div>

      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
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
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
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

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
              />
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
  );
};

export default AdminProducts;
