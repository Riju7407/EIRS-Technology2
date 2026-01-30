import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaBox, FaPhone, FaChartBar, FaSignOutAlt, FaBars, FaTimes, FaTags, FaTools } from 'react-icons/fa';
import { adminService, authService } from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    todayEnquiries: 0,
    totalProducts: 0,
    activeCategories: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get admin user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAdminUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    // Check if admin is logged in by trying to fetch user data
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const enquiries = await adminService.getContacts();
      const contactsData = enquiries.data || [];
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayCount = contactsData.filter(
        c => new Date(c.createdAt).toDateString() === today
      ).length;

      setStats({
        totalEnquiries: contactsData.length,
        todayEnquiries: todayCount,
        totalProducts: 0, // Will be fetched from products
        activeCategories: 7, // Default categories
      });

      // Get recent enquiries (last 5)
      setRecentEnquiries(contactsData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If 401 Unauthorized, redirect to signin
      if (error.status === 401 || error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>EIRS Admin</h2>
          <button
            className="sidebar-toggle-mobile"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item active">
            <FaChartBar /> Dashboard
          </Link>
          <Link to="/admin/users" className="nav-item">
            <FaUsers /> Users
          </Link>
          <Link to="/admin/enquiries" className="nav-item">
            <FaPhone /> Enquiries
          </Link>
          <Link to="/admin/products" className="nav-item">
            <FaBox /> Products
          </Link>
          <Link to="/admin/subcategories" className="nav-item">
            <FaTags /> Categories
          </Link>
          <Link to="/admin/services" className="nav-item">
            <FaTools /> Services
          </Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <button
            className="sidebar-toggle-desktop"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>
          <div className="topbar-right">
            <div className="admin-profile">
              <img src="https://via.placeholder.com/40x40?text=Admin" alt="Admin" />
              <span>{adminUser?.name || 'Admin User'}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="content-header">
            <h1>Welcome, {adminUser?.name || 'Admin'}! 👋</h1>
            <p>Here's your admin dashboard overview. Manage products, services, and user enquiries.</p>
          </div>

          {/* KPI Cards */}
          <section className="kpi-section">
            <div className="kpi-card">
              <div className="kpi-icon" style={{ backgroundColor: '#FF6B6B' }}>
                <FaPhone size={30} />
              </div>
              <div className="kpi-content">
                <p className="kpi-label">Total Enquiries</p>
                <h3 className="kpi-value">{stats.totalEnquiries}</h3>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ backgroundColor: '#4ECDC4' }}>
                <FaPhone size={30} />
              </div>
              <div className="kpi-content">
                <p className="kpi-label">Today's Enquiries</p>
                <h3 className="kpi-value">{stats.todayEnquiries}</h3>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ backgroundColor: '#45B7D1' }}>
                <FaBox size={30} />
              </div>
              <div className="kpi-content">
                <p className="kpi-label">Total Products</p>
                <h3 className="kpi-value">{stats.totalProducts}</h3>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" style={{ backgroundColor: '#F7DC6F' }}>
                <FaTags size={30} />
              </div>
              <div className="kpi-content">
                <p className="kpi-label">Active Categories</p>
                <h3 className="kpi-value">{stats.activeCategories}</h3>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="recent-activity">
            <div className="activity-header">
              <h2>Recent Enquiries</h2>
              <Link to="/admin/enquiries" className="view-all-link">View All →</Link>
            </div>

            {loading ? (
              <p className="loading">Loading enquiries...</p>
            ) : recentEnquiries.length > 0 ? (
              <div className="enquiries-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnquiries.map((enquiry) => (
                      <tr key={enquiry._id}>
                        <td>{enquiry.name}</td>
                        <td>{enquiry.email}</td>
                        <td>{enquiry.phoneNumber}</td>
                        <td>{enquiry.subject}</td>
                        <td>{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/admin/enquiries/${enquiry._id}`} className="action-link">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No enquiries found</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
