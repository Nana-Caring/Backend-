const db = require('../models');

async function updateEmmaAccountId() {
  try {
    const oldId = '2fa479e0-953c-4b55-9137-fe418d9c5fb3';
    const newId = 101;

    // Start a transaction
    const transaction = await db.sequelize.transaction();

    try {
      // Update Transactions
      await db.Transaction.update(
        { accountId: newId },
        { 
          where: { accountId: oldId },
          transaction
        }
      );
      console.log('Updated Transactions');

      // Update Users
      await db.User.update(
        { accountId: newId },
        { 
          where: { accountId: oldId },
          transaction
        }
      );
      console.log('Updated Users');

      // Update Accounts
      await db.Account.update(
        { id: newId },
        { 
          where: { id: oldId },
          transaction
        }
      );
      console.log('Updated Account');

      // Commit the transaction
      await transaction.commit();
      console.log('Successfully updated Emma\'s account ID to:', newId);
    } catch (err) {
      // If any error occurs, rollback the transaction
      await transaction.rollback();
      throw err;
    }

    // Close the database connection
    await db.sequelize.close();
  } catch (error) {
    console.error('Error updating account ID:', error);
    process.exit(1);
  }
}

// Run the function
updateEmmaAccountId();
