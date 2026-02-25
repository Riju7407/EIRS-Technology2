const express = require('express');
const { signup, signin, getuser, logout, editUserProfile, postEditUserProfile, changePassword, forgotPassword, resetPassword, requestPasswordChangeOTP, verifyOTP, resetPasswordWithOTP, changePasswordWithOTP } = require('../controller/authController');
const { services, getAllServices, deleteService, addService, updateService } = require('../controller/serviceController');
const { getAllUsers, contactForm: getContacts, deleteUserById, promoteToAdmin, checkAdminStatus } = require('../controller/adminController');
const { contactForm: submitContact, deleteContact } = require('../controller/contactController');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getFeaturedProducts, toggleFeatured } = require('../controller/productController');
const { createOrder, getUserOrders, getOrderById, updateOrderStatus, getAllOrders, deleteOrder, cancelOrder, requestRefund, approveRefund, rejectRefund, processRefund } = require('../controller/orderController');
const { createSubcategory, getAllSubcategories, getSubcategoriesByCategory, getSubcategoryById, updateSubcategory, deleteSubcategory } = require('../controller/subcategoryController');
const { addReview, getProductReviews, getUserProductReview, updateReview, deleteReview } = require('../controller/reviewController');
const {adminMiddleware} = require('../middleware/adminMiddleware');
const jwtAuth = require('../middleware/jwtAuth');
const { upload, cloudinary } = require('../config/cloudinary');
const authRouter = express.Router();

// Cloudinary image upload (admin only)
authRouter.post(
  '/upload-image',
  jwtAuth,
  adminMiddleware,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    res.json({
      success: true,
      url: req.file.path,          // Cloudinary secure URL
      public_id: req.file.filename  // Cloudinary public_id
    });
  }
);

authRouter.post('/signup',signup);
authRouter.post('/signin',signin);
authRouter.get('/user', jwtAuth, getuser);
authRouter.get('/admin/status', jwtAuth, checkAdminStatus);
authRouter.post('/logout', jwtAuth, logout);
authRouter.post('/contact', jwtAuth, submitContact);
authRouter.put('/change-password/:id', jwtAuth, changePassword);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

// OTP-based password reset/change routes
authRouter.post('/request-otp', requestPasswordChangeOTP);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/reset-password-otp', resetPasswordWithOTP);
authRouter.post('/change-password-otp', jwtAuth, changePasswordWithOTP);

authRouter.get('/services', services);
authRouter.get('/users', adminMiddleware, getAllUsers);
authRouter.get('/contacts', adminMiddleware, getContacts);
authRouter.delete('/contacts/:id', adminMiddleware, deleteContact);
authRouter.delete('/users/delete/:id', adminMiddleware, deleteUserById);
authRouter.post('/users/promote/:userId', adminMiddleware, promoteToAdmin);
authRouter.get('/users/edit/:id', jwtAuth, editUserProfile);
authRouter.put('/users/edit/:id', jwtAuth, postEditUserProfile);
authRouter.get('/services/admin', adminMiddleware, getAllServices);
authRouter.post('/services/add', jwtAuth, adminMiddleware, addService);
authRouter.put('/services/update/:id', jwtAuth, adminMiddleware, updateService);
authRouter.delete('/services/delete/:id', jwtAuth, adminMiddleware, deleteService);
authRouter.get('/products/featured', getFeaturedProducts);
authRouter.get('/products', getAllProducts);
authRouter.get('/products/:id', getProductById);
authRouter.post('/products/add',jwtAuth, adminMiddleware, createProduct);
authRouter.put('/products/:id/featured', jwtAuth, adminMiddleware, toggleFeatured);
authRouter.put('/products/:id', jwtAuth, adminMiddleware, updateProduct);
authRouter.delete('/products/:id', jwtAuth, adminMiddleware, deleteProduct);

// Subcategory Routes
authRouter.post('/subcategories', jwtAuth, adminMiddleware, createSubcategory);
authRouter.get('/subcategories', getAllSubcategories);
authRouter.get('/subcategories/category/:category', getSubcategoriesByCategory);
authRouter.get('/subcategories/:id', getSubcategoryById);
authRouter.put('/subcategories/:id', jwtAuth, adminMiddleware, updateSubcategory);
authRouter.delete('/subcategories/:id', jwtAuth, adminMiddleware, deleteSubcategory);

// Order Routes
authRouter.post('/orders/create', jwtAuth, createOrder);
authRouter.get('/orders/admin/all', adminMiddleware, getAllOrders);
authRouter.get('/orders', jwtAuth, getUserOrders);
authRouter.get('/orders/:orderId', jwtAuth, getOrderById);
authRouter.post('/orders/:orderId/cancel', jwtAuth, cancelOrder);
authRouter.post('/orders/:orderId/refund', jwtAuth, requestRefund);
authRouter.put('/orders/:orderId/status', jwtAuth, adminMiddleware, updateOrderStatus);
authRouter.delete('/orders/:orderId', jwtAuth, adminMiddleware, deleteOrder);

// Admin Refund Management Routes
authRouter.post('/refunds/:orderId/approve', jwtAuth, adminMiddleware, approveRefund);
authRouter.post('/refunds/:orderId/reject', jwtAuth, adminMiddleware, rejectRefund);
authRouter.post('/refunds/:orderId/process', jwtAuth, adminMiddleware, processRefund);

// Review Routes
authRouter.post('/reviews/add', jwtAuth, addReview);
authRouter.get('/reviews/product/:productId/user', jwtAuth, getUserProductReview);
authRouter.get('/reviews/product/:productId', getProductReviews);
authRouter.put('/reviews/:reviewId', jwtAuth, updateReview);
authRouter.delete('/reviews/:reviewId', jwtAuth, deleteReview);

module.exports = {authRouter};