'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // This migration is disabled - Accounts table is created by 20250313201217-add-accountType-to-Accounts.js with INTEGER IDs
      console.log('Skipping UUID-based accounts table creation - using INTEGER-based version instead');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.dropTable('Accounts');
      // Drop the ENUM type as well
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Accounts_status";');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
};