// accountUtils.js
const Account = require('../models/Account');

async function generateUniqueAccountNumber(retries = 5) {
  for (let i = 0; i < retries; i++) {
    // Generate a random 10-digit number as a string
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Check if this account number already exists
    const existingAccount = await Account.findOne({ where: { accountNumber } });

    if (!existingAccount) {
      return accountNumber;
    }
  }
  throw new Error('Failed to generate a unique account number');
}

module.exports = { generateUniqueAccountNumber };
