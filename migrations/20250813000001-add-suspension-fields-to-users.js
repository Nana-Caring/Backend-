'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'suspendedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the user was suspended'
    });

    await queryInterface.addColumn('Users', 'suspendedUntil', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the suspension expires'
    });

    await queryInterface.addColumn('Users', 'suspendedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'ID of admin who suspended the user'
    });

    await queryInterface.addColumn('Users', 'suspensionReason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for suspension'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'suspendedAt');
    await queryInterface.removeColumn('Users', 'suspendedUntil');
    await queryInterface.removeColumn('Users', 'suspendedBy');
    await queryInterface.removeColumn('Users', 'suspensionReason');
  }
};
