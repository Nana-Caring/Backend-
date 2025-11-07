require('dotenv').config();
const { Account, Transaction, sequelize } = require('./models');

async function removeSavingsAccounts() {
  console.log('🧹 REMOVING SAVINGS ACCOUNTS FROM DATABASE');
  console.log('='.repeat(45));

  const transaction = await sequelize.transaction();

  try {
    // First, find all Savings accounts
    const savingsAccounts = await Account.findAll({
      where: {
        accountType: 'Savings'
      },
      transaction
    });

    console.log(`\n📊 Found ${savingsAccounts.length} Savings accounts to remove`);

    if (savingsAccounts.length === 0) {
      console.log('✅ No Savings accounts found - database is already clean!');
      await transaction.rollback();
      return;
    }

    // Show accounts that will be removed
    console.log('\n📋 Accounts to be removed:');
    savingsAccounts.forEach(account => {
      console.log(`   • Account ${account.accountNumber}: ${account.accountName || 'Unnamed'} (Balance: ZAR ${account.balance})`);
    });

    // Check if any Savings accounts have non-zero balances
    const accountsWithBalances = savingsAccounts.filter(acc => acc.balance > 0);
    
    if (accountsWithBalances.length > 0) {
      console.log('\n⚠️  WARNING: Some Savings accounts have non-zero balances:');
      accountsWithBalances.forEach(account => {
        console.log(`   • Account ${account.accountNumber}: ZAR ${account.balance}`);
      });
      
      // Ask for confirmation (in production, you might want to redistribute these balances first)
      console.log('\n🔄 In a real scenario, you should redistribute these balances to other category accounts first.');
      console.log('For this cleanup, we\'ll proceed with removal (test environment).');
    }

    // Remove all transactions related to Savings accounts
    const savingsAccountIds = savingsAccounts.map(acc => acc.id);
    
    if (savingsAccountIds.length > 0) {
      const deletedTransactions = await Transaction.destroy({
        where: {
          accountId: savingsAccountIds
        },
        transaction
      });
      
      console.log(`\n🗑️  Removed ${deletedTransactions} transactions related to Savings accounts`);
    }

    // Remove the Savings accounts themselves
    const deletedAccounts = await Account.destroy({
      where: {
        accountType: 'Savings'
      },
      transaction
    });

    console.log(`\n🗑️  Removed ${deletedAccounts} Savings accounts from database`);

    // Commit the transaction
    await transaction.commit();

    console.log('\n✅ CLEANUP COMPLETE!');
    console.log('   • All Savings accounts removed');
    console.log('   • Related transactions removed');
    console.log('   • Database is now clean');

  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Error during cleanup:', error.message);
    throw error;
  }
}

async function verifyCleanup() {
  console.log('\n🔍 VERIFYING CLEANUP...');
  
  try {
    // Check for any remaining Savings accounts
    const remainingSavings = await Account.findAll({
      where: {
        accountType: 'Savings'
      }
    });

    if (remainingSavings.length === 0) {
      console.log('✅ Verification passed - No Savings accounts found');
    } else {
      console.log(`❌ Verification failed - Still found ${remainingSavings.length} Savings accounts`);
    }

    // Show current account types in use
    const accountTypes = await Account.findAll({
      attributes: ['accountType'],
      group: ['accountType'],
      raw: true
    });

    console.log('\n📊 Current account types in database:');
    accountTypes.forEach(type => {
      console.log(`   • ${type.accountType}`);
    });

  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
  }
}

async function main() {
  try {
    await removeSavingsAccounts();
    await verifyCleanup();
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { removeSavingsAccounts, verifyCleanup };