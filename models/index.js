'use strict';

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

// Import models
const User = require('./User');
const Account = require('./Account');
const BankAccount = require('./BankAccount');
const Transaction = require('./Transaction')(sequelize, Sequelize.DataTypes);
const FunderDependent = require('./FunderDependent')(sequelize, Sequelize.DataTypes);

const models = {
    User,
    Account,
    BankAccount,
    Transaction,
    FunderDependent
};

// Set up associations
User.hasMany(Account, {
    foreignKey: 'userId',
    as: 'accounts'
});

Account.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// BankAccount associations
User.hasMany(BankAccount, {
    foreignKey: 'userId',
    as: 'bankAccounts'
});

BankAccount.belongsTo(User, {
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

// Transaction associations
Transaction.belongsTo(Account, {
    foreignKey: 'accountId',
    as: 'account'
});

Account.hasMany(Transaction, {
    foreignKey: 'accountId',
    as: 'transactions'
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