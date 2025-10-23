'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Cart table
    await queryInterface.createTable('Carts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      priceAtTime: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'saved_for_later', 'ordered'),
        defaultValue: 'active'
      },
      addedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Order table with UUID accountId for production compatibility
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      storeCode: {
        type: Sequelize.STRING(8),
        allowNull: false,
        unique: true
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
      accountId: {
        type: Sequelize.UUID,  // Using UUID to match production Accounts table
        allowNull: false,
        references: {
          model: 'Accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.ENUM('account_balance', 'card', 'bank_transfer'),
        defaultValue: 'account_balance'
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      orderStatus: {
        type: Sequelize.ENUM('processing', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'processing'
      },
      shippingAddress: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      shippedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create OrderItem table
    await queryInterface.createTable('OrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      productSnapshot: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Snapshot of product details at time of order'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      priceAtTime: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('Carts', ['userId']);
    await queryInterface.addIndex('Orders', ['userId']);
    await queryInterface.addIndex('Orders', ['accountId']);
    await queryInterface.addIndex('Orders', ['orderNumber']);
    await queryInterface.addIndex('Orders', ['storeCode']);
    await queryInterface.addIndex('OrderItems', ['orderId']);
    await queryInterface.addIndex('OrderItems', ['productId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderItems');
    await queryInterface.dropTable('Orders');
    await queryInterface.dropTable('Carts');
  }
};
