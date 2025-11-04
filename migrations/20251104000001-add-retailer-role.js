'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if 'retailer' value already exists in enum
    const [results] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'retailer' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_Users_role')
    `);
    
    if (results.length === 0) {
      // Add 'retailer' to the existing role enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Users_role" ADD VALUE 'retailer';
      `);
      console.log('✅ Added "retailer" role to enum_Users_role');
    } else {
      console.log('ℹ️ "retailer" role already exists in enum_Users_role');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum and updating all references
    // For now, we'll leave a comment about manual rollback if needed
    console.log('Warning: Cannot automatically rollback enum value addition in PostgreSQL');
    console.log('Manual intervention required to remove "retailer" from enum_Users_role');
  }
};