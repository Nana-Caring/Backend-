const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, getProductsByCategory } = require('../controllers/productController');

// Public routes for products (no admin authentication required)

// Get all active products (public access)
router.get('/', getAllProducts);

// Get products by category (public access)
router.get('/category/:category', getProductsByCategory);

// Get product by ID (public access)
router.get('/:id', getProductById);

module.exports = router;
