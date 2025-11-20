'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserDevices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      platform: {
        type: Sequelize.ENUM('android', 'ios', 'web'),
        allowNull: false
      },
      deviceId: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      // Firebase FCM Token
      fcmToken: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // OneSignal Player ID
      oneSignalPlayerId: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      // Expo Push Token
      expoPushToken: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Legacy support
      pushToken: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      lastSeenAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('UserDevices', ['userId', 'isActive']);
    await queryInterface.addIndex('UserDevices', ['userId', 'deviceId'], {
      unique: true,
      name: 'user_devices_user_device_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserDevices');
  }
};