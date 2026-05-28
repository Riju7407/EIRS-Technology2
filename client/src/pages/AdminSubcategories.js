import React, { useState, useEffect } from 'react';
import axios from 'axios';

import AdminLayout from '../components/AdminLayout';

import '../styles/AdminPages.css';

const AdminSubcategories = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: ''
    });

    const API_ROOT = (
        process.env.REACT_APP_API_URL ||
        'http://localhost:5000'
    ).replace(/\/$/, '');

    const API_BASE = `${API_ROOT}/api`;

    useEffect(() => {
        fetchData();
    }, []);

   const fetchData = async () => {
    try {
        setLoading(true);

        const [catRes, subRes] = await Promise.all([
            axios.get(`${API_BASE}/categories`),
            axios.get(`${API_BASE}/subcategories`)
        ]);

        console.log("CATEGORY RESPONSE:", catRes.data);
        console.log("SUBCATEGORY RESPONSE:", subRes.data);

        setCategories(catRes.data.data || []);

        setSubcategories(subRes.data.data || []);

        console.log("FINAL SUBCATEGORIES:", subRes.data.data);

        setError('');

    } catch (err) {
        console.error(err);

        setError(
            err.response?.data?.message ||
            'Error fetching data'
        );

    } finally {
        setLoading(false);
    }
};;

    // INPUT

    const handleInputChange = (e) => {
    const { name, value } = e.target;

    console.log("FIELD:", name);
    console.log("VALUE:", value);

    setFormData((prev) => ({
        ...prev,
        [name]: value
    }));
};

    // ADD

    const handleAddClick = () => {
        setEditingId(null);

        setFormData({
            name: '',
            category: '',
            description: ''
        });

        setShowForm(true);
    };

    // EDIT

    const handleEditClick = (subcategory) => {
        setEditingId(subcategory._id);

        setFormData({
            name: subcategory.name,
            category: subcategory.category,
            description: subcategory.description || ''
        });

        setShowForm(true);
    };

    // SUBMIT

    const handleSubmit = async (e) => {
        console.log("SUBMIT DATA:", formData);
        e.preventDefault();

        if (!formData.name || !formData.category) {
            setError('All required fields are mandatory');
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            const headers = {
                Authorization: `Bearer ${token}`
            };

            if (editingId) {
                await axios.put(
                    `${API_BASE}/subcategories/${editingId}`,
                    formData,
                    { headers }
                );

                setSuccess(
                    'Subcategory updated successfully'
                );

            } else {
                await axios.post(
                    `${API_BASE}/subcategories`,
                    formData,
                    { headers }
                );

                setSuccess(
                    'Subcategory created successfully'
                );
            }

            setFormData({
                name: '',
                category: '',
                description: ''
            });

            setShowForm(false);

            fetchData();

            setTimeout(() => {
                setSuccess('');
            }, 3000);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Error saving subcategory'
            );

            console.error(err);

        } finally {
            setLoading(false);
        }
    };

    // DELETE

    const handleDelete = async (id, name) => {
        const confirmDelete = window.confirm(
            `Delete "${name}" ?`
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            const headers = {
                Authorization: `Bearer ${token}`
            };

            await axios.delete(
                `${API_BASE}/subcategories/${id}`,
                { headers }
            );

            setSuccess(
                'Subcategory deleted successfully'
            );

            fetchData();

            setTimeout(() => {
                setSuccess('');
            }, 3000);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Error deleting subcategory'
            );

            console.error(err);

        } finally {
            setLoading(false);
        }
    };

    // CANCEL

    const handleCancel = () => {
        setShowForm(false);

        setEditingId(null);

        setFormData({
            name: '',
            category: '',
            description: ''
        });

        setError('');
    };

    // CATEGORY NAME

  const getCategoryName = (categoryData) => {

    if (
        typeof categoryData === 'object' &&
        categoryData !== null
    ) {
        return categoryData.name || '-';
    }

    const category = categories.find(
        (c) => c._id === categoryData
    );

    return category?.name || '-';
};
    console.log(categories)
    console.log(formData);

    return (
        <AdminLayout
            pageTitle="Subcategories"
            breadcrumbs={[
                {
                    label: 'Subcategories'
                }
            ]}
        >
            <div className="admin-subcategories-container">

                {/* HEADER */}

                <div className="admin-subcategories-header">

                    <div>
                        <h1>Manage Subcategories</h1>

                        <p>
                            Create and manage product subcategories
                        </p>
                    </div>

                    <button
                        className="btn-add-subcategory"
                        onClick={handleAddClick}
                        disabled={
                            loading ||
                            categories.length === 0
                        }
                    >
                        + Add Subcategory
                    </button>

                </div>

                {/* ALERTS */}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                {/* FORM */}

                {showForm && (
                    <div className="subcategory-form">

                        <h2>
                            {editingId
                                ? 'Edit Subcategory'
                                : 'Add New Subcategory'}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="form-group">
                                <label>
                                    Category *
                                </label>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">
                                        Select Category
                                    </option>

                                    {categories.map((cat) => (
                                        <option
                                            key={cat._id}
                                            value={cat._id}
                                        >
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    Subcategory Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter subcategory"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Description
                                </label>

                                <textarea
                                    rows="4"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter description"
                                />
                            </div>

                            <div className="form-actions">

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Saving...'
                                        : editingId
                                            ? 'Update'
                                            : 'Save'}
                                </button>

                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {/* TABLE */}

                <div className="subcategories-table">

                    <table>

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Subcategory</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {subcategories.length > 0 ? (
                                subcategories.map(
                                    (item, index) => (
                                        <tr key={item._id}>

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>
                                                {item.name}
                                            </td>

                                            <td>
                                                {getCategoryName(
                                                    item.category
                                                )}
                                            </td>

                                            <td>
                                                {item.description || '-'}
                                            </td>

                                            <td className="subcategory-actions">

                                                <button
                                                    className="btn-edit"
                                                    onClick={() =>
                                                        handleEditClick(item)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="btn-delete"
                                                    onClick={() =>
                                                        handleDelete(
                                                            item._id,
                                                            item.name
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="no-data"
                                    >
                                        No subcategories found
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminSubcategories;