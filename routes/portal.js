const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const portalController = require('../controllers/portalController');

// User portal endpoints
router.get('/me', authenticate, portalController.getUserDetails);
router.get('/me/accounts', authenticate, portalController.getUserAccounts);
router.get('/me/transactions', authenticate, portalController.getUserTransactions);

module.exports = router;
