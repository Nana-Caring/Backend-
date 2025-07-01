const User = require('../models/User');

/**
 * Middleware to check if user is blocked
 * This should be used after authentication middleware
 */
const checkUserStatus = async (req, res, next) => {
  try {
    // Skip check if user is not authenticated
    if (!req.user || !req.user.id) {
      return next();
    }

    // Get fresh user data to check current status
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'isBlocked', 'status', 'blockedAt', 'blockReason']
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is blocked
    if (user.isBlocked || user.status === 'blocked') {
      return res.status(403).json({
        message: 'Your account has been blocked. Please contact support.',
        code: 'ACCOUNT_BLOCKED',
        details: {
          blockedAt: user.blockedAt,
          reason: user.blockReason || 'No reason provided'
        }
      });
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Your account has been suspended. Please contact support.',
        code: 'ACCOUNT_SUSPENDED',
        details: {
          blockedAt: user.blockedAt,
          reason: user.blockReason || 'No reason provided'
        }
      });
    }

    // Check if user is pending activation
    if (user.status === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending activation. Please contact support.',
        code: 'ACCOUNT_PENDING'
      });
    }

    // User is active, continue
    next();
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({
      message: 'Server error while checking user status',
      error: error.message
    });
  }
};

module.exports = checkUserStatus;
