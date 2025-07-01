// migrations/XXXXXXXXXXXXXX-add-caregiver-to-accounts.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Accounts', 'caregiverId', {
      type: Sequelize.INTEGER, // Changed to INTEGER to match Users.id
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Accounts', 'caregiverId');
  }
};
