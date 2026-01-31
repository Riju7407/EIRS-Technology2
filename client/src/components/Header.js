import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaShoppingCart, FaBox, FaSearch, FaHome, FaServicestack, FaBoxes, FaPhone, FaInfoCircle, FaChevronDown } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import '../styles/Header_Flipkart.css';

// Header component with auth context integration
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isLoggedIn, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  const { getTotalItems, clearCart } = useCart();
  const { toggleSidebar } = useCategoryFilter();
  const totalItems = getTotalItems();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar - HIDDEN */}

      {/* Main Header */}
      <header className={`sticky-header ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="container header-container">
          {/* Left Section: Categories Hamburger, Mobile Menu, and Logo */}
          <div className="header-left-section">
            {/* Categories & Filters Hamburger (Left) */}
            {!isAdmin && (
              <div className="categories-hamburger" onClick={toggleSidebar} title="Categories & Filters">
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
              </div>
            )}

            {/* Hamburger Menu (Left) - Mobile Navigation */}
            <div className="hamburger-menu-left" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </div>

            {/* Logo */}
            <Link to="/" className="logo">
              <div className="logo-content">
                <img src="/EIRSLogo.png" alt="EIRS Technology" className="logo-icon" />
                <h1>EIRS Technology</h1>
              </div>
            </Link>
          </div>

          {/* Search Bar (Center - E-commerce style) */}
          {!isAdmin && (
            <form className="search-bar-main" onSubmit={handleSearch}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-main"
              />
              <button type="submit" className="search-button-main">Search</button>
            </form>
          )}

          {/* Right Actions */}
          <div className="header-actions">
            {!isAdmin && isLoggedIn && (
              <Link to="/cart" className="action-item cart-item">
                <FaShoppingCart />
                {totalItems > 0 && <span className="action-badge">{totalItems}</span>}
                <span className="action-label">Cart</span>
              </Link>
            )}

            {isLoggedIn && !isAdmin && (
              <Link to="/orders" className="action-item">
                <FaBox />
                <span className="action-label">Orders</span>
              </Link>
            )}

            {/* User Account Hamburger Menu */}
            <div className="user-account-hamburger" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
              <div className="user-menu-trigger">
                <FaUser className="user-icon" />
                <FaChevronDown className="chevron-icon" />
              </div>
              
              {isUserMenuOpen && (
                <div className="user-dropdown-menu">
                  {!isLoggedIn ? (
                    <div className="auth-buttons-container">
                      <Link to="/signin" className="dropdown-link signin-link" onClick={() => setIsUserMenuOpen(false)}>
                        Sign In
                      </Link>
                      <Link to="/signup" className="dropdown-link signup-link" onClick={() => setIsUserMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="dropdown-header">
                        {user?.name && <span className="user-name">{user.name}</span>}
                        {user?.email && <span className="user-email">{user.email}</span>}
                      </div>
                      <hr className="dropdown-divider" />
                      <Link to="/account" className="dropdown-link" onClick={() => setIsUserMenuOpen(false)}>
                        My Account
                      </Link>
                      <Link to="/orders" className="dropdown-link" onClick={() => setIsUserMenuOpen(false)}>
                        My Orders
                      </Link>
                      <Link to="/wishlist" className="dropdown-link" onClick={() => setIsUserMenuOpen(false)}>
                        Wishlist
                      </Link>
                      <hr className="dropdown-divider" />
                      <button className="dropdown-link logout-link" onClick={() => {
                        logout();
                        clearCart();
                        setIsUserMenuOpen(false);
                        navigate('/');
                      }}>
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation - Below Header */}
        <nav className="nav-desktop-bar">
          <div className="container nav-container">
            <Link to="/" className="nav-link">Home</Link>
            {!isAdmin && (
              <>
                <Link to="/products" className="nav-link">Products</Link>
                <Link to="/services" className="nav-link">Services</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="nav-link admin-link">Dashboard</Link>
                <Link to="/admin/products" className="nav-link admin-link">Products</Link>
                <Link to="/admin/services" className="nav-link admin-link">Services</Link>
                <Link to="/admin/orders" className="nav-link admin-link">Orders</Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Sidebar Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-sidebar-menu">
            <div className="sidebar-header">
              <h3>Menu</h3>
              <FaTimes onClick={closeMobileMenu} className="close-btn" />
            </div>

            <nav className="sidebar-nav">
              <Link to="/" className="sidebar-link" onClick={closeMobileMenu}>
                <FaHome /> Home
              </Link>
              {!isAdmin && (
                <>
                  <Link to="/products" className="sidebar-link" onClick={closeMobileMenu}>
                    Products
                  </Link>
                  <Link to="/services" className="sidebar-link" onClick={closeMobileMenu}>
                    Services
                  </Link>
                  <Link to="/about" className="sidebar-link" onClick={closeMobileMenu}>
                    About
                  </Link>
                  <Link to="/contact" className="sidebar-link" onClick={closeMobileMenu}>
                    Contact
                  </Link>
                  <hr />
                  {isLoggedIn && (
                    <>
                      <Link to="/orders" className="sidebar-link" onClick={closeMobileMenu}>
                        <FaBox /> My Orders
                      </Link>
                      <button className="sidebar-link logout-link" onClick={() => {
                        logout();
                        clearCart();
                        closeMobileMenu();
                        navigate('/');
                      }}>
                        Logout
                      </button>
                    </>
                  )}
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className="sidebar-link admin-link" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                  <Link to="/admin/products" className="sidebar-link admin-link" onClick={closeMobileMenu}>
                    Manage Products
                  </Link>
                  <Link to="/admin/services" className="sidebar-link admin-link" onClick={closeMobileMenu}>
                    Manage Services
                  </Link>
                  <Link to="/admin/orders" className="sidebar-link admin-link" onClick={closeMobileMenu}>
                    Manage Orders
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
