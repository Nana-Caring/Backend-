const db = require('../models');
const crypto = require('crypto');

async function updateEmmaAccountUuid() {
  try {
    const oldId = '2fa479e0-953c-4b55-9137-fe418d9c5fb3';
    const newId = crypto.randomUUID();
    console.log('New UUID for Emma\'s account:', newId);

    // Start a transaction
    const transaction = await db.sequelize.transaction();

    try {
      // Update Transactions
      await db.Transaction.update(
        { accountId: newId },
        { where: { accountId: oldId }, transaction }
      );
      console.log('Updated Transactions');

      // Update Users
      await db.User.update(
        { accountId: newId },
        { where: { accountId: oldId }, transaction }
      );
      console.log('Updated Users');

      // Update Accounts
      await db.Account.update(
        { id: newId },
        { where: { id: oldId }, transaction }
      );
      console.log('Updated Account');

      // Commit the transaction
      await transaction.commit();
      console.log('Successfully updated Emma\'s account UUID to:', newId);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    await db.sequelize.close();
  } catch (error) {
    console.error('Error updating account UUID:', error);
    process.exit(1);
  }
}

updateEmmaAccountUuid();
