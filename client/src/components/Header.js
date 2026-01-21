import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import { authService } from '../services/api';
import '../styles/Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in only on component mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAdmin(userData.isAdmin || false);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoggedIn(false);
      }
    } else if (token) {
      checkAuthStatus();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
      setIsAdmin(userData.isAdmin || false);
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      setIsAdmin(false);
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
            {isLoggedIn && user ? (
              <>
                {isAdmin && <span className="admin-badge">Admin</span>}
                <div className="user-profile">
                  <FaUser className="profile-icon" />
                  <span className="username">{user.name || user.email}</span>
                </div>
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
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="nav-link admin-link">Dashboard</Link>
                <Link to="/admin/products" className="nav-link admin-link">Manage Products</Link>
                <Link to="/admin/services" className="nav-link admin-link">Manage Services</Link>
                <Link to="/admin/enquiries" className="nav-link admin-link">Manage Enquiries</Link>
              </>
            )}
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
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="nav-link-mobile admin-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/admin/products" className="nav-link-mobile admin-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Manage Products
                </Link>
                <Link to="/admin/services" className="nav-link-mobile admin-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Manage Services
                </Link>
                <Link to="/admin/enquiries" className="nav-link-mobile admin-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Manage Enquiries
                </Link>
              </>
            )}
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
