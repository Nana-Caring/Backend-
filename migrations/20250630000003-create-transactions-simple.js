'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is disabled to avoid conflicts with 20250424000006-create-transactions-table.js
    console.log('Skipping duplicate transaction table creation - using main INTEGER version instead');
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // Disabled migration - no down action needed
    console.log('Skipping duplicate transaction table down migration');
    return Promise.resolve();
  }
};
