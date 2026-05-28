import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaPhone,
  FaConciergeBell,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaSignOutAlt,
  FaStore,
  FaBell,
  FaChevronDown,
  FaTags,
  FaLayerGroup,
  
} from 'react-icons/fa';
import '../styles/AdminLayout.css';

const NAV_ITEMS = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: <FaTachometerAlt /> },
    ],
  },
 {
  section: 'Catalogue',
  items: [
    {
      label: 'Products',
      to: '/admin/products',
      icon: <FaBox />,
    },

    {
      label: 'Categories',
      to: '/admin/categories',
      icon: <FaTags />,
    },

    // ✅ SUBCATEGORIES PAGE
    {
      label: 'Subcategories',
      to: '/admin/subcategories',
      icon: <FaTags />,
    },

    {
      label: 'Services',
      to: '/admin/services',
      icon: <FaConciergeBell />,
    },
  ],
},
  {
    section: 'Sales',
    items: [
      { label: 'Orders', to: '/admin/orders', icon: <FaShoppingCart /> },
      { label: 'Enquiries', to: '/admin/enquiries', icon: <FaPhone /> },
    ],
  },
  {
    section: 'Customers',
    items: [
      { label: 'Users', to: '/admin/users', icon: <FaUsers /> },
    ],
  },
];

const AdminLayout = ({ children, pageTitle, breadcrumbs }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const userMenuRef = useRef(null);

  // Get stored admin user
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();
  const adminName = storedUser?.name || 'Admin';
  const adminEmail = storedUser?.email || '';
  const adminInitial = adminName.charAt(0).toUpperCase();

  // Clock tick every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (date) =>
    date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`al-root ${collapsed ? 'al-collapsed' : ''} ${mobileOpen ? 'al-mobile-open' : ''}`}>
      {/* ───────────────── SIDEBAR ───────────────── */}
      <aside className="al-sidebar">
        {/* Brand */}
        <div className="al-brand">
          <div className="al-brand-icon">
            <FaStore />
          </div>
          {!collapsed && (
            <div className="al-brand-text">
              <span className="al-brand-name">EIRS Admin</span>
              <span className="al-brand-sub">Control Panel</span>
            </div>
          )}
          <button
            className="al-collapse-btn desktop-only"
            onClick={() => setCollapsed((p) => !p)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FaChevronLeft className={collapsed ? 'al-flip' : ''} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="al-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.section} className="al-nav-section">
              {!collapsed && (
                <span className="al-nav-section-label">{section.section}</span>
              )}
              {section.items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`al-nav-link ${isActive ? 'al-nav-link--active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="al-nav-icon">{item.icon}</span>
                    {!collapsed && <span className="al-nav-label">{item.label}</span>}
                    {!collapsed && isActive && <span className="al-nav-active-dot" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom user info */}
        <div className="al-sidebar-footer">
          {!collapsed && (
            <div className="al-sidebar-user">
              <div className="al-avatar al-avatar--sm">{adminInitial}</div>
              <div className="al-sidebar-user-info">
                <span className="al-sidebar-user-name">{adminName}</span>
                <span className="al-sidebar-user-role">Administrator</span>
              </div>
            </div>
          )}
          <button className="al-logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="al-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ───────────────── MAIN ───────────────── */}
      <div className="al-main">
        {/* Top Header */}
        <header className="al-header">
          <div className="al-header-left">
            {/* Mobile menu toggle */}
            <button
              className="al-mobile-menu-btn mobile-only"
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Breadcrumb / page title */}
            <div className="al-page-info">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <nav className="al-breadcrumb">
                  <Link to="/admin/dashboard" className="al-breadcrumb-item al-breadcrumb-link">
                    Home
                  </Link>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                      <span className="al-breadcrumb-sep">/</span>
                      {crumb.to ? (
                        <Link to={crumb.to} className="al-breadcrumb-item al-breadcrumb-link">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="al-breadcrumb-item al-breadcrumb-current">
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              ) : (
                <nav className="al-breadcrumb">
                  <Link to="/admin/dashboard" className="al-breadcrumb-item al-breadcrumb-link">
                    Home
                  </Link>
                  {pageTitle && (
                    <>
                      <span className="al-breadcrumb-sep">/</span>
                      <span className="al-breadcrumb-item al-breadcrumb-current">{pageTitle}</span>
                    </>
                  )}
                </nav>
              )}
              {pageTitle && <h1 className="al-page-title">{pageTitle}</h1>}
            </div>
          </div>

          <div className="al-header-right">
            {/* Date */}
            <span className="al-header-date desktop-only">{formatDate(currentTime)}</span>

            {/* View Store */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="al-view-store-btn desktop-only"
              title="View Store"
            >
              <FaStore />
              <span>View Store</span>
            </a>

            {/* Notifications */}
            <button className="al-icon-btn" title="Notifications">
              <FaBell />
            </button>

            {/* User dropdown */}
            <div className="al-user-menu" ref={userMenuRef}>
              <button
                className="al-user-btn"
                onClick={() => setUserMenuOpen((p) => !p)}
              >
                <div className="al-avatar">{adminInitial}</div>
                <span className="al-user-name desktop-only">{adminName}</span>
                <FaChevronDown className={`al-user-chevron ${userMenuOpen ? 'open' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="al-user-dropdown">
                  <div className="al-user-dropdown-header">
                    <div className="al-avatar al-avatar--lg">{adminInitial}</div>
                    <div>
                      <p className="al-dropdown-name">{adminName}</p>
                      <p className="al-dropdown-email">{adminEmail}</p>
                      <span className="al-dropdown-badge">Administrator</span>
                    </div>
                  </div>
                  <div className="al-user-dropdown-divider" />
                  <button
                    className="al-user-dropdown-item al-user-dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="al-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
