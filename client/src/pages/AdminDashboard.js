import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhone, FaBox, FaTags, FaUsers, FaShoppingCart,
  FaEye, FaPlus, FaSync, FaExternalLinkAlt, FaPlug,
} from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';
import { adminService, productService } from '../services/api';
import '../styles/AdminDashboard.css';

const StatCard = ({ label, value, icon, color }) => (
  <div className="dash-stat-card">
    <div className="dash-stat-header">
      <span className="dash-stat-label">{label}</span>
      <div className="dash-stat-icon" style={{ backgroundColor: color + '18', color }}>
        {icon}
      </div>
    </div>
    <div className="dash-stat-value">{value}</div>
  </div>
);

const AdminDashboard = () => {
  const crmPortalUrl = 'https://eirs-technology-crm.vercel.app';
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    todayEnquiries: 0,
    totalProducts: 0,
    activeCategories: 0,
    totalUsers: 0,
    totalOrders: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [crmOverview, setCrmOverview] = useState({
    configured: false,
    enabled: false,
    totals: {
      websiteProspects: 0,
      websiteClients: 0,
      websitePurchases: 0,
    },
    recentProspects: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [enquiriesRes, usersRes, productsRes, crmRes] = await Promise.allSettled([
        adminService.getContacts(),
        adminService.getAllUsers(),
        productService.getAllProducts(),
        adminService.getCrmSyncOverview(),
      ]);
      const contacts = enquiriesRes.status === 'fulfilled' ? (enquiriesRes.value?.data || []) : [];
      const users = usersRes.status === 'fulfilled' ? (usersRes.value?.data || usersRes.value || []) : [];
      const products = productsRes.status === 'fulfilled' ? (productsRes.value?.data || productsRes.value || []) : [];
      const sortedContacts = [...contacts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const today = new Date().toDateString();
      const todayCount = sortedContacts.filter(c => new Date(c.createdAt).toDateString() === today).length;
      setStats({
        totalEnquiries: sortedContacts.length,
        todayEnquiries: todayCount,
        totalProducts: Array.isArray(products) ? products.length : 0,
        activeCategories: 7,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalOrders: 0,
      });
      setRecentEnquiries(sortedContacts.slice(0, 6));

      const crmData = crmRes.status === 'fulfilled' ? crmRes.value?.overview : null;
      if (crmData) {
        setCrmOverview({
          configured: Boolean(crmData.configured),
          enabled: Boolean(crmData.enabled),
          totals: {
            websiteProspects: Number(crmData?.totals?.websiteProspects || 0),
            websiteClients: Number(crmData?.totals?.websiteClients || 0),
            websitePurchases: Number(crmData?.totals?.websitePurchases || 0),
          },
          recentProspects: Array.isArray(crmData.recentProspects) ? crmData.recentProspects.slice(0, 4) : [],
        });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quickActions = [
    { label: 'Add Product', to: '/admin/products', icon: <FaBox />, color: '#3b82f6' },
    { label: 'View Orders', to: '/admin/orders', icon: <FaShoppingCart />, color: '#8b5cf6' },
    { label: 'Manage Users', to: '/admin/users', icon: <FaUsers />, color: '#10b981' },
    { label: 'View Enquiries', to: '/admin/enquiries', icon: <FaPhone />, color: '#f59e0b' },
  ];

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="dash-wrapper">
        {/* Welcome Banner */}
        <div className="dash-welcome">
          <div className="dash-welcome-text">
            <h2>Welcome back! </h2>
            <p>Here's what's happening with your store today.</p>
          </div>
          <button
            className="dash-refresh-btn"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
        </div>

        {/* KPI STAT CARDS */}
        <div className="dash-stats-grid">
          <StatCard label="Total Enquiries" value={stats.totalEnquiries} icon={<FaPhone />} color="#ef4444" />
          <StatCard label="Today's Enquiries" value={stats.todayEnquiries} icon={<FaPhone />} color="#f59e0b" />
          <StatCard label="Total Products" value={stats.totalProducts} icon={<FaBox />} color="#3b82f6" />
          <StatCard label="Registered Users" value={stats.totalUsers} icon={<FaUsers />} color="#10b981" />
          <StatCard label="Total Orders" value={stats.totalOrders} icon={<FaShoppingCart />} color="#8b5cf6" />
          <StatCard label="Active Categories" value={stats.activeCategories} icon={<FaTags />} color="#06b6d4" />
        </div>

        {/* MAIN GRID */}
        <div className="dash-main-grid">
          {/* RECENT ENQUIRIES */}
          <div className="dash-card dash-enquiries">
            <div className="dash-card-header">
              <h3 className="dash-card-title">Recent Enquiries</h3>
              <Link to="/admin/enquiries" className="dash-view-all">
                <FaEye /> View All
              </Link>
            </div>
            {loading ? (
              <div className="dash-skeleton-rows">
                {[1,2,3,4].map(i => (
                  <div key={i} className="dash-skeleton-row">
                    <div className="dash-skeleton dash-skeleton-avatar" />
                    <div className="dash-skeleton-lines">
                      <div className="dash-skeleton dash-skeleton-line" />
                      <div className="dash-skeleton dash-skeleton-line short" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentEnquiries.length > 0 ? (
              <div className="dash-enquiries-list">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnquiries.map(enq => (
                      <tr key={enq._id}>
                        <td>
                          <div className="dash-table-name">
                            <div className="dash-avatar">{(enq.name || 'U')[0].toUpperCase()}</div>
                            {enq.name}
                          </div>
                        </td>
                        <td><span className="dash-muted">{enq.email}</span></td>
                        <td><span className="dash-subject-badge">{enq.subject || '—'}</span></td>
                        <td><span className="dash-muted">{new Date(enq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span></td>
                        <td><Link to="/admin/enquiries" className="dash-link-btn">View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="dash-empty">
                <FaPhone className="dash-empty-icon" />
                <p>No enquiries yet</p>
              </div>
            )}
          </div>

          {/* SIDEBAR COL */}
          <div className="dash-sidebar-col">
            {/* Quick Actions */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3 className="dash-card-title">Quick Actions</h3>
              </div>
              <div className="dash-quick-actions">
                {quickActions.map(action => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="dash-quick-action-item"
                  >
                    <div className="dash-qa-icon" style={{ backgroundColor: action.color + '18', color: action.color }}>
                      {action.icon}
                    </div>
                    <span className="dash-qa-label">{action.label}</span>
                    <FaPlus className="dash-qa-arrow" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="dash-card dash-crm-card">
              <div className="dash-card-header">
                <h3 className="dash-card-title">Website to CRM Sync</h3>
                <a
                  href={crmPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="dash-view-all"
                >
                  <FaExternalLinkAlt /> Open CRM
                </a>
              </div>
              <div className="dash-crm-body">
                <div className={`dash-crm-status ${(crmOverview.enabled && crmOverview.configured) ? 'ok' : 'warn'}`}>
                  <FaPlug />
                  {(crmOverview.enabled && crmOverview.configured)
                    ? 'CRM sync is active'
                    : 'CRM sync needs configuration'}
                </div>

                <div className="dash-crm-kpis">
                  <div className="dash-crm-kpi">
                    <span className="dash-crm-kpi-label">Website Prospects</span>
                    <strong>{crmOverview.totals.websiteProspects}</strong>
                  </div>
                  <div className="dash-crm-kpi">
                    <span className="dash-crm-kpi-label">Website Clients</span>
                    <strong>{crmOverview.totals.websiteClients}</strong>
                  </div>
                  <div className="dash-crm-kpi">
                    <span className="dash-crm-kpi-label">Tracked Purchases</span>
                    <strong>{crmOverview.totals.websitePurchases}</strong>
                  </div>
                </div>

                {crmOverview.recentProspects.length > 0 ? (
                  <div className="dash-crm-recent">
                    {crmOverview.recentProspects.map((item) => (
                      <div key={item.id} className="dash-crm-recent-item">
                        <div>
                          <p className="dash-crm-name">{item.name}</p>
                          <p className="dash-crm-email">{item.email}</p>
                        </div>
                        <span className="dash-crm-stage">{item.stage || 'new'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="dash-crm-empty">No website records found in CRM yet.</p>
                )}
              </div>
            </div>

            {/* Store Overview */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3 className="dash-card-title">Store Overview</h3>
              </div>
              <div className="dash-overview-list">
                {[
                  { label: 'Total Products', val: stats.totalProducts, color: '#3b82f6' },
                  { label: 'Registered Users', val: stats.totalUsers, color: '#10b981' },
                  { label: 'Total Enquiries', val: stats.totalEnquiries, color: '#ef4444' },
                  { label: 'Active Categories', val: stats.activeCategories, color: '#06b6d4' },
                  { label: 'Total Orders', val: stats.totalOrders, color: '#8b5cf6' },
                ].map(item => (
                  <div key={item.label} className="dash-overview-item">
                    <span className="dash-overview-dot" style={{ background: item.color }} />
                    <span className="dash-overview-label">{item.label}</span>
                    <span className="dash-overview-val">{item.val}</span>
                  </div>
                ))}
              </div>
              <div className="dash-manage-links">
                <Link to="/admin/products" className="dash-manage-link"><FaBox /> Manage Products</Link>
                <Link to="/admin/orders" className="dash-manage-link"><FaShoppingCart /> Manage Orders</Link>
                <Link to="/admin/users" className="dash-manage-link"><FaUsers /> Manage Users</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
