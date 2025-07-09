'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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

    // Add indexes
    await queryInterface.addIndex('bank_accounts', ['userId']);
    await queryInterface.addIndex('bank_accounts', ['stripePaymentMethodId']);
    await queryInterface.addIndex('bank_accounts', ['userId', 'accountNumber', 'bankName'], {
      unique: true,
      name: 'unique_user_bank_account',
      where: {
        accountNumber: { [Sequelize.Op.ne]: null }
      }
    });
    await queryInterface.addIndex('bank_accounts', ['userId', 'cardNumber'], {
      unique: true,
      name: 'unique_user_card',
      where: {
        cardNumber: { [Sequelize.Op.ne]: null }
      }
    });

    // Add stripeCustomerId to Users table
    await queryInterface.addColumn('Users', 'stripeCustomerId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Stripe customer ID for payment processing'
    });

    // Add index for stripeCustomerId
    await queryInterface.addIndex('Users', ['stripeCustomerId']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove stripeCustomerId from Users table
    await queryInterface.removeColumn('Users', 'stripeCustomerId');

    // Drop bank_accounts table
    await queryInterface.dropTable('bank_accounts');
  }
};
