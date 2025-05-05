const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const stripeController = require('../controllers/stripeController');

// Payment intent route - requires authentication
router.post('/create-payment-intent', auth, stripeController.createPaymentIntent);

// Webhook route - no authentication needed as it's called by Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

module.exports = router;