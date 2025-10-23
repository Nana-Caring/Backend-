'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration was used to fix migration state issues
    // No changes needed as structure is already correct
  },

  async down(queryInterface, Sequelize) {
    // No rollback needed
  }
};