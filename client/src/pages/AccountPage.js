import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTimes, FaCheckCircle, FaExclamationCircle, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/AccountPage.css';

const AccountPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangePasswordMode, setIsChangePasswordMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Redirect to signin if user is not logged in
    if (!isLoggedIn) {
      navigate('/signin');
      return;
    }

    // Load user data from localStorage or auth context
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

  // Auto-close notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const validateForm = () => {
    const newErrors = {};
    if (!editData.name.trim()) newErrors.name = 'Name is required';
    if (!editData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (editData.phoneNumber && !/^\d{10}$/.test(editData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    if (!editData.address.trim()) newErrors.address = 'Address is required';
    if (!editData.city.trim()) newErrors.city = 'City is required';
    if (!editData.state.trim()) newErrors.state = 'State is required';
    if (!editData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (editData.pincode && !/^\d{6}$/.test(editData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      showNotification('Please fix the errors above', 'error');
      return;
    }
    setIsLoading(true);
    
    try {
      // Get the token from localStorage or cookies
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user._id) {
        showNotification('User information not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }
      
      // Make API call to update user profile in database
      // Use the correct endpoint with /auth/ prefix
      const response = await axios.put(
        `http://localhost:5000/auth/users/edit/${user._id}`,
        {
          name: editData.name,
          email: editData.email,
          phoneNumber: editData.phoneNumber,
          address: editData.address,
          city: editData.city,
          state: editData.state,
          pincode: editData.pincode
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update localStorage with the new data
        const updatedUserData = {
          ...user,
          ...editData
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        setIsEditMode(false);
        setErrors({});
        showNotification('Profile updated successfully!', 'success');
      } else {
        showNotification(response.data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword.trim()) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword.trim()) newErrors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 6) newErrors.newPassword = 'New password must be at least 6 characters';
    if (!passwordData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      showNotification('Please fix the errors above', 'error');
      return;
    }
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      const user = JSON.parse(localStorage.getItem('user'));

      if (!user || !user._id) {
        showNotification('User information not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/auth/change-password/${user._id}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangePasswordMode(false);
        showNotification('Password changed successfully!', 'success');
      } else {
        showNotification(response.data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="account-page">
        <div className="container account-container">
          {/* Notification Toast */}
          {notification && (
            <div className={`notification notification-${notification.type}`}>
              <div className="notification-content">
                {notification.type === 'success' ? 
                  <FaCheckCircle className="notification-icon" /> : 
                  <FaExclamationCircle className="notification-icon" />
                }
                <span>{notification.message}</span>
              </div>
            </div>
          )}

          {/* Account Header */}
          <section className="account-header">
            <div className="header-content">
              <div className="profile-icon">
                <FaUser />
              </div>
              <div className="header-text">
                <h1>My Account</h1>
                <p>Manage your profile and account settings</p>
              </div>
            </div>
          </section>

          {/* Account Content */}
          <section className="account-content">
            <div className="profile-card">
              <div className="card-header">
                <div>
                  <h2>Profile Information</h2>
                  <p className="card-description">{isEditMode ? 'Update your information' : 'Your personal details'}</p>
                </div>
                <button 
                  className={`edit-btn ${isEditMode ? 'cancel' : 'edit'}`}
                  onClick={() => {
                    if (isEditMode) {
                      setErrors({});
                    }
                    setIsEditMode(!isEditMode);
                  }}
                >
                  {isEditMode ? <FaTimes /> : <FaEdit />}
                  {isEditMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="profile-content">
                {!isEditMode ? (
                  // View Mode
                  <div className="profile-view">
                    <div className="profile-grid">
                      <div className="profile-field">
                        <label className="field-label">
                          <FaUser className="field-icon" /> Full Name
                        </label>
                        <p className="field-value">{editData.name || 'Not provided'}</p>
                      </div>

                      <div className="profile-field">
                        <label className="field-label">
                          <FaEnvelope className="field-icon" /> Email Address
                        </label>
                        <p className="field-value">{editData.email || 'Not provided'}</p>
                      </div>

                      <div className="profile-field">
                        <label className="field-label">
                          <FaPhone className="field-icon" /> Phone Number
                        </label>
                        <p className="field-value">{editData.phoneNumber || 'Not provided'}</p>
                      </div>

                      <div className="profile-field">
                        <label className="field-label">
                          <FaMapMarkerAlt className="field-icon" /> Address
                        </label>
                        <p className="field-value">{editData.address || 'Not provided'}</p>
                      </div>

                      <div className="profile-field">
                        <label className="field-label">City</label>
                        <p className="field-value">{editData.city || 'Not provided'}</p>
                      </div>
                      <div className="profile-field">
                        <label className="field-label">State</label>
                        <p className="field-value">{editData.state || 'Not provided'}</p>
                      </div>
                      <div className="profile-field">
                        <label className="field-label">Pincode</label>
                        <p className="field-value">{editData.pincode || 'Not provided'}</p>
                      </div>
                      <div className="logout-button-container">
                        <button className="logout-btn-inline" onClick={handleLogout}>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="profile-edit">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name <span className="required">*</span></label>
                        <input 
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                      </div>

                      <div className="form-group">
                        <label>Email Address</label>
                        <input 
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          disabled
                        />
                        <span className="help-text">Email cannot be changed</span>
                      </div>

                      <div className="form-group">
                        <label>Phone Number <span className="required">*</span></label>
                        <input 
                          type="tel"
                          name="phoneNumber"
                          value={editData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="10-digit phone number"
                          className={errors.phoneNumber ? 'error' : ''}
                        />
                        {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                      </div>

                      <div className="form-group full-width">
                        <label>Address <span className="required">*</span></label>
                        <input 
                          type="text"
                          name="address"
                          value={editData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                          className={errors.address ? 'error' : ''}
                        />
                        {errors.address && <span className="error-message">{errors.address}</span>}
                      </div>

                      <div className="form-group">
                        <label>City <span className="required">*</span></label>
                        <input 
                          type="text"
                          name="city"
                          value={editData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className={errors.city ? 'error' : ''}
                        />
                        {errors.city && <span className="error-message">{errors.city}</span>}
                      </div>
                      <div className="form-group">
                        <label>State <span className="required">*</span></label>
                        <input 
                          type="text"
                          name="state"
                          value={editData.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          className={errors.state ? 'error' : ''}
                        />
                        {errors.state && <span className="error-message">{errors.state}</span>}
                      </div>
                      <div className="form-group">
                        <label>Pincode <span className="required">*</span></label>
                        <input 
                          type="text"
                          name="pincode"
                          value={editData.pincode}
                          onChange={handleInputChange}
                          placeholder="6-digit pincode"
                          className={errors.pincode ? 'error' : ''}
                        />
                        {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                      </div>
                    </div>

                    <button className="save-btn" onClick={handleSaveProfile} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Change Card */}
            <div className="profile-card">
              <div className="card-header">
                <div>
                  <h2>Password & Security</h2>
                  <p className="card-description">Manage your password and security settings</p>
                </div>
                <button 
                  className={`edit-btn ${isChangePasswordMode ? 'cancel' : 'edit'}`}
                  onClick={() => {
                    if (isChangePasswordMode) {
                      setErrors({});
                    }
                    setIsChangePasswordMode(!isChangePasswordMode);
                  }}
                >
                  {isChangePasswordMode ? <FaTimes /> : <FaLock />}
                  {isChangePasswordMode ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              <div className="profile-content">
                {!isChangePasswordMode ? (
                  <div className="password-view">
                    <div className="password-info">
                      <p>Keep your account secure by using a strong, unique password.</p>
                      <Link to="/forgot-password" className="forgot-password-link">
                        Forgot Password? Reset it here
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="password-change-form">
                    <div className="form-grid password-form-grid">
                      <div className="form-group full-width">
                        <label>Current Password <span className="required">*</span></label>
                        <input 
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="Enter your current password"
                          className={errors.currentPassword ? 'error' : ''}
                        />
                        {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
                      </div>

                      <div className="form-group full-width">
                        <label>New Password <span className="required">*</span></label>
                        <input 
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="Enter your new password"
                          className={errors.newPassword ? 'error' : ''}
                        />
                        {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                        <span className="help-text">Minimum 6 characters</span>
                      </div>

                      <div className="form-group full-width">
                        <label>Confirm Password <span className="required">*</span></label>
                        <input 
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="Confirm your new password"
                          className={errors.confirmPassword ? 'error' : ''}
                        />
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                      </div>
                    </div>

                    <button className="save-btn" onClick={handleChangePassword} disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AccountPage;
