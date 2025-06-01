'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Accounts', 'currency', {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'ZAR', // South African Rand as default
        validate: {
          isIn: [['ZAR', 'USD', 'EUR', 'GBP']] // Add more currencies as needed
        }
      });
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Accounts', 'currency');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
};