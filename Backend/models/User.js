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
