import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaDownload, FaSearch } from 'react-icons/fa';
import { adminService } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import '../styles/AdminPages.css';

const AdminEnquiries = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredEnquiries(
      enquiries.filter(e =>
        e.name?.toLowerCase().includes(lower) ||
        e.email?.toLowerCase().includes(lower) ||
        e.phoneNumber?.includes(searchTerm) ||
        e.subject?.toLowerCase().includes(lower)
      )
    );
  }, [enquiries, searchTerm]);

  const fetchEnquiries = async () => {
    try {
      const r = await adminService.getContacts();
      const contacts = r.data || r || [];
      setEnquiries(
        [...contacts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (e) {
      if (e.status === 401 || e.response?.status === 401) navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      const res = await adminService.deleteContact(id);
      if (res && res.success) {
        setEnquiries(enquiries.filter(e => e._id !== id));
      } else {
        alert('Failed: ' + (res?.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Failed: ' + (e.message || 'Unknown error'));
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Date'];
    const csv = [
      headers.join(','),
      ...filteredEnquiries.map(e =>
        [e.name, e.email, e.phoneNumber, e.subject,
          e.message?.replace(/,/g, ';'),
          new Date(e.createdAt).toLocaleDateString()
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'enquiries.csv'; a.click();
  };

  return (
    <AdminLayout pageTitle="Enquiries" breadcrumbs={[{ label: 'Enquiries' }]}>
      <div className="ap-page">
        <div className="ap-header">
          <div className="ap-header-text">
            <h1>Enquiries Management</h1>
            <p>View and manage all customer enquiries and contact requests.</p>
          </div>
          <div className="ap-header-actions">
            <button className="ap-btn ap-btn-secondary" onClick={exportToCSV}>
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        <div className="ap-toolbar">
          <div className="ap-search">
            <FaSearch className="ap-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, subject..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="ap-results-count">
            {filteredEnquiries.length} enquir{filteredEnquiries.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        {loading ? (
          <div className="ap-loading"><div className="ap-spinner" /><p>Loading enquiries...</p></div>
        ) : filteredEnquiries.length > 0 ? (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map(enq => (
                  <React.Fragment key={enq._id}>
                    <tr>
                      <td>
                        <div className="ap-user-cell">
                          <div className="ap-user-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                            {(enq.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="ap-user-name-text">{enq.name}</div>
                            <div className="ap-user-email">{enq.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{enq.phoneNumber || '—'}</td>
                      <td>
                        <span className="ap-badge ap-badge-blue">{enq.subject || '—'}</span>
                      </td>
                      <td>
                        <span className="ap-enquiry-msg" title={enq.message}>
                          {enq.message || '—'}
                        </span>
                      </td>
                      <td>
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td>
                        <div className="ap-actions">
                          <button
                            className="ap-btn ap-btn-secondary ap-btn-sm"
                            onClick={() => setExpandedId(expandedId === enq._id ? null : enq._id)}
                          >
                            <FaEye /> {expandedId === enq._id ? 'Hide' : 'View'}
                          </button>
                          <button
                            className="ap-btn ap-btn-danger ap-btn-sm"
                            onClick={() => handleDelete(enq._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === enq._id && (
                      <tr className="enq-detail-row">
                        <td colSpan="6">
                          <div className="enq-detail-panel">
                            <strong>Full Message:</strong>
                            <p>{enq.message || 'No message provided.'}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ap-empty">
            <div className="ap-empty-icon">📩</div>
            <h3>No enquiries found</h3>
            <p>{searchTerm ? 'Try adjusting your search.' : 'No customer enquiries yet.'}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEnquiries;
