const notificationService = require('../services/notificationService');
const { User, Notification, NotificationPreference, UserDevice } = require('../models');
const { Op } = require('sequelize');

class NotificationController {
  /**
   * Get user's notification preferences
   */
  static async getPreferences(req, res) {
    try {
      const { userId } = req.params;
      const preferences = await notificationService.getPreferences(userId);
      
      res.json({
        success: true,
        preferences
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get notification preferences',
        error: error.message
      });
    }
  }

  /**
   * Update user's notification preferences
   */
  static async updatePreferences(req, res) {
    try {
      const { userId } = req.params;
      const { preferences } = req.body;

      const updated = await notificationService.updatePreferences(userId, preferences);
      
      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        preferences: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        error: error.message
      });
    }
  }

  /**
   * Create default preferences for a user
   */
  static async createDefaultPreferences(req, res) {
    try {
      const { userId } = req.params;
      const preferences = await notificationService.createDefaultPreferences(userId);
      
      res.json({
        success: true,
        message: 'Default notification preferences created',
        preferences
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create default preferences',
        error: error.message
      });
    }
  }

  /**
   * Register a device for push notifications
   */
  static async registerDevice(req, res) {
    try {
      const { userId } = req.params;
      const deviceInfo = req.body;

      const device = await notificationService.registerDevice(userId, deviceInfo);
      
      res.json({
        success: true,
        message: 'Device registered successfully',
        device
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to register device',
        error: error.message
      });
    }
  }

  /**
   * Get user's registered devices
   */
  static async getDevices(req, res) {
    try {
      const { userId } = req.params;
      const devices = await notificationService.getUserDevices(userId);
      
      res.json({
        success: true,
        devices
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user devices',
        error: error.message
      });
    }
  }

  /**
   * Get user's notification history
   */
  static async getHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50, eventType } = req.query;
      
      const notifications = await notificationService.getNotificationHistory(
        userId, 
        parseInt(limit), 
        eventType
      );
      
      res.json({
        success: true,
        notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get notification history',
        error: error.message
      });
    }
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(req, res) {
    try {
      const { userId } = req.params;
      const { notificationIds } = req.body;

      const result = await notificationService.markAsRead(userId, notificationIds);
      
      res.json({
        success: true,
        message: `${result[0]} notifications marked as read`,
        updated: result[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
        error: error.message
      });
    }
  }

  /**
   * Send a test notification
   */
  static async sendTestNotification(req, res) {
    try {
      const { userId } = req.params;
      const { title, body, channels = ['email'] } = req.body;

      const result = await notificationService.sendTestNotification({
        userId,
        title,
        body,
        channels
      });
      
      res.json({
        success: true,
        message: 'Test notification sent successfully',
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message
      });
    }
  }

  /**
   * Send a manual notification
   */
  static async sendNotification(req, res) {
    try {
      const { userId, type, title, body, data = {}, channels = ['email'] } = req.body;

      const result = await notificationService.createNotification({
        userId,
        type,
        title,
        body,
        data,
        channels
      });
      
      res.json({
        success: true,
        message: 'Notification sent successfully',
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: error.message
      });
    }
  }

  /**
   * Get notification statistics for admin
   */
  static async getStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const whereClause = {};
      if (startDate) whereClause.createdAt = { ...whereClause.createdAt, [Op.gte]: new Date(startDate) };
      if (endDate) whereClause.createdAt = { ...whereClause.createdAt, [Op.lte]: new Date(endDate) };

      const [totalNotifications, sentNotifications, failedNotifications] = await Promise.all([
        Notification.count({ where: whereClause }),
        Notification.count({ where: { ...whereClause, status: 'sent' } }),
        Notification.count({ where: { ...whereClause, status: 'failed' } })
      ]);

      const stats = {
        total: totalNotifications,
        sent: sentNotifications,
        failed: failedNotifications,
        successRate: totalNotifications > 0 ? (sentNotifications / totalNotifications * 100).toFixed(2) : 0
      };
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get notification stats',
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;