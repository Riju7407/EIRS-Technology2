import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaTimes, FaPhone, FaUser, FaEnvelope, FaMapMarkerAlt,
  FaShieldAlt, FaCheckCircle, FaSpinner, FaArrowLeft,
  FaMobileAlt, FaLock
} from 'react-icons/fa';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/PhoneOTPLoginPopup.css';

/* ─────────────────────────────────────────────────────────────────────────────
   PhoneOTPLoginPopup
   Multi-step e-commerce login popup powered by Twilio Verify SMS OTP.

   STEP 1 → Enter phone number           → POST /auth/phone-otp/send
   STEP 2 → Enter 6-digit OTP            → POST /auth/phone-otp/verify
            └ existing user  → JWT issued, popup closes
            └ new user       → STEP 3
   STEP 3 → Enter name, email, address   → POST /auth/phone-otp/register

   Props:
     onClose {function}  — called when popup should be dismissed
   ───────────────────────────────────────────────────────────────────────────── */
const TOTAL_STEPS = 3;

const PhoneOTPLoginPopup = ({ onClose }) => {
  /* ── State ─────────────────────────────────────────────────────────────── */
  const [step,      setStep]      = useState(1);   // 1 | 2 | 3
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [resendCD,  setResendCD]  = useState(0);  // resend countdown seconds

  // Step-1 data
  const [phone, setPhone] = useState('');

  // Step-2 OTP – 6 individual digit boxes
  const [otp,        setOtp]        = useState(['', '', '', '', '', '']);
  const [phoneToken, setPhoneToken] = useState(''); // returned for new users after verify

  // Step-3 profile data (new users)
  const [profile, setProfile] = useState({ name: '', email: '', address: '' });

  const overlayRef  = useRef(null);
  const otpRefs     = useRef([]);   // refs for the 6 OTP input boxes
  const { login }   = useAuth();

  /* ── Lock scroll ───────────────────────────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* ── ESC key close ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* ── Resend countdown ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (resendCD <= 0) return;
    const t = setTimeout(() => setResendCD(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCD]);

  /* ── Overlay click close ───────────────────────────────────────────────── */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* ── Helpers ───────────────────────────────────────────────────────────── */
  const clearMessages = () => { setError(''); setSuccess(''); };

  const normalisePhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (raw.startsWith('+')) return '+' + digits;
    if (digits.length === 10) return '+91' + digits;
    if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
    return null;
  };

  /* ── STEP 1 – Send OTP ─────────────────────────────────────────────────── */
  const handleSendOTP = useCallback(async (e) => {
    e?.preventDefault();
    clearMessages();

    const e164 = normalisePhone(phone);
    if (!e164) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendTwilioPhoneOTP(e164);
      if (res.success) {
        setStep(2);
        setResendCD(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  /* ── STEP 2 – Verify OTP ───────────────────────────────────────────────── */
  const handleVerifyOTP = useCallback(async (e, codeOverride) => {
    e?.preventDefault();
    clearMessages();

    const code = codeOverride || otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    const e164 = normalisePhone(phone);
    setLoading(true);
    try {
      const res = await authService.verifyTwilioPhoneOTP(e164, code);
      if (res.success) {
        if (!res.isNewUser) {
          // Returning user – log in immediately
          login(res.data, res.token);
          setSuccess(res.message || 'Welcome back! Signing you in…');
          setTimeout(() => onClose(), 1200);
        } else {
          // New user – collect profile details
          setPhoneToken(res.phoneToken);
          setStep(3);
        }
      } else {
        setError(res.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [otp, phone, login, onClose]);

  /* ── STEP 3 – Register ─────────────────────────────────────────────────── */
  const handleRegister = useCallback(async (e) => {
    e?.preventDefault();
    clearMessages();

    const { name, email, address } = profile;
    if (!name.trim() || !email.trim() || !address.trim()) {
      setError('All fields are required to create your account.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.registerWithTwilioPhoneOTP({
        phoneToken, name: name.trim(), email: email.trim(), address: address.trim()
      });
      if (res.success) {
        login(res.data, res.token);
        setSuccess(res.message || 'Account created! Welcome to EIRS Technology.');
        setTimeout(() => onClose(), 1400);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [profile, phoneToken, login, onClose]);

  /* ── OTP box key handling ──────────────────────────────────────────────── */
  const handleOtpChange = (index, value) => {
    const v = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = v;
    setOtp(next);
    if (v && index < 5) otpRefs.current[index + 1]?.focus();
    // Auto-submit when all 6 filled
    if (v && next.every(d => d !== '')) {
      const autoCode = next.join('');
      setTimeout(() => handleVerifyOTP(null, autoCode), 80);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const arr = text.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(arr);
    const focusIdx = Math.min(text.length, 5);
    otpRefs.current[focusIdx]?.focus();
    if (text.length === 6) setTimeout(() => handleVerifyOTP(null, arr.join('')), 80);
  };

  /* ── Step progress indicator ───────────────────────────────────────────── */
  const StepDot = ({ n }) => (
    <div className={`potp-step-dot ${step === n ? 'active' : step > n ? 'done' : ''}`}>
      {step > n ? <FaCheckCircle /> : n}
    </div>
  );

  const StepLine = ({ done }) => (
    <div className={`potp-step-line ${done ? 'done' : ''}`} />
  );

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div
      className="potp-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Phone OTP Login"
    >
      <div className="potp-modal">

        {/* ─── Header ─────────────────────────────────────────────────── */}
        <div className="potp-header">
          <div className="potp-header-brand">
            <div className="potp-header-icon-wrap">
              <FaShieldAlt />
            </div>
            <div>
              <div className="potp-header-title">EIRS Technology</div>
              <div className="potp-header-sub">Secure Phone Verification</div>
            </div>
          </div>
          <button className="potp-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* ─── Step indicator ─────────────────────────────────────────── */}
        <div className="potp-steps">
          <StepDot n={1} />
          <StepLine done={step > 1} />
          <StepDot n={2} />
          <StepLine done={step > 2} />
          <StepDot n={3} />
        </div>
        <div className="potp-steps-labels">
          <span className={step === 1 ? 'active' : ''}>Phone</span>
          <span className={step === 2 ? 'active' : ''}>Verify</span>
          <span className={step === 3 ? 'active' : ''}>Profile</span>
        </div>

        {/* ─── Body ───────────────────────────────────────────────────── */}
        <div className="potp-body">

          {/* Alert messages */}
          {error && (
            <div className="potp-alert potp-alert--error" role="alert">
              <FaTimes className="potp-alert-icon" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="potp-alert potp-alert--success" role="status">
              <FaCheckCircle className="potp-alert-icon" />
              <span>{success}</span>
            </div>
          )}

          {/* ══════════ STEP 1 – Phone number ══════════ */}
          {step === 1 && (
            <form className="potp-form" onSubmit={handleSendOTP} noValidate>
              <div className="potp-step-heading">
                <div className="potp-step-icon-circle">
                  <FaMobileAlt />
                </div>
                <div>
                  <h2 className="potp-step-title">Enter your mobile number</h2>
                  <p className="potp-step-desc">We'll send a 6-digit OTP to verify your phone</p>
                </div>
              </div>

              <div className="potp-phone-field">
                <div className="potp-country-badge">
                  <span className="potp-flag">🇮🇳</span>
                  <span className="potp-country-code">+91</span>
                </div>
                <input
                  className="potp-phone-input"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  value={phone.replace(/^\+91/, '').replace(/\D/g, '')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setPhone(raw);
                    clearMessages();
                  }}
                  autoFocus
                  required
                />
              </div>

              <p className="potp-terms">
                By continuing, you agree to our{' '}
                <a href="/terms" onClick={onClose}>Terms of Service</a> and{' '}
                <a href="/privacy" onClick={onClose}>Privacy Policy</a>.
              </p>

              <button
                className="potp-btn potp-btn--primary"
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length < 10}
              >
                {loading
                  ? <><FaSpinner className="potp-spin" /> Sending OTP…</>
                  : <>Get OTP <span className="potp-btn-arrow">→</span></>
                }
              </button>
            </form>
          )}

          {/* ══════════ STEP 2 – OTP entry ══════════ */}
          {step === 2 && (
            <form className="potp-form" onSubmit={handleVerifyOTP} noValidate>
              <button
                type="button"
                className="potp-back-btn"
                onClick={() => { setStep(1); setOtp(['','','','','','']); clearMessages(); }}
              >
                <FaArrowLeft /> Back
              </button>

              <div className="potp-step-heading">
                <div className="potp-step-icon-circle potp-step-icon-circle--green">
                  <FaLock />
                </div>
                <div>
                  <h2 className="potp-step-title">Verify OTP</h2>
                  <p className="potp-step-desc">
                    Enter the 6-digit code sent to{' '}
                    <strong>+91 {phone.replace(/\D/g, '').slice(-10)}</strong>
                  </p>
                </div>
              </div>

              <div className="potp-otp-boxes" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    className={`potp-otp-box ${digit ? 'filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    autoFocus={idx === 0}
                    aria-label={`OTP digit ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="potp-resend-row">
                {resendCD > 0 ? (
                  <span className="potp-resend-timer">
                    Resend OTP in <strong>{resendCD}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="potp-resend-btn"
                    onClick={() => { setOtp(['','','','','','']); clearMessages(); handleSendOTP(); }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                className="potp-btn potp-btn--primary"
                type="submit"
                disabled={loading || otp.some(d => d === '')}
              >
                {loading
                  ? <><FaSpinner className="potp-spin" /> Verifying…</>
                  : 'Verify & Continue'
                }
              </button>
            </form>
          )}

          {/* ══════════ STEP 3 – Profile (new users) ══════════ */}
          {step === 3 && (
            <form className="potp-form" onSubmit={handleRegister} noValidate>
              <div className="potp-step-heading">
                <div className="potp-step-icon-circle potp-step-icon-circle--orange">
                  <FaUser />
                </div>
                <div>
                  <h2 className="potp-step-title">Complete your profile</h2>
                  <p className="potp-step-desc">Just a few details to set up your account</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="potp-field">
                <label htmlFor="potp-name">Full Name</label>
                <div className="potp-input-wrap">
                  <FaUser className="potp-input-icon" />
                  <input
                    id="potp-name"
                    type="text"
                    placeholder="Your full name"
                    required
                    autoFocus
                    minLength={2}
                    maxLength={100}
                    value={profile.name}
                    onChange={(e) => { setProfile(p => ({ ...p, name: e.target.value })); clearMessages(); }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="potp-field">
                <label htmlFor="potp-email">Email Address</label>
                <div className="potp-input-wrap">
                  <FaEnvelope className="potp-input-icon" />
                  <input
                    id="potp-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={profile.email}
                    onChange={(e) => { setProfile(p => ({ ...p, email: e.target.value })); clearMessages(); }}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="potp-field">
                <label htmlFor="potp-address">Delivery Address</label>
                <div className="potp-input-wrap potp-input-wrap--textarea">
                  <FaMapMarkerAlt className="potp-input-icon potp-input-icon--top" />
                  <textarea
                    id="potp-address"
                    placeholder="House no., Street, City, State – Pincode"
                    required
                    rows={3}
                    maxLength={300}
                    value={profile.address}
                    onChange={(e) => { setProfile(p => ({ ...p, address: e.target.value })); clearMessages(); }}
                  />
                </div>
              </div>

              <button
                className="potp-btn potp-btn--primary"
                type="submit"
                disabled={loading || !profile.name || !profile.email || !profile.address}
              >
                {loading
                  ? <><FaSpinner className="potp-spin" /> Creating account…</>
                  : <>Create Account &amp; Shop <span className="potp-btn-arrow">→</span></>
                }
              </button>
            </form>
          )}

          {/* Trust badges */}
          <div className="potp-trust-row">
            <span className="potp-trust-badge"><FaShieldAlt /> Secure</span>
            <span className="potp-trust-badge">🔒 Encrypted</span>
            <span className="potp-trust-badge">✅ Trusted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneOTPLoginPopup;
