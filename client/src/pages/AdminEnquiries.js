import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaDownload } from 'react-icons/fa';
import { adminService } from '../services/api';
import '../styles/AdminPages.css';

const AdminEnquiries = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);

  useEffect(() => {
    fetchEnquiries();
  }, [navigate]);

  useEffect(() => {
    filterEnquiries();
  }, [enquiries, searchTerm]);

  const fetchEnquiries = async () => {
    try {
      const response = await adminService.getContacts();
      setEnquiries(response.data || response || []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      // If 401 Unauthorized, redirect to signin
      if (error.status === 401 || error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterEnquiries = () => {
    const filtered = enquiries.filter(enquiry =>
      enquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.phoneNumber?.includes(searchTerm)
    );
    setFilteredEnquiries(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await adminService.deleteUserById(id);
        setEnquiries(enquiries.filter(e => e._id !== id));
      } catch (error) {
        console.error('Error deleting enquiry:', error);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Date'];
    const csv = [
      headers.join(','),
      ...filteredEnquiries.map(e =>
        [
          e.name,
          e.email,
          e.phoneNumber,
          e.subject,
          e.message?.replace(/,/g, ';'),
          new Date(e.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enquiries.csv';
    a.click();
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Enquiries Management</h1>
        <p>Manage all customer enquiries and contact requests</p>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" onClick={exportToCSV}>
          <FaDownload /> Export to CSV
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading enquiries...</div>
      ) : filteredEnquiries.length > 0 ? (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((enquiry) => (
                <tr key={enquiry._id}>
                  <td>{enquiry.name}</td>
                  <td>{enquiry.email}</td>
                  <td>{enquiry.phoneNumber}</td>
                  <td>{enquiry.subject}</td>
                  <td>{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="action-btn view"
                      onClick={() => alert(`Message: ${enquiry.message}`)}
                    >
                      <FaEye /> View
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(enquiry._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>No enquiries found</p>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;
