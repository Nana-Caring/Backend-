'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Token for password reset verification'
    });

    await queryInterface.addColumn('Users', 'resetPasswordExpires', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expiration time for password reset token'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'resetPasswordToken');
    await queryInterface.removeColumn('Users', 'resetPasswordExpires');
  }
};
