'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('Accounts', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        accountType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        accountNumber: {
          type: Sequelize.STRING(10),
          allowNull: false,
          unique: true,
        },
        balance: {
          type: Sequelize.FLOAT,
          defaultValue: 0,
        },
        currency: {
          type: Sequelize.STRING(3),
          defaultValue: 'ZAR',
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('active', 'inactive', 'frozen'),
          defaultValue: 'active',
          allowNull: false,
        },
        creationDate: {
          type: Sequelize.DATEONLY,
          defaultValue: Sequelize.NOW,
          allowNull: false,
        },
        lastTransactionDate: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        parentAccountId: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        }
      });
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.dropTable('Accounts');
      // Drop the ENUM type as well
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Accounts_status";');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
};