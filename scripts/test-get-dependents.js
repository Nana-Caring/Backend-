const { User, Account } = require('../models');

async function testGetDependents() {
  try {
    console.log('Testing getDependents function...');

    // Get the first caregiver
    const caregiver = await User.findOne({
      where: { role: 'caregiver' },
      attributes: ['id', 'firstName', 'surname', 'email']
    });

    if (!caregiver) {
      console.log('No caregiver found!');
      return;
    }

    console.log(`Testing with caregiver: ${caregiver.firstName} ${caregiver.surname} (ID: ${caregiver.id})`);

    // Replicate the getDependents logic
    const dependentAccounts = await Account.findAll({
      where: { 
        caregiverId: caregiver.id,
        accountType: 'Main' // Only get main accounts to avoid duplicates
      },
      include: [{
        model: User,
        as: 'user',
        where: { role: 'dependent' },
        attributes: { exclude: ["password"] }
      }]
    });

    console.log(`Found ${dependentAccounts.length} main accounts for dependents`);

    // Extract unique dependents from the accounts
    const dependentsMap = new Map();
    dependentAccounts.forEach(account => {
      if (account.user && !dependentsMap.has(account.user.id)) {
        dependentsMap.set(account.user.id, {
          ...account.user.toJSON(),
          accounts: []
        });
      }
    });

    console.log(`Found ${dependentsMap.size} unique dependents`);

    // Now get all accounts for each dependent
    const dependentIds = Array.from(dependentsMap.keys());
    if (dependentIds.length > 0) {
      const allAccounts = await Account.findAll({
        where: { 
          caregiverId: caregiver.id,
          userId: dependentIds
        },
        attributes: ["id", "accountType", "balance", "parentAccountId", "userId"],
        order: [['accountType', 'ASC']]
      });

      console.log(`Found ${allAccounts.length} total accounts for all dependents`);

      // Group accounts by userId
      allAccounts.forEach(account => {
        const dependent = dependentsMap.get(account.userId);
        if (dependent) {
          dependent.accounts.push(account.toJSON());
        }
      });
    }

    const dependents = Array.from(dependentsMap.values());
    
    console.log(`\nFinal result: ${dependents.length} dependents with their accounts`);
    
    // Show first dependent as example
    if (dependents.length > 0) {
      const firstDependent = dependents[0];
      console.log(`\nExample - First dependent:`);
      console.log(`Name: ${firstDependent.firstName} ${firstDependent.surname}`);
      console.log(`Email: ${firstDependent.email}`);
      console.log(`Accounts: ${firstDependent.accounts.length}`);
      firstDependent.accounts.forEach(account => {
        console.log(`  - ${account.accountType}: Balance ${account.balance}`);
      });
    }

    console.log('\nThis is what the API should return now!');

  } catch (error) {
    console.error('Error testing getDependents:', error);
  }
}

// Run the test
testGetDependents()
  .then(() => {
    console.log('Test completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
