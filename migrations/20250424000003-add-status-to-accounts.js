'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Accounts', 'status', {
        type: Sequelize.ENUM('active', 'inactive', 'frozen'),
        defaultValue: 'active',
        allowNull: false,
      });
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Accounts', 'status');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Accounts_status";');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
};