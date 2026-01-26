import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaHeadset } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Hide footer on admin pages, services page, cart page, and product-related pages
  const hideFooterPaths = ['/services', '/cart'];
  const isProductPage = location.pathname.startsWith('/products');
  
  if (location.pathname.startsWith('/admin/') || hideFooterPaths.includes(location.pathname) || isProductPage) {
    return null;
  }

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container footer-container">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <h3 className="footer-title">EIRS Technology</h3>
              <p className="footer-tagline">Smart Security Solutions</p>
            </div>
            <p className="footer-description">
              Integrated Security & Automation Solutions for Homes & Businesses. Trusted by thousands of customers.
            </p>
            <div className="social-links">
              <a href="#facebook" className="social-link" title="Facebook"><FaFacebook /></a>
              <a href="#twitter" className="social-link" title="Twitter"><FaTwitter /></a>
              <a href="#linkedin" className="social-link" title="LinkedIn"><FaLinkedin /></a>
              <a href="https://www.instagram.com/technologyeirs/" className="social-link" title="Instagram"><FaInstagram /></a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="footer-section">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4 className="footer-heading">Our Services</h4>
            <ul className="footer-links">
              <li><a href="#installation">Installation & Setup</a></li>
              <li><a href="#maintenance">AMC & Maintenance</a></li>
              <li><a href="#consultation">Expert Consultation</a></li>
              <li><a href="#support">Technical Support</a></li>
              <li><a href="#training">Training Programs</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-heading">Get In Touch</h4>
            <div className="contact-items">
              {!location.pathname.startsWith('/products') && (
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <div>
                    <p className="contact-label">Phone</p>
                    <a href="tel:+918707095798">+91 8707-095-798</a>
                  </div>
                </div>
              )}
              {!location.pathname.startsWith('/products') && (
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <p className="contact-label">Email</p>
                    <a href="mailto:contact@eirstechnology.com">contact@eirstechnology.com</a>
                  </div>
                </div>
              )}
              <div className="contact-item">
                <FaHeadset className="contact-icon" />
                <div>
                  <p className="contact-label">Support</p>
                  <a href="mailto:contact@eirstechnology.com">contact@eirstechnology.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="footer-info-bar">
        <div className="container info-container">
          <div className="info-item">
            <FaClock />
            <div>
              <span className="info-label">Hours</span>
              <span className="info-text">Mon - Fri: 9:00 AM - 6:00 PM</span>
            </div>
          </div>
          <div className="info-item">
            <FaMapMarkerAlt />
            <div>
              <span className="info-label">Location</span>
              <span className="info-text">553/135 Upper No 9. Bhairaw Complex, Alambagh Bus Stop Lucknow</span>
            </div>
          </div>
          <div className="info-item">
            <img src="/.hikvision.png" alt="Hikvision Partner" className="partner-img" />
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container bottom-container">
          <div className="footer-legal">
            <Link to="/">Privacy Policy</Link>
            <span className="divider">•</span>
            <Link to="/">Terms of Service</Link>
            <span className="divider">•</span>
            <Link to="/">Sitemap</Link>
          </div>
          <div className="footer-copyright">
            <p>&copy; {currentYear} EIRS Technology. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
