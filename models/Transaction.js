const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Account = require("./Account");

const Transaction = sequelize.define("Transaction", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  accountId: { type: DataTypes.UUID, allowNull: false, references: { model: "Accounts", key: "id" } },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  type: { type: DataTypes.ENUM("Debit", "Credit"), allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: true });

// Define associations
Transaction.belongsTo(Account, { foreignKey: "accountId", onDelete: "CASCADE" });
Account.hasMany(Transaction, { foreignKey: "accountId" });

module.exports = Transaction;
