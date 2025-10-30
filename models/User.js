const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('funder', 'caregiver', 'dependent'),
    allowNull: false
  },
  Idnumber: {
    type: DataTypes.STRING(13),
    allowNull: false,
    unique: true,
    validate: {
      // Must be exactly 13 numeric digits (South African ID format)
      isThirteenDigits(value) {
        if (value === null || value === undefined) return;
        const trimmed = String(value).trim();
        if (!/^\d{13}$/.test(trimmed)) {
          throw new Error('Idnumber must be exactly 13 numeric digits');
        }
      }
    }
  },
  relation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // User blocking/status fields
  isBlocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  blockedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  blockedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  blockReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'blocked', 'suspended', 'pending'),
    allowNull: false,
    defaultValue: 'active'
  },
  // Suspension fields
  suspendedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the user was suspended'
  },
  suspendedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the suspension expires'
  },
  suspendedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'ID of admin who suspended the user'
  },
  suspensionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for suspension'
  },
  // Personal details - these remain null until user explicitly edits them
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      isValidSANumber(value) {
        if (value !== null && value !== undefined && value !== '') {
          if (!/^(\+27|0)[0-9]{9}$/.test(value)) {
            throw new Error('Phone number must be a valid South African number (e.g., +27821234567 or 0821234567)');
          }
        }
      }
    }
  },
  // Postal Address fields
  postalAddressLine1: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postalAddressLine2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postalCity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postalProvince: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postalCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  // Home Address fields
  homeAddressLine1: {
    type: DataTypes.STRING,
    allowNull: true
  },
  homeAddressLine2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  homeCity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  homeProvince: {
    type: DataTypes.STRING,
    allowNull: true
  },
  homeCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  // Stripe integration fields
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Stripe customer ID for payment processing'
  },
  // Password reset fields
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Token for password reset functionality'
  },
  resetTokenExpires: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Expiration timestamp for reset token'
  }
}, {
  timestamps: true
});

User.associate = function(models) {
  // User can have many accounts
  User.hasMany(models.Account, {
    foreignKey: 'userId',
    as: 'Accounts'
  });
  
  // User can have many bank accounts
  User.hasMany(models.BankAccount, {
    foreignKey: 'userId',
    as: 'BankAccounts'
  });
  
  User.belongsToMany(models.User, {
    as: 'Dependents',
    through: 'FunderDependent',
    foreignKey: 'funderId',
    otherKey: 'dependentId'
  });
  User.belongsToMany(models.User, {
    as: 'Funders',
    through: 'FunderDependent',
    foreignKey: 'dependentId',
    otherKey: 'funderId'
  });
  
  // User blocking associations
  User.belongsTo(models.User, {
    as: 'BlockedByUser',
    foreignKey: 'blockedBy',
    constraints: false
  });
  User.hasMany(models.User, {
    as: 'BlockedUsers',
    foreignKey: 'blockedBy',
    constraints: false
  });
};

module.exports = User;
