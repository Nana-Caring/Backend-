'use strict';

const { Sequelize } = require('sequelize');
const path = require('path');
// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: envFile });

let sequelize;

// Use DATABASE_URL if available (production), otherwise use config.json (development)
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    // Use config.json for local development
    const config = require('../config/config.json');
    const env = process.env.NODE_ENV || 'development';
    const dbConfig = config[env];
    
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false
    });
}

// Import models
const User = require('./User');
const Account = require('./Account');
const PaymentCard = require('./PaymentCard');
const Transaction = require('./Transaction')(sequelize, Sequelize.DataTypes);
const FunderDependent = require('./FunderDependent')(sequelize, Sequelize.DataTypes);
const Product = require('./Product')(sequelize, Sequelize.DataTypes);
const Cart = require('./Cart')(sequelize, Sequelize.DataTypes);
const Order = require('./Order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./OrderItem')(sequelize, Sequelize.DataTypes);

const models = {
    User,
    Account,
    PaymentCard,
    Transaction,
    FunderDependent,
    Product,
    Cart,
    Order,
    OrderItem
};

// Set up associations
User.hasMany(Account, {
    foreignKey: 'userId',
    as: 'Accounts'
});

Account.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Account self-referencing associations for parent/sub accounts
Account.belongsTo(Account, {
    foreignKey: 'parentAccountId',
    as: 'parentAccount'
});

Account.hasMany(Account, {
    foreignKey: 'parentAccountId',
    as: 'subAccounts'
});

// Account caregiver association
Account.belongsTo(User, {
    foreignKey: 'caregiverId',
    as: 'caregiver'
});

User.hasMany(Account, {
    foreignKey: 'caregiverId',
    as: 'caregiverAccounts'
});

// PaymentCard associations
User.hasMany(PaymentCard, {
    foreignKey: 'userId',
    as: 'paymentCards'
});

PaymentCard.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// FunderDependent belongs to the dependent (user)
models.FunderDependent.belongsTo(models.User, {
  foreignKey: 'dependentId',
  as: 'dependent'
});

models.FunderDependent.belongsTo(models.User, {
  foreignKey: 'funderId',
  as: 'funder'
});

// A funder has many dependents through FunderDependent
models.User.hasMany(models.FunderDependent, {
  foreignKey: 'funderId',
  as: 'linkedDependents'
});

// Caregiver-Dependent associations (through caregiverId in accounts)
models.User.belongsToMany(models.User, {
  through: models.Account,
  foreignKey: 'caregiverId',
  otherKey: 'userId',
  as: 'Dependents'
});

models.User.belongsToMany(models.User, {
  through: models.Account,
  foreignKey: 'userId',
  otherKey: 'caregiverId',
  as: 'Caregivers'
});

// Transaction associations
Transaction.belongsTo(Account, {
    foreignKey: 'accountId',
    as: 'account'
});

Account.hasMany(Transaction, {
    foreignKey: 'accountId',
    as: 'transactions'
});

// Product associations (for future use with orders, reviews, etc.)
Product.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
});

Product.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater'
});

// Cart associations
Cart.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Cart.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

User.hasMany(Cart, {
    foreignKey: 'userId',
    as: 'cartItems'
});

Product.hasMany(Cart, {
    foreignKey: 'productId',
    as: 'cartItems'
});

// Order associations
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Order.belongsTo(Account, {
    foreignKey: 'accountId',
    as: 'account'
});

User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders'
});

Account.hasMany(Order, {
    foreignKey: 'accountId',
    as: 'orders'
});

// OrderItem associations
OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
});

OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items'
});

Product.hasMany(OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems'
});

// Test connection
sequelize.authenticate()
    .then(() => console.log('✅ Database connected successfully'))
    .catch(err => console.error('❌ Database connection error:', err));

module.exports = {
    sequelize,
    Sequelize,
    ...models
};