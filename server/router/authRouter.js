const express = require('express');
const { signup, signin, getuser, logout, editUserProfile, postEditUserProfile,} = require('../controller/authController');
const { services, getAllServices, deleteService, addService, updateService } = require('../controller/serviceController');
const { getAllUsers, contactForm: getContacts, deleteUserById, promoteToAdmin, checkAdminStatus } = require('../controller/adminController');
const { contactForm: submitContact, deleteContact } = require('../controller/contactController');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controller/productController');
const { createOrder, getUserOrders, getOrderById, updateOrderStatus, getAllOrders, deleteOrder } = require('../controller/orderController');
const {adminMiddleware} = require('../middleware/adminMiddleware');
const jwtAuth = require('../middleware/jwtAuth');
const authRouter = express.Router();

authRouter.post('/signup',signup);
authRouter.post('/signin',signin);
authRouter.get('/user', jwtAuth, getuser);
authRouter.get('/admin/status', jwtAuth, checkAdminStatus);
authRouter.post('/logout', jwtAuth, logout);
authRouter.post('/contact', jwtAuth, submitContact);
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
authRouter.get('/products', getAllProducts);
authRouter.get('/products/:id', getProductById);
authRouter.post('/products/add',jwtAuth, adminMiddleware, createProduct);
authRouter.put('/products/:id', jwtAuth, adminMiddleware, updateProduct);
authRouter.delete('/products/:id', jwtAuth, adminMiddleware, deleteProduct);

// Order Routes
authRouter.post('/orders/create', jwtAuth, createOrder);
authRouter.get('/orders', jwtAuth, getUserOrders);
authRouter.get('/orders/:orderId', jwtAuth, getOrderById);
authRouter.put('/orders/:orderId/status', jwtAuth, adminMiddleware, updateOrderStatus);
authRouter.get('/orders/admin/all', adminMiddleware, getAllOrders);
authRouter.delete('/orders/:orderId', jwtAuth, adminMiddleware, deleteOrder);

module.exports = {authRouter};