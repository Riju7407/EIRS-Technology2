import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLocationArrow, FaSpinner } from 'react-icons/fa';
import { authService } from '../services/api';
import '../styles/AuthPages.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
     city: '',
  state: '',
  pincode: '',
    password: '',
    confirmPassword: '',
  });

  const handleAutoDetectLocation = async () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const p = data.address || {};
          const parts = [
            p.road || p.hamlet || p.village,
            p.suburb || p.neighbourhood,
            p.city || p.town || p.county,
            p.state,
            p.postcode,
          ].filter(Boolean);
          const resolved = parts.join(', ') || data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setFormData(prev => ({
  ...prev,
  address: resolved,
  city: p.city || p.town || p.village || p.county || '',
  state: p.state || '',
  pincode: p.postcode || '',
}));
        } catch {
          setGeoError('Could not fetch address. Please type it manually.');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location access denied. Please type your address manually.');
        } else {
          setGeoError('Unable to detect location. Please type your address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic client-side validation
    if (!formData.city.trim()) {
  setError('City is required');
  setLoading(false);
  return;
}

if (!formData.state.trim()) {
  setError('State is required');
  setLoading(false);
  return;
}

if (!/^\d{6}$/.test(formData.pincode)) {
  setError('Pincode must be 6 digits');
  setLoading(false);
  return;
}
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.name.length < 5) {
      setError('Full name must be at least 5 characters');
      setLoading(false);
      return;
    }

    const phoneDigits = formData.phoneNumber.replace(/[\s-]/g, '');
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      setError('Phone number must be 10-15 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signup(formData);
      
      if (response && response.success) {
        // Sign up successful, redirect to sign in
        navigate('/signin', { state: { message: 'Account created successfully! Please sign in.' } });
      } else {
        setError(response?.message || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = err?.message || 'Error during signup';
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p>Join us to get started with EIRS Technology</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  disabled={geoLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: geoLoading ? '#a0aec0' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: geoLoading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {geoLoading ? <FaSpinner style={{ animation: 'spin 0.9s linear infinite' }} /> : <FaLocationArrow />}
                  {geoLoading ? 'Detecting…' : 'Auto-Detect Location'}
                </button>
              </div>
              {geoError && (
                <p style={{ color: '#c53030', fontSize: '0.8rem', marginBottom: '6px' }}>{geoError}</p>
              )}
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Or type your address manually"
              />
            </div>

            <div className="form-group">
  <label htmlFor="city">City</label>
  <input
    type="text"
    id="city"
    name="city"
    value={formData.city}
    onChange={handleInputChange}
    required
    placeholder="Enter city"
  />
</div>
<div className="form-group">
  <label htmlFor="state">State</label>
  <input
    type="text"
    id="state"
    name="state"
    value={formData.state}
    onChange={handleInputChange}
    required
    placeholder="Enter state"
  />
</div>
<div className="form-group">
  <label htmlFor="pincode">Pincode</label>
  <input
    type="text"
    id="pincode"
    name="pincode"
    value={formData.pincode}
    onChange={handleInputChange}
    required
    placeholder="Enter pincode"
  />
</div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/signin">Sign In</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignUpPage;
