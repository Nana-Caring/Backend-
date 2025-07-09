'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update the cardNumber column to store only 4 digits (last 4 digits)
    await queryInterface.changeColumn('PaymentCards', 'cardNumber', {
      type: Sequelize.STRING(4),
      allowNull: false,
      comment: 'Last 4 digits of card number for security'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to original size
    await queryInterface.changeColumn('PaymentCards', 'cardNumber', {
      type: Sequelize.STRING(19),
      allowNull: false,
      comment: 'Card number'
    });
  }
};
