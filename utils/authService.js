// utils/authService.js
// Additional authentication utility functions
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate a secure password reset token
 * @returns {string} Hex encoded token
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if a reset token is valid and not expired
 * @param {string} token - The reset token
 * @param {string} email - User email
 * @returns {Promise<{valid: boolean, user: Object|null}>}
 */
async function validateResetToken(token, email) {
  try {
    const user = await User.findOne({
      where: {
        email: email,
        resetToken: token,
        resetTokenExpires: {
          [Op.gt]: Date.now() // Token hasn't expired
        }
      }
    });

    return {
      valid: !!user,
      user: user
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      valid: false,
      user: null
    };
  }
}

/**
 * Clear reset token from user (makes it single-use)
 * @param {Object} user - User instance
 * @returns {Promise<void>}
 */
async function clearResetToken(user) {
  await user.update({
    resetToken: null,
    resetTokenExpires: null
  });
}

/**
 * Check if user exists by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
async function findUserByEmail(email) {
  try {
    return await User.findOne({ where: { email } });
  } catch (error) {
    console.error('Find user error:', error);
    return null;
  }
}

/**
 * Get password reset token expiration time
 * @param {number} minutes - Minutes from now (default 15)
 * @returns {Date} Expiration date
 */
function getTokenExpiration(minutes = 15) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password && password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  // Optional: Add more password strength requirements
  // if (!/(?=.*[a-z])/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }
  
  // if (!/(?=.*[A-Z])/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  
  // if (!/(?=.*\d)/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Generate a secure temporary password
 * @param {number} length - Password length (default 12)
 * @returns {string} Generated password
 */
function generateTemporaryPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}

module.exports = {
  generateResetToken,
  validateResetToken,
  clearResetToken,
  findUserByEmail,
  getTokenExpiration,
  validatePassword,
  generateTemporaryPassword
};
