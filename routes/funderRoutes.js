const express = require('express');
const router = express.Router();
const funderController = require('../controllers/funderController');
const authMiddleware = require('../middlewares/auth');
const beneficiaryController = require('../controllers/getbeneficiaryController');

// Link dependent/beneficiary with custom name
router.post('/link-dependent', authMiddleware, funderController.linkDependent);

// Search dependent by custom name
router.get('/search-dependent', authMiddleware, funderController.searchDependentByCustomName);

//route to get all dependents of a funder
router.get('/get-beneficiaries', authMiddleware, beneficiaryController.getMyBeneficiaries);
module.exports = router;