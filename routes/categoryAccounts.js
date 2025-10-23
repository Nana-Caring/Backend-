const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryAccountController = require('../controllers/categoryAccountController');
const auth = require('../middlewares/auth');

// Validation rules for transfer
const transferValidation = [
  body('fromCategory')
    .notEmpty()
    .withMessage('From category is required')
    .isIn(['healthcare', 'transport', 'education', 'other', 'entertainment', 'groceries'])
    .withMessage('Invalid from category'),
  body('toCategory')
    .notEmpty()
    .withMessage('To category is required')
    .isIn(['healthcare', 'transport', 'education', 'other', 'entertainment', 'groceries'])
    .withMessage('Invalid to category'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters')
];

// Routes
router.get('/balances', auth, categoryAccountController.getCategoryBalances);
router.get('/:category', auth, categoryAccountController.getCategoryAccount);
router.post('/transfer', auth, transferValidation, categoryAccountController.transferBetweenCategories);

module.exports = router;
