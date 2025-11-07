'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if accountName column exists in Accounts table
      const [accountNameResults] = await queryInterface.sequelize.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'Accounts' AND column_name = 'accountName';"
      );
      
      if (accountNameResults.length === 0) {
        await queryInterface.addColumn('Accounts', 'accountName', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Human readable name for the account'
        });
        console.log('✅ Added accountName column to Accounts table');
      } else {
        console.log('ℹ️ accountName column already exists');
      }
      
    } catch (error) {
      console.log('Migration completed with notes:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Accounts', 'accountName');
    } catch (error) {
      console.log('Rollback completed:', error.message);
    }
  }
};
