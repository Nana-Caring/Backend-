const express = require("express");
const { check, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, getUser, registerDependent, adminLogin, verifyResetToken, retailerLogin } = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/auth");
const authMiddleware = authenticateToken; // For backward compatibility


const router = express.Router();

// LOGIN
router.post(
  "/login",
  [
    check("email", "Include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);

// ADMIN LOGIN
router.post("/admin-login", adminLogin);

// RETAILER LOGIN
router.post(
  "/retailer-login",
  [
    check("email", "Include a valid email").isEmail(),
    check("password", "Password is required").exists(),
    check("storeId", "Store ID is optional").optional().isString()
  ],
  retailerLogin
);

// REGISTER (Funder or Caregiver)
router.post(
  "/register",
  [
    check("firstName", "First name is required").not().isEmpty().trim(),
    check("middleName", "Middle name is optional").optional().trim(),
    check("surname", "Surname is required").not().isEmpty().trim(),
    check("email", "Include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("role", "Role must be either funder or caregiver").isIn(["funder", "caregiver"]),
    check("Idnumber", "Valid 13-digit numeric ID number required").isLength({ min: 13, max: 13 }).isNumeric(),
  ],
  register
);

// REGISTER DEPENDENT (by Caregiver or Funder)
router.post(
  "/register-dependent",
  [
    authMiddleware,
    check("firstName", "First name is required").not().isEmpty().trim(),
    check("middleName", "Middle name is optional").optional().trim(),
    check("surname", "Surname is required").not().isEmpty().trim(),
    check("email", "Valid email is required").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("Idnumber", "Valid 13-digit numeric ID number required").isLength({ min: 13, max: 13 }).isNumeric(),
    check("relation", "Relation is required").not().isEmpty().trim(),
  ],
  registerDependent
);

// GET CURRENT USER
router.get("/me", authMiddleware, getUser);

// Rate limiting middleware for password reset requests
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 reset requests per email per 15 minutes
  message: 'Too many password reset attempts, try again later.',
  keyGenerator: (req) => req.body.email || req.ip
});

// Forgot Password (IMPROVED VERSION)
router.post(
  "/forgot-password",
  forgotPasswordLimiter, // Apply rate limiting here
  [
    check("email", "Include a valid email").isEmail(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a valid email address",
        errors: errors.array() 
      });
    }

    const { email } = req.body;
    
    try {
      const User = require("../models/User");
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
      const frontendUrl = (process.env.FRONTEND_URL || 'https://password-reset-29wr.onrender.com/').replace(/\/$/, '');
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


// TESTING ENDPOINT: Forgot Password with Token Response (FOR DEVELOPMENT ONLY)
if (process.env.NODE_ENV === 'development') {
  router.post(
    "/test-forgot-password",
    [
      check("email", "Include a valid email").isEmail(),
    ],
    async (req, res) => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { email } = req.body;
      
      try {
        const User = require("../models/User");
        const user = await User.findOne({ 
          where: { email: email.toLowerCase().trim() },
          attributes: ['id', 'firstName', 'surname', 'email', 'role']
        });
        
        if (!user) {
          return res.status(404).json({ 
            success: false,
            message: 'User not found with this email address.' 
          });
        }

        // Generate secure token
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + (10 * 60 * 1000); // 10 minutes expiration

        await user.update({ resetToken: token, resetTokenExpires: expires });

        // For testing: return token directly instead of sending email
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5000').replace(/\/$/, '');
        const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        res.json({ 
          success: true,
          message: 'Reset token generated successfully for testing.',
          data: {
            token: token,
            email: email,
            userRole: user.role,
            expiresAt: new Date(expires).toISOString(),
            resetUrl: resetUrl
          },
          note: 'This endpoint is for testing only. Use /forgot-password for production.'
        });
      } catch (error) {
        console.error('Test forgot password error:', error);
        res.status(500).json({ 
          success: false,
          message: 'Server error' 
        });
      }
    }
  );
}

// Reset Password (IMPROVED VERSION)
router.post(
  "/reset-password",
  [
    check("email", "Include a valid email").isEmail(),
    check("token", "Reset token is required").not().isEmpty(),
    check("newPassword", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: "Please check your input and try again",
        errors: errors.array() 
      });
    }

    const { email, token, newPassword } = req.body;

    try {
      const User = require("../models/User");
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

// Verify Reset Token
router.post("/verify-reset-token", verifyResetToken);

module.exports = router;




