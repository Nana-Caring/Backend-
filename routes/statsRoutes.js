const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminAuth');

// Protected routes - only admin can access
router.get('/overall', [authMiddleware, adminMiddleware], statsController.getOverallStats);
router.get('/monthly', [authMiddleware, adminMiddleware], statsController.getMonthlyStats);

module.exports = router;