const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const auth = require('../middlewares/auth');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  saveForLater,
  moveToCart,
  getSavedItems
} = require('../controllers/cartController');

// Validation middleware
const validateAddToCart = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50')
];

const validateUpdateCart = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid cart item ID is required'),
  body('quantity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50')
];

const validateCartItemId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid cart item ID is required')
];

// Cart routes - all require authentication
router.use(auth);

/**
 * @route   POST /api/cart/add
 * @desc    Add product to cart
 * @access  Private (Dependents only)
 */
router.post('/add', validateAddToCart, addToCart);

/**
 * @route   GET /api/cart
 * @desc    Get user's active cart items
 * @access  Private (Dependents only)
 */
router.get('/', getCart);

/**
 * @route   PUT /api/cart/:id
 * @desc    Update cart item quantity
 * @access  Private (Dependents only)
 */
router.put('/:id', validateUpdateCart, updateCartItem);

/**
 * @route   DELETE /api/cart/:id
 * @desc    Remove item from cart
 * @access  Private (Dependents only)
 */
router.delete('/:id', validateCartItemId, removeCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private (Dependents only)
 */
router.delete('/', clearCart);

/**
 * @route   POST /api/cart/:id/save-for-later
 * @desc    Save cart item for later
 * @access  Private (Dependents only)
 */
router.post('/:id/save-for-later', validateCartItemId, saveForLater);

/**
 * @route   POST /api/cart/:id/move-to-cart
 * @desc    Move saved item back to cart
 * @access  Private (Dependents only)
 */
router.post('/:id/move-to-cart', validateCartItemId, moveToCart);

/**
 * @route   GET /api/cart/saved
 * @desc    Get saved items
 * @access  Private (Dependents only)
 */
router.get('/saved', getSavedItems);

module.exports = router;
