// utils/emailService.js
// Uses Nodemailer with Gmail for reliable transactional email
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASS  // App password (not your regular Gmail password)
    }
});

async function sendMail({ to, subject, html }) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        html
    };
    return transporter.sendMail(mailOptions);
}

// Helper to generate password reset email HTML
function getPasswordResetEmail({ user, resetUrl }) {
    return `
        <div style="font-family: Arial, sans-serif; background: #f7f9fa; padding: 32px; border-radius: 8px; max-width: 480px; margin: auto;">
            <div style="text-align: center; margin-bottom: 24px;">
                <img src='/assets/nana-logo.png' alt='NANA Logo' style='height: 60px; margin-bottom: 8px;' />
                <h2 style="color: #2d7ff9; margin: 0;">NANA Portal Password Reset</h2>
            </div>
            <p style="font-size: 16px;">Hi ${user.firstName || user.email},</p>
            <p style="font-size: 15px;">You requested a password reset for your NANA Portal account.</p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="${resetUrl}" style="background: #2d7ff9; color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #555;">This link will expire in 30 minutes. If you did not request this, please ignore this email.</p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888; text-align: center;">NANA Portal &copy; 2025</p>
        </div>
    `;
}

module.exports = { sendMail, getPasswordResetEmail };
