const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const auth = require('../middlewares/auth');
const {
  checkout,
  getOrders,
  getOrderDetails,
  cancelOrder
} = require('../controllers/orderController');

// Validation middleware
const validateCheckout = [
  body('shippingAddress')
    .optional()
    .isObject()
    .withMessage('Shipping address must be an object'),
  body('shippingAddress.fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('shippingAddress.address1')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address line 1 must be between 5 and 200 characters'),
  body('shippingAddress.address2')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address line 2 must be less than 200 characters'),
  body('shippingAddress.city')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('shippingAddress.province')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Province must be between 2 and 50 characters'),
  body('shippingAddress.postalCode')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('Postal code must be 4 digits'),
  body('shippingAddress.phone')
    .optional()
    .matches(/^(\+27|0)[1-9]\d{8}$/)
    .withMessage('Phone number must be a valid South African number'),
  body('paymentMethod')
    .optional()
    .isIn(['account_balance'])
    .withMessage('Invalid payment method')
];

const validateOrderId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid order ID is required')
];

const validateOrderQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

// Order routes - all require authentication
router.use(auth);

/**
 * @route   POST /api/orders/checkout
 * @desc    Create order from cart items (checkout)
 * @access  Private (Dependents only)
 */
router.post('/checkout', validateCheckout, checkout);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders with pagination
 * @access  Private (Dependents only)
 */
router.get('/', validateOrderQuery, getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get specific order details
 * @access  Private (Dependents only)
 */
router.get('/:id', validateOrderId, getOrderDetails);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order (if still processing)
 * @access  Private (Dependents only)
 */
router.post('/:id/cancel', validateOrderId, cancelOrder);

module.exports = router;
