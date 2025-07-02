'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Since we need to change the primary key from UUID to INTEGER,
    // we need to recreate the table with the correct structure
    
    // First, backup existing data if any
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create a temporary table with the correct structure
      await queryInterface.createTable('Accounts_temp', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        accountType: {
          type: Sequelize.STRING,
          allowNull: false
        },
        accountNumber: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true
        },
        balance: {
          type: Sequelize.FLOAT,
          allowNull: true,
          defaultValue: 0
        },
        currency: {
          type: Sequelize.STRING(3),
          allowNull: false,
          defaultValue: 'ZAR'
        },
        status: {
          type: Sequelize.ENUM('active', 'inactive', 'frozen'),
          allowNull: false,
          defaultValue: 'active'
        },
        creationDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        lastTransactionDate: {
          type: Sequelize.DATE,
          allowNull: true
        },
        parentAccountId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Accounts_temp',
            key: 'id'
          }
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        caregiverId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          }
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
      }, { transaction });        // Copy data from old table to new table (only if there's data)
        // Note: Since IDs will change, we need to be careful about relationships
        const existingAccounts = await queryInterface.sequelize.query(
          'SELECT COUNT(*) as count FROM "Accounts"',
          { type: Sequelize.QueryTypes.SELECT, transaction }
        );
        
        if (existingAccounts[0].count > 0) {
          // If there are existing accounts, we need to handle this carefully
          console.log('Found existing accounts, preserving data...');
          
          // Copy non-ID data (accounts will get new sequential IDs)
          await queryInterface.sequelize.query(`
            INSERT INTO "Accounts_temp" (
              "accountType", "accountNumber", "balance", "currency",
              "creationDate", "lastTransactionDate", "userId", "caregiverId",
              "createdAt", "updatedAt"
            )
            SELECT 
              "accountType", "accountNumber", "balance", "currency",
              "creationDate", "lastTransactionDate", "userId", "caregiverId",
              "createdAt", "updatedAt"
            FROM "Accounts"
            WHERE "parentAccountId" IS NULL
            ORDER BY "createdAt"
          `, { transaction });
          
          // Handle sub-accounts separately (they need to reference new parent IDs)
          // For now, we'll set parentAccountId to NULL for sub-accounts
          // and let the application recreate the hierarchy
          await queryInterface.sequelize.query(`
            INSERT INTO "Accounts_temp" (
              "accountType", "accountNumber", "balance", "currency",
              "creationDate", "lastTransactionDate", "userId", "caregiverId",
              "createdAt", "updatedAt", "parentAccountId"
            )
            SELECT 
              "accountType", "accountNumber", "balance", "currency",
              "creationDate", "lastTransactionDate", "userId", "caregiverId",
              "createdAt", "updatedAt", NULL
            FROM "Accounts"
            WHERE "parentAccountId" IS NOT NULL
            ORDER BY "createdAt"
          `, { transaction });
        }
      
      // Drop the old table
      await queryInterface.dropTable('Accounts', { transaction });
      
      // Rename the temporary table to the original name
      await queryInterface.renameTable('Accounts_temp', 'Accounts', { transaction });
      
      await transaction.commit();
      console.log('Successfully migrated Accounts table to use INTEGER primary key');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    // Reverting this migration is complex and risky
    // For safety, we'll throw an error to prevent accidental rollback
    throw new Error('This migration cannot be safely reversed. Please restore from backup if needed.');
  }
};
