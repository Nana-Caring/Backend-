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

// Helper to generate welcome email HTML with login credentials
function getWelcomeEmail({ user, password, loginUrl = 'https://nanacaring-backend.onrender.com' }) {
    const roleTitle = user.role === 'funder' ? 'Funder' : 
                     user.role === 'caregiver' ? 'Caregiver' : 'Dependent';
    
    return `
        <div style="font-family: Arial, sans-serif; background: #f7f9fa; padding: 32px; border-radius: 8px; max-width: 520px; margin: auto;">
            <div style="text-align: center; margin-bottom: 24px;">
                <img src='/assets/nana-logo.png' alt='NANA Logo' style='height: 60px; margin-bottom: 8px;' />
                <h2 style="color: #2d7ff9; margin: 0;">Welcome to NANA Portal!</h2>
            </div>
            
            <p style="font-size: 16px;">Hi ${user.firstName} ${user.surname},</p>
            <p style="font-size: 15px;">Welcome to NANA Portal! Your account has been successfully created as a <strong>${roleTitle}</strong>.</p>
            
            <div style="background: #fff; padding: 20px; border-radius: 6px; margin: 24px 0; border-left: 4px solid #2d7ff9;">
                <h3 style="margin: 0 0 16px 0; color: #333;">Your Login Credentials:</h3>
                <p style="margin: 8px 0; font-size: 15px;"><strong>Email:</strong> ${user.email}</p>
                <p style="margin: 8px 0; font-size: 15px;"><strong>Password:</strong> <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
                <p style="margin: 8px 0; font-size: 15px;"><strong>Role:</strong> ${roleTitle}</p>
                ${user.Idnumber ? `<p style="margin: 8px 0; font-size: 15px;"><strong>ID Number:</strong> ${user.Idnumber}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 24px 0;">
                <a href="${loginUrl}/api/auth/login" style="background: #2d7ff9; color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">Login to Your Account</a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 16px; border-radius: 6px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Security Note:</strong> Please keep your login credentials secure and consider changing your password after your first login.</p>
            </div>
            
            <h3 style="color: #333; margin: 24px 0 16px 0;">What's Next?</h3>
            <ul style="padding-left: 20px; color: #555;">
                <li style="margin-bottom: 8px;">Log in to your account using the credentials above</li>
                <li style="margin-bottom: 8px;">Complete your profile information</li>
                ${user.role === 'funder' ? '<li style="margin-bottom: 8px;">Start managing your financial accounts</li>' : ''}
                ${user.role === 'caregiver' ? '<li style="margin-bottom: 8px;">Begin registering and managing dependents</li>' : ''}
                ${user.role === 'dependent' ? '<li style="margin-bottom: 8px;">Explore your accounts and transaction history</li>' : ''}
                <li style="margin-bottom: 8px;">Contact support if you need any assistance</li>
            </ul>
            
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888; text-align: center;">
                NANA Portal &copy; 2025<br>
                If you didn't request this account, please contact our support team immediately.
            </p>
        </div>
    `;
}

module.exports = { sendMail, getPasswordResetEmail, getWelcomeEmail };
