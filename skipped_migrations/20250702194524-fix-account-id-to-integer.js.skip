'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Since we need to change the primary key from UUID to INTEGER,
    // we need to recreate the table with the correct structure
    // But first we need to handle foreign key dependencies
    
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Step 1: Drop foreign key constraints that reference Accounts table
      console.log('Dropping foreign key constraints...');
      
      // Drop constraint from Transactions table
      try {
        await queryInterface.removeConstraint('Transactions', 'Transactions_accountId_fkey', { transaction });
      } catch (error) {
        console.log('Constraint Transactions_accountId_fkey might not exist:', error.message);
      }
      
      // Drop self-referencing constraint for parentAccountId
      try {
        await queryInterface.removeConstraint('Accounts', 'Accounts_parentAccountId_fkey', { transaction });
      } catch (error) {
        console.log('Constraint Accounts_parentAccountId_fkey might not exist:', error.message);
      }
      
      // Step 2: Create a temporary table with the correct structure
      console.log('Creating temporary table...');
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
          allowNull: true
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
      }, { transaction });

      // Step 3: Copy data from old table to new table (only if there's data)
      console.log('Copying data...');
      const existingAccounts = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM "Accounts"',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );
      
      if (existingAccounts[0].count > 0) {
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
    
      // Step 4: Drop the old table (now that constraints are removed)
      console.log('Dropping old Accounts table...');
      await queryInterface.dropTable('Accounts', { transaction });
      
      // Step 5: Rename the temporary table to the original name
      console.log('Renaming temp table...');
      await queryInterface.renameTable('Accounts_temp', 'Accounts', { transaction });
      
      // Step 6: Add back the self-referencing foreign key for parentAccountId
      console.log('Adding back foreign key constraints...');
      await queryInterface.addConstraint('Accounts', {
        fields: ['parentAccountId'],
        type: 'foreign key',
        name: 'Accounts_parentAccountId_fkey',
        references: {
          table: 'Accounts',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        transaction
      });
      
      // Step 7: Note about Transactions table
      console.log('NOTE: You will need to manually fix Transaction accountId references or recreate Transactions table');
      console.log('All existing transactions will need to be updated to reference the new account IDs');
      
      await transaction.commit();
      console.log('Successfully migrated Accounts table to use INTEGER primary key');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    // Reverting this migration is complex and risky
    // For safety, we'll throw an error to prevent accidental rollback
    throw new Error('This migration cannot be safely reversed. Please restore from backup if needed.');
  }
};
