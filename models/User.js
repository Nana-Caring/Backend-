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
    unique: true
  },
  relation: {
    type: DataTypes.STRING,
    allowNull: true
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
  }
}, {
  timestamps: true
});

User.associate = function(models) {
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
};

module.exports = User;
