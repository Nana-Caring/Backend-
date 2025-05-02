'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Accounts', 'lastTransactionDate', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Accounts', 'lastTransactionDate');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
};