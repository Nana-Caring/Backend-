'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const oldId = '2fa479e0-953c-4b55-9137-fe418d9c5fb3';
    const newId = 101; // Choose a unique integer

    // Update Transactions
    await queryInterface.sequelize.query(
      `UPDATE "Transactions" SET "accountId" = :newId WHERE "accountId" = :oldId`,
      { replacements: { newId, oldId } }
    );

    // Update Users
    await queryInterface.sequelize.query(
      `UPDATE "Users" SET "accountId" = :newId WHERE "accountId" = :oldId`,
      { replacements: { newId, oldId } }
    );

    // Update Accounts
    await queryInterface.sequelize.query(
      `UPDATE "Accounts" SET "id" = :newId WHERE "id" = :oldId`,
      { replacements: { newId, oldId } }
    );
  },

  async down(queryInterface, Sequelize) {
    const oldId = '2fa479e0-953c-4b55-9137-fe418d9c5fb3';
    const newId = 101; // The integer you used above

    // Revert Accounts
    await queryInterface.sequelize.query(
      `UPDATE "Accounts" SET "id" = :oldId WHERE "id" = :newId`,
      { replacements: { newId, oldId } }
    );

    // Revert Users
    await queryInterface.sequelize.query(
      `UPDATE "Users" SET "accountId" = :oldId WHERE "accountId" = :newId`,
      { replacements: { newId, oldId } }
    );

    // Revert Transactions
    await queryInterface.sequelize.query(
      `UPDATE "Transactions" SET "accountId" = :oldId WHERE "accountId" = :newId`,
      { replacements: { newId, oldId } }
    );
  }
};