'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add user blocking and status fields
      await queryInterface.addColumn('Users', 'isBlocked', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });

      await queryInterface.addColumn('Users', 'blockedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'blockedBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });

      await queryInterface.addColumn('Users', 'blockReason', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'status', {
        type: Sequelize.ENUM('active', 'blocked', 'suspended', 'pending'),
        allowNull: false,
        defaultValue: 'active'
      });

      console.log('User blocking fields added successfully');
    } catch (error) {
      console.error('Error adding user blocking fields:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove the columns in reverse order
      await queryInterface.removeColumn('Users', 'status');
      await queryInterface.removeColumn('Users', 'blockReason');
      await queryInterface.removeColumn('Users', 'blockedBy');
      await queryInterface.removeColumn('Users', 'blockedAt');
      await queryInterface.removeColumn('Users', 'isBlocked');

      // Drop the ENUM type
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_status";');

      console.log('User blocking fields removed successfully');
    } catch (error) {
      console.error('Error removing user blocking fields:', error);
      throw error;
    }
  }
};
