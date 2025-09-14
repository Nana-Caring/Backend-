const { User, Account } = require('../models');

async function assignDependentsToCaregiver() {
  try {
    console.log('Assigning all unlinked dependents to first caregiver for testing...');

    // Get the first caregiver (for testing purposes)
    const firstCaregiver = await User.findOne({
      where: { role: 'caregiver' },
      attributes: ['id', 'firstName', 'surname', 'email']
    });

    if (!firstCaregiver) {
      console.log('No caregiver found!');
      return;
    }

    console.log(`Assigning all dependents to caregiver: ${firstCaregiver.firstName} ${firstCaregiver.surname} (ID: ${firstCaregiver.id})`);

    // Update all accounts without caregiverId to belong to the first caregiver
    const result = await Account.update(
      { caregiverId: firstCaregiver.id },
      { 
        where: { caregiverId: null },
        include: [{
          model: User,
          as: 'user',
          where: { role: 'dependent' }
        }]
      }
    );

    console.log(`Updated ${result[0]} account records with caregiverId: ${firstCaregiver.id}`);

    // Verify the update
    const dependentsWithCaregivers = await Account.findAll({
      where: { caregiverId: firstCaregiver.id },
      include: [{
        model: User,
        as: 'user',
        where: { role: 'dependent' },
        attributes: ['id', 'firstName', 'surname', 'email']
      }],
      attributes: ['id', 'accountType', 'userId']
    });

    const uniqueDependents = new Map();
    dependentsWithCaregivers.forEach(account => {
      if (!uniqueDependents.has(account.user.id)) {
        uniqueDependents.set(account.user.id, account.user);
      }
    });

    console.log(`\nNow ${uniqueDependents.size} dependents are linked to caregiver ${firstCaregiver.firstName}:`);
    uniqueDependents.forEach(dependent => {
      console.log(`- ${dependent.firstName} ${dependent.surname} (ID: ${dependent.id})`);
    });

  } catch (error) {
    console.error('Error assigning dependents to caregiver:', error);
  }
}

// Run the assignment
assignDependentsToCaregiver()
  .then(() => {
    console.log('Assignment completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Assignment failed:', error);
    process.exit(1);
  });
