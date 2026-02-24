import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import '../styles/ForgotPasswordPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  // Auto-close notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Validate link params on mount
  useEffect(() => {
    if (!token || !email) {
      showNotification('Invalid or missing reset link. Please request a new one.', 'error');
    }
  }, [token, email]);

  const validate = () => {
    const newErrors = {};
    if (!newPassword.trim()) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      showNotification('Invalid reset link. Please request a new one.', 'error');
      return;
    }
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('https://eirs-technology2-2.onrender.com/auth/reset-password', {
        email: decodeURIComponent(email),
        resetToken: token,
        newPassword
      });

      if (response.data.success) {
        setResetSuccess(true);
        showNotification('Password reset successfully!', 'success');
        setTimeout(() => navigate('/signin'), 3000);
      } else {
        showNotification(response.data.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
      showNotification(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success'
              ? <FaCheckCircle className="notification-icon" />
              : <FaExclamationCircle className="notification-icon" />
            }
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="card-icon">
            <FaLock />
          </div>

          <h1>Set New Password</h1>
          <p className="card-subtitle">
            {resetSuccess
              ? 'Your password has been reset successfully'
              : 'Enter your new password below'}
          </p>

          {resetSuccess ? (
            <div className="email-sent-container">
              <div className="email-sent-icon" style={{ color: '#22c55e', fontSize: '48px' }}>✓</div>
              <h3 className="email-sent-title">Password Reset!</h3>
              <p className="email-sent-text">
                Your password has been updated successfully. You will be redirected to the sign in page shortly.
              </p>
              <Link to="/signin" className="submit-btn" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
                Sign In Now
              </Link>
            </div>
          ) : !token || !email ? (
            <div className="email-sent-container">
              <div className="email-sent-icon" style={{ color: '#ef4444', fontSize: '48px' }}>✗</div>
              <h3 className="email-sent-title">Invalid Link</h3>
              <p className="email-sent-text">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link to="/forgot-password" className="submit-btn" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
                Request New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="forgot-password-form">
              <div className="form-group">
                <label>New Password <span className="required">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                    }}
                    placeholder="Enter your new password"
                    className={errors.newPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                <span className="help-text">Minimum 6 characters</span>
              </div>

              <div className="form-group">
                <label>Confirm Password <span className="required">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    placeholder="Confirm your new password"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <Link to="/forgot-password" className="back-link">
                Request a new reset link
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
