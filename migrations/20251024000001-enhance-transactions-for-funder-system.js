'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns for enhanced transaction functionality
    await queryInterface.addColumn('Transactions', 'balanceAfter', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Account balance after this transaction'
    });

    await queryInterface.addColumn('Transactions', 'status', {
      type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'completed',
      comment: 'Transaction status'
    });

    await queryInterface.addColumn('Transactions', 'recipientAccountId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'id'
      },
      comment: 'Account receiving the transfer (for transfer_out transactions)'
    });

    await queryInterface.addColumn('Transactions', 'senderAccountId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'id'
      },
      comment: 'Account sending the transfer (for transfer_in transactions)'
    });

    // Update the type enum to include new transaction types
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Transactions_type" 
      ADD VALUE IF NOT EXISTS 'deposit';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Transactions_type" 
      ADD VALUE IF NOT EXISTS 'transfer_out';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Transactions_type" 
      ADD VALUE IF NOT EXISTS 'transfer_in';
    `);

    // Add indexes for better performance
    await queryInterface.addIndex('Transactions', ['status'], {
      name: 'idx_transactions_status'
    });

    await queryInterface.addIndex('Transactions', ['recipientAccountId'], {
      name: 'idx_transactions_recipient_account_id'
    });

    await queryInterface.addIndex('Transactions', ['senderAccountId'], {
      name: 'idx_transactions_sender_account_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('Transactions', 'idx_transactions_status');
    await queryInterface.removeIndex('Transactions', 'idx_transactions_recipient_account_id');
    await queryInterface.removeIndex('Transactions', 'idx_transactions_sender_account_id');

    // Remove columns
    await queryInterface.removeColumn('Transactions', 'balanceAfter');
    await queryInterface.removeColumn('Transactions', 'status');
    await queryInterface.removeColumn('Transactions', 'recipientAccountId');
    await queryInterface.removeColumn('Transactions', 'senderAccountId');

    // Note: Removing enum values is more complex and may cause issues if data exists
    // We'll leave the enum values in place for safety
  }
};
