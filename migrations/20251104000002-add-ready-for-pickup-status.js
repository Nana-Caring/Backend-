'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if 'ready_for_pickup' value already exists in enum
    const [results] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'ready_for_pickup' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_Orders_orderStatus')
    `);
    
    if (results.length === 0) {
      // Add 'ready_for_pickup' to the existing order status enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Orders_orderStatus" ADD VALUE 'ready_for_pickup' BEFORE 'shipped';
      `);
      console.log('✅ Added "ready_for_pickup" status to enum_Orders_orderStatus');
    } else {
      console.log('ℹ️ "ready_for_pickup" status already exists in enum_Orders_orderStatus');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum and updating all references
    console.log('Warning: Cannot automatically rollback enum value addition in PostgreSQL');
    console.log('Manual intervention required to remove "ready_for_pickup" from enum_Orders_orderStatus');
  }
};