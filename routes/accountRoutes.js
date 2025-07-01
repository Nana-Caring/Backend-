const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const checkUserStatus = require('../middlewares/checkUserStatus');

// User account balance routes (require authentication and active status)
router.get('/my-accounts', [auth, checkUserStatus], accountController.getUserAccounts);
router.get('/balance/:accountId', [auth, checkUserStatus], accountController.getAccountBalance);
router.get('/balance/number/:accountNumber', [auth, checkUserStatus], accountController.getAccountBalanceByNumber);
router.get('/type/:accountType', [auth, checkUserStatus], accountController.getAccountsByType);
router.get('/summary/:accountId', [auth, checkUserStatus], accountController.getAccountSummary);

// Caregiver routes for dependent accounts
router.get('/dependent/:dependentId', [auth, checkUserStatus], accountController.getDependentAccounts);

// Admin routes (require admin role)
router.get('/admin/all', [auth, isAdmin], accountController.getAllAccounts);
router.get('/admin/stats', [auth, isAdmin], accountController.getAccountStats);

module.exports = router;
