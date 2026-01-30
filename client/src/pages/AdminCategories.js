import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminCategories.css';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const API_BASE = 'http://localhost:5000/api';

    // Fetch all categories
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/categories`);
            setCategories(response.data.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching categories');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddClick = () => {
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setShowForm(true);
    };

    const handleEditClick = (category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Category name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            let response;
            if (editingId) {
                response = await axios.put(
                    `${API_BASE}/categories/${editingId}`,
                    formData,
                    { headers }
                );
                setSuccess('Category updated successfully');
            } else {
                response = await axios.post(
                    `${API_BASE}/categories`,
                    formData,
                    { headers }
                );
                setSuccess('Category created successfully');
            }

            setFormData({ name: '', description: '' });
            setShowForm(false);
            fetchCategories();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving category');
            console.error('Submit error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                await axios.delete(`${API_BASE}/categories/${id}`, { headers });

                setSuccess('Category deleted successfully');
                fetchCategories();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Error deleting category');
                console.error('Delete error:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setError('');
    };

    return (
        <div className="admin-categories-container">
            <div className="admin-categories-header">
                <h1>Manage Categories</h1>
                <button 
                    className="btn-add-category"
                    onClick={handleAddClick}
                    disabled={loading}
                >
                    + Add Category
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="category-form">
                    <h2>{editingId ? 'Edit Category' : 'Add New Category'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Category Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter category name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter category description"
                                rows="4"
                            />
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Category'}
                            </button>
                            <button 
                                type="button" 
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && !showForm ? <p className="loading">Loading...</p> : null}

            <div className="categories-table">
                <table>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 ? (
                            categories.map(category => (
                                <tr key={category._id}>
                                    <td className="category-name">{category.name}</td>
                                    <td className="category-description">
                                        {category.description || '-'}
                                    </td>
                                    <td className="category-actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEditClick(category)}
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(category._id, category.name)}
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="no-data">No categories found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCategories;
