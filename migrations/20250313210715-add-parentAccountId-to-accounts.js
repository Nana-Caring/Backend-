// migrations/xxxxxx-add-parentAccountId-to-accounts.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Accounts', 'parentAccountId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Accounts',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Accounts', 'parentAccountId');
  },
};
