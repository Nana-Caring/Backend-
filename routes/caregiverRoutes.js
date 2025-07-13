const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const {
    getCaregiverDependents,
    getDependentById,
    getCaregiverStats,
    getRecentActivity
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


// Get all dependents with relationship info
router.get('/dependents-with-relationship', require('../controllers/caregiverController').getCaregiverDependentsWithRelationship);

// Get specific dependent's relationship to caregiver
router.get('/dependents/:dependentId/relationship', require('../controllers/caregiverController').getDependentRelationship);

// Existing endpoints
router.get('/stats', getCaregiverStats);
router.get('/activity', getRecentActivity);
router.get('/dependents/:dependentId', getDependentById);

module.exports = router;
