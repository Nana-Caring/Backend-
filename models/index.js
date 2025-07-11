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
const PaymentCard = require('./PaymentCard');
const Transaction = require('./Transaction')(sequelize, Sequelize.DataTypes);
const FunderDependent = require('./FunderDependent')(sequelize, Sequelize.DataTypes);

const models = {
    User,
    Account,
    PaymentCard,
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

// Test connection
sequelize.authenticate()
    .then(() => console.log('✅ Database connected successfully'))
    .catch(err => console.error('❌ Database connection error:', err));

module.exports = {
    sequelize,
    Sequelize,
    ...models
};