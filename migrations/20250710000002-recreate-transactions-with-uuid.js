'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔧 Updating Transaction table structure...');

      // Check if table exists
      const tableExists = await queryInterface.describeTable('Transactions').catch(() => false);
      
      if (tableExists) {
        console.log('Table exists, updating structure...');
        
        // Drop table and recreate with correct structure
        await queryInterface.dropTable('Transactions');
        console.log('✅ Dropped existing table');
      }

      // Create table with correct UUID structure
      await queryInterface.createTable('Transactions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
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
        description: {
          type: Sequelize.STRING,
          allowNull: true
        },
        reference: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true
        },
        timestamp: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
          allowNull: false
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      // Add indexes
      await queryInterface.addIndex('Transactions', ['accountId']);
      await queryInterface.addIndex('Transactions', ['reference']);
      await queryInterface.addIndex('Transactions', ['timestamp']);

      console.log('✅ Transaction table created with UUID structure');

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('Transactions');
      console.log('✅ Transaction table dropped');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }
};
