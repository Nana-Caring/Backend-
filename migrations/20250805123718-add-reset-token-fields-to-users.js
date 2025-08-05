'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'resetToken', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Token for password reset functionality'
    });

    await queryInterface.addColumn('Users', 'resetTokenExpires', {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'Expiration timestamp for reset token'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'resetToken');
    await queryInterface.removeColumn('Users', 'resetTokenExpires');
  }
};
