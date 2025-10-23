'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add category field to Accounts table
    await queryInterface.addColumn('Accounts', 'category', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Account category for budget allocation (e.g., Healthcare, Transport, Education, etc.)'
    });

    // Add isMainAccount field to identify the main savings account
    await queryInterface.addColumn('Accounts', 'isMainAccount', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is the main savings account that receives funder transfers'
    });

    // Add allocatedFrom field to track which main account this category account was allocated from
    // Using UUID to match production Accounts table
    await queryInterface.addColumn('Accounts', 'allocatedFromId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to main account this category account was allocated from'
    });

    // Add index for better performance
    await queryInterface.addIndex('Accounts', ['category']);
    await queryInterface.addIndex('Accounts', ['isMainAccount']);
    await queryInterface.addIndex('Accounts', ['allocatedFromId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Accounts', ['allocatedFromId']);
    await queryInterface.removeIndex('Accounts', ['isMainAccount']);
    await queryInterface.removeIndex('Accounts', ['category']);
    
    await queryInterface.removeColumn('Accounts', 'allocatedFromId');
    await queryInterface.removeColumn('Accounts', 'isMainAccount');
    await queryInterface.removeColumn('Accounts', 'category');
  }
};
