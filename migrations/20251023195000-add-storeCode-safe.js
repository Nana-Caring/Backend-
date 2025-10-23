'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if storeCode column exists before adding it
    try {
      const [results] = await queryInterface.sequelize.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'Orders' AND column_name = 'storeCode';"
      );
      
      if (results.length === 0) {
        // Column doesn't exist, add it
        await queryInterface.addColumn('Orders', 'storeCode', {
          type: Sequelize.STRING(8),
          allowNull: false,
          unique: true,
          defaultValue: 'TEMP0001'
        });
        
        // Remove default after adding
        await queryInterface.changeColumn('Orders', 'storeCode', {
          type: Sequelize.STRING(8),
          allowNull: false,
          unique: true
        });
      }
    } catch (error) {
      console.log('Store code column already exists or other issue:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Orders', 'storeCode');
    } catch (error) {
      console.log('Could not remove storeCode column:', error.message);
    }
  }
};
