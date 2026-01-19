import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaPhone, FaEnvelope } from 'react-icons/fa';
import { authService } from '../services/api';
import '../styles/Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in by trying to fetch user data
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await authService.getUser();
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggedIn(false);
      navigate('/');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-left">
            <span className="contact-info">
              <FaPhone /> +1 234-567-8900
            </span>
            <span className="contact-info">
              <FaEnvelope /> info@eirtech.com
            </span>
          </div>
          <div className="top-bar-right">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="top-link">Profile</Link>
                <button className="top-link logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="top-link">Sign In</Link>
                <Link to="/signup" className="top-link">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky-header ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="container header-container">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-text">
              <h1>EIRS</h1>
              <p>Technology</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/services" className="nav-link">Services</Link>
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>

          {/* CTA Button */}
          <Link to="/contact" className="cta-button">
            Get a Quote
          </Link>

          {/* Mobile Menu Toggle */}
          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="nav-mobile">
            <Link to="/" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/about" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
              About
            </Link>
            <Link to="/services" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
              Services
            </Link>
            <Link to="/products" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
              Products
            </Link>
            <Link to="/contact" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
              Contact
            </Link>
            {!isLoggedIn && (
              <>
                <Link to="/signin" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/signup" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
