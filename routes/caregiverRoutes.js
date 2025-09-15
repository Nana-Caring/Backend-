const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const {
    getCaregiverDependents,
    getDependentById,
    getCaregiverStats,
    getRecentActivity,
    getAllDependentTransactions,
    getDependentTransactions,
    getTransactionAnalytics
} = require('../controllers/caregiverController');

// Middleware to check if user is a caregiver
const isCaregiverRole = (req, res, next) => {
    if (req.user.role !== 'caregiver') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Caregiver role required.'
        });
    }
    next();
};

// Apply authentication and caregiver role check to all routes
router.use(authenticate);
router.use(isCaregiverRole);

// Get all dependents assigned to this caregiver
router.get('/dependents', getCaregiverDependents);

// Get caregiver dashboard statistics
router.get('/stats', getCaregiverStats);

// Get recent activity across all dependents
router.get('/activity', getRecentActivity);

// Transaction tracking routes
// Get all transactions for all dependents
router.get('/transactions', getAllDependentTransactions);

// Get transaction analytics
router.get('/transactions/analytics', getTransactionAnalytics);

// Get transactions for a specific dependent
router.get('/dependents/:dependentId/transactions', getDependentTransactions);

// Get specific dependent details by ID
router.get('/dependents/:dependentId', getDependentById);

module.exports = router;
