const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Account extends Model {}

Account.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  accountType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
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
  caregiverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Account',
  tableName: 'Accounts',
  timestamps: true
});

// Define associations
Account.associate = function(models) {
  // Account belongs to a User
  Account.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  // Account belongs to a Caregiver (User with caregiver role)
  Account.belongsTo(models.User, {
    foreignKey: 'caregiverId',
    as: 'caregiver'
  });
  
  // Account has many Transactions
  Account.hasMany(models.Transaction, {
    foreignKey: 'accountId',
    as: 'transactions'
  });
  
  // Self-referencing for parent accounts
  Account.belongsTo(models.Account, {
    foreignKey: 'parentAccountId',
    as: 'parentAccount'
  });
  
  Account.hasMany(models.Account, {
    foreignKey: 'parentAccountId',
    as: 'subAccounts'
  });
};

module.exports = Account;