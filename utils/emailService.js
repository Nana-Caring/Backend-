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

// Generate password reset email HTML with dual platform support
// Supports both web browsers and mobile app deep links
function getPasswordResetEmail({ user, resetUrl, mobileUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f7f9fa; padding: 32px; border-radius: 8px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2d7ff9; margin: 0;">NANA Portal Password Reset</h2>
      </div>
      
      <p style="font-size: 16px;">Hi ${user.firstName || user.email},</p>
      
      <p style="font-size: 15px;">You requested a password reset for your NANA Portal account.</p>
      
      <!-- DUAL PLATFORM RESET OPTIONS: Web and Mobile App -->
      <div style="background: #fff; padding: 20px; border-radius: 6px; margin: 24px 0; border-left: 4px solid #2d7ff9;">
        <p style="margin: 0 0 16px 0; font-size: 15px;">Choose how you'd like to reset your password:</p>
        
        <!-- Reset buttons for both web and mobile platforms -->
        <div style="text-align: center; margin: 20px 0;">
          <!-- Web browser reset button (blue) -->
          <a href="${resetUrl}" style="background: #2d7ff9; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block; margin: 5px;">🌐 Reset on Web</a>
          
          <!-- Mobile app deep link button (green) - only shows if mobile URL provided -->
          ${mobileUrl ? `<a href="${mobileUrl}" style="background: #28a745; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px; display: inline-block; margin: 5px;">📱 Open in App</a>` : ''}
        </div>
        
        <!-- Mobile user tip - only shows if mobile URL is available -->
        ${mobileUrl ? `
        <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 12px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #0066cc;">
            💡 <strong>Tip:</strong> If you're on your phone, tap "Open in App" to reset your password directly in the NANA mobile app!
          </p>
        </div>
        ` : ''}
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 16px; border-radius: 6px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>Security Note:</strong> This link will expire in 15 minutes. If you did not request this, please ignore this email and your password will remain unchanged.
        </p>
      </div>
      
      <!-- Fallback links in case buttons don't work -->
      <p style="font-size: 14px; color: #555;">
        If the buttons don't work, you can copy and paste these links:<br>
        <strong>Web Browser:</strong> <a href="${resetUrl}" style="color: #2d7ff9; word-break: break-all;">${resetUrl}</a><br>
        ${mobileUrl ? `<strong>Mobile App:</strong> <a href="${mobileUrl}" style="color: #28a745; word-break: break-all;">${mobileUrl}</a>` : ''}
      </p>
      
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        NANA Portal &copy; 2025<br>
        If you didn't request this password reset, please contact our support team immediately.
      </p>
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
                <img src='https://nanacaring-backend.onrender.com/assets/logo.jpg' alt='NANA Logo' style='height: 60px; margin-bottom: 8px;' />
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

module.exports = {
    sendMail,
    getPasswordResetEmail,
    getWelcomeEmail,
    getUserBlockedEmail,
    getUserSuspendedEmail,
    getUserUnblockedEmail,
    getUserUnsuspendedEmail,
    getAccountDeletedEmail
};

// Helper to generate user blocked email
function getUserBlockedEmail({ user, reason, blockedBy }) {
    return `
        <div style="font-family: Arial, sans-serif; background: #fff5f5; padding: 32px; border-radius: 8px; max-width: 520px; margin: auto; border-left: 4px solid #ef4444;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #ef4444; margin: 0;">Account Blocked</h2>
            </div>
            <p style="font-size: 16px;">Dear ${user.firstName} ${user.surname},</p>
            <p style="font-size: 15px;">Your NANA Portal account has been <strong>blocked</strong> by an administrator.</p>
            
            <div style="background: #fef2f2; padding: 16px; border-radius: 4px; margin: 16px 0; border-left: 3px solid #ef4444;">
                <h4 style="margin: 0 0 8px 0; color: #dc2626;">Reason for blocking:</h4>
                <p style="margin: 0; font-size: 14px;">${reason || 'No specific reason provided'}</p>
            </div>
            
            <p style="font-size: 14px;">You will no longer be able to access your account or use NANA Portal services.</p>
            <p style="font-size: 14px;">If you believe this is an error, please contact our support team for assistance.</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 4px; margin: 24px 0;">
                <p style="font-size: 13px; margin: 0; color: #6b7280;">
                    <strong>Account Details:</strong><br>
                    Email: ${user.email}<br>
                    Blocked Date: ${new Date().toLocaleDateString()}
                </p>
            </div>
            
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888; text-align: center;">NANA Portal Support Team &copy; 2025</p>
        </div>
    `;
}

// Helper to generate user suspended email
function getUserSuspendedEmail({ user, reason, suspendedUntil, suspendedBy }) {
    const suspensionEndDate = new Date(suspendedUntil).toLocaleDateString();
    const suspensionDays = Math.ceil((new Date(suspendedUntil) - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
        <div style="font-family: Arial, sans-serif; background: #fffbeb; padding: 32px; border-radius: 8px; max-width: 520px; margin: auto; border-left: 4px solid #f59e0b;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #f59e0b; margin: 0;">Account Suspended</h2>
            </div>
            <p style="font-size: 16px;">Dear ${user.firstName} ${user.surname},</p>
            <p style="font-size: 15px;">Your NANA Portal account has been <strong>temporarily suspended</strong> by an administrator.</p>
            
            <div style="background: #fef3c7; padding: 16px; border-radius: 4px; margin: 16px 0; border-left: 3px solid #f59e0b;">
                <h4 style="margin: 0 0 8px 0; color: #d97706;">Reason for suspension:</h4>
                <p style="margin: 0; font-size: 14px;">${reason || 'No specific reason provided'}</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 4px; margin: 16px 0;">
                <h4 style="margin: 0 0 8px 0; color: #374151;">Suspension Details:</h4>
                <p style="margin: 0; font-size: 14px;">
                    <strong>Suspension Duration:</strong> ${suspensionDays} days<br>
                    <strong>Suspension End Date:</strong> ${suspensionEndDate}<br>
                    <strong>Current Status:</strong> Suspended
                </p>
            </div>
            
            <p style="font-size: 14px;">During this period, you will not be able to access your account or use NANA Portal services.</p>
            <p style="font-size: 14px;">Your account will be automatically reactivated on ${suspensionEndDate}.</p>
            <p style="font-size: 14px;">If you believe this is an error, please contact our support team for assistance.</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 4px; margin: 24px 0;">
                <p style="font-size: 13px; margin: 0; color: #6b7280;">
                    <strong>Account Details:</strong><br>
                    Email: ${user.email}<br>
                    Suspended Date: ${new Date().toLocaleDateString()}<br>
                    Reactivation Date: ${suspensionEndDate}
                </p>
            </div>
            
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888; text-align: center;">NANA Portal Support Team &copy; 2025</p>
        </div>
    `;
}

// Helper to generate user unblocked email
function getUserUnblockedEmail({ user }) {
    return `
        <div style="font-family: Arial, sans-serif; background: #f0fdf4; padding: 32px; border-radius: 8px; max-width: 520px; margin: auto; border-left: 4px solid #22c55e;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #22c55e; margin: 0;">Account Reactivated</h2>
            </div>
            <p style="font-size: 16px;">Dear ${user.firstName} ${user.surname},</p>
            <p style="font-size: 15px;">Good news! Your NANA Portal account has been <strong>reactivated</strong> by an administrator.</p>
            
            <div style="background: #dcfce7; padding: 16px; border-radius: 4px; margin: 16px 0; border-left: 3px solid #22c55e;">
                <h4 style="margin: 0 0 8px 0; color: #16a34a;">Account Status: Active</h4>
                <p style="margin: 0; font-size: 14px;">You can now access all NANA Portal services again.</p>
            </div>
            
            <p style="font-size: 14px;">You can now log in to your account and continue using NANA Portal services.</p>
            <p style="font-size: 14px;">We apologize for any inconvenience caused during the blocking period.</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 4px; margin: 24px 0;">
                <p style="font-size: 13px; margin: 0; color: #6b7280;">
                    <strong>Account Details:</strong><br>
                    Email: ${user.email}<br>
                    Reactivated Date: ${new Date().toLocaleDateString()}<br>
                    Status: Active
                </p>
            </div>
            
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888; text-align: center;">NANA Portal Support Team &copy; 2025</p>
        </div>
    `;
}

// Helper to generate user unsuspended email
function getUserUnsuspendedEmail({ user }) {
    return `
        <div style="font-family: Arial, sans-serif; background: #f0fdf4; padding: 32px; border-radius: 8px; max-width: 520px; margin: auto; border-left: 4px solid #22c55e;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #22c55e; margin: 0;">Suspension Lifted</h2>
            </div>
            <p style="font-size: 16px;">Dear ${user.firstName} ${user.surname},</p>
            <p style="font-size: 15px;">Your NANA Portal account suspension has been <strong>lifted</strong> and your account is now active.</p>
            
            <div style="background: #dcfce7; padding: 16px; border-radius: 4px; margin: 16px 0; border-left: 3px solid #22c55e;">
                <h4 style="margin: 0 0 8px 0; color: #16a34a;">Account Status: Active</h4>
                <p style="margin: 0; font-size: 14px;">You can now access all NANA Portal services again.</p>
            </div>
            
            <p style="font-size: 14px;">You can now log in to your account and continue using NANA Portal services.</p>
            <p style="font-size: 14px;">Thank you for your patience during the suspension period.</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 4px; margin: 24px 0;">
                <p style="font-size: 13px; margin: 0; color: #6b7280;">
                    <strong>Account Details:</strong><br>
                    Email: ${user.email}<br>
                    Suspension Lifted: ${new Date().toLocaleDateString()}<br>
                    Status: Active
                </p>
            </div>
            
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888; text-align: center;">NANA Portal Support Team &copy; 2025</p>
        </div>
    `;
}

// Helper to generate account deleted email
function getAccountDeletedEmail({ user, deletedBy }) {
    return `
        <div style="font-family: Arial, sans-serif; background: #fafafa; padding: 32px; border-radius: 8px; max-width: 520px; margin: auto; border-left: 4px solid #6b7280;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #6b7280; margin: 0;">Account Deleted</h2>
            </div>
            <p style="font-size: 16px;">Dear ${user.firstName} ${user.surname},</p>
            <p style="font-size: 15px;">Your NANA Portal account has been <strong>permanently deleted</strong> by an administrator.</p>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 4px; margin: 16px 0; border-left: 3px solid #6b7280;">
                <h4 style="margin: 0 0 8px 0; color: #374151;">Account Deletion Notice</h4>
                <p style="margin: 0; font-size: 14px;">All your account data and associated information have been removed from our systems.</p>
            </div>
            
            <p style="font-size: 14px;">This action is permanent and cannot be undone.</p>
            <p style="font-size: 14px;">If you believe this deletion was made in error, please contact our support team immediately.</p>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 4px; margin: 24px 0;">
                <p style="font-size: 13px; margin: 0; color: #6b7280;">
                    <strong>Final Account Details:</strong><br>
                    Email: ${user.email}<br>
                    Deleted Date: ${new Date().toLocaleDateString()}<br>
                    Status: Permanently Deleted
                </p>
            </div>
            
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888; text-align: center;">NANA Portal Support Team &copy; 2025</p>
        </div>
    `;
}
