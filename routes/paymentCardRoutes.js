const express = require('express');
const router = express.Router();
const paymentCardController = require('../controllers/paymentCardController');
const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Payment card management routes
router.post('/add', paymentCardController.addPaymentCard);
router.post('/add-stripe', paymentCardController.addPaymentCardWithStripeMethod); // Stripe Payment Method ID
router.post('/add-test', paymentCardController.addPaymentCardTest); // TEST ONLY - bypasses Stripe
router.get('/my-cards', paymentCardController.getPaymentCards);
router.get('/debug-all', paymentCardController.getAllCardsDebug); // DEBUG - shows all cards
router.put('/set-default/:cardId', paymentCardController.setDefaultCard);
router.put('/reactivate/:cardId', paymentCardController.reactivateCard); // Reactivate inactive card
router.delete('/remove/:cardId', paymentCardController.deletePaymentCard);
router.delete('/remove-all', paymentCardController.deleteAllCards); // Delete all cards

// Payment processing
router.post('/create-payment-intent', paymentCardController.createPaymentIntentWithCard);

module.exports = router;
