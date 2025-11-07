const express = require('express');
const router = express.Router();
const funderController = require('../controllers/funderController');
const authMiddleware = require('../middlewares/auth');
const beneficiaryController = require('../controllers/getbeneficiaryController');

// Link dependent/beneficiary
router.post('/link-dependent', authMiddleware, funderController.linkDependent);

// Search dependent by custom name
router.get('/search-dependent', authMiddleware, funderController.searchDependentByCustomName);

// Get all beneficiaries of a funder
router.get('/get-beneficiaries', authMiddleware, beneficiaryController.getMyBeneficiaries);

// Alias route for beneficiaries (same as get-beneficiaries)
router.get('/beneficiaries', authMiddleware, beneficiaryController.getMyBeneficiaries);

// Transfer funds to beneficiary (Smart Distribution System)
router.post('/transfer', authMiddleware, funderController.transferToBeneficiary);

// Get funder account balance
router.get('/balance', authMiddleware, funderController.getBalance);

module.exports = router;