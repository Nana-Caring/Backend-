'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NotificationPreferences', {
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
      eventType: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      emailEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      pushEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Add unique constraint on userId + eventType
    await queryInterface.addIndex('NotificationPreferences', ['userId', 'eventType'], {
      unique: true,
      name: 'notification_preferences_user_event_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NotificationPreferences');
  }
};