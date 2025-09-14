const { User, Account } = require('../models');

async function fixCaregiverDependentRelationships() {
  try {
    console.log('Starting caregiver-dependent relationship fix...');

    // Find all accounts for dependents that don't have a caregiverId set
    const dependentAccountsWithoutCaregiver = await Account.findAll({
      include: [{
        model: User,
        as: 'user',
        where: { role: 'dependent' }
      }],
      where: { caregiverId: null }
    });

    console.log(`Found ${dependentAccountsWithoutCaregiver.length} dependent accounts without caregiver relationships`);

    if (dependentAccountsWithoutCaregiver.length === 0) {
      console.log('No accounts need updating.');
      return;
    }

    // Get all caregivers to potentially assign dependents to
    const caregivers = await User.findAll({
      where: { role: 'caregiver' },
      attributes: ['id', 'firstName', 'surname', 'email']
    });

    console.log(`Found ${caregivers.length} caregivers in the system`);

    if (caregivers.length === 0) {
      console.log('No caregivers found. Cannot assign dependents.');
      return;
    }

    // For now, let's just list the unassigned dependents
    // In a real scenario, you'd need business logic to determine the correct caregiver
    const unassignedDependents = new Set();
    dependentAccountsWithoutCaregiver.forEach(account => {
      unassignedDependents.add(account.user.id);
    });

    console.log('\nUnassigned dependents:');
    for (const dependentId of unassignedDependents) {
      const dependent = await User.findByPk(dependentId, {
        attributes: ['id', 'firstName', 'surname', 'email']
      });
      console.log(`- ID: ${dependent.id}, Name: ${dependent.firstName} ${dependent.surname}, Email: ${dependent.email}`);
    }

    console.log('\nAvailable caregivers:');
    caregivers.forEach(caregiver => {
      console.log(`- ID: ${caregiver.id}, Name: ${caregiver.firstName} ${caregiver.surname}, Email: ${caregiver.email}`);
    });

    console.log('\nTo fix these relationships, you need to:');
    console.log('1. Determine which caregiver should be assigned to each dependent');
    console.log('2. Update the caregiverId field in the accounts table');
    console.log('\nExample SQL to update (replace CAREGIVER_ID and DEPENDENT_ID):');
    console.log('UPDATE "Accounts" SET "caregiverId" = CAREGIVER_ID WHERE "userId" = DEPENDENT_ID;');

  } catch (error) {
    console.error('Error fixing caregiver-dependent relationships:', error);
  }
}

// Run the fix
fixCaregiverDependentRelationships()
  .then(() => {
    console.log('Fix script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fix script failed:', error);
    process.exit(1);
  });
