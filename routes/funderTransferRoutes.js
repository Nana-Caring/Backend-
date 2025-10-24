const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const authenticate = require('../middlewares/auth');
const {
  transferToBeneficiary,
  getTransferHistory
} = require('../controllers/funderTransferController');

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
const validateTransfer = [
  body('beneficiaryId')
    .isInt({ min: 1 })
    .withMessage('Valid beneficiary ID is required'),
  body('targetAccountId')
    .isInt({ min: 1 })
    .withMessage('Valid target account ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const validateHistory = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Apply authentication and funder role check
router.use(authenticate);
router.use(isFunderRole);

/**
 * @route   POST /api/funder/transfer
 * @desc    Transfer funds to beneficiary account
 * @access  Private (Funders only)
 */
router.post('/', validateTransfer, transferToBeneficiary);

/**
 * @route   GET /api/funder/transfer/history
 * @desc    Get transfer history
 * @access  Private (Funders only)
 */
router.get('/history', validateHistory, getTransferHistory);

module.exports = router;
