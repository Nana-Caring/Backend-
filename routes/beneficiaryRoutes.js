const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const beneficiaryController = require('../controllers/getbeneficiaryController');

router.get('/', auth, beneficiaryController.getMyBeneficiaries);

module.exports = router;