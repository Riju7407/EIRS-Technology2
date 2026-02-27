import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTimes, FaEnvelope, FaLock, FaUser, FaPhone,
  FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaShieldAlt
} from 'react-icons/fa';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/OTPLoginPopup.css';

/* ─────────────────────────────────────────────────────────────────────────────
   OTPLoginPopup
   Props:
     onClose {function} – called when the popup should be dismissed
   ───────────────────────────────────────────────────────────────────────────── */
const OTPLoginPopup = ({ onClose }) => {
  const [tab,       setTab]       = useState('signin');   // 'signin' | 'signup'
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [showPwd2,  setShowPwd2]  = useState(false);
  const overlayRef = useRef(null);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    name: '', email: '', phoneNumber: '', password: '', confirmPassword: ''
  });

  // ── Lock body scroll while open ────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Close on Escape key ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Overlay click closes popup ─────────────────────────────────────────────
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // ── Reset messages on tab switch ──────────────────────────────────────────
  const switchTab = (t) => {
    setTab(t);
    setError('');
    setSuccess('');
  };

  // ── Sign In ────────────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.signin({
        email:    signInData.email.trim().toLowerCase(),
        password: signInData.password,
      });
      // Server returns { success, token, data: { _id, name, email, isAdmin } }
      if (res.token && res.data) {
        login(res.data, res.token);
        setSuccess('Signed in successfully! Welcome back.');
        setTimeout(() => onClose(), 1000);
      } else {
        setError(res.message || 'Sign in failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.signup({
        name:          signUpData.name.trim(),
        email:         signUpData.email.trim().toLowerCase(),
        phoneNumber:   signUpData.phoneNumber.trim(),
        password:      signUpData.password,
        confirmPassword: signUpData.confirmPassword,
        address:       '',
      });

      if (res.success || res.token) {
        setSuccess('Account created! Please sign in.');
        setSignInData({ email: signUpData.email, password: '' });
        setTimeout(() => switchTab('signin'), 1500);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="olp-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Sign in or create account">

      <div className="olp-modal">
        {/* Header */}
        <div className="olp-header">
          <div className="olp-brand">
            <FaShieldAlt className="olp-brand-icon" />
            <span>EIRS Technology</span>
          </div>
          <button className="olp-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="olp-tabs">
          <button
            className={`olp-tab ${tab === 'signin' ? 'olp-tab--active' : ''}`}
            onClick={() => switchTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`olp-tab ${tab === 'signup' ? 'olp-tab--active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Create Account
          </button>
        </div>

        <div className="olp-body">
          {/* ── Alerts ── */}
          {error && (
            <div className="olp-alert olp-alert--error">
              <FaTimes className="olp-alert-icon" /> {error}
            </div>
          )}
          {success && (
            <div className="olp-alert olp-alert--success">
              <FaCheckCircle className="olp-alert-icon" /> {success}
            </div>
          )}

          {/* ══════════════ SIGN IN FORM ══════════════ */}
          {tab === 'signin' && (
            <form className="olp-form" onSubmit={handleSignIn} noValidate>
              <div className="olp-field">
                <label htmlFor="olp-si-email">Email address</label>
                <div className="olp-input-wrap">
                  <FaEnvelope className="olp-input-icon" />
                  <input
                    id="olp-si-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoFocus
                    value={signInData.email}
                    onChange={(e) => setSignInData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="olp-field">
                <label htmlFor="olp-si-pwd">Password</label>
                <div className="olp-input-wrap">
                  <FaLock className="olp-input-icon" />
                  <input
                    id="olp-si-pwd"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Your password"
                    required
                    value={signInData.password}
                    onChange={(e) => setSignInData(p => ({ ...p, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="olp-pwd-toggle"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button className="olp-submit" type="submit" disabled={loading}>
                {loading ? <><FaSpinner className="olp-spin" /> Signing in…</> : 'Sign In'}
              </button>

              <p className="olp-footer-link">
                <a href="/forgot-password" onClick={onClose}>Forgot your password?</a>
              </p>
            </form>
          )}

          {/* ══════════════ SIGN UP FORM ══════════════ */}
          {tab === 'signup' && (
            <form className="olp-form" onSubmit={handleSignUp} noValidate>
              <div className="olp-field">
                <label htmlFor="olp-su-name">Full Name</label>
                <div className="olp-input-wrap">
                  <FaUser className="olp-input-icon" />
                  <input
                    id="olp-su-name"
                    type="text"
                    placeholder="Your full name"
                    required
                    autoFocus
                    minLength={2}
                    maxLength={100}
                    value={signUpData.name}
                    onChange={(e) => setSignUpData(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="olp-field">
                <label htmlFor="olp-su-email">Email address</label>
                <div className="olp-input-wrap">
                  <FaEnvelope className="olp-input-icon" />
                  <input
                    id="olp-su-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="olp-field">
                <label htmlFor="olp-su-phone">Phone Number</label>
                <div className="olp-input-wrap">
                  <FaPhone className="olp-input-icon" />
                  <input
                    id="olp-su-phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    required
                    minLength={10}
                    maxLength={15}
                    value={signUpData.phoneNumber}
                    onChange={(e) => setSignUpData(p => ({ ...p, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="olp-field-row">
                <div className="olp-field">
                  <label htmlFor="olp-su-pwd">Password</label>
                  <div className="olp-input-wrap">
                    <FaLock className="olp-input-icon" />
                    <input
                      id="olp-su-pwd"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(p => ({ ...p, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="olp-pwd-toggle"
                      onClick={() => setShowPwd(v => !v)}
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      {showPwd ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="olp-field">
                  <label htmlFor="olp-su-pwd2">Confirm Password</label>
                  <div className="olp-input-wrap">
                    <FaLock className="olp-input-icon" />
                    <input
                      id="olp-su-pwd2"
                      type={showPwd2 ? 'text' : 'password'}
                      placeholder="Repeat password"
                      required
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(p => ({ ...p, confirmPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="olp-pwd-toggle"
                      onClick={() => setShowPwd2(v => !v)}
                      aria-label={showPwd2 ? 'Hide' : 'Show'}
                    >
                      {showPwd2 ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <button className="olp-submit" type="submit" disabled={loading}>
                {loading ? <><FaSpinner className="olp-spin" /> Creating account…</> : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── Divider / alternative CTA ── */}
          <div className="olp-divider"><span>or</span></div>
          <p className="olp-alt-cta">
            {tab === 'signin'
              ? <>New here? <button className="olp-link-btn" onClick={() => switchTab('signup')}>Create a free account</button></>
              : <>Already have an account? <button className="olp-link-btn" onClick={() => switchTab('signin')}>Sign in</button></>
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPLoginPopup;
