import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState(1); // Step 1: Enter Email, Step 2: Reset Password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  // Auto-close notification after 3 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const validateEmail = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!newPassword.trim()) newErrors.newPassword = 'New password is required';
    if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/auth/forgot-password', { email });

      if (response.data.success) {
        setResetToken(response.data.resetToken);
        setStep(2);
        showNotification('Reset token sent! Enter your new password.', 'success');
      } else {
        showNotification(response.data.message || 'Failed to send reset link', 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset link';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/auth/reset-password', {
        email,
        resetToken,
        newPassword
      });

      if (response.data.success) {
        showNotification('Password reset successfully! Redirecting...', 'success');
        setTimeout(() => {
          if (isLoggedIn) {
            navigate('/account');
          } else {
            navigate('/signin');
          }
        }, 2000);
      } else {
        showNotification(response.data.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
      showNotification(errorMessage, 'error');
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
            {notification.type === 'success' ? 
              <FaCheckCircle className="notification-icon" /> : 
              <FaExclamationCircle className="notification-icon" />
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
          
          <h1>Reset Your Password</h1>
          <p className="card-subtitle">
            {step === 1 
              ? 'Enter your email address to receive a password reset link' 
              : 'Enter your new password to complete the reset'}
          </p>

          {step === 1 ? (
            // Step 1: Email Entry
            <form onSubmit={handleRequestReset} className="forgot-password-form">
              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="Enter your registered email"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            // Step 2: Password Reset
            <form onSubmit={handleResetPassword} className="forgot-password-form">
              <div className="form-group">
                <label>New Password <span className="required">*</span></label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                  }}
                  placeholder="Enter your new password"
                  className={errors.newPassword ? 'error' : ''}
                />
                {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                <span className="help-text">Minimum 6 characters</span>
              </div>

              <div className="form-group">
                <label>Confirm Password <span className="required">*</span></label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  placeholder="Confirm your new password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button 
                type="button"
                className="back-btn"
                onClick={() => {
                  setStep(1);
                  setNewPassword('');
                  setConfirmPassword('');
                  setErrors({});
                }}
              >
                Back to Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
