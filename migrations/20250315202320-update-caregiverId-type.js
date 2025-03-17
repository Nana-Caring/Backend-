// migrations/XXXXXXXXXXXXXX-update-caregiverId-type.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // First check if Idnumber column exists and is unique
      const columns = await queryInterface.describeTable('Users');
      
      if (!columns.Idnumber) {
        // Add Idnumber column if it doesn't exist
        await queryInterface.addColumn('Users', 'Idnumber', {
          type: Sequelize.STRING,
          unique: true,
          allowNull: true
        });
      } else if (!columns.Idnumber.unique) {
        // Make Idnumber unique if it exists but isn't unique
        await queryInterface.changeColumn('Users', 'Idnumber', {
          type: Sequelize.STRING,
          unique: true,
          allowNull: true
        });
      }
      
      // Now we can safely add the constraint
      // Check if the column exists in Accounts table
      const accountColumns = await queryInterface.describeTable('Accounts');
      
      if (!accountColumns.caregiverId) {
        // Add caregiverId column if it doesn't exist
        await queryInterface.addColumn('Accounts', 'caregiverId', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }
      
      // Add the foreign key constraint
      await queryInterface.addConstraint('Accounts', {
        type: 'foreign key',
        fields: ['caregiverId'],
        name: 'Accounts_caregiverId_fkey',
        references: {
          table: 'Users',
          field: 'Idnumber'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },
  
  down: async (queryInterface, Sequelize) => {
    try {
      // Try to remove constraint if it exists
      try {
        await queryInterface.removeConstraint('Accounts', 'Accounts_caregiverId_fkey');
      } catch (error) {
        console.log('Constraint might not exist, continuing...');
      }
      
      // Remove caregiverId column if it exists
      const accountColumns = await queryInterface.describeTable('Accounts');
      if (accountColumns.caregiverId) {
        await queryInterface.removeColumn('Accounts', 'caregiverId');
      }
    } catch (error) {
      console.error('Migration rollback failed:', error);
      throw error;
    }
  }
};