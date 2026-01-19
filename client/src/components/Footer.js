import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Hide footer on auth pages, admin pages, and product detail pages
  const hideFooterPaths = ['/signin', '/signup', '/admin/dashboard', '/admin/enquiries', '/admin/products'];
  const shouldHideFooter = hideFooterPaths.includes(location.pathname) || location.pathname.startsWith('/products/');

  if (shouldHideFooter) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container footer-container">
        {/* Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-title">EIRS Technology</h3>
            <p className="footer-description">
              Integrated Security & Automation Solutions for Homes & Businesses
            </p>
            <div className="partner-logos">
              <h4>Partners</h4>
              <div className="partners-grid">
                <img src="https://via.placeholder.com/100x50?text=Hikvision" alt="Hikvision" />
                <img src="https://via.placeholder.com/100x50?text=Dahua" alt="Dahua" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
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
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li><a href="#services">Installation</a></li>
              <li><a href="#services">AMC & Maintenance</a></li>
              <li><a href="#services">Consultation</a></li>
              <li><a href="#services">Support</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="contact-item">
              <FaPhone /> <span>+1 234-567-8900</span>
            </div>
            <div className="contact-item">
              <FaEnvelope /> <span>info@eirtech.com</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt /> <span>123 Tech Street, Tech City, TC 12345</span>
            </div>
            <div className="social-links">
              <a href="#facebook" className="social-link"><FaFacebook /></a>
              <a href="#twitter" className="social-link"><FaTwitter /></a>
              <a href="#linkedin" className="social-link"><FaLinkedin /></a>
              <a href="#instagram" className="social-link"><FaInstagram /></a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-legal">
            <Link to="/">Privacy Policy</Link>
            <span className="divider">|</span>
            <Link to="/">Terms of Service</Link>
            <span className="divider">|</span>
            <Link to="/">Sitemap</Link>
          </div>
          <div className="footer-copyright">
            <p>&copy; {currentYear} EIRS Technology. All rights reserved.</p>
          </div>
          <div className="footer-badges">
            <img src="https://via.placeholder.com/60x30?text=SSL" alt="SSL Secure" className="badge" />
            <img src="https://via.placeholder.com/60x30?text=ISO" alt="ISO Certified" className="badge" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
