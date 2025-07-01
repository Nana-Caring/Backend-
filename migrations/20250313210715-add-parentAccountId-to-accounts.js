// migrations/xxxxxx-add-parentAccountId-to-accounts.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if column exists
      const tableInfo = await queryInterface.describeTable('Accounts');
      if (!tableInfo.parentAccountId) {
        await queryInterface.addColumn('Accounts', 'parentAccountId', {
          type: Sequelize.INTEGER, // Changed to INTEGER to match Accounts.id
          allowNull: true,
          references: {
            model: 'Accounts',
            key: 'id',
          },
          onDelete: 'SET NULL',
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable('Accounts');
      if (tableInfo.parentAccountId) {
        await queryInterface.removeColumn('Accounts', 'parentAccountId');
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },
};
