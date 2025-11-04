const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      comment: 'Order this item belongs to'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      comment: 'Product that was ordered'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      },
      comment: 'Quantity ordered'
    },
    priceAtTime: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price per unit at time of order'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Total price for this line item (quantity * priceAtTime)'
    },
    productSnapshot: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Snapshot of product details at time of order'
    }
  }, {
    tableName: 'OrderItems',
    timestamps: true,
    indexes: [
      {
        fields: ['orderId']
      },
      {
        fields: ['productId']
      }
    ]
  });

  return OrderItem;
};
