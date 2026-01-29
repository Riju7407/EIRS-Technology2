import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Hide footer on admin pages, product pages, cart page, and services page
  if (location.pathname.startsWith('/admin/') || location.pathname === '/cart' || location.pathname.startsWith('/products') || location.pathname.startsWith('/services')) {
    return null;
  }

  return (
    <footer className="footer-wrapper">
      {/* Main Footer */}
      <div className="footer-main-content">
        <div className="footer-content-wrapper">
          {/* Left Section - Company Info */}
          <div className="footer-section footer-company">
            <div className="footer-brand">
              <h3 className="footer-brand-name">EIRS Technology</h3>
              <p className="footer-brand-subtitle">Security Solutions</p>
            </div>
            <p className="footer-description">
              Your trusted partner for advanced security systems, CCTV cameras, and smart automation solutions. Protecting what matters most to you.
            </p>
            <div className="footer-social">
              <a href="#facebook" className="social-icon" title="Facebook">
                <FaFacebook />
              </a>
              <a href="#twitter" className="social-icon" title="Twitter">
                <FaTwitter />
              </a>
              <a href="#linkedin" className="social-icon" title="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="https://www.instagram.com/technologyeirs/" className="social-icon" title="Instagram" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Center Left - Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-menu">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Center Right - Services */}
          <div className="footer-section">
            <h4 className="footer-title">Services</h4>
            <ul className="footer-menu">
              <li><a href="#installation">Installation</a></li>
              <li><a href="#maintenance">Maintenance</a></li>
              <li><a href="#support">Technical Support</a></li>
              <li><a href="#training">Training</a></li>
            </ul>
          </div>

          {/* Right Section - Contact Info */}
          <div className="footer-section footer-contact">
            <h4 className="footer-title">Get In Touch</h4>
            <div className="contact-block">
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <div className="contact-text">
                  <p className="contact-label">Call Us</p>
                  <a href="tel:+918707095798">+91 8707-095-798</a>
                </div>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <div className="contact-text">
                  <p className="contact-label">Email</p>
                  <a href="mailto:info@eirstechnology.com">info@eirstechnology.com</a>
                </div>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <div className="contact-text">
                  <p className="contact-label">Location</p>
                  <p className="contact-value">New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">&copy; {currentYear} EIRS Technology. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
            <Link to="#">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
