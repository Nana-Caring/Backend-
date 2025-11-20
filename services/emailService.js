const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      console.log('📧 Email service initialized with Gmail SMTP');
      return transporter;
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      return null;
    }
  }

  async sendNotificationEmail({ to, subject, text, html, data = {} }) {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'NANA Caring',
          address: process.env.FROM_EMAIL || 'nana@nanacaring.com'
        },
        to,
        subject,
        text,
        html: html || this.generateHTML(subject, text, data)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully to ${to}:`, result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Email send failed:', error);
      throw error;
    }
  }

  generateHTML(subject, text, data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white; 
            padding: 30px 20px;
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
          }
          .content { 
            padding: 30px 20px;
            background: #ffffff;
          }
          .content h2 {
            color: #007bff;
            margin-top: 0;
            font-size: 24px;
          }
          .content p {
            font-size: 16px;
            margin-bottom: 16px;
          }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer { 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
            background: #f8f9fa;
          }
          .divider {
            height: 1px;
            background: #e9ecef;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 NANA Caring</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>${text}</p>
            ${data.action ? `
              <div class="divider"></div>
              <p><a href="#" class="button">View in App</a></p>
            ` : ''}
            ${data.accountNumber ? `
              <div class="divider"></div>
              <p><strong>Account Number:</strong> ${data.accountNumber}</p>
            ` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} NANA Caring. Supporting families, one step at a time.</p>
            <p style="font-size: 12px; margin-top: 10px;">
              You received this email because you are a registered user of NANA Caring.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Template methods for specific notifications
  async sendDependentRegistrationEmail({ funderEmail, funderName, dependentName, customName, accountNumber }) {
    const displayName = customName || dependentName;
    
    return this.sendNotificationEmail({
      to: funderEmail,
      subject: `✅ ${displayName} Successfully Registered`,
      text: `Dear ${funderName},\n\nGreat news! You have successfully registered ${displayName} as your dependent.\n\nAccount Details:\n• Display Name: ${displayName}\n• Main Account Number: ${accountNumber}\n• Status: Active and ready for funding\n\nYou can now fund their account and manage their expenses through your NANA dashboard.\n\nBest regards,\nThe NANA Team`,
      data: { funderName, dependentName, customName, accountNumber, action: 'view_dependent' }
    });
  }

  async sendWelcomeEmail({ dependentEmail, dependentName, funderName, accountNumber }) {
    return this.sendNotificationEmail({
      to: dependentEmail,
      subject: `🎉 Welcome to NANA, ${dependentName}!`,
      text: `Dear ${dependentName},\n\nWelcome to NANA Caring! ${funderName} has set up your account and you're all ready to go.\n\nYour Account Details:\n• Main Account Number: ${accountNumber}\n• Funder: ${funderName}\n• Status: Active\n\nYou can now use this account to make purchases at participating stores. Download our app to track your spending and account balance.\n\nWelcome to the NANA family!\n\nBest regards,\nThe NANA Team`,
      data: { dependentName, funderName, accountNumber, action: 'download_app' }
    });
  }

  async sendLowBalanceEmail({ userEmail, userName, accountNumber, balance, threshold }) {
    return this.sendNotificationEmail({
      to: userEmail,
      subject: `⚠️ Low Balance Alert - Account ${accountNumber}`,
      text: `Dear ${userName},\n\nYour NANA account balance is running low.\n\nAccount Details:\n• Account Number: ${accountNumber}\n• Current Balance: R${balance}\n• Low Balance Threshold: R${threshold}\n\nTo avoid any interruption in services, please consider adding funds to your account.\n\nYou can top up your account through:\n• The NANA mobile app\n• Our website\n• Participating retail partners\n\nBest regards,\nThe NANA Team`,
      data: { userName, accountNumber, balance, threshold, action: 'add_funds' }
    });
  }

  async testEmailConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();