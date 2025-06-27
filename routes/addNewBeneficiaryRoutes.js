const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const addNewBeneficiary = require('../controllers/addNewBeneficiary');

// Add a beneficiary (dependent) for the logged-in funder
router.post('/', auth, addNewBeneficiary.addBeneficiary);

module.exports = router;