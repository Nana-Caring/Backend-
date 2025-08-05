const express = require('express');
const router = express.Router();
const { portalAdminLogin } = require('../controllers/adminTransactionController');
const authenticate = require('../middlewares/auth');
const portalController = require('../controllers/portalController');

// Admin login as user for portal access
router.post('/admin-login', portalAdminLogin);

// User portal endpoints
router.get('/me', authenticate, portalController.getUserDetails);
router.put('/me', authenticate, portalController.updateUserProfile);
router.get('/me/accounts', authenticate, portalController.getUserAccounts);
router.get('/me/transactions', authenticate, portalController.getUserTransactions);

// Admin reset user password directly (for current logged-in user)
router.post('/reset-password', authenticate, async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required.' });
    }
    try {
        const { User } = require('../models');
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Hash the new password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });
        res.json({ message: 'Password reset successful for user: ' + user.email });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin reset user password by email
router.post('/reset-user-password', authenticate, async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required.' });
    }
    try {
        const user = await require('../models').User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Hash the new password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });
        res.json({ message: 'Password reset successful.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin request password reset link for user (TEMPORARILY DISABLED - PENDING DB UPDATE)
/*
router.post('/request-password-reset', authenticate, async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try {
        const { User } = require('../models');
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Generate secure token
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 1000 * 60 * 30; // 30 minutes
        // Save token and expiry to user (add fields if needed)
        await user.update({ resetToken: token, resetTokenExpires: expires });
        // Send email
        const { sendMail, getPasswordResetEmail } = require('../utils/emailService');
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        const html = getPasswordResetEmail({ user, resetUrl });
        await sendMail({
            to: email,
            subject: 'Password Reset Request',
            html
        });
        res.json({ message: 'Password reset link sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Endpoint to reset password using token (TEMPORARILY DISABLED - PENDING DB UPDATE)
router.post('/reset-password-token', async (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
        return res.status(400).json({ message: 'Email, token, and new password are required.' });
    }
    try {
        const { User } = require('../models');
        const user = await User.findOne({ where: { email, resetToken: token } });
        if (!user || !user.resetTokenExpires || user.resetTokenExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        // Hash new password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword, resetToken: null, resetTokenExpires: null });
        res.json({ message: 'Password has been reset.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
*/

module.exports = router;
