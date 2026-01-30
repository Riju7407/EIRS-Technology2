const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// CATEGORY ROUTES
// Get all categories
router.get('/categories', categoryController.getAllCategories);

// Create new category (Admin only)
router.post('/categories', verifyToken, verifyAdmin, categoryController.createCategory);

// Update category (Admin only)
router.put('/categories/:id', verifyToken, verifyAdmin, categoryController.updateCategory);

// Delete category (Admin only)
router.delete('/categories/:id', verifyToken, verifyAdmin, categoryController.deleteCategory);

// SUBCATEGORY ROUTES
// Get all subcategories
router.get('/subcategories', categoryController.getAllSubcategories);

// Create new subcategory (Admin only)
router.post('/subcategories', verifyToken, verifyAdmin, categoryController.createSubcategory);

// Update subcategory (Admin only)
router.put('/subcategories/:id', verifyToken, verifyAdmin, categoryController.updateSubcategory);

// Delete subcategory (Admin only)
router.delete('/subcategories/:id', verifyToken, verifyAdmin, categoryController.deleteSubcategory);

module.exports = router;
