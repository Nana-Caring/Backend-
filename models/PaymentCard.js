const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const PaymentCard = sequelize.define('PaymentCard', {
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
  
  // Card Fields (exact fields you specified)
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: {
        msg: 'Bank name is required'
      }
    },
    comment: 'Bank Name * - Enter bank name'
  },
  cardNumber: {
    type: DataTypes.STRING(4),
    allowNull: false,
    validate: {
      len: [4, 4], // Only last 4 digits stored
      isNumeric: {
        msg: 'Card number must contain only numbers'
      },
      notEmpty: {
        msg: 'Card number is required'
      }
    },
    comment: 'Card Number - Last 4 digits only for security'
  },
  expiryDate: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      is: {
        args: /^(0[1-9]|1[0-2])\/\d{2}$/,
        msg: 'Expiry date must be in MM/YY format'
      },
      notEmpty: {
        msg: 'Expiry date is required'
      }
    },
    comment: 'Expiry Date - MM/YY'
  },
  ccv: {
    type: DataTypes.STRING(4),
    allowNull: false,
    validate: {
      len: [3, 4],
      isNumeric: {
        msg: 'CCV must contain only numbers'
      },
      notEmpty: {
        msg: 'CCV is required'
      }
    },
    comment: 'CCV - 123'
  },
  
  // Stripe Integration
  stripePaymentMethodId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Stripe payment method ID for this card'
  },
  
  // Common Fields
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this is the default payment card'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this payment card is active'
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Optional nickname for the card (e.g., "My Visa Card")'
  }
}, {
  tableName: 'payment_cards',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'cardNumber'],
      name: 'unique_user_card'
    },
    {
      fields: ['userId', 'isDefault'],
      name: 'user_default_card'
    },
    {
      fields: ['userId', 'isActive'],
      name: 'user_active_cards'
    }
  ],
  validate: {
    // Ensure only one default payment card per user
    async validateSingleDefault() {
      if (this.isDefault) {
        const existingDefault = await PaymentCard.findOne({
          where: {
            userId: this.userId,
            isDefault: true,
            id: { [Op.ne]: this.id || 'new' }
          }
        });
        
        if (existingDefault) {
          throw new Error('Only one payment card can be set as default');
        }
      }
    }
  }
});

module.exports = PaymentCard;
