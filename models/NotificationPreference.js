const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationPreference = sequelize.define('NotificationPreference', {
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
    },
    onDelete: 'CASCADE'
  },
  eventType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  emailEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether user wants email notifications for this type'
  },
  pushEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether user wants push notifications for this type'
  }
}, {
  tableName: 'NotificationPreferences',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['userId', 'eventType'],
      unique: true,
      name: 'notification_preferences_user_event_unique'
    }
  ]
});

// Define associations
NotificationPreference.associate = (models) => {
  NotificationPreference.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// Class methods for managing preferences
NotificationPreference.getDefaultPreferences = () => {
  return [
    { eventType: 'dependent.registered', emailEnabled: true, pushEnabled: true },
    { eventType: 'welcome.message', emailEnabled: true, pushEnabled: true },
    { eventType: 'account.low_balance', emailEnabled: true, pushEnabled: true },
    { eventType: 'password.reset', emailEnabled: true, pushEnabled: false },
    { eventType: 'transaction.completed', emailEnabled: false, pushEnabled: true },
    { eventType: 'account.created', emailEnabled: true, pushEnabled: true },
    { eventType: 'funder.linked', emailEnabled: true, pushEnabled: true },
    { eventType: 'marketing.promotional', emailEnabled: false, pushEnabled: false },
    { eventType: 'system.maintenance', emailEnabled: true, pushEnabled: true }
  ];
};

NotificationPreference.createDefaultPreferences = async (userId) => {
  const defaults = NotificationPreference.getDefaultPreferences();
  const preferences = defaults.map(pref => ({
    userId,
    ...pref
  }));
  
  return await NotificationPreference.bulkCreate(preferences);
};

NotificationPreference.getUserPreference = async (userId, eventType) => {
  const preference = await NotificationPreference.findOne({
    where: { userId, eventType }
  });
  
  // If no preference exists, return default
  if (!preference) {
    const defaults = NotificationPreference.getDefaultPreferences();
    const defaultPref = defaults.find(p => p.eventType === eventType);
    return defaultPref || { emailEnabled: true, pushEnabled: true };
  }
  
  return preference;
};

module.exports = NotificationPreference;