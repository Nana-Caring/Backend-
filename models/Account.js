const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Account = sequelize.define("Account", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false }, // Links to the User model
  name: { 
    type: DataTypes.ENUM("Main", "Baby Care", "Entertainment", "Clothing", "Savings", "Pregnancy"),
    allowNull: false 
  },
  balance: { type: DataTypes.FLOAT, defaultValue: 0.0 },
}, { timestamps: true });

module.exports = Account;
