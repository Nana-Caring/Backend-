const express = require('express');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting middleware for password reset requests
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 reset requests per email per 15 minutes
  message: 'Too many password reset attempts, try again later.',
  keyGenerator: (req) => req.body.email || req.ip
});

// Forgot Password endpoint
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  [
    check('email', 'Include a valid email').isEmail(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address',
        errors: errors.array() 
      });
    }

    const { email } = req.body;
    
    try {
      const User = require('../models/User');
      const user = await User.findOne({ 
        where: { email: email.toLowerCase().trim() },
        attributes: ['id', 'firstName', 'middleName', 'surname', 'email', 'role']
      });
      
      // Always return success message for security (don't reveal if email exists)
      const successMessage = 'If an account with that email exists, a password reset link has been sent.';
      
      if (!user) {
        return res.json({ 
          success: true,
          message: successMessage
        });
      }

      // Generate secure token
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = Date.now() + (10 * 60 * 1000); // 10 minutes from now

      // Update user with reset token
      await user.update({ 
        resetToken, 
        resetTokenExpires 
      });

      // Prepare reset URL
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5000').replace(/\/$/, '');
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      // Send email with reset link
      try {
        const { sendMail, getPasswordResetEmail } = require('../utils/emailService');
        
        const emailHtml = getPasswordResetEmail({ 
          user: {
            firstName: user.firstName,
            middleName: user.middleName,
            surname: user.surname,
            email: user.email,
            role: user.role
          }, 
          resetUrl 
        });
        
        await sendMail({
          to: email,
          subject: 'NANA Caring - Password Reset Request',
          html: emailHtml
        });

        console.log(`✅ Password reset email sent successfully to ${email} (${user.role})`);
        
        res.json({ 
          success: true,
          message: successMessage,
          emailSent: true
        });

      } catch (emailError) {
        console.error('❌ Failed to send password reset email:', emailError);
        
        // Clear the reset token if email fails
        await user.update({ 
          resetToken: null, 
          resetTokenExpires: null 
        });

        res.status(500).json({ 
          success: false,
          message: 'Failed to send reset email. Please try again later.',
          error: 'Email service unavailable'
        });
      }

    } catch (error) {
      console.error('❌ Forgot password error:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred. Please try again later.',
        error: 'Server error'
      });
    }
  }
);

// Reset Password endpoint
router.post(
  '/reset-password',
  [
    check('email', 'Include a valid email').isEmail(),
    check('token', 'Reset token is required').not().isEmpty(),
    check('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Please check your input and try again',
        errors: errors.array() 
      });
    }

    const { email, token, newPassword } = req.body;

    try {
      const User = require('../models/User');
      const user = await User.findOne({ 
        where: { 
          email: email.toLowerCase().trim(),
          resetToken: token 
        },
        attributes: ['id', 'firstName', 'surname', 'email', 'role', 'resetToken', 'resetTokenExpires']
      });

      // Check if user exists and token is valid
      if (!user) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid reset link. Please request a new password reset.' 
        });
      }

      // Check if token has expired
      if (!user.resetTokenExpires || Date.now() > user.resetTokenExpires) {
        // Clear expired token
        await user.update({ 
          resetToken: null,        
          resetTokenExpires: null  
        });

        return res.status(400).json({ 
          success: false,
          message: 'Reset link has expired. Please request a new password reset.' 
        });
      }

      // Hash new password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token (single use)
      await user.update({ 
        password: hashedPassword, 
        resetToken: null,        
        resetTokenExpires: null  
      });

      // Log successful password reset for security monitoring
      console.log(`✅ Password reset successful for user: ${email} (${user.role}) at ${new Date().toISOString()}`);

      res.json({ 
        success: true,
        message: 'Your password has been reset successfully. You can now log in with your new password.',
        userRole: user.role
      });

    } catch (error) {
      console.error('❌ Reset password error:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while resetting your password. Please try again.',
        error: 'Server error'
      });
    }
  }
);

module.exports = router;
