import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaShoppingCart, FaBox, FaShieldAlt, FaSearch } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

// Header component with auth context integration
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoggedIn, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems, clearCart } = useCart();
  const totalItems = getTotalItems();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-left">
          </div>
          <div className="top-bar-right">
            {isLoggedIn && user ? (
              <>
                {isAdmin && <span className="admin-badge">Admin</span>}
                {!isAdmin && (
                  <Link to="/cart" className="cart-icon-link">
                    <FaShoppingCart className="cart-icon" />
                    {totalItems > 0 && (
                      <span className="cart-badge">{totalItems}</span>
                    )}
                  </Link>
                )}
                {!isAdmin && <Link to="/orders" className="top-link orders-link"><FaBox /> My Orders</Link>}
                <div className="user-profile">
                  <FaUser className="profile-icon" />
                  <span className="username">{user.name || user.email}</span>
                </div>
                <button className="top-link logout-btn" onClick={() => {
                  logout();
                  clearCart();
                  navigate('/');
                }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/cart" className="cart-icon-link">
                  <FaShoppingCart className="cart-icon" />
                  {totalItems > 0 && (
                    <span className="cart-badge">{totalItems}</span>
                  )}
                </Link>
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
            <div className="logo-content">
              <img src="/EIRSLogo.png" alt="EIRS Technology" className="logo-icon" />
              <h1>EIRS Technology</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <Link to="/" className="nav-link">Home</Link>
            {!isAdmin && (
              <>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/services" className="nav-link">Services</Link>
                <Link to="/products" className="nav-link">Products</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="nav-link admin-link">Dashboard</Link>
                <Link to="/admin/products" className="nav-link admin-link">Manage Products</Link>
                <Link to="/admin/services" className="nav-link admin-link">Manage Services</Link>
                <Link to="/admin/enquiries" className="nav-link admin-link">Manage Enquiries</Link>
                <Link to="/admin/orders" className="nav-link admin-link">Manage Orders</Link>
              </>
            )}
          </nav>

          {/* Search Bar */}
          {!isAdmin && (
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products & services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <FaSearch />
              </button>
            </form>
          )}

          {/* CTA Button */}
          {!isAdmin && (
            <Link to="/contact" className="cta-button">
              Get a Quote
            </Link>
          )}

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
            {!isAdmin && (
              <>
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
              </>
            )}
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
                <Link to="/admin/orders" className="nav-link-mobile admin-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Manage Orders
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
