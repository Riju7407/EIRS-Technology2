import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

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

    // FETCH DATA

    const fetchData = async () => {
        try {
            setLoading(true);

            const [catRes, subRes] = await Promise.all([
                axios.get(`${API_BASE}/categories`),
                axios.get(`${API_BASE}/subcategories`)
            ]);

            console.log('CATEGORY RESPONSE:', catRes.data);
            console.log('SUBCATEGORY RESPONSE:', subRes.data);

            setCategories(
                Array.isArray(catRes.data)
                    ? catRes.data
                    : catRes.data.data || []
            );

            setSubcategories(
                Array.isArray(subRes.data)
                    ? subRes.data
                    : subRes.data.data || []
            );

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
    };

    // INPUT CHANGE

    const handleInputChange = (e) => {
        const { name, value } = e.target;

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

            category:
                typeof subcategory.category === 'object'
                    ? subcategory.category._id
                    : subcategory.category,

            description: subcategory.description || ''
        });

        setShowForm(true);
    };

    // SUBMIT

    const handleSubmit = async (e) => {
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
            console.error(err);

            setError(
                err.response?.data?.message ||
                'Error saving subcategory'
            );

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

            console.error(err);

            setError(
                err.response?.data?.message ||
                'Error deleting subcategory'
            );

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

    return (
        <AdminLayout
            pageTitle="Subcategories"
            breadcrumbs={[
                {
                    label: 'Subcategories'
                }
            ]}
        >
            <div className="min-h-screen bg-gray-100 p-6">

                {/* HEADER */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">
                            Manage Subcategories
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Create and manage product subcategories
                        </p>
                    </div>

                    <button
                        onClick={handleAddClick}
                        disabled={
                            loading ||
                            categories.length === 0
                        }
                        className="
                            bg-indigo-600
                            hover:bg-indigo-700
                            text-white
                            px-6
                            py-3
                            rounded-xl
                            font-semibold
                            shadow-lg
                            transition-all
                            duration-200
                            disabled:opacity-50
                        "
                    >
                        + Add Subcategory
                    </button>

                </div>

                {/* ALERTS */}

                {error && (
                    <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-3 rounded-xl mb-5">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 text-green-700 border border-green-300 px-4 py-3 rounded-xl mb-5">
                        {success}
                    </div>
                )}

                {/* FORM */}

                {showForm && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">

                            {editingId
                                ? 'Edit Subcategory'
                                : 'Add New Subcategory'}

                        </h2>

                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        >

                            {/* CATEGORY */}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category *
                                </label>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="
                                        w-full
                                        border
                                        border-gray-300
                                        rounded-xl
                                        px-4
                                        py-3
                                        focus:ring-2
                                        focus:ring-indigo-500
                                        outline-none
                                    "
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

                            {/* NAME */}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Subcategory Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter subcategory"
                                    required
                                    className="
                                        w-full
                                        border
                                        border-gray-300
                                        rounded-xl
                                        px-4
                                        py-3
                                        focus:ring-2
                                        focus:ring-indigo-500
                                        outline-none
                                    "
                                />
                            </div>

                            {/* DESCRIPTION */}

                            <div className="md:col-span-2">

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>

                                <textarea
                                    rows="4"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter description"
                                    className="
                                        w-full
                                        border
                                        border-gray-300
                                        rounded-xl
                                        px-4
                                        py-3
                                        focus:ring-2
                                        focus:ring-indigo-500
                                        outline-none
                                    "
                                />
                            </div>

                            {/* BUTTONS */}

                            <div className="md:col-span-2 flex gap-4 mt-2">

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        bg-indigo-600
                                        hover:bg-indigo-700
                                        text-white
                                        px-6
                                        py-3
                                        rounded-xl
                                        font-semibold
                                        shadow-md
                                        transition-all
                                        duration-200
                                    "
                                >
                                    {loading
                                        ? 'Saving...'
                                        : editingId
                                            ? 'Update'
                                            : 'Save'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="
                                        bg-gray-200
                                        hover:bg-gray-300
                                        text-gray-700
                                        px-6
                                        py-3
                                        rounded-xl
                                        font-semibold
                                        transition-all
                                        duration-200
                                    "
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {/* TABLE */}

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-indigo-600 text-white">

                                <tr>

                                    <th className="px-6 py-4 text-left">
                                        #
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Subcategory
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Category
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Description
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {subcategories.length > 0 ? (

                                    subcategories.map((item, index) => (

                                        <tr
                                            key={item._id}
                                            className="
                                                border-b
                                                hover:bg-gray-50
                                                transition-all
                                            "
                                        >

                                            <td className="px-6 py-4">
                                                {index + 1}
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {item.name}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {getCategoryName(
                                                    item.category
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-gray-500">
                                                {item.description || '-'}
                                            </td>

                                            <td className="px-6 py-4">

                                                <div className="flex gap-3">

                                                    <button
                                                        onClick={() =>
                                                            handleEditClick(item)
                                                        }
                                                        className="
                                                            bg-blue-500
                                                            hover:bg-blue-600
                                                            text-white
                                                            px-4
                                                            py-2
                                                            rounded-lg
                                                            font-medium
                                                            transition-all
                                                        "
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item._id,
                                                                item.name
                                                            )
                                                        }
                                                        className="
                                                            bg-red-500
                                                            hover:bg-red-600
                                                            text-white
                                                            px-4
                                                            py-2
                                                            rounded-lg
                                                            font-medium
                                                            transition-all
                                                        "
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="
                                                text-center
                                                py-10
                                                text-gray-500
                                            "
                                        >
                                            No subcategories found
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminSubcategories;