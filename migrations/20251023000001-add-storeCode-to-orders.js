'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'storeCode', {
      type: Sequelize.STRING(8),
      unique: true,
      allowNull: true, // Allow null initially for existing orders
      comment: 'Unique 8-character code for in-store pickup/verification'
    });

    // Add index for faster lookups
    await queryInterface.addIndex('Orders', ['storeCode'], {
      name: 'orders_store_code_idx',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Orders', 'orders_store_code_idx');
    await queryInterface.removeColumn('Orders', 'storeCode');
  }
};
