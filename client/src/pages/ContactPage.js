import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaClock,
  FaTimes, FaSignInAlt, FaUserPlus, FaHeadset, FaShieldAlt,
  FaCheckCircle, FaWhatsapp, FaArrowRight, FaChevronRight
} from 'react-icons/fa';
import { contactService } from '../services/api';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import CategorySidebar from '../components/CategorySidebar';
import LocationPicker from '../components/LocationPicker';
import Footer from '../components/Footer';
import '../styles/ContactPage.css';

const INFO_CARDS = [
  {
    icon: <FaPhone />,
    label: 'Call Us',
    value: '+91 8707-095-798',
    sub: 'Mon – Sat, 9am – 7pm',
    color: '#667eea',
  },
  {
    icon: <FaEnvelope />,
    label: 'Email Us',
    value: 'contact@eirstechnology.com',
    sub: 'Reply within 24 hours',
    color: '#43e97b',
  },
  {
    icon: <FaMapMarkerAlt />,
    label: 'Visit Us',
    value: 'Lucknow, Uttar Pradesh',
    sub: 'India – 226001',
    color: '#f093fb',
  },
  
];

const ContactPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ name: '', phoneNumber: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { isSidebarOpen, closeSidebar } = useCategoryFilter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!user && !!token);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate location field (LocationPicker is a custom component, so check manually)
    if (!formData.location || formData.location.trim().length < 3) {
      setError('Please provide your location (use Auto-Detect or type it manually).');
      setLoading(false);
      return;
    }

    try {
      const response = await contactService.submitContact(formData);
      if (response.success) {
        setSuccess(true);
        setFormData({ name: '', phoneNumber: '', location: '', description: '' });
        setTimeout(() => setSuccess(false), 6000);
      } else {
        setError(response.message || 'Error submitting form');
      }
    } catch (err) {
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
    <>
      {/* Sidebar */}
      <div className={`left-sidebar-filters ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Categories & Filters</h3>
          <button className="close-sidebar-btn" onClick={closeSidebar}><FaTimes /></button>
        </div>
        <CategorySidebar />
      </div>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <main className="cp-page">

        {/*  Hero  */}
        <section className="cp-hero">
          <div className="cp-hero-inner">
            <span className="cp-hero-badge">Get In Touch</span>
            <h1>We're Here to Help You</h1>
            <p>Have a question, need a quote, or want to discuss your security needs? Our expert team is ready to assist you — fast, friendly and professional.</p>
            <div className="cp-hero-actions">
              <a href="tel:+918707095798" className="cp-hero-btn cp-hero-btn--primary"><FaPhone /> Call Now</a>
              <a href="https://wa.me/918707095798" target="_blank" rel="noopener noreferrer" className="cp-hero-btn cp-hero-btn--outline"><FaWhatsapp /> WhatsApp</a>
            </div>
          </div>
        </section>

        {/*  Info Strip  */}
        <section className="cp-info-strip">
          <div className="cp-container">
            <div className="cp-info-grid">
              {INFO_CARDS.map((c, i) => (
                <div key={i} className="cp-info-card">
                  <div className="cp-info-icon" style={{ background: `${c.color}18`, color: c.color }}>{c.icon}</div>
                  <div className="cp-info-text">
                    <span className="cp-info-label">{c.label}</span>
                    <strong>{c.value}</strong>
                    <span className="cp-info-sub">{c.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*  Main Content  */}
        <section className="cp-main-section">
          <div className="cp-container">
            {!isLoggedIn ? (
              /*  Auth Wall  */
              <div className="cp-auth-wall">
                <div className="cp-auth-left">
                  <div className="cp-auth-icon"><FaHeadset /></div>
                  <h2>Sign In to Send Us a Message</h2>
                  <p>Create a free account or sign in to submit your enquiry. We'll respond within 24 hours with a personalised solution for your needs.</p>
                  <ul className="cp-auth-perks">
                    <li><FaCheckCircle /> Track the status of your enquiry</li>
                    <li><FaCheckCircle /> Get faster, personalised support</li>
                    <li><FaShieldAlt /> Your data is 100% secure</li>
                    <li><FaCheckCircle /> Receive exclusive offers and updates</li>
                  </ul>
                  <div className="cp-auth-btns">
                    <Link to="/signin" className="cp-auth-btn cp-auth-btn--signin"><FaSignInAlt /> Sign In</Link>
                    <Link to="/signup" className="cp-auth-btn cp-auth-btn--signup"><FaUserPlus /> Create Account</Link>
                  </div>
                </div>
                <div className="cp-auth-right">
                  <div className="cp-auth-card-preview">
                    <span className="cp-preview-tag">Contact Form Preview</span>
                    <div className="cp-preview-field"><span>Full Name</span></div>
                    <div className="cp-preview-field"><span>Phone Number</span></div>
                    <div className="cp-preview-field"><span>Your Location</span></div>
                    <div className="cp-preview-field cp-preview-field--tall"><span>Your Message / Requirements</span></div>
                    <div className="cp-preview-btn"><FaPaperPlane /> Send Message</div>
                    <div className="cp-preview-lock"><FaShieldAlt /> Sign in required to submit</div>
                  </div>
                </div>
              </div>
            ) : (
              /*  Contact Form (logged in)  */
              <div className="cp-form-wrap">
                <div className="cp-form-left">
                  <span className="cp-section-badge">Write to Us</span>
                  <h2>Send Us a Message</h2>
                  <p>Fill in the form and our team will reach out to you with the best solution for your requirements.</p>

                  <div className="cp-form-assurance">
                    <div className="cp-assure-item"><FaCheckCircle /> Quick 24-hour response</div>
                    <div className="cp-assure-item"><FaShieldAlt /> Completely confidential</div>
                    <div className="cp-assure-item"><FaHeadset /> Dedicated support team</div>
                  </div>

                  <div className="cp-sidebar-contact">
                    <a href="tel:+918707095798" className="cp-sc-link"><FaPhone /> +91 8707-095-798</a>
                    <a href="mailto:contact@eirstechnology.com" className="cp-sc-link"><FaEnvelope /> contact@eirstechnology.com</a>
                    <a href="https://wa.me/918707095798" target="_blank" rel="noopener noreferrer" className="cp-sc-link cp-sc-link--wa"><FaWhatsapp /> Chat on WhatsApp</a>
                  </div>
                </div>

                <div className="cp-form-right">
                  {success && (
                    <div className="cp-alert cp-alert--success">
                      <FaCheckCircle /> Message sent successfully! We'll get back to you within 24 hours.
                    </div>
                  )}
                  {error && (
                    <div className="cp-alert cp-alert--error">
                      <FaTimes /> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="cp-form">
                    <div className="cp-form-row">
                      <div className="cp-form-group">
                        <label htmlFor="name">Full Name <span>*</span></label>
                        <input
                          type="text" id="name" name="name"
                          value={formData.name} onChange={handleInputChange}
                          required placeholder="Enter your full name"
                          minLength="2" maxLength="100"
                        />
                      </div>
                      <div className="cp-form-group">
                        <label htmlFor="phoneNumber">Phone Number <span>*</span></label>
                        <input
                          type="tel" id="phoneNumber" name="phoneNumber"
                          value={formData.phoneNumber} onChange={handleInputChange}
                          required placeholder="+91 XXXXX XXXXX"
                          pattern="[0-9+\-\s()]*"
                        />
                      </div>
                    </div>

                    <div className="cp-form-group">
                      <label htmlFor="location">Your Location <span>*</span></label>
                      {/* LocationPicker: auto-detects GPS, shows OpenStreetMap,
                          reverse-geocodes via Nominatim, and saves coords to backend */}
                      <LocationPicker
                        value={formData.location}
                        onChange={(resolvedAddress) =>
                          setFormData(prev => ({ ...prev, location: resolvedAddress }))
                        }
                      />
                    </div>

                    <div className="cp-form-group">
                      <label htmlFor="description">Message / Requirements <span>*</span></label>
                      <textarea
                        id="description" name="description"
                        value={formData.description} onChange={handleInputChange}
                        required rows="5"
                        placeholder="Describe your security requirements or leave us a message..."
                        minLength="10" maxLength="1000"
                      />
                    </div>

                    <button type="submit" className="cp-submit-btn" disabled={loading}>
                      {loading ? (
                        <><span className="cp-spinner" /> Sending...</>
                      ) : (
                        <><FaPaperPlane /> Send Message</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>

        {/*  Map / Location CTA  */}
        <section className="cp-map-section">
          <div className="cp-container">
            <div className="cp-map-inner">
              <div className="cp-map-text">
                <span className="cp-section-badge">Our Location</span>
                <h2>Find Us in Lucknow</h2>
                <p>We serve clients across all major cities in Uttar Pradesh and pan-India for enterprise projects.</p>
                <div className="cp-map-detail">
                  <FaMapMarkerAlt /> Lucknow, Uttar Pradesh – 226001
                </div>
                <a
                  href="https://maps.app.goo.gl/2YBiPuWHPuWVvSsd6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-map-btn"
                >
                  Open in Google Maps <FaArrowRight />
                </a>
              </div>
              <div className="cp-map-frame">
                <iframe
                  title="EIRS Technology Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14242.575744298869!2d80.89042695541991!3d26.819463900000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bff0d7fa113c3%3A0xcec32720b820cb74!2sEIRS%20TECHNOLOGY%7C%20CCTV%20CAMERA%20INSTALLATION%20REPAIR%20SERVICES%20IN%20LUCKNOW%7C%20COMPUTER%20NETWORKING%7C%20BIOMETRIC%7C%20INTERCOM-LANDLINE%7C%20AMC!5e0!3m2!1sen!2sin!4v1772876390908!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default ContactPage;
