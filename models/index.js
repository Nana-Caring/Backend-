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
const FunderBeneficiary = require('./FunderBeneficiary');



const models = {
    User,
    Account,
    Beneficiary,           
    FunderBeneficiary 
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

User.hasMany(FunderBeneficiary, { foreignKey: 'funderId' });
FunderBeneficiary.belongsTo(User, { foreignKey: 'funderId' });

Beneficiary.hasMany(FunderBeneficiary, { foreignKey: 'beneficiaryId' });
FunderBeneficiary.belongsTo(Beneficiary, { foreignKey: 'beneficiaryId' });


// Test connection
sequelize.authenticate()
    .then(() => console.log('✅ Database connected successfully'))
    .catch(err => console.error('❌ Database connection error:', err));

module.exports = {
    sequelize,
    Sequelize,
    ...models
};
