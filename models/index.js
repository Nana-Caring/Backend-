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
const Transaction = require('./Transaction')(sequelize, Sequelize.DataTypes);
const FunderDependent = require('./FunderDependent')(sequelize, Sequelize.DataTypes);

const models = {
    User,
    Account,
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
