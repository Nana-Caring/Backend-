const express = require('express');
const router = express.Router();
const funderController = require('../controllers/funderController');
const authMiddleware = require('../middlewares/auth');
const beneficiaryController = require('../controllers/getbeneficiaryController');

router.post('/link-dependent', authMiddleware, funderController.linkDependent);

//route to get all dependents of a funder
router.get('/get-beneficiaries', authMiddleware, beneficiaryController.getMyBeneficiaries);

// Alias route for beneficiaries (same as get-beneficiaries)
router.get('/beneficiaries', authMiddleware, beneficiaryController.getMyBeneficiaries);

module.exports = router;