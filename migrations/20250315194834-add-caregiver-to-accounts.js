// migrations/XXXXXXXXXXXXXX-add-caregiver-to-accounts.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Accounts', 'caregiverId', {
      type: Sequelize.UUID, // Changed to UUID
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
