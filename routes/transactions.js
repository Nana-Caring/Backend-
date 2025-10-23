const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const auth = require('../middlewares/auth');
const {
  getUserTransactions,
  getTransactionSummary,
  getTransactionDetails
} = require('../controllers/simpleTransactionController');

// Validation middleware
const validateTransactionQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('type')
    .optional()
    .isIn(['credit', 'debit'])
    .withMessage('Type must be either credit or debit'),
  query('category')
    .optional()
    .isIn(['healthcare', 'groceries', 'education', 'transport', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('accountId')
    .optional()
    .isInt()
    .withMessage('Account ID must be a valid integer')
];

const validateTransactionId = [
  param('id')
    .isInt()
    .withMessage('Transaction ID must be a valid integer')
];

const validateSummaryQuery = [
  query('period')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Period must be between 1 and 365 days')
];

const validateMonthlyQuery = [
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12')
];

// All routes require authentication and are for dependents only
router.use(auth);

/**
 * @route   GET /api/transactions
 * @desc    Get user's transaction history with filters and pagination
 * @access  Private (Dependents only)
 * @query   {
 *   page?: number,
 *   limit?: number,
 *   type?: 'credit' | 'debit',
 *   category?: string,
 *   startDate?: string (ISO 8601),
 *   endDate?: string (ISO 8601),
 *   accountId?: string (UUID)
 * }
 */
router.get('/', validateTransactionQuery, getUserTransactions);

/**
 * @route   GET /api/transactions/summary
 * @desc    Get transaction summary and analytics
 * @access  Private (Dependents only)
 * @query   {
 *   period?: number (days, default 30)
 * }
 */
router.get('/summary', validateSummaryQuery, getTransactionSummary);

// Monthly report temporarily disabled - will be implemented after schema fixes

/**
 * @route   GET /api/transactions/:id
 * @desc    Get detailed information about a specific transaction
 * @access  Private (Dependents only)
 */
router.get('/:id', validateTransactionId, getTransactionDetails);

module.exports = router;
