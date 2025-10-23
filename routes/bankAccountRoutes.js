const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const directDepositController = require('../controllers/directDepositController');

// Middleware to ensure only funders can access deposit routes
const requireFunder = (req, res, next) => {
  if (req.user.role !== 'funder') {
    return res.status(403).json({ error: 'Only funders can make direct deposits' });
  }
  next();
};

// Direct deposit routes without storing payment methods
router.post('/create-deposit-intent', auth, requireFunder, directDepositController.createDirectDepositIntent);
router.post('/confirm-deposit', auth, requireFunder, directDepositController.confirmDirectDeposit);
router.get('/deposit-history', auth, requireFunder, directDepositController.getDepositHistory);

// Get available deposit methods from Stripe (without storing)
router.get('/payment-methods', auth, requireFunder, directDepositController.getAvailablePaymentMethods);

module.exports = router;
