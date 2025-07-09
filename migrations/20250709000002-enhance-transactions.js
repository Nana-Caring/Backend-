'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to Transactions table
    await queryInterface.addColumn('Transactions', 'description', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Transactions', 'reference', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('Transactions', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true
    });

    // Add index for reference column
    await queryInterface.addIndex('Transactions', ['reference'], {
      name: 'transactions_reference_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns
    await queryInterface.removeColumn('Transactions', 'description');
    await queryInterface.removeColumn('Transactions', 'reference');
    await queryInterface.removeColumn('Transactions', 'metadata');
  }
};
