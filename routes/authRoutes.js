const express = require("express");
const { check, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, getUser, registerDependent, adminLogin, verifyResetToken } = require("../controllers/authController");


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

// REGISTER (Funder or Caregiver)
router.post(
  "/register",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("surname", "Surname is required").not().isEmpty(),
    check("email", "Include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("role", "Role must be either funder or caregiver").isIn(["funder", "caregiver"]),
    check("Idnumber", "Valid 13-digit numeric ID number required").isLength({ min: 13, max: 13 }).isNumeric(),
  ],
  register
);

// REGISTER DEPENDENT (by Caregiver)
router.post(
  "/register-dependent",
  [
    authMiddleware,
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("surname", "Surname is required").not().isEmpty(),
    check("Idnumber", "Valid 13-digit numeric ID number required").isLength({ min: 13, max: 13 }).isNumeric(),
    check("relation", "Relation is required").not().isEmpty(),
  ],
  registerDependent
);

// GET CURRENT USER
router.get("/me", authMiddleware, getUser);

// Forgot Password 
router.post(
  "/forgot-password",
  [
    check("email", "Include a valid email").isEmail(),
  ],
  async (req, res) => {
    const { email } = req.body;
    
    try {
      const User = require("../models/User");
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        // Don't reveal if email exists for security reasons
        return res.json({ message: 'If email exists, reset link sent.' });
      }

      // Generate secure token
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + 1000 * 60 * 10; // 10 minutes expiration

      await user.update({ resetToken: token, resetTokenExpires: expires });

      // Send email
      const { sendMail, getPasswordResetEmail } = require('../utils/emailService');
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      const html = getPasswordResetEmail({ user, resetUrl });
      
      await sendMail({
        to: email,
        subject: 'Password Reset Request',
        html
      });

      res.json({ message: 'If email exists, reset link sent.' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Rate limiting middleware for password reset
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 reset requests per email per 15 minutes
  message: 'Too many password reset attempts, try again later.',
  keyGenerator: (req) => req.body.email || req.ip
});

// Reset Password 
router.post(
  "/reset-password",
  [
    check("email", "Include a valid email").isEmail(),
    check("token", "Reset token is required").not().isEmpty(),
    check("newPassword", "Password must be at least 10 characters").isLength({ min: 6 }),
  ],
  forgotPasswordLimiter, // Apply rate limiting
  async (req, res) => {
    const { email, token, newPassword } = req.body;

    try {
      const User = require("../models/User");
      const user = await User.findOne({ 
        where: { email, resetToken: token } 
      });

      if (!user || !user.resetTokenExpires || user.resetTokenExpires < Date.now()) {
        return res.status(400).json({ 
          message: 'Invalid or expired reset token.' 
        });
      }

      // Hash new password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Invalidate token after single use
      await user.update({ 
        password: hashedPassword, 
        resetToken: null,        
        resetTokenExpires: null  
      });

      // Log reset attempts for monitoring
      console.log(`Password reset requested for: ${email} at ${new Date()}`);

      res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Verify Reset Token
router.post("/verify-reset-token", verifyResetToken);

module.exports = router;




