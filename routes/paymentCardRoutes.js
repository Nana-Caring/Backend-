const express = require('express');
const router = express.Router();
const paymentCardController = require('../controllers/paymentCardController');
const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Payment card management routes
router.post('/add', paymentCardController.addPaymentCard);
router.post('/add-test', paymentCardController.addPaymentCardTest); // TEST ONLY - bypasses Stripe
router.get('/my-cards', paymentCardController.getPaymentCards);
router.put('/set-default/:cardId', paymentCardController.setDefaultCard);
router.delete('/remove/:cardId', paymentCardController.deletePaymentCard);

// Payment processing
router.post('/create-payment-intent', paymentCardController.createPaymentIntentWithCard);

module.exports = router;
