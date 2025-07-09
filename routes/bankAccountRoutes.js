const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const bankAccountController = require('../controllers/bankAccountController');

// Middleware to ensure only funders can access bank account routes
const requireFunder = (req, res, next) => {
  if (req.user.role !== 'funder') {
    return res.status(403).json({ error: 'Only funders can manage bank accounts' });
  }
  next();
};

// Bank account management routes
router.post('/add', auth, requireFunder, bankAccountController.addBankAccount);
router.get('/', auth, requireFunder, bankAccountController.getBankAccounts);
router.put('/:bankAccountId/default', auth, requireFunder, bankAccountController.setDefaultBankAccount);
router.delete('/:bankAccountId', auth, requireFunder, bankAccountController.deleteBankAccount);

// Enhanced payment intent creation with bank account selection
router.post('/payment-intent', auth, requireFunder, bankAccountController.createPaymentIntentWithBankAccount);

module.exports = router;
