'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove foreign key constraints if they exist
    const constraints = ['Accounts_userId_fkey', 'Accounts_caregiverId_fkey'];
    for (const constraint of constraints) {
      try {
        await queryInterface.removeConstraint('Accounts', constraint);
      } catch (e) {
        console.warn(`Constraint ${constraint} does not exist, skipping.`);
      }
    }

    // Drop the old columns
    await queryInterface.removeColumn('Accounts', 'userId');
    await queryInterface.removeColumn('Accounts', 'caregiverId');

    // Add new columns as INTEGER
    await queryInterface.addColumn('Accounts', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true // or false, as needed
    });
    await queryInterface.addColumn('Accounts', 'caregiverId', {
      type: Sequelize.INTEGER,
      allowNull: true // or false, as needed
    });

    // Re-add the foreign key constraints
    await queryInterface.addConstraint('Accounts', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Accounts_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('Accounts', {
      fields: ['caregiverId'],
      type: 'foreign key',
      name: 'Accounts_caregiverId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Optional: reverse the changes if needed
  }
};