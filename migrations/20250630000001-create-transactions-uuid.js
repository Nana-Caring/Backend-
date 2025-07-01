'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration is skipped because transactions table is already created
    // by 20250424000006-create-transactions-table.js
    console.log('Skipping UUID transactions table creation - using INTEGER version instead');
  },

  async down(queryInterface, Sequelize) {
    // No operation needed since no changes were made
    console.log('No operation needed for UUID transactions migration down');
  }
};