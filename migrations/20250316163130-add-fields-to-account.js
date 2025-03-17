'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, let's check if the column exists before trying to modify it
    const tableInfo = await queryInterface.describeTable('Accounts');
    
    // Only try to modify accountNumber if it exists
    if (tableInfo.accountNumber) {
      await queryInterface.changeColumn('Accounts', 'accountNumber', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }
    
    // Add the new columns you requested (if they don't exist)
    if (!tableInfo.currency) {
      await queryInterface.addColumn('Accounts', 'currency', {
        type: Sequelize.STRING(3),
        defaultValue: 'ZAR',
        allowNull: false
      });
    }

    if (!tableInfo.status) {
      await queryInterface.addColumn('Accounts', 'status', {
        type: Sequelize.ENUM('active', 'inactive', 'frozen'),
        defaultValue: 'active',
        allowNull: false
      });
    }

    if (!tableInfo.creationDate) {
      await queryInterface.addColumn('Accounts', 'creationDate', {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW,
        allowNull: false
      });
    }

    if (!tableInfo.lastTransactionDate) {
      await queryInterface.addColumn('Accounts', 'lastTransactionDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new columns, but only if they exist
    const tableInfo = await queryInterface.describeTable('Accounts');
    
    if (tableInfo.lastTransactionDate) {
      await queryInterface.removeColumn('Accounts', 'lastTransactionDate');
    }
    
    if (tableInfo.creationDate) {
      await queryInterface.removeColumn('Accounts', 'creationDate');
    }
    
    if (tableInfo.status) {
      await queryInterface.removeColumn('Accounts', 'status');
    }
    
    if (tableInfo.currency) {
      await queryInterface.removeColumn('Accounts', 'currency');
    }
    
    // Only try to modify accountNumber if it exists
    if (tableInfo.accountNumber) {
      await queryInterface.changeColumn('Accounts', 'accountNumber', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      });
    }
    
    // Remove the ENUM type if it exists
    try {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Accounts_status";');
    } catch (error) {
      console.log('enum_Accounts_status does not exist or cannot be dropped');
    }
  }
};