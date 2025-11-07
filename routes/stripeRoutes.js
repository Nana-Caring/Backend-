const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const stripeController = require('../controllers/stripeController');

// Payment intent route - requires authentication
router.post('/create-payment-intent', authenticateToken, stripeController.createPaymentIntent);

// Create Setup Intent route - requires authentication
router.post('/create-setup-intent', authenticateToken, stripeController.createSetupIntent);

// List saved payment methods - requires authentication
router.get('/payment-methods', authenticateToken, stripeController.listPaymentMethods);

// Webhook route - no authentication needed as it's called by Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

module.exports = router;