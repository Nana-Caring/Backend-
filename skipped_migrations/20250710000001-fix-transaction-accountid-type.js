'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if Transactions table exists
      const tableExists = await queryInterface.describeTable('Transactions').catch(() => false);
      
      if (tableExists) {
        // Change accountId from INTEGER to UUID
        await queryInterface.changeColumn('Transactions', 'accountId', {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Accounts',
            key: 'id'
          }
        });
        
        console.log('✅ Updated Transactions.accountId to UUID type');
      } else {
        console.log('ℹ️ Transactions table does not exist, will be created with correct types');
      }
    } catch (error) {
      console.error('❌ Migration error:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('Transactions', 'accountId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Accounts',
          key: 'id'
        }
      });
      
      console.log('✅ Reverted Transactions.accountId to INTEGER type');
    } catch (error) {
      console.error('❌ Rollback error:', error.message);
      throw error;
    }
  }
};
