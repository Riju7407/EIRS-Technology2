import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { contactService } from '../services/api';
import '../styles/ContactPage.css';

const ContactPage = () => {
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
      <div className="contact-header">
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="container contact-container">
        {/* Contact Information */}
        <section className="contact-info-section">
          <h2>Contact Information</h2>
          
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">
                <FaPhone />
              </div>
              <h3>Phone</h3>
              <p>+1 234-567-8900</p>
              <p className="hours">Mon - Fri, 9am to 6pm</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <FaEnvelope />
              </div>
              <h3>Email</h3>
              <p>info@eirtech.com</p>
              <p className="hours">We'll respond within 24 hours</p>
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 234-567-8900"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="How can we help?"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="6"
                placeholder="Tell us about your requirements..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <FaPaperPlane /> Send Message
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      {/* Map Section */}
      <section className="map-section">
        <h2>Find Us</h2>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890123!2d-74.0!3d40.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjQzIEZha2UgU3QsIEZha2UgQ2l0eSwgRksgMTIzNDU!5e0!3m2!1sen!2sus!4v1234567890"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="EIRS Technology Location"
          ></iframe>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
