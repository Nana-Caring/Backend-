const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'The dependent user who owns this cart'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      comment: 'Product in the cart'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 50
      },
      comment: 'Quantity of the product'
    },
    priceAtTime: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price of the product when added to cart (to handle price changes)'
    },
    status: {
      type: DataTypes.ENUM('active', 'saved_for_later', 'ordered'),
      defaultValue: 'active',
      comment: 'Cart item status'
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'When the item was added to cart'
    }
  }, {
    tableName: 'Carts',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['productId']
      },
      {
        fields: ['userId', 'productId'],
        unique: true,
        name: 'unique_user_product'
      },
      {
        fields: ['status']
      }
    ]
  });

  return Cart;
};
