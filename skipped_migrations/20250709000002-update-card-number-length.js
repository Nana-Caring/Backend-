'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the table exists and what the current structure is
    const tables = await queryInterface.showAllTables();
    const tableName = tables.includes('payment_cards') ? 'payment_cards' : 'PaymentCards';
    
    if (!tables.includes('payment_cards') && !tables.includes('PaymentCards')) {
      console.log('Payment cards table does not exist, skipping migration...');
      return;
    }

    try {
      // Update the cardNumber column to store only 4 digits (last 4 digits)
      await queryInterface.changeColumn(tableName, 'cardNumber', {
        type: Sequelize.STRING(4),
        allowNull: false,
        comment: 'Last 4 digits of card number for security'
      });
    } catch (error) {
      console.log('Error updating cardNumber column:', error.message);
      console.log('This might be because the column is already the correct size');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Check if the table exists
    const tables = await queryInterface.showAllTables();
    const tableName = tables.includes('payment_cards') ? 'payment_cards' : 'PaymentCards';
    
    if (!tables.includes('payment_cards') && !tables.includes('PaymentCards')) {
      console.log('Payment cards table does not exist, skipping rollback...');
      return;
    }

    try {
      // Revert back to original size
      await queryInterface.changeColumn(tableName, 'cardNumber', {
        type: Sequelize.STRING(19),
        allowNull: false,
        comment: 'Card number'
      });
    } catch (error) {
      console.log('Error reverting cardNumber column:', error.message);
    }
  }
};
