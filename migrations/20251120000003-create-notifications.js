'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
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
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      channels: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '["email"]'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed', 'partial'),
        allowNull: false,
        defaultValue: 'pending'
      },
      emailStatus: {
        type: Sequelize.ENUM('pending', 'sent', 'failed', 'delivered', 'bounced'),
        allowNull: true
      },
      pushStatus: {
        type: Sequelize.ENUM('pending', 'sent', 'failed', 'delivered'),
        allowNull: true
      },
      readAt: {
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
    await queryInterface.addIndex('Notifications', ['userId', 'status']);
    await queryInterface.addIndex('Notifications', ['type', 'createdAt']);
    await queryInterface.addIndex('Notifications', ['readAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};