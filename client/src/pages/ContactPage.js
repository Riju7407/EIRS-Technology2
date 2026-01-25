import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaClock } from 'react-icons/fa';
import { contactService } from '../services/api';
import '../styles/ContactPage.css';

const ContactPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!user && !!token);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await contactService.submitContact(formData);
      
      if (response.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          subject: '',
          message: '',
        });
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.message || 'Error submitting form');
      }
    } catch (err) {
      // If 401 Unauthorized, suggest signing in
      if (err.status === 401 || err.response?.status === 401) {
        setError('Please sign in to submit the contact form');
      } else {
        setError(err.message || 'Error submitting form. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact-page">
      <div className="container contact-container">
        {/* Login Required Message */}
        {!isLoggedIn ? (
          <section className="login-required-section" style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '2px solid #e5e7eb'
          }}>
            <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>Sign in to Contact Us</h2>
            <p style={{ marginBottom: '24px', color: '#6b7280', fontSize: '1.05rem' }}>
              Please log in to your account to submit a contact form. This helps us provide better support and track your inquiries.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signin" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-secondary" style={{ padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', textDecoration: 'none', borderRadius: '0.5rem' }}>
                Create Account
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* Contact Information */}
            <section className="contact-info-section">
          <h2>Contact Information</h2>
          
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">
                <FaPhone />
              </div>
              <h3>Phone</h3>
              <p>+91 8707-095-798</p>
              <p className="hours"><FaClock style={{marginRight: '8px'}} />Mon - Fri, 9am to 6pm</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaEnvelope />
              </div>
              <h3>Email</h3>
              <p>contact@eirstechnology.com</p>
              <p className="hours"><FaClock style={{marginRight: '8px'}} />We'll respond within 24 hours</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Address</h3>
              <p>123 Tech Street</p>
              <p>Tech City, TC 12345</p>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="contact-form-section">
          <h2>Send us a Message</h2>

          {success && (
            <div className="alert alert-success">
              ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              ✗ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-intro">
              <p>Fill out the form below and we'll get back to you as soon as possible. All fields are required.</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                  minLength="2"
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 (234) 567-8900"
                  pattern="[0-9+\-\s()]*"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">
                  Subject <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Installation Inquiry"
                  maxLength="100"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="message">
                Message <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="2"
                placeholder="Tell us about your requirements, project details, or any questions you have..."
                minLength="10"
                maxLength="1000"
              ></textarea>
              <span className="char-count">{formData.message.length}/1000 characters</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Send Message
                </>
              )}
            </button>
          </form>
        </section>
          </>
        )}
      </div>
    </main>
  );
};

export default ContactPage;
