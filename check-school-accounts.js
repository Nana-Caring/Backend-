const { Account } = require('./models');

async function checkSchoolAccounts() {
  try {
    console.log('🔍 Searching for school-related accounts...');
    
    // Search for accounts with "school" in the account type
    const schoolAccounts = await Account.findAll({
      where: {
        accountType: {
          [require('sequelize').Op.iLike]: '%school%'
        }
      },
      attributes: ['id', 'accountType', 'userId', 'caregiverId', 'balance', 'accountNumber', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`\n📊 Found ${schoolAccounts.length} accounts with 'school' in the type:`);
    if (schoolAccounts.length > 0) {
      schoolAccounts.forEach(account => {
        console.log(`   ID: ${account.id} | Type: ${account.accountType} | User: ${account.userId} | Caregiver: ${account.caregiverId} | Balance: R${account.balance} | Account#: ${account.accountNumber}`);
      });
    }

    // Also check for "Education" accounts (which might be used for school purposes)
    console.log('\n🔍 Searching for education-related accounts...');
    const educationAccounts = await Account.findAll({
      where: {
        accountType: {
          [require('sequelize').Op.iLike]: '%education%'
        }
      },
      attributes: ['id', 'accountType', 'userId', 'caregiverId', 'balance', 'accountNumber', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`\n📊 Found ${educationAccounts.length} accounts with 'education' in the type:`);
    if (educationAccounts.length > 0) {
      educationAccounts.forEach(account => {
        console.log(`   ID: ${account.id} | Type: ${account.accountType} | User: ${account.userId} | Caregiver: ${account.caregiverId} | Balance: R${account.balance} | Account#: ${account.accountNumber}`);
      });
    }

    // Show all unique account types to see what's available
    console.log('\n📋 All unique account types in the system:');
    const allAccountTypes = await Account.findAll({
      attributes: ['accountType'],
      group: ['accountType'],
      raw: true
    });

    const uniqueTypes = allAccountTypes.map(acc => acc.accountType).sort();
    console.log(`✅ Found ${uniqueTypes.length} unique account types:`);
    uniqueTypes.forEach(type => {
      console.log(`   - ${type}`);
    });

    // Count accounts by type
    console.log('\n📊 Account counts by type:');
    for (const type of uniqueTypes) {
      const count = await Account.count({
        where: { accountType: type }
      });
      console.log(`   ${type}: ${count} accounts`);
    }

  } catch (error) {
    console.error('❌ Error checking school accounts:', error);
  }
}

// Run the check
checkSchoolAccounts().then(() => {
  console.log('\n🏁 School account check completed.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Check failed:', error);
  process.exit(1);
});