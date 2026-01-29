import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryFilterProvider } from './context/CategoryFilterContext';
import Header from './components/Header';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import AccountPage from './pages/AccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminEnquiries from './pages/AdminEnquiries';
import AdminProducts from './pages/AdminProducts';
import AdminSubcategories from './pages/AdminSubcategories';
import AdminServices from './pages/AdminServices';
import AdminOrders from './pages/AdminOrders';
import './App.css';

function AppContent() {
  const location = useLocation();
  // Hide Footer on orders page and account page
  const hideFooterPaths = ['/', '/orders', '/account'];
  // Also hide for product detail pages (any route starting with /products/)
  const isProductDetailPage = location.pathname.startsWith('/products/');
  const isAdminPage = location.pathname.startsWith('/admin');
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div className="App">
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/account" element={<AccountPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/users" element={<ProtectedAdminRoute element={<AdminUsers />} />} />
        <Route path="/admin/enquiries" element={<ProtectedAdminRoute element={<AdminEnquiries />} />} />
        <Route path="/admin/products" element={<ProtectedAdminRoute element={<AdminProducts />} />} />
        <Route path="/admin/subcategories" element={<ProtectedAdminRoute element={<AdminSubcategories />} />} />
        <Route path="/admin/services" element={<ProtectedAdminRoute element={<AdminServices />} />} />
        <Route path="/admin/orders" element={<ProtectedAdminRoute element={<AdminOrders />} />} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </div>
  );
}
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CategoryFilterProvider>
          <Router>
            <AppContent />
          </Router>
        </CategoryFilterProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
