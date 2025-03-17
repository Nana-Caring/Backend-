// migrations/xxxxxx-update-account-type-column.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the accountType column to STRING and set allowNull to false
    await queryInterface.changeColumn('Accounts', 'accountType', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the accountType column to its original state if needed
    await queryInterface.changeColumn('Accounts', 'accountType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }


  
};
// Inside your registration logic
if (role === "caregiver") {
  // Create the main account
  const mainAccount = await Account.create({
    userId: user.id,
    accountType: "Main", // Ensure this is provided
    balance: 0,
    parentAccountId: null, // Main account has no parent
  });

  // Define subaccount types
  const subAccountTypes = ["Baby Care", "Entertainment", "Clothing", "Savings", "Pregnancy"];
  const subAccounts = subAccountTypes.map(type => ({
    userId: user.id,
    accountType: type, // Ensure this is provided
    balance: 0,
    parentAccountId: mainAccount.id, // Link to Main Account
  }));

  // Create subaccounts in bulk
  await Account.bulkCreate(subAccounts);
}
