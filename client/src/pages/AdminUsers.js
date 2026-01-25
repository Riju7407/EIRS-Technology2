import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaCrown } from 'react-icons/fa';
import { adminService } from '../services/api';
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
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data || response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // If 401 Unauthorized, redirect to signin
      if (error.status === 401 || error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUserById(id);
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handlePromoteAdmin = async (userId) => {
    if (window.confirm('Promote this user to admin?')) {
      try {
        await adminService.promoteToAdmin(userId);
        // Refresh users list
        fetchUsers();
        alert('User promoted to admin successfully!');
      } catch (error) {
        console.error('Error promoting user:', error);
        alert('Failed to promote user: ' + (error.message || 'Unknown error'));
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage all registered users and their permissions</p>
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
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : filteredUsers.length > 0 ? (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="action-btn view"
                      onClick={() => alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phoneNumber}\nAddress: ${user.address}\nJoined: ${new Date(user.createdAt).toLocaleDateString()}`)}
                    >
                      <FaEye /> View
                    </button>
                    {!user.isAdmin && (
                      <button
                        className="action-btn promote"
                        onClick={() => handlePromoteAdmin(user._id)}
                        title="Promote to Admin"
                      >
                        <FaCrown /> Promote
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(user._id)}
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
          <p>No users found</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
