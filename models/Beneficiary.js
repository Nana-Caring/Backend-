const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Account = require('./Account');

class Beneficiary extends Model {}

Beneficiary.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  funderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }

}, {
  sequelize,
  modelName: 'Beneficiary',
  tableName: 'Beneficiaries', 
  timestamps: true       
});

// Association for JOIN with Account
Beneficiary.belongsTo(Account, {
  foreignKey: 'accountNumber',
  targetKey: 'accountNumber',
  as: 'account'
});

// Association for JOIN with User (funder)
Beneficiary.belongsTo(User, {
  foreignKey: 'funderId',
  as: 'user'
});


module.exports = Beneficiary;