const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extract and clean token
    const token = authHeader.replace('Bearer ', '').trim();
    console.log('Received token:', token);

    // Validate token format
    if (!token || !token.match(/^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/)) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Verify token using secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle portal tokens
    if (decoded.portal && decoded.originalUserId) {
      const user = await User.findByPk(decoded.originalUserId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = {
        ...user.toJSON(),
        portalAccess: true,
        originalUserId: decoded.originalUserId
      };
      return next();
    }

    // Allow admin token (not in DB)
    if (decoded.role === 'admin' && !decoded.portal) {
      req.user = { id: 0, role: 'admin', email: process.env.ADMIN_EMAIL, firstName: 'Admin' };
      return next();
    }

    // Check if regular user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = auth;
