const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductStats,
  getProductsForDependent,
  validateProductAccess,
  uploadMainImage,
  uploadThumbnailImages,
  deleteThumbnailImage,
  getProductImages
} = require('../controllers/productController');

// Import middleware
const authMiddleware = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const { uploadSingle, uploadMultiple } = require('../middlewares/imageUpload');

// ========================================
// PUBLIC ROUTES (No authentication needed)
// ========================================

// Get all products with filtering
router.get('/', getAllProducts);

// Get products by category (must come before /:id route)
router.get('/category/:category', getProductsByCategory);

// Get product by ID
router.get('/:id', getProductById);

// Get product images
router.get('/:id/images', getProductImages);

// ========================================
// DEPENDENT ROUTES (Authentication needed)
// ========================================

// Get age-appropriate products for specific dependent
router.get('/dependent/:dependentId', authMiddleware, getProductsForDependent);

// Validate if dependent can access specific product
router.get('/dependent/:dependentId/validate/:productId', authMiddleware, validateProductAccess);

// ========================================
// ADMIN ROUTES (Authentication + Admin role needed)
// ========================================

// Product validation rules
const productValidation = [
  check('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 255 })
    .withMessage('Product name must be less than 255 characters'),
  
  check('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .isLength({ max: 255 })
    .withMessage('Brand must be less than 255 characters'),
  
  check('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  check('category')
    .isIn(['Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'])
    .withMessage('Invalid category'),
  
  check('sku')
    .optional()
    .isLength({ max: 100 })
    .withMessage('SKU must be less than 100 characters'),
  
  check('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  
  check('minAge')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Minimum age must be between 0 and 100'),
  
  check('maxAge')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Maximum age must be between 0 and 100'),
  
  check('requiresAgeVerification')
    .optional()
    .isBoolean()
    .withMessage('Age verification requirement must be true or false')
];

// Create new product
router.post('/', authMiddleware, isAdmin, productValidation, createProduct);

// Update product
router.put('/:id', authMiddleware, isAdmin, productValidation, updateProduct);

// Delete product (soft delete)
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

// Get product statistics
router.get('/admin/stats', authMiddleware, isAdmin, getProductStats);

// ========================================
// IMAGE UPLOAD ROUTES (Admin only)
// ========================================

// Upload main product image
router.post('/:id/images/main', 
  authMiddleware, 
  isAdmin, 
  uploadSingle,
  uploadMainImage
);

// Upload thumbnail images (multiple)
router.post('/:id/images/thumbnails', 
  authMiddleware, 
  isAdmin, 
  uploadMultiple,
  uploadThumbnailImages
);

// Delete specific thumbnail image
router.delete('/:id/images/thumbnails/:thumbnailIndex', 
  authMiddleware, 
  isAdmin, 
  deleteThumbnailImage
);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB per file.'
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum 5 files per upload.'
    });
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, PNG and WebP images are allowed.'
    });
  }
  
  next(error);
});

module.exports = router;
