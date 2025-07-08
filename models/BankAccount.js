const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const BankAccount = sequelize.define('BankAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('bank_account', 'card'),
    allowNull: false,
    defaultValue: 'bank_account'
  },
  
  // Bank Account Fields
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  accountNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [8, 20],
      isNumeric: true
    }
  },
  
  // Card Fields  
  cardNumber: {
    type: DataTypes.STRING(19),
    allowNull: true,
    validate: {
      len: [13, 19],
      isNumeric: {
        msg: 'Card number must contain only numbers'
      }
    }
  },
  expiryDate: {
    type: DataTypes.STRING(5),
    allowNull: true,
    validate: {
      is: {
        args: /^(0[1-9]|1[0-2])\/\d{2}$/,
        msg: 'Expiry date must be in MM/YY format'
      }
    }
  },
  ccv: {
    type: DataTypes.STRING(4),
    allowNull: true,
    validate: {
      len: [3, 4],
      isNumeric: true
    }
  },
  
  // Stripe Integration
  stripePaymentMethodId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Common Fields
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'BankAccounts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'accountNumber'],
      where: {
        accountNumber: { [Op.ne]: null }
      }
    },
    {
      unique: true,
      fields: ['userId', 'cardNumber'],
      where: {
        cardNumber: { [Op.ne]: null }
      }
    },
    {
      fields: ['userId', 'type']
    },
    {
      fields: ['userId', 'isDefault']
    }
  ],
  validate: {
    // Custom validation to ensure required fields based on type
    validateTypeFields() {
      if (this.type === 'bank_account') {
        if (!this.bankName || !this.accountNumber) {
          throw new Error('Bank name and account number are required for bank accounts');
        }
      } else if (this.type === 'card') {
        if (!this.cardNumber || !this.expiryDate || !this.ccv) {
          throw new Error('Card number, expiry date, and CCV are required for cards');
        }
      }
    },
    
    // Ensure only one default payment method per user
    async validateSingleDefault() {
      if (this.isDefault) {
        const existingDefault = await BankAccount.findOne({
          where: {
            userId: this.userId,
            isDefault: true,
            id: { [Op.ne]: this.id }
          }
        });
        
        if (existingDefault) {
          throw new Error('Only one payment method can be set as default');
        }
      }
    }
  }
});

BankAccount.associate = function(models) {
  BankAccount.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = BankAccount;
