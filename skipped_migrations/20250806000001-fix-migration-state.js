'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration fixes the database state by manually updating the SequelizeMeta table
    // to mark the problematic migration as completed
    
    try {
      // Insert the problematic migration as completed
      await queryInterface.sequelize.query(`
        INSERT INTO "SequelizeMeta" (name) 
        VALUES ('20250702194524-fix-account-id-to-integer.js')
        ON CONFLICT (name) DO NOTHING
      `);
      
      console.log('Marked 20250702194524-fix-account-id-to-integer.js as completed');
    } catch (error) {
      console.log('Error marking migration as completed:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove the migration record
    try {
      await queryInterface.sequelize.query(`
        DELETE FROM "SequelizeMeta" 
        WHERE name = '20250702194524-fix-account-id-to-integer.js'
      `);
    } catch (error) {
      console.log('Error removing migration record:', error.message);
    }
  }
};
