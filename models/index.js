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
const Beneficiary = require('./Beneficiary');


const models = {
    User,
    Account,
    Beneficiary 
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

// Test connection
sequelize.authenticate()
    .then(() => console.log('✅ Database connected successfully'))
    .catch(err => console.error('❌ Database connection error:', err));

module.exports = {
    sequelize,
    Sequelize,
    ...models
};