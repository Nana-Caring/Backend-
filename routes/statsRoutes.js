const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminAuth');

router.get('/overall', [authMiddleware, adminMiddleware], statsController.getOverallStats);
router.get('/monthly', [authMiddleware, adminMiddleware], statsController.getMonthlyStats);

module.exports = router;