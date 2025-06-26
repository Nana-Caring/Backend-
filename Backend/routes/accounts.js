const { v4: uuidv4 } = require('uuid');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: uuidv4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensures account numbers are unique
  },
  
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ZAR',
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'frozen'),
    defaultValue: 'active',
    allowNull: false,
  },
  creationDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  lastTransactionDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  parentAccountId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Account;