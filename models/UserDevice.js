const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserDevice = sequelize.define('UserDevice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  platform: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: false
  },
  deviceId: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  fcmToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  oneSignalPlayerId: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  expoPushToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pushToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastSeenAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'UserDevices',
  indexes: [
    { fields: ['userId', 'isActive'] },
    { 
      fields: ['userId', 'deviceId'],
      unique: true,
      name: 'user_devices_user_device_unique'
    }
  ]
});

module.exports = UserDevice;
