const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authenticate = require('../middlewares/auth');
const {
  createDepositIntent,
  confirmDeposit,
  getFunderAccount,
  demoAddBalance
} = require('../controllers/funderDepositController');

// Middleware to check if user is a funder
const isFunderRole = (req, res, next) => {
  if (req.user.role !== 'funder') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Funder role required.'
    });
  }
  next();
};

// Validation middleware
const validateDeposit = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 1000 }) // Minimum R10.00 (1000 cents)
    .withMessage('Minimum deposit amount is R10.00'),
  body('currency')
    .optional()
    .isIn(['zar', 'ZAR'])
    .withMessage('Currency must be ZAR')
];

const validateConfirmation = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required')
    .isString()
    .withMessage('Payment intent ID must be a string')
];

// Apply authentication and funder role check
router.use(authenticate);
router.use(isFunderRole);

/**
 * @route   POST /api/funder/deposit/create-intent
 * @desc    Create Stripe payment intent for deposit
 * @access  Private (Funders only)
 */
router.post('/create-intent', validateDeposit, createDepositIntent);

/**
 * @route   POST /api/funder/deposit/confirm
 * @desc    Confirm deposit and update account balance
 * @access  Private (Funders only)
 */
router.post('/confirm', validateConfirmation, confirmDeposit);

/**
 * @route   GET /api/funder/deposit/account
 * @desc    Get funder account balance and transaction history
 * @access  Private (Funders only)
 */
router.get('/account', getFunderAccount);

/**
 * @route   POST /api/funder/deposit/demo-add-balance
 * @desc    DEMO: Add balance for testing (simulates confirmed Stripe payment)
 * @access  Private (Funders only) - DEMO ONLY
 */
router.post('/demo-add-balance', [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description must be less than 255 characters')
], demoAddBalance);

module.exports = router;
