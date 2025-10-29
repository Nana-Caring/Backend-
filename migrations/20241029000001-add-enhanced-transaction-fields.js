'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🚀 Adding enhanced transaction fields...');
      
      // Add senderName field
      await queryInterface.addColumn('Transactions', 'senderName', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Name of the person/entity sending money'
      });
      console.log('✅ Added senderName field');

      // Add senderAccountNumber field
      await queryInterface.addColumn('Transactions', 'senderAccountNumber', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Account number money is coming from'
      });
      console.log('✅ Added senderAccountNumber field');

      // Add recipientName field
      await queryInterface.addColumn('Transactions', 'recipientName', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Name of the person receiving money'
      });
      console.log('✅ Added recipientName field');

      // Add recipientAccountNumber field
      await queryInterface.addColumn('Transactions', 'recipientAccountNumber', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Account number money is going to'
      });
      console.log('✅ Added recipientAccountNumber field');

      // Add transactionCategory enum field
      await queryInterface.addColumn('Transactions', 'transactionCategory', {
        type: Sequelize.ENUM(
          'fund_transfer', 
          'purchase', 
          'allowance', 
          'emergency_fund',
          'smart_distribution', 
          'manual_transfer', 
          'refund', 
          'fee',
          'deposit',
          'withdrawal'
        ),
        allowNull: true,
        comment: 'Category of transaction for better organization'
      });
      console.log('✅ Added transactionCategory field');

      // Add merchantName field
      await queryInterface.addColumn('Transactions', 'merchantName', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'For purchases - name of store/merchant'
      });
      console.log('✅ Added merchantName field');

      console.log('🎉 Enhanced transaction fields migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Error in enhanced transaction migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Removing enhanced transaction fields...');
      
      await queryInterface.removeColumn('Transactions', 'senderName');
      await queryInterface.removeColumn('Transactions', 'senderAccountNumber');
      await queryInterface.removeColumn('Transactions', 'recipientName');
      await queryInterface.removeColumn('Transactions', 'recipientAccountNumber');
      await queryInterface.removeColumn('Transactions', 'transactionCategory');
      await queryInterface.removeColumn('Transactions', 'merchantName');
      
      console.log('✅ Enhanced transaction fields removed successfully');
      
    } catch (error) {
      console.error('❌ Error removing enhanced transaction fields:', error);
      throw error;
    }
  }
};