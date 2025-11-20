const emailService = require('./emailService');
const pushService = require('./pushService');
const { User, Notification, NotificationPreference, UserDevice } = require('../models');

class SimpleNotificationService {
  // Event types constants
  static EVENT_TYPES = {
    DEPENDENT_REGISTERED: 'dependent.registered',
    WELCOME_MESSAGE: 'welcome.message',
    ACCOUNT_LOW_BALANCE: 'account.low_balance',
    PASSWORD_RESET: 'password.reset',
    TRANSACTION_COMPLETED: 'transaction.completed',
    ACCOUNT_CREATED: 'account.created',
    FUNDER_LINKED: 'funder.linked'
  };

  /**
   * Create and send notification immediately (no queue)
   */
  static async createNotification({ userId, type, title, body, data = {}, channels = ['email'] }) {
    try {
      console.log(`📧 Creating immediate notification for user ${userId}: ${type}`);

      // Check user notification preferences
      const preference = await NotificationPreference.findOne({
        where: { userId, eventType: type }
      });

      // If preference exists, respect user settings
      const shouldSendEmail = preference ? preference.emailEnabled : true;
      const shouldSendPush = preference ? preference.pushEnabled : true;

      // Filter channels based on user preferences
      const enabledChannels = [];
      if (channels.includes('email') && shouldSendEmail) enabledChannels.push('email');
      if (channels.includes('push') && shouldSendPush) enabledChannels.push('push');

      const results = [];

      // Send email if enabled
      if (enabledChannels.includes('email')) {
        try {
          const emailResult = await this.sendEmailNotification({ userId, title, body, data, type });
          results.push({ channel: 'email', ...emailResult });
        } catch (error) {
          console.error('Email notification failed:', error);
          results.push({ channel: 'email', success: false, error: error.message });
        }
      }

      // Send push if enabled
      if (enabledChannels.includes('push')) {
        try {
          const pushResult = await this.sendPushNotification({ userId, title, body, data });
          results.push({ channel: 'push', ...pushResult });
        } catch (error) {
          console.error('Push notification failed:', error);
          results.push({ channel: 'push', success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ Notification completed - ${successCount}/${results.length} channels successful`);
      
      // Save notification to database
      const notification = await Notification.create({
        userId,
        type: type,
        title,
        body: body,
        data: JSON.stringify(data),
        status: successCount > 0 ? 'sent' : 'failed',
        emailSent: results.find(r => r.channel === 'email')?.success || false,
        pushSent: results.find(r => r.channel === 'push')?.success || false,
        errorMessage: results.filter(r => !r.success).map(r => r.error).join('; ') || null
      });
      
      return {
        success: successCount > 0,
        notification,
        results,
        type,
        userId,
        sentAt: new Date().toISOString(),
        enabledChannels
      };

    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  static async sendEmailNotification({ userId, title, body, data, type }) {
    // Get user details (you'll need to implement this based on your User model)
    const User = require('../models/User'); // Adjust path as needed
    const user = await User.findByPk(userId);
    
    if (!user || !user.email) {
      throw new Error(`User ${userId} not found or no email`);
    }

    // Use specific email templates for different notification types
    switch (type) {
      case this.EVENT_TYPES.DEPENDENT_REGISTERED:
        return await emailService.sendDependentRegistrationEmail({
          funderEmail: user.email,
          funderName: `${user.firstName} ${user.surname}`,
          dependentName: data.dependentName,
          customName: data.customName,
          accountNumber: data.accountNumber
        });
        
      case this.EVENT_TYPES.WELCOME_MESSAGE:
        return await emailService.sendWelcomeEmail({
          dependentEmail: user.email,
          dependentName: `${user.firstName} ${user.surname}`,
          funderName: data.funderName,
          accountNumber: data.accountNumber
        });
        
      case this.EVENT_TYPES.ACCOUNT_LOW_BALANCE:
        return await emailService.sendLowBalanceEmail({
          userEmail: user.email,
          userName: `${user.firstName} ${user.surname}`,
          accountNumber: data.accountNumber,
          balance: data.balance,
          threshold: data.threshold
        });
        
      default:
        // Generic notification email
        return await emailService.sendNotificationEmail({
          to: user.email,
          subject: title,
          text: body,
          data
        });
    }
  }

  static async sendPushNotification({ userId, title, body, data }) {
    // Get user devices (you'll need to implement this based on your UserDevice model)
    try {
      const UserDevice = require('../models/UserDevice'); // Adjust path as needed
      
      const devices = await UserDevice.findAll({
        where: { 
          userId,
          isActive: true
        }
      });

      if (devices.length === 0) {
        return { success: false, error: 'No active devices found' };
      }

      // Get all available tokens from devices
      const tokens = {};
      devices.forEach(device => {
        if (device.fcmToken) tokens.fcmToken = device.fcmToken;
        if (device.oneSignalPlayerId) tokens.oneSignalPlayerId = device.oneSignalPlayerId;
        if (device.expoPushToken) tokens.expoPushToken = device.expoPushToken;
      });

      if (Object.keys(tokens).length === 0) {
        return { success: false, error: 'No valid push tokens found' };
      }

      const result = await pushService.sendNotification({
        userId,
        title,
        body,
        data,
        tokens
      });

      return result;

    } catch (error) {
      console.error('Error getting user devices:', error);
      return { success: false, error: 'Failed to get user devices' };
    }
  }

  // SPECIFIC EVENT METHODS

  /**
   * Send dependent registration notification to funder
   */
  static async notifyDependentRegistered({ funderId, dependentName, customName, accountNumber }) {
    const displayName = customName || dependentName;
    
    return await this.createNotification({
      userId: funderId,
      type: this.EVENT_TYPES.DEPENDENT_REGISTERED,
      title: '👶 Dependent Registered Successfully',
      body: `You successfully registered ${displayName}. Their main account (${accountNumber}) is now active and ready for funding.`,
      data: {
        dependentName,
        customName,
        accountNumber,
        action: 'view_dependent'
      },
      channels: ['email', 'push']
    });
  }

  /**
   * Send welcome notification to newly registered dependent
   */
  static async notifyDependentWelcome({ dependentId, funderName, accountNumber }) {
    return await this.createNotification({
      userId: dependentId,
      type: this.EVENT_TYPES.WELCOME_MESSAGE,
      title: '🎉 Welcome to NANA!',
      body: `Welcome! ${funderName} has set up your account. Your main account number is ${accountNumber}.`,
      data: {
        funderName,
        accountNumber,
        action: 'view_account'
      },
      channels: ['email', 'push']
    });
  }

  /**
   * Send low balance alert
   */
  static async notifyLowBalance({ userId, accountNumber, balance, threshold }) {
    return await this.createNotification({
      userId,
      type: this.EVENT_TYPES.ACCOUNT_LOW_BALANCE,
      title: '⚠️ Low Account Balance',
      body: `Your account ${accountNumber} balance is low: R${balance}. Consider adding funds.`,
      data: {
        accountNumber,
        balance,
        threshold,
        action: 'add_funds'
      },
      channels: ['email', 'push']
    });
  }

  /**
   * Send transaction completed notification
   */
  static async notifyTransactionCompleted({ userId, amount, merchantName, transactionId }) {
    return await this.createNotification({
      userId,
      type: this.EVENT_TYPES.TRANSACTION_COMPLETED,
      title: '💳 Transaction Completed',
      body: `Transaction of R${amount} at ${merchantName} completed successfully.`,
      data: {
        amount,
        merchantName,
        transactionId,
        action: 'view_transaction'
      },
      channels: ['push'] // Only push for transactions to avoid email spam
    });
  }

  /**
   * Send welcome notification for new users
   */
  static async notifyUserWelcome({ userId, firstName, role }) {
    return await this.createNotification({
      userId,
      type: this.EVENT_TYPES.WELCOME_MESSAGE,
      title: `🎉 Welcome to NANA, ${firstName}!`,
      body: `Your ${role} account has been created successfully. You can now start using NANA services.`,
      data: {
        firstName,
        role,
        action: 'complete_profile'
      },
      channels: ['email', 'push']
    });
  }

  /**
   * Test notification function
   */
  static async sendTestNotification({ userId, title, body, channels = ['email'] }) {
    return await this.createNotification({
      userId,
      type: 'test.notification',
      title: title || '🧪 Test Notification',
      body: body || 'This is a test notification to verify the system is working.',
      data: { test: true, timestamp: new Date().toISOString() },
      channels
    });
  }

  /**
   * Create default notification preferences for a new user
   */
  static async createDefaultPreferences(userId) {
    const defaultPreferences = [
      { eventType: 'dependent.registered', emailEnabled: true, pushEnabled: true },
      { eventType: 'welcome.message', emailEnabled: true, pushEnabled: true },
      { eventType: 'account.low_balance', emailEnabled: true, pushEnabled: true },
      { eventType: 'password.reset', emailEnabled: true, pushEnabled: false },
      { eventType: 'transaction.completed', emailEnabled: false, pushEnabled: true },
      { eventType: 'account.created', emailEnabled: true, pushEnabled: true },
      { eventType: 'funder.linked', emailEnabled: true, pushEnabled: true }
    ];

    const preferences = defaultPreferences.map(pref => ({ userId, ...pref }));
    return await NotificationPreference.bulkCreate(preferences);
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(userId, preferences) {
    const results = [];
    for (const pref of preferences) {
      const [updated] = await NotificationPreference.upsert({
        userId,
        eventType: pref.eventType,
        emailEnabled: pref.emailEnabled,
        pushEnabled: pref.pushEnabled
      });
      results.push(updated);
    }
    return results;
  }

  /**
   * Get user notification preferences
   */
  static async getPreferences(userId) {
    return await NotificationPreference.findAll({ 
      where: { userId },
      order: [['eventType', 'ASC']]
    });
  }

  /**
   * Register user device for push notifications
   */
  static async registerDevice(userId, deviceInfo) {
    const [device] = await UserDevice.upsert({
      userId,
      platform: deviceInfo.platform,
      deviceId: deviceInfo.deviceId,
      fcmToken: deviceInfo.fcmToken,
      oneSignalPlayerId: deviceInfo.oneSignalPlayerId,
      expoPushToken: deviceInfo.expoPushToken,
      pushToken: deviceInfo.pushToken, // Legacy support
      isActive: true,
      lastSeenAt: new Date()
    });
    return device;
  }

  /**
   * Get user's active devices
   */
  static async getUserDevices(userId) {
    return await UserDevice.findAll({
      where: { userId, isActive: true },
      order: [['lastSeenAt', 'DESC']]
    });
  }

  /**
   * Get user's notification history
   */
  static async getNotificationHistory(userId, limit = 50, eventType = null) {
    const where = { userId };
    if (eventType) where.eventType = eventType;

    return await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(userId, notificationIds) {
    return await Notification.update(
      { readAt: new Date() },
      { 
        where: { 
          userId, 
          id: notificationIds,
          readAt: null 
        }
      }
    );
  }
}

module.exports = SimpleNotificationService;