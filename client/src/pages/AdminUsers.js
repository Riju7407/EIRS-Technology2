import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaCrown, FaSearch } from 'react-icons/fa';
import { adminService } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import '../styles/AdminPages.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(u =>
        u.name?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower) ||
        u.phoneNumber?.includes(searchTerm)
      )
    );
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const r = await adminService.getAllUsers();
      setUsers(r.data || r || []);
    } catch (e) {
      if (e.status === 401 || e.response?.status === 401) navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUserById(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (e) {
      alert('Failed to delete: ' + (e.message || 'Unknown error'));
    }
  };

  const handlePromote = async (id) => {
    if (!window.confirm('Promote this user to admin?')) return;
    try {
      await adminService.promoteToAdmin(id);
      fetchUsers();
      alert('User promoted to admin successfully!');
    } catch (e) {
      alert('Failed to promote: ' + (e.message || 'Unknown error'));
    }
  };

  return (
    <AdminLayout pageTitle="Users" breadcrumbs={[{ label: 'Users' }]}>
      <div className="ap-page">
        <div className="ap-header">
          <div className="ap-header-text">
            <h1>User Management</h1>
            <p>Manage all registered users and their permissions.</p>
          </div>
        </div>

        <div className="ap-toolbar">
          <div className="ap-search">
            <FaSearch className="ap-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="ap-results-count">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="ap-loading">
            <div className="ap-spinner" />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="ap-user-cell">
                        <div className="ap-user-avatar">
                          {(user.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="ap-user-name-text">{user.name}</div>
                          <div className="ap-user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.phoneNumber || '—'}</td>
                    <td>
                      <span className={`ap-badge ${user.isAdmin ? 'ap-badge-admin' : 'ap-badge-user'}`}>
                        {user.isAdmin ? 'Administrator' : 'Customer'}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div className="ap-actions">
                        <button
                          className="ap-btn ap-btn-secondary ap-btn-sm"
                          onClick={() => alert(`Name: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phoneNumber}`)}
                          title="View Details"
                        >
                          <FaEye /> View
                        </button>
                        {!user.isAdmin && (
                          <button
                            className="ap-btn ap-btn-warning ap-btn-sm"
                            onClick={() => handlePromote(user._id)}
                            title="Promote to Admin"
                          >
                            <FaCrown /> Promote
                          </button>
                        )}
                        <button
                          className="ap-btn ap-btn-danger ap-btn-sm"
                          onClick={() => handleDelete(user._id)}
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ap-empty">
            <div className="ap-empty-icon">👤</div>
            <h3>No users found</h3>
            <p>{searchTerm ? 'Try adjusting your search.' : 'No users have registered yet.'}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
