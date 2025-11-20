const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');
const UserDevice = require('../models/UserDevice');
const NotificationPreference = require('../models/NotificationPreference');
const { authMiddleware } = require('../middleware/auth');

// 📱 Device Management

/**
 * Register a device for push notifications
 * POST /api/notifications/devices
 */
router.post('/devices', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceType, fcmToken, oneSignalPlayerId, expoPushToken, deviceInfo } = req.body;

    // Validate required fields
    if (!deviceType || !['android', 'ios', 'web'].includes(deviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid deviceType is required (android, ios, web)'
      });
    }

    // Check if device already exists and update, or create new
    let device = await UserDevice.findOne({
      where: {
        userId,
        deviceType,
        ...(fcmToken && { fcmToken }),
        ...(oneSignalPlayerId && { oneSignalPlayerId }),
        ...(expoPushToken && { expoPushToken })
      }
    });

    if (device) {
      // Update existing device
      device = await device.update({
        fcmToken,
        oneSignalPlayerId,
        expoPushToken,
        deviceInfo,
        isActive: true,
        lastSeen: new Date()
      });
    } else {
      // Create new device
      device = await UserDevice.create({
        userId,
        deviceType,
        fcmToken,
        oneSignalPlayerId,
        expoPushToken,
        deviceInfo,
        isActive: true
      });
    }

    res.json({
      success: true,
      data: {
        deviceId: device.id,
        message: 'Device registered successfully'
      }
    });

  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get user's devices
 * GET /api/notifications/devices
 */
router.get('/devices', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const devices = await UserDevice.findAll({
      where: { userId },
      order: [['lastSeen', 'DESC']]
    });

    res.json({
      success: true,
      data: devices
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices'
    });
  }
});

/**
 * Update device status
 * PATCH /api/notifications/devices/:deviceId
 */
router.patch('/devices/:deviceId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId } = req.params;
    const { isActive } = req.body;

    const device = await UserDevice.findOne({
      where: { id: deviceId, userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    await device.update({
      isActive: isActive !== undefined ? isActive : device.isActive,
      lastSeen: new Date()
    });

    res.json({
      success: true,
      data: device,
      message: 'Device updated successfully'
    });

  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device'
    });
  }
});

// 🔔 Notification Preferences

/**
 * Get user notification preferences
 * GET /api/notifications/preferences
 */
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    let preferences = await NotificationPreference.findAll({
      where: { userId }
    });

    // If no preferences exist, create defaults
    if (preferences.length === 0) {
      preferences = await NotificationPreference.createDefaultPreferences(userId);
    }

    res.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences'
    });
  }
});

/**
 * Update notification preferences
 * PATCH /api/notifications/preferences
 */
router.patch('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        message: 'Preferences must be an array'
      });
    }

    const updated = [];

    for (const pref of preferences) {
      const { notificationType, emailEnabled, pushEnabled, smsEnabled } = pref;

      const [preference] = await NotificationPreference.upsert({
        userId,
        notificationType,
        emailEnabled,
        pushEnabled,
        smsEnabled
      });

      updated.push(preference);
    }

    res.json({
      success: true,
      data: updated,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// 📧 Manual Notifications (Admin/Testing)

/**
 * Send test notification
 * POST /api/notifications/test
 */
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body, channels } = req.body;

    const result = await NotificationService.sendTestNotification({
      userId,
      title,
      body,
      channels: channels || ['email', 'push']
    });

    res.json({
      success: true,
      data: result,
      message: 'Test notification sent'
    });

  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Send dependent registration notification (Admin only)
 * POST /api/notifications/dependent-registered
 */
router.post('/dependent-registered', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { funderId, dependentName, customName, accountNumber } = req.body;

    if (!funderId || !dependentName || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'funderId, dependentName, and accountNumber are required'
      });
    }

    const result = await NotificationService.notifyDependentRegistered({
      funderId,
      dependentName,
      customName,
      accountNumber
    });

    res.json({
      success: true,
      data: result,
      message: 'Dependent registration notification sent'
    });

  } catch (error) {
    console.error('Error sending dependent registration notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

/**
 * Send low balance notification (Admin only)
 * POST /api/notifications/low-balance
 */
router.post('/low-balance', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { userId, accountNumber, balance, threshold } = req.body;

    if (!userId || !accountNumber || balance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'userId, accountNumber, and balance are required'
      });
    }

    const result = await NotificationService.notifyLowBalance({
      userId,
      accountNumber,
      balance,
      threshold: threshold || 10
    });

    res.json({
      success: true,
      data: result,
      message: 'Low balance notification sent'
    });

  } catch (error) {
    console.error('Error sending low balance notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// 📜 Notification History

/**
 * Get user's notification history
 * GET /api/notifications/history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, eventType } = req.query;
    
    const where = { userId };
    if (eventType) where.eventType = eventType;

    const { Notification } = require('../models');
    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      attributes: {
        exclude: ['data'] // Exclude potentially large data field unless needed
      }
    });
    
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification history'
    });
  }
});

/**
 * Get specific notification with data
 * GET /api/notifications/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { Notification } = require('../models');
    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification'
    });
  }
});

/**
 * Mark notifications as read
 * PATCH /api/notifications/read
 */
router.patch('/read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds must be an array'
      });
    }

    const { Notification } = require('../models');
    const [updatedCount] = await Notification.update(
      { readAt: new Date() },
      { 
        where: { 
          userId, 
          id: notificationIds,
          readAt: null 
        }
      }
    );
    
    res.json({
      success: true,
      message: `${updatedCount} notifications marked as read`,
      updated: updatedCount
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
});

module.exports = router;