const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const auth = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Money transfer routes
router.post('/send-to-beneficiary', transferController.sendMoneyToBeneficiary);
router.get('/history', transferController.getTransferHistory);
router.get('/beneficiaries', transferController.getBeneficiariesList);
router.get('/info', transferController.getTransferInfo);

module.exports = router;
