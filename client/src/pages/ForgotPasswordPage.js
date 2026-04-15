import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import '../styles/ForgotPasswordPage.css';

const API_ROOT = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_BASE = `${API_ROOT}/auth`;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password, 4=success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpInfoMsg, setOtpInfoMsg] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address');

    setError('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/request-otp`, { email, purpose: 'forgot-password' });
      if (res.data.success) {
        setOtpInfoMsg(res.data.emailSent === false ? res.data.message : '');
        setStep(2);
        setTimer(60);
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input: change individual digit
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return setError('Please enter the complete 6-digit OTP');

    setError('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/verify-otp`, { email, otp: otpValue });
      if (res.data.success) {
        setStep(3);
      } else {
        setError(res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return setError('New password is required');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setError('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/reset-password-otp`, {
        email,
        otp: otp.join(''),
        newPassword,
        confirmPassword
      });
      if (res.data.success) {
        setStep(4);
      } else {
        setError(res.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (timer > 0 || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/request-otp`, { email, purpose: 'forgot-password' });
      if (res.data.success) {
        setOtpInfoMsg(res.data.emailSent === false ? res.data.message : '');
        setOtp(['', '', '', '', '', '']);
        setTimer(60);
        otpRefs.current[0]?.focus();
      } else {
        setError(res.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">

        {/* Lock Icon */}
        <div className="fp-logo">
          <FaLock />
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="fp-steps">
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div className={`fp-step ${step >= s ? 'fp-step--active' : ''} ${step > s ? 'fp-step--done' : ''}`}>
                  {step > s ? <FaCheckCircle /> : s}
                </div>
                {s < 3 && <div className={`fp-step-line ${step > s ? 'fp-step-line--done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <>
            <h2 className="fp-title">Forgot Password?</h2>
            <p className="fp-subtitle">Enter your email address and we'll send you a verification code</p>
            <form onSubmit={handleSendOTP}>
              <div className="fp-field">
                <label>Email Address</label>
                <div className="fp-input-wrap">
                  <FaEnvelope className="fp-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="Enter your registered email"
                    autoFocus
                  />
                </div>
                {error && <span className="fp-error">{error}</span>}
              </div>
              <button type="submit" className="fp-btn" disabled={isLoading}>
                {isLoading ? <span className="fp-spinner" /> : 'Send OTP'}
              </button>
            </form>
            <Link to="/signin" className="fp-signin-link">
              <FaArrowLeft /> Back to Sign In
            </Link>
          </>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 2 && (
          <>
            <h2 className="fp-title">Enter Verification Code</h2>
            {otpInfoMsg ? (
              <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#92400e' }}>
                ⚠️ {otpInfoMsg}
              </div>
            ) : (
              <p className="fp-subtitle">
                We sent a 6-digit OTP to<br /><strong>{email}</strong>
              </p>
            )}
            <form onSubmit={handleVerifyOTP}>
              <div className="fp-otp-wrap" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`fp-otp-box ${digit ? 'fp-otp-box--filled' : ''}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              {error && <span className="fp-error fp-error--center">{error}</span>}
              <button type="submit" className="fp-btn" disabled={isLoading || otp.join('').length !== 6}>
                {isLoading ? <span className="fp-spinner" /> : 'Verify OTP'}
              </button>
            </form>
            <div className="fp-resend">
              {timer > 0 ? (
                <span>Resend OTP in <strong>{timer}s</strong></span>
              ) : (
                <button className="fp-resend-btn" onClick={handleResendOTP} disabled={isLoading}>
                  Resend OTP
                </button>
              )}
            </div>
            <button className="fp-back-btn" onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); }}>
              <FaArrowLeft /> Change Email
            </button>
          </>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 3 && (
          <>
            <h2 className="fp-title">Set New Password</h2>
            <p className="fp-subtitle">Create a strong new password for your account</p>
            <form onSubmit={handleResetPassword}>
              <div className="fp-field">
                <label>New Password</label>
                <div className="fp-input-wrap">
                  <FaLock className="fp-input-icon" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="Enter new password (min 6 chars)"
                    autoFocus
                  />
                  <button type="button" className="fp-eye" onClick={() => setShowNew(!showNew)}>
                    {showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="fp-field">
                <label>Confirm Password</label>
                <div className="fp-input-wrap">
                  <FaLock className="fp-input-icon" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" className="fp-eye" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {error && <span className="fp-error">{error}</span>}
              </div>
              <button type="submit" className="fp-btn" disabled={isLoading}>
                {isLoading ? <span className="fp-spinner" /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {/* ── Step 4: Success ── */}
        {step === 4 && (
          <div className="fp-success">
            <div className="fp-success-icon">
              <FaCheckCircle />
            </div>
            <h2 className="fp-title">Password Reset!</h2>
            <p className="fp-subtitle">Your password has been updated successfully. Please sign in with your new password.</p>
            <button className="fp-btn" onClick={() => navigate('/signin')}>
              Go to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
