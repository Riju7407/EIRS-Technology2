import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaMobileAlt } from 'react-icons/fa';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPages.css';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Tab: 'email' or 'mobile'
  const [loginMode, setLoginMode] = useState('email');

  // Email login state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Mobile OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [phoneToken, setPhoneToken] = useState('');
  const [regData, setRegData] = useState({ name: '', email: '', address: '' });
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // ─── Email Sign In ───────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signin(formData);
      if (response && response.success) {
        if (response.token) login(response.data, response.token);
        setTimeout(() => {
          if (response.data?.isAdmin) {
            navigate('/admin/dashboard', { state: { message: 'Logged in successfully as admin!' } });
          } else {
            navigate('/', { state: { message: 'Logged in successfully!' } });
          }
        }, 100);
      } else {
        setError(response?.message || 'Sign in failed');
      }
    } catch (err) {
      setError(err?.message || 'Error during sign in');
    } finally {
      setLoading(false);
    }
  };

  // ─── Send OTP via Fast2SMS ───────────────────────────────────
  const handleSendOTP = async () => {
    setError(''); setMessage(''); setLoading(true);

    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.sendFast2SMSOTP(digits);
      if (res.success) {
        setOtpSent(true);
        setIsNewUser(res.isNewUser);
        setMessage(res.message || 'OTP sent successfully!');
        setCountdown(30);
      } else {
        setError(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ─── Verify OTP ──────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    setError(''); setMessage(''); setLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const digits = phone.replace(/\D/g, '').slice(-10);
      const res = await authService.verifyFast2SMSOTP(digits, otp);

      if (res.success && !res.isNewUser) {
        // Existing user – logged in
        login(res.data, res.token);
        setTimeout(() => {
          if (res.data?.isAdmin) {
            navigate('/admin/dashboard', { state: { message: 'Logged in successfully!' } });
          } else {
            navigate('/', { state: { message: 'Logged in successfully!' } });
          }
        }, 100);
      } else if (res.success && res.isNewUser) {
        // New user – show registration form
        setIsNewUser(true);
        setPhoneToken(res.phoneToken);
        setMessage('Phone verified! Complete your profile below.');
      } else {
        setError(res.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Complete Registration (new mobile user) ─────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);

    if (!regData.name || !regData.email || !regData.address) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.registerWithFast2SMSOTP({
        phoneToken,
        name: regData.name,
        email: regData.email,
        address: regData.address,
      });

      if (res.success) {
        login(res.data, res.token);
        setTimeout(() => {
          navigate('/', { state: { message: res.message } });
        }, 100);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Reset mobile flow ──────────────────────────────────────
  const resetMobileFlow = () => {
    setOtpSent(false);
    setOtp('');
    setIsNewUser(false);
    setPhoneToken('');
    setRegData({ name: '', email: '', address: '' });
    setError('');
    setMessage('');
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Sign In</h1>
          <p>Welcome back to EIRS Technology</p>

          {/* ── Tab Switcher ─────────────────────────────────── */}
          <div style={{
            display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '1.2rem'
          }}>
            <button type="button" onClick={() => { setLoginMode('email'); resetMobileFlow(); setError(''); setMessage(''); }}
              style={{
                flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.95rem',
                background: loginMode === 'email' ? '#667eea' : 'transparent',
                color: loginMode === 'email' ? '#fff' : '#555',
                borderRadius: '6px 6px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.3s ease'
              }}>
              <FaEnvelope /> Email
            </button>
            <button type="button" onClick={() => { setLoginMode('mobile'); setError(''); setMessage(''); }}
              style={{
                flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.95rem',
                background: loginMode === 'mobile' ? '#667eea' : 'transparent',
                color: loginMode === 'mobile' ? '#fff' : '#555',
                borderRadius: '6px 6px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.3s ease'
              }}>
              <FaMobileAlt /> Mobile OTP
            </button>
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {/* ═══════════ EMAIL LOGIN ═══════════ */}
          {loginMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email}
                  onChange={handleInputChange} required placeholder="Enter your email" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                    value={formData.password} onChange={handleInputChange} required placeholder="Enter your password" />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label><input type="checkbox" name="remember" /> Remember me</label>
                <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
              </div>

              <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ═══════════ MOBILE OTP LOGIN ═══════════ */}
          {loginMode === 'mobile' && (
            <div className="auth-form">
              {/* Step 1: Enter phone number */}
              {!otpSent && !phoneToken && (
                <>
                  <div className="form-group">
                    <label htmlFor="phone">Mobile Number</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '0.7rem 0.6rem', border: '2px solid #667eea', borderRadius: '0.5rem',
                        background: '#f7f8fc', fontWeight: 600, fontSize: '0.95rem', color: '#333'
                      }}>+91</span>
                      <input type="tel" id="phone" value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                        placeholder="Enter 10-digit number" maxLength={10}
                        style={{ flex: 1 }} />
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary btn-large" disabled={loading || phone.length !== 10}
                    onClick={handleSendOTP}>
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </>
              )}

              {/* Step 2: Enter OTP */}
              {otpSent && !phoneToken && (
                <>
                  <div className="form-group">
                    <label>OTP sent to +91 {phone}</label>
                    <input type="text" value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      placeholder="Enter 6-digit OTP" maxLength={6}
                      style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.3rem', fontWeight: 700 }} />
                  </div>

                  <button type="button" className="btn btn-primary btn-large" disabled={loading || otp.length !== 6}
                    onClick={handleVerifyOTP}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <button type="button" onClick={resetMobileFlow}
                      style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 600 }}>
                      ← Change Number
                    </button>
                    <button type="button" disabled={countdown > 0 || loading}
                      onClick={handleSendOTP}
                      style={{ background: 'none', border: 'none', color: countdown > 0 ? '#999' : '#667eea', cursor: countdown > 0 ? 'default' : 'pointer', fontWeight: 600 }}>
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: New user registration form */}
              {phoneToken && isNewUser && (
                <form onSubmit={handleRegister}>
                  <p style={{ textAlign: 'center', color: '#28a745', fontWeight: 600, marginBottom: 12 }}>
                    ✓ Phone verified: +91 {phone}
                  </p>
                  <div className="form-group">
                    <label htmlFor="reg-name">Full Name</label>
                    <input type="text" id="reg-name" name="name" value={regData.name}
                      onChange={handleRegChange} required placeholder="Enter your full name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-email">Email Address</label>
                    <input type="email" id="reg-email" name="email" value={regData.email}
                      onChange={handleRegChange} required placeholder="Enter your email" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-address">Address</label>
                    <input type="text" id="reg-address" name="address" value={regData.address}
                      onChange={handleRegChange} required placeholder="Enter your address" />
                  </div>
                  <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account & Sign In'}
                  </button>
                  <button type="button" onClick={resetMobileFlow}
                    style={{ marginTop: 10, width: '100%', background: 'none', border: '1px solid #667eea', borderRadius: 6, padding: 8, color: '#667eea', cursor: 'pointer', fontWeight: 600 }}>
                    ← Start Over
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignInPage;
