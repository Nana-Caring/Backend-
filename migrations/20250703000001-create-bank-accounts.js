'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if bank_accounts table already exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('bank_accounts')) {
      console.log('bank_accounts table already exists, skipping creation...');
      
      // Check if stripeCustomerId column exists in Users table
      const tableInfo = await queryInterface.describeTable('Users');
      if (!tableInfo.stripeCustomerId) {
        await queryInterface.addColumn('Users', 'stripeCustomerId', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Stripe customer ID for payment processing'
        });

        // Add index for stripeCustomerId
        try {
          await queryInterface.addIndex('Users', ['stripeCustomerId']);
        } catch (error) {
          console.log('Index for stripeCustomerId might already exist:', error.message);
        }
      } else {
        console.log('stripeCustomerId column already exists in Users table, skipping...');
      }
      
      return;
    }

    // Create bank_accounts table
    await queryInterface.createTable('bank_accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      accountName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Name on the bank account'
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Name of the bank'
      },
      accountNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Bank account number'
      },
      accountType: {
        type: Sequelize.ENUM('checking', 'savings', 'card'),
        allowNull: false,
        defaultValue: 'checking'
      },
      routingNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Bank routing number or sort code'
      },
      cardNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Last 4 digits of card number for card payment methods'
      },
      expiryDate: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Card expiry date in MM/YY format'
      },
      ccv: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Card CCV/CVV code (encrypted)'
      },
      stripePaymentMethodId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Stripe payment method ID for this bank account'
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this is the default payment method'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this bank account is active'
      },
      lastVerifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the bank account was last verified'
      },
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'failed'),
        defaultValue: 'pending',
        comment: 'Verification status of the bank account'
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

    // Add indexes with error handling
    try {
      await queryInterface.addIndex('bank_accounts', ['userId']);
    } catch (error) {
      console.log('userId index might already exist:', error.message);
    }

    try {
      await queryInterface.addIndex('bank_accounts', ['stripePaymentMethodId']);
    } catch (error) {
      console.log('stripePaymentMethodId index might already exist:', error.message);
    }

    try {
      await queryInterface.addIndex('bank_accounts', ['userId', 'accountNumber', 'bankName'], {
        unique: true,
        name: 'unique_user_bank_account',
        where: {
          accountNumber: { [Sequelize.Op.ne]: null }
        }
      });
    } catch (error) {
      console.log('unique_user_bank_account index might already exist:', error.message);
    }

    try {
      await queryInterface.addIndex('bank_accounts', ['userId', 'cardNumber'], {
        unique: true,
        name: 'unique_user_card',
        where: {
          cardNumber: { [Sequelize.Op.ne]: null }
        }
      });
    } catch (error) {
      console.log('unique_user_card index might already exist:', error.message);
    }

    // Add stripeCustomerId to Users table if it doesn't exist
    const tableInfo = await queryInterface.describeTable('Users');
    if (!tableInfo.stripeCustomerId) {
      await queryInterface.addColumn('Users', 'stripeCustomerId', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Stripe customer ID for payment processing'
      });

      // Add index for stripeCustomerId
      try {
        await queryInterface.addIndex('Users', ['stripeCustomerId']);
      } catch (error) {
        console.log('Index for stripeCustomerId might already exist:', error.message);
      }
    } else {
      console.log('stripeCustomerId column already exists in Users table, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove stripeCustomerId from Users table
    await queryInterface.removeColumn('Users', 'stripeCustomerId');

    // Drop bank_accounts table
    await queryInterface.dropTable('bank_accounts');
  }
};
