'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_cards', {
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
      bankName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Bank Name * - Enter bank name'
      },
      cardNumber: {
        type: Sequelize.STRING(4),
        allowNull: false,
        comment: 'Last 4 digits of card number for security'
      },
      expiryDate: {
        type: Sequelize.STRING(5),
        allowNull: false,
        comment: 'Expiry Date - MM/YY'
      },
      ccv: {
        type: Sequelize.STRING(4),
        allowNull: false,
        comment: 'CCV - 123 (consider encrypting in production)'
      },
      stripePaymentMethodId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Stripe payment method ID for this card'
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this is the default payment card'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this payment card is active'
      },
      nickname: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Optional nickname for the card'
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

    // Create indexes
    await queryInterface.addIndex('payment_cards', ['userId', 'cardNumber'], {
      unique: true,
      name: 'unique_user_card'
    });
    
    await queryInterface.addIndex('payment_cards', ['userId', 'isDefault'], {
      name: 'user_default_card'
    });
    
    await queryInterface.addIndex('payment_cards', ['userId', 'isActive'], {
      name: 'user_active_cards'
    });

    // Add stripeCustomerId to Users table if it doesn't exist
    try {
      await queryInterface.addColumn('Users', 'stripeCustomerId', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Stripe customer ID for payment processing'
      });
    } catch (error) {
      console.log('stripeCustomerId column may already exist');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_cards');
    
    try {
      await queryInterface.removeColumn('Users', 'stripeCustomerId');
    } catch (error) {
      console.log('stripeCustomerId column may not exist');
    }
  }
};
