const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: 'Human-readable order number'
    },
    storeCode: {
      type: DataTypes.STRING(8),
      unique: true,
      allowNull: false,
      comment: 'Unique 8-character code for in-store pickup/verification'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'The dependent who placed the order'
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id'
      },
      comment: 'Account used for payment'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      },
      comment: 'Total order amount'
    },
    orderStatus: {
      type: DataTypes.ENUM('processing', 'confirmed', 'ready_for_pickup', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'processing',
      comment: 'Order status'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
      comment: 'Payment status'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: 'account_balance',
      comment: 'Payment method used'
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Shipping address details'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When payment was completed'
    },
    shippedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When order was shipped'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When order was delivered'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When order was cancelled'
    }
  }, {
    tableName: 'Orders',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['accountId']
      },
      {
        fields: ['orderNumber']
      },
      {
        fields: ['orderStatus']
      }
    ]
  });

  return Order;
};
