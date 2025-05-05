const express = require('express');
const router = express.Router();
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripeController = require('../controllers/stripeController');

router.post('create-payment-intent', stripeController.createPaymentIntent);


router.post('/webhook', express.raw({ type: 'application/json'}), stripeController.handleWebhook);

  

module.exports = router;