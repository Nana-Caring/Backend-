'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if middleName column already exists, if so skip this migration
      const tableDescription = await queryInterface.describeTable('Users');
      
      if (tableDescription.middleName) {
        console.log('middleName column already exists, skipping migration');
        return;
      }

      await queryInterface.sequelize.transaction(async (transaction) => {
        // Add the new middleName column
        await queryInterface.addColumn(
          'Users',
          'middleName',
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          { transaction }
        );

        // Copy data from lastName to middleName if lastName exists
        const hasLastName = tableDescription.lastName;
        if (hasLastName) {
          await queryInterface.sequelize.query(
            'UPDATE "Users" SET "middleName" = "lastName" WHERE "lastName" IS NOT NULL',
            { transaction }
          );

          // Remove the lastName column
          await queryInterface.removeColumn('Users', 'lastName', { transaction });
        }
      });
    } catch (error) {
      console.error('Migration error:', error);
      // Don't throw error if column already exists
      if (error.message && error.message.includes('already exists')) {
        console.log('Column already exists, skipping...');
        return;
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Check if lastName column exists, if so skip reversal
      const tableDescription = await queryInterface.describeTable('Users');
      
      if (tableDescription.lastName) {
        console.log('lastName column already exists, skipping reversal');
        return;
      }

      await queryInterface.sequelize.transaction(async (transaction) => {
        // Add back the lastName column
        await queryInterface.addColumn(
          'Users',
          'lastName',
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          { transaction }
        );

        // Copy data from middleName to lastName if middleName exists
        if (tableDescription.middleName) {
          await queryInterface.sequelize.query(
            'UPDATE "Users" SET "lastName" = "middleName" WHERE "middleName" IS NOT NULL',
            { transaction }
          );

          // Remove the middleName column
          await queryInterface.removeColumn('Users', 'middleName', { transaction });
        }
      });
    } catch (error) {
      console.error('Migration down error:', error);
      // Don't throw error if column already exists
      if (error.message && error.message.includes('already exists')) {
        console.log('Column already exists, skipping...');
        return;
      }
      throw error;
    }
  }
};
