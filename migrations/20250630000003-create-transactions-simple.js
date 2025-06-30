'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First check if table already exists
      const tables = await queryInterface.showAllTables();
      console.log('Existing tables:', tables);
      
      if (tables.includes('Transactions') || tables.includes('transactions')) {
        console.log('Transactions table already exists');
        return;
      }
      
      await queryInterface.createTable('Transactions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        accountId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Accounts',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        amount: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        type: {
          type: Sequelize.ENUM('Debit', 'Credit'),
          allowNull: false
        },
        timestamp: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
      
      console.log('Transactions table created successfully');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};
