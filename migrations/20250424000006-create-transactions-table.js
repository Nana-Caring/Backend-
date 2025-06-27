'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
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
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.dropTable('Transactions');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Transactions_type";');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
};