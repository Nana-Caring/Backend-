const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryOrderController = require('../controllers/categoryOrderController');
const auth = require('../middlewares/auth');

// Validation rules for checkout
const checkoutValidation = [
  body('shippingAddress.street')
    .optional()
    .isLength({ min: 5 })
    .withMessage('Street address must be at least 5 characters'),
  body('shippingAddress.city')
    .optional()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters'),
  body('shippingAddress.postalCode')
    .optional()
    .isLength({ min: 4 })
    .withMessage('Postal code must be at least 4 characters'),
  body('paymentMethod')
    .optional()
    .isIn(['account_balance'])
    .withMessage('Invalid payment method')
];

// Routes
router.post('/checkout', auth, checkoutValidation, categoryOrderController.checkout);
router.get('/', auth, categoryOrderController.getOrders);
router.get('/:id', auth, categoryOrderController.getOrderDetails);
router.patch('/:id/cancel', auth, categoryOrderController.cancelOrder);

module.exports = router;
