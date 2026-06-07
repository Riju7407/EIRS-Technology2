import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryFilterProvider } from './context/CategoryFilterContext';
import { WishlistProvider } from './context/WishlistContext';
import useKeepServerAwake from './hooks/useKeepServerAwake';
import Header from './components/Header';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import ContactPage from './pages/ContactPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import AccountPage from './pages/AccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import OrdersPage from './pages/OrdersPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminEnquiries from './pages/AdminEnquiries';
import AdminProducts from './pages/AdminProducts';
import AdminServices from './pages/AdminServices';
import AdminOrders from './pages/AdminOrders';
import PhoneSignUp from './pages/PhoneSignUp';
import './App.css';
import AdminCategories from './pages/AdminCategories';
import AdminSubcategories from './pages/AdminSubcategories';
import CheckoutModal from './components/CheckoutModal';


function AppContent() {
  const location = useLocation();
  // Keep Render server awake by pinging /health every 25 minutes
  useKeepServerAwake();

  // Hide Footer on orders page, account page, phone signup page, product detail pages, about page, contact page, and services page
  const hideFooterPaths = ['/', '/orders', '/account', '/phonesignup', '/checkout','/about', '/contact', '/services'];
  const isProductDetailPage = location.pathname.startsWith('/products/') || location.pathname.startsWith('/product/');
  const isServiceDetailPage = location.pathname.startsWith('/services/');
  const isAdminPage = location.pathname.startsWith('/admin');
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname) && !isProductDetailPage && !isServiceDetailPage && !isAdminPage;

  return (
    <div className="App">
      
      {!isAdminPage && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutModal />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/phonesignup" element={<PhoneSignUp />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/account" element={<AccountPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/users" element={<ProtectedAdminRoute element={<AdminUsers />} />} />
        <Route path="/admin/enquiries" element={<ProtectedAdminRoute element={<AdminEnquiries />} />} />
        <Route path="/admin/products" element={<ProtectedAdminRoute element={<AdminProducts />} />} />
        <Route
  path="/admin/categories"
  element={
    <ProtectedAdminRoute
      element={<AdminCategories />}
    />
  }
/>

<Route
  path="/admin/subcategories"
  element={
    <ProtectedAdminRoute
      element={<AdminSubcategories />}
    />
  }
/>
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
        <WishlistProvider>
          <CategoryFilterProvider>
            <Router>
              <AppContent />
            </Router>
          </CategoryFilterProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
