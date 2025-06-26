'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // First, add the new middleName column
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
      await queryInterface.sequelize.query(
        'UPDATE "Users" SET "middleName" = "lastName" WHERE "lastName" IS NOT NULL',
        { transaction }
      );

      // Remove the lastName column
      await queryInterface.removeColumn('Users', 'lastName', { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
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
      await queryInterface.sequelize.query(
        'UPDATE "Users" SET "lastName" = "middleName" WHERE "middleName" IS NOT NULL',
        { transaction }
      );

      // Remove the middleName column
      await queryInterface.removeColumn('Users', 'middleName', { transaction });
    });
  }
};
