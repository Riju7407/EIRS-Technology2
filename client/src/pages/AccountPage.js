import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTimes,
  FaCheckCircle, FaExclamationCircle, FaLock, FaShoppingBag,
  FaShieldAlt, FaSignOutAlt, FaChevronRight, FaStar
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/AccountPage.css';

const AccountPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [editData, setEditData] = useState({
    name: '', email: '', phoneNumber: '', address: '', city: '', state: '', pincode: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (!isLoggedIn) { navigate('/signin'); return; }
    const userData = JSON.parse(localStorage.getItem('user')) || user;
    if (userData) {
      setEditData({
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        pincode: userData.pincode || ''
      });
    }
  }, [isLoggedIn, navigate, user]);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => setNotification({ message, type });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name[0].toUpperCase();
  };

  const validateForm = () => {
    const e = {};
    if (!editData.name.trim()) e.name = 'Name is required';
    if (!editData.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    if (editData.phoneNumber && !/^\d{10}$/.test(editData.phoneNumber.replace(/\D/g, '')))
      e.phoneNumber = 'Phone number must be 10 digits';
    if (!editData.address.trim()) e.address = 'Address is required';
    if (!editData.city.trim()) e.city = 'City is required';
    if (!editData.state.trim()) e.state = 'State is required';
    if (!editData.pincode.trim()) e.pincode = 'Pincode is required';
    if (editData.pincode && !/^\d{6}$/.test(editData.pincode)) e.pincode = 'Pincode must be 6 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) { showNotification('Please fix the errors above', 'error'); return; }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?._id) {
        showNotification('User information not found. Please log in again.', 'error');
        setIsLoading(false); return;
      }
      const response = await axios.put(
        `http://localhost:5000/auth/users/edit/${userData._id}`,
        { name: editData.name, email: editData.email, phoneNumber: editData.phoneNumber,
          address: editData.address, city: editData.city, state: editData.state, pincode: editData.pincode },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify({ ...userData, ...editData }));
        setIsEditMode(false);
        setErrors({});
        showNotification('Profile updated successfully!', 'success');
      } else {
        showNotification(response.data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const e = {};
    if (!passwordData.currentPassword.trim()) e.currentPassword = 'Current password is required';
    if (!passwordData.newPassword.trim()) e.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 6) e.newPassword = 'Minimum 6 characters';
    if (!passwordData.confirmPassword.trim()) e.confirmPassword = 'Confirm password is required';
    if (passwordData.newPassword !== passwordData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (passwordData.currentPassword === passwordData.newPassword) e.newPassword = 'New password must differ from current';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) { showNotification('Please fix the errors above', 'error'); return; }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData?._id) {
        showNotification('User information not found. Please log in again.', 'error');
        setIsLoading(false); return;
      }
      const response = await axios.put(
        `http://localhost:5000/auth/change-password/${userData._id}`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showNotification('Password changed successfully!', 'success');
      } else {
        showNotification(response.data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/signin'); };

  const initials = getInitials(editData.name);

  return (
    <main className="ap-page">
      {/* Toast */}
      {notification && (
        <div className={`ap-toast ap-toast--${notification.type}`}>
          {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="ap-shell">

        {/* ── Sidebar ─────────────────────────────── */}
        <aside className="ap-sidebar">
          <div className="ap-avatar-block">
            <div className="ap-avatar">{initials}</div>
            <div className="ap-sb-info">
              <p className="ap-sb-name">{editData.name || 'My Account'}</p>
              <p className="ap-sb-email">{editData.email}</p>
              <span className="ap-member-badge"><FaStar /> Valued Member</span>
            </div>
          </div>

          <nav className="ap-nav">
            <p className="ap-nav-label">ACCOUNT</p>
            <button
              className={`ap-nav-item${activeTab === 'profile' ? ' ap-nav-item--active' : ''}`}
              onClick={() => { setActiveTab('profile'); setIsEditMode(false); setErrors({}); }}
            >
              <FaUser className="ap-nav-icon" />
              <span>My Profile</span>
              <FaChevronRight className="ap-nav-arrow" />
            </button>
            <Link to="/orders" className="ap-nav-item">
              <FaShoppingBag className="ap-nav-icon" />
              <span>My Orders</span>
              <FaChevronRight className="ap-nav-arrow" />
            </Link>

            <p className="ap-nav-label ap-nav-label--spaced">SETTINGS</p>
            <button
              className={`ap-nav-item${activeTab === 'security' ? ' ap-nav-item--active' : ''}`}
              onClick={() => { setActiveTab('security'); setErrors({}); }}
            >
              <FaShieldAlt className="ap-nav-icon" />
              <span>Security</span>
              <FaChevronRight className="ap-nav-arrow" />
            </button>
            <button className="ap-nav-item ap-nav-item--danger" onClick={handleLogout}>
              <FaSignOutAlt className="ap-nav-icon" />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* ── Main Content ─────────────────────────── */}
        <div className="ap-main">

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <div className="ap-card">
              <div className="ap-card-head">
                <div>
                  <h2 className="ap-card-title">Profile Information</h2>
                  <p className="ap-card-sub">
                    {isEditMode ? 'Update your personal details below' : 'Your saved personal details'}
                  </p>
                </div>
                <button
                  className={`ap-btn ${isEditMode ? 'ap-btn--ghost' : 'ap-btn--edit'}`}
                  onClick={() => { if (isEditMode) setErrors({}); setIsEditMode(!isEditMode); }}
                >
                  {isEditMode ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
                </button>
              </div>

              {!isEditMode ? (
                <div className="ap-view">
                  <div className="ap-view-grid">
                    <div className="ap-field">
                      <span className="ap-field-label"><FaUser /> Full Name</span>
                      <span className="ap-field-val">{editData.name || <em>Not provided</em>}</span>
                    </div>
                    <div className="ap-field">
                      <span className="ap-field-label"><FaEnvelope /> Email</span>
                      <span className="ap-field-val">{editData.email || <em>Not provided</em>}</span>
                    </div>
                    <div className="ap-field">
                      <span className="ap-field-label"><FaPhone /> Phone</span>
                      <span className="ap-field-val">{editData.phoneNumber || <em>Not provided</em>}</span>
                    </div>
                    <div className="ap-field ap-field--full">
                      <span className="ap-field-label"><FaMapMarkerAlt /> Address</span>
                      <span className="ap-field-val">{editData.address || <em>Not provided</em>}</span>
                    </div>
                    <div className="ap-field">
                      <span className="ap-field-label">City</span>
                      <span className="ap-field-val">{editData.city || <em>Not provided</em>}</span>
                    </div>
                    <div className="ap-field">
                      <span className="ap-field-label">State</span>
                      <span className="ap-field-val">{editData.state || <em>Not provided</em>}</span>
                    </div>
                    <div className="ap-field">
                      <span className="ap-field-label">Pincode</span>
                      <span className="ap-field-val">{editData.pincode || <em>Not provided</em>}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ap-form">
                  <div className="ap-form-grid">
                    <div className="ap-fg">
                      <label>Full Name <span className="ap-req">*</span></label>
                      <input type="text" name="name" value={editData.name} onChange={handleInputChange}
                        placeholder="Your full name" className={errors.name ? 'ap-err' : ''} />
                      {errors.name && <span className="ap-err-msg">{errors.name}</span>}
                    </div>
                    <div className="ap-fg">
                      <label>Email Address</label>
                      <input type="email" name="email" value={editData.email} disabled placeholder="Email" />
                      <span className="ap-hint">Email cannot be changed</span>
                    </div>
                    <div className="ap-fg">
                      <label>Phone Number <span className="ap-req">*</span></label>
                      <input type="tel" name="phoneNumber" value={editData.phoneNumber} onChange={handleInputChange}
                        placeholder="10-digit mobile number" className={errors.phoneNumber ? 'ap-err' : ''} />
                      {errors.phoneNumber && <span className="ap-err-msg">{errors.phoneNumber}</span>}
                    </div>
                    <div className="ap-fg ap-fg--full">
                      <label>Address <span className="ap-req">*</span></label>
                      <input type="text" name="address" value={editData.address} onChange={handleInputChange}
                        placeholder="House/Flat No., Street, Area" className={errors.address ? 'ap-err' : ''} />
                      {errors.address && <span className="ap-err-msg">{errors.address}</span>}
                    </div>
                    <div className="ap-fg">
                      <label>City <span className="ap-req">*</span></label>
                      <input type="text" name="city" value={editData.city} onChange={handleInputChange}
                        placeholder="City" className={errors.city ? 'ap-err' : ''} />
                      {errors.city && <span className="ap-err-msg">{errors.city}</span>}
                    </div>
                    <div className="ap-fg">
                      <label>State <span className="ap-req">*</span></label>
                      <input type="text" name="state" value={editData.state} onChange={handleInputChange}
                        placeholder="State" className={errors.state ? 'ap-err' : ''} />
                      {errors.state && <span className="ap-err-msg">{errors.state}</span>}
                    </div>
                    <div className="ap-fg">
                      <label>Pincode <span className="ap-req">*</span></label>
                      <input type="text" name="pincode" value={editData.pincode} onChange={handleInputChange}
                        placeholder="6-digit pincode" className={errors.pincode ? 'ap-err' : ''} />
                      {errors.pincode && <span className="ap-err-msg">{errors.pincode}</span>}
                    </div>
                  </div>
                  <div className="ap-form-actions">
                    <button className="ap-btn ap-btn--save" onClick={handleSaveProfile} disabled={isLoading}>
                      {isLoading ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button className="ap-btn ap-btn--ghost"
                      onClick={() => { setIsEditMode(false); setErrors({}); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <div className="ap-card">
              <div className="ap-card-head">
                <div>
                  <h2 className="ap-card-title">Security Settings</h2>
                  <p className="ap-card-sub">Manage your password and account security</p>
                </div>
              </div>
              <div className="ap-security-body">
                <div className="ap-security-info">
                  <div className="ap-security-icon"><FaLock /></div>
                  <div>
                    <p className="ap-security-title">Password</p>
                    <p className="ap-security-note">Use a strong password that you don't use elsewhere</p>
                  </div>
                </div>
                <div className="ap-form" style={{ padding: '0', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                  <div className="ap-form-grid ap-form-grid--narrow">
                    <div className="ap-fg ap-fg--full">
                      <label>Current Password <span className="ap-req">*</span></label>
                      <input type="password" name="currentPassword" value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange} placeholder="Enter current password"
                        className={errors.currentPassword ? 'ap-err' : ''} />
                      {errors.currentPassword && <span className="ap-err-msg">{errors.currentPassword}</span>}
                    </div>
                    <div className="ap-fg ap-fg--full">
                      <label>New Password <span className="ap-req">*</span></label>
                      <input type="password" name="newPassword" value={passwordData.newPassword}
                        onChange={handlePasswordInputChange} placeholder="Enter new password"
                        className={errors.newPassword ? 'ap-err' : ''} />
                      {errors.newPassword && <span className="ap-err-msg">{errors.newPassword}</span>}
                      <span className="ap-hint">Minimum 6 characters</span>
                    </div>
                    <div className="ap-fg ap-fg--full">
                      <label>Confirm New Password <span className="ap-req">*</span></label>
                      <input type="password" name="confirmPassword" value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange} placeholder="Re-enter new password"
                        className={errors.confirmPassword ? 'ap-err' : ''} />
                      {errors.confirmPassword && <span className="ap-err-msg">{errors.confirmPassword}</span>}
                    </div>
                  </div>
                  <div className="ap-form-actions">
                    <button className="ap-btn ap-btn--save" onClick={handleChangePassword} disabled={isLoading}>
                      {isLoading ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                  <Link to="/forgot-password" className="ap-forgot-link">
                    Forgot your password? Reset via email &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default AccountPage;