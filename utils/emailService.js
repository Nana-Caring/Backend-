// utils/emailService.js
// Email service for sending password reset emails
const nodemailer = require('nodemailer');


// Create transporter based on environment
const createTransporter = async () => {
  // Always use Gmail for email sending
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
};

// Send email function
async function sendMail({ to, subject, html }) {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@nanacaring.com',
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

  

    
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

// Generate password reset email HTML
function getPasswordResetEmail({ user, resetUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f7f9fa; padding: 32px; border-radius: 8px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2d7ff9; margin: 0;">NANA Portal Password Reset</h2>
      </div>
      
      <p style="font-size: 16px;">Hi ${user.firstName || user.email},</p>
      
      <p style="font-size: 15px;">You requested a password reset for your NANA Portal account.</p>
      
      <div style="background: #fff; padding: 20px; border-radius: 6px; margin: 24px 0; border-left: 4px solid #2d7ff9;">
        <p style="margin: 0 0 16px 0; font-size: 15px;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background: #2d7ff9; color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block;">Reset Password</a>
        </div>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 16px; border-radius: 6px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>Security Note:</strong> This link will expire in 15 minutes. If you did not request this, please ignore this email and your password will remain unchanged.
        </p>
      </div>
      
      <p style="font-size: 14px; color: #555;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #2d7ff9; word-break: break-all;">${resetUrl}</a>
      </p>
      
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        NANA Portal &copy; 2025<br>
        If you didn't request this password reset, please contact our support team immediately.
      </p>
    </div>
  `;
}

// Generate password reset success email HTML
function getPasswordResetSuccessEmail({ user }) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f7f9fa; padding: 32px; border-radius: 8px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #28a745; margin: 0;">Password Reset Successful</h2>
      </div>
      
      <p style="font-size: 16px;">Hi ${user.firstName || user.email},</p>
      
      <p style="font-size: 15px;">Your password has been successfully reset for your NANA Portal account.</p>
      
      <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 16px; border-radius: 6px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #155724;">
          <strong>✓ Password Changed:</strong> Your account is now secure with your new password.
        </p>
      </div>
      
      <p style="font-size: 14px; color: #555;">
        If you did not make this change, please contact our support team immediately.
      </p>
      
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        NANA Portal &copy; 2025
      </p>
    </div>
  `;
}

module.exports = {
  sendMail,
  getPasswordResetEmail,
  getPasswordResetSuccessEmail
};
