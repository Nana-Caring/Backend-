const admin = require('firebase-admin');
const { Client } = require('@onesignal/node-onesignal');
const { Expo } = require('expo-server-sdk');

class SimplePushService {
  constructor() {
    this.initializeServices();
    this.provider = process.env.PUSH_SERVICE_PROVIDER || 'hybrid';
  }

  initializeServices() {
    this.initializeFirebase();
    this.initializeOneSignal();
    this.initializeExpo();
  }

  initializeFirebase() {
    try {
      // Skip Firebase initialization if required env vars are missing
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        console.log('🔥 Firebase FCM skipped - missing environment variables');
        return;
      }

      if (!admin.apps.length) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      
      this.fcm = admin.messaging();
      console.log('🔥 Firebase FCM initialized');
    } catch (error) {
      console.error('❌ Firebase FCM initialization failed:', error.message);
      // Don't crash the server, just disable Firebase notifications
      this.fcm = null;
    }
  }

  initializeOneSignal() {
    try {
      // Skip OneSignal initialization if required env vars are missing
      if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_API_KEY) {
        console.log('🟠 OneSignal skipped - missing environment variables');
        this.oneSignal = null;
        return;
      }

      this.oneSignal = new Client({
        userKey: process.env.ONESIGNAL_USER_AUTH_KEY,
        appKey: process.env.ONESIGNAL_API_KEY,
      });
      this.oneSignalAppId = process.env.ONESIGNAL_APP_ID;
      console.log('🟠 OneSignal initialized');
    } catch (error) {
      console.error('❌ OneSignal initialization failed:', error.message);
      // Don't crash the server, just disable OneSignal notifications
      this.oneSignal = null;
    }
  }

  initializeExpo() {
    try {
      if (process.env.EXPO_PUSH_ENABLED === 'true') {
        this.expo = new Expo();
        console.log('📱 Expo Push initialized');
      } else {
        this.expo = null;
      }
    } catch (error) {
      console.error('❌ Expo initialization failed:', error);
      this.expo = null;
    }
  }

  async sendNotification({ userId, title, body, data = {}, tokens = {} }) {
    const results = [];

    // Try Firebase FCM
    if (this.fcm && tokens.fcmToken && (this.provider === 'firebase' || this.provider === 'hybrid')) {
      try {
        const fcmResult = await this.sendViaFirebase(tokens.fcmToken, title, body, data);
        results.push({ service: 'firebase', success: true, ...fcmResult });
        console.log(`✅ Firebase push sent to user ${userId}`);
      } catch (error) {
        console.error('Firebase FCM failed:', error);
        results.push({ service: 'firebase', success: false, error: error.message });
      }
    }

    // Try OneSignal
    if (this.oneSignal && tokens.oneSignalPlayerId && (this.provider === 'onesignal' || this.provider === 'hybrid')) {
      try {
        const oneSignalResult = await this.sendViaOneSignal(tokens.oneSignalPlayerId, title, body, data);
        results.push({ service: 'onesignal', success: true, ...oneSignalResult });
        console.log(`✅ OneSignal push sent to user ${userId}`);
      } catch (error) {
        console.error('OneSignal failed:', error);
        results.push({ service: 'onesignal', success: false, error: error.message });
      }
    }

    // Try Expo
    if (this.expo && tokens.expoPushToken && (this.provider === 'expo' || this.provider === 'hybrid')) {
      try {
        const expoResult = await this.sendViaExpo(tokens.expoPushToken, title, body, data);
        results.push({ service: 'expo', success: true, ...expoResult });
        console.log(`✅ Expo push sent to user ${userId}`);
      } catch (error) {
        console.error('Expo failed:', error);
        results.push({ service: 'expo', success: false, error: error.message });
      }
    }

    const successfulServices = results.filter(r => r.success).length;
    return {
      success: successfulServices > 0,
      results,
      successfulServices,
      totalAttempts: results.length
    };
  }

  async sendViaFirebase(token, title, body, data) {
    const message = {
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries({ ...data, service: 'firebase' }).map(([k, v]) => [k, String(v)])
      ),
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#007bff',
          sound: 'default',
          channelId: 'nana_notifications'
        }
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default'
          }
        }
      }
    };

    const response = await this.fcm.send(message);
    return { messageId: response };
  }

  async sendViaOneSignal(playerId, title, body, data) {
    const notification = {
      app_id: this.oneSignalAppId,
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: body },
      data: { ...data, service: 'onesignal' },
      android_accent_color: "FF007BFF",
      small_icon: "ic_notification"
    };

    const response = await this.oneSignal.createNotification(notification);
    return { notificationId: response.id };
  }

  async sendViaExpo(token, title, body, data) {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Invalid Expo push token');
    }

    const message = {
      to: token,
      sound: 'default',
      title,
      body,
      data: { ...data, service: 'expo' }
    };

    const chunks = this.expo.chunkPushNotifications([message]);
    const tickets = await this.expo.sendPushNotificationsAsync(chunks[0]);
    
    const ticket = tickets[0];
    if (ticket.status === 'error') {
      throw new Error(ticket.details?.error || 'Expo send failed');
    }

    return { ticketId: ticket.id };
  }
}

module.exports = new SimplePushService();