// migrations/xxxxxx-update-account-type-column.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First create the table if it doesn't exist
      await queryInterface.createTable('Accounts', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        accountType: {
          type: Sequelize.STRING,
          allowNull: false
        },
        balance: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0.00
        },
        parentAccountId: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    } catch (error) {
      console.error('Migration up error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Drop the table in the down migration
      await queryInterface.dropTable('Accounts');
    } catch (error) {
      console.error('Migration down error:', error);
      throw error;
    }
  }
};
