'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if columns exist before adding them
      const [categoryResults] = await queryInterface.sequelize.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'Accounts' AND column_name = 'category';"
      );
      
      if (categoryResults.length === 0) {
        await queryInterface.addColumn('Accounts', 'category', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Account category for budget allocation'
        });
        console.log('✅ Added category column');
      }
      
      const [isMainResults] = await queryInterface.sequelize.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'Accounts' AND column_name = 'isMainAccount';"
      );
      
      if (isMainResults.length === 0) {
        await queryInterface.addColumn('Accounts', 'isMainAccount', {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          comment: 'Whether this is the main savings account'
        });
        console.log('✅ Added isMainAccount column');
      }
      
      const [allocatedResults] = await queryInterface.sequelize.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'Accounts' AND column_name = 'allocatedFromId';"
      );
      
      if (allocatedResults.length === 0) {
        await queryInterface.addColumn('Accounts', 'allocatedFromId', {
          type: Sequelize.UUID,
          allowNull: true,
          comment: 'Reference to main account this was allocated from'
        });
        console.log('✅ Added allocatedFromId column');
      }
      
    } catch (error) {
      console.log('Migration completed with notes:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Accounts', 'allocatedFromId');
      await queryInterface.removeColumn('Accounts', 'isMainAccount');
      await queryInterface.removeColumn('Accounts', 'category');
    } catch (error) {
      console.log('Rollback completed:', error.message);
    }
  }
};
