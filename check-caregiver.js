const { User } = require('./models');

async function checkCaregiver() {
  try {
    console.log('🔍 Checking caregiver in database...\n');

    // Find all caregivers
    const caregivers = await User.findAll({
      where: { role: 'caregiver' },
      attributes: ['id', 'firstName', 'middleName', 'surname', 'email', 'role', 'createdAt']
    });

    if (caregivers.length === 0) {
      console.log('❌ No caregivers found in database');
      return;
    }

    console.log(`✅ Found ${caregivers.length} caregiver(s):`);
    caregivers.forEach((caregiver, index) => {
      console.log(`${index + 1}. ${caregiver.firstName} ${caregiver.middleName || ''} ${caregiver.surname}`.trim());
      console.log(`   📧 Email: ${caregiver.email}`);
      console.log(`   🆔 ID: ${caregiver.id}`);
      console.log(`   📅 Created: ${caregiver.createdAt}`);
      console.log('');
    });

    // Check specific email
    const sarahByEmail = await User.findOne({
      where: { email: 'caregiver@demo.com' },
      attributes: ['id', 'firstName', 'surname', 'email', 'role']
    });

    if (sarahByEmail) {
      console.log('✅ Caregiver found by email caregiver@demo.com:');
      console.log(`   Name: ${sarahByEmail.firstName} ${sarahByEmail.surname}`);
      console.log(`   Role: ${sarahByEmail.role}`);
    } else {
      console.log('❌ No user found with email: caregiver@demo.com');
    }

    // Check if there's a user with Sarah Williams name
    const sarahByName = await User.findOne({
      where: { 
        firstName: 'Sarah',
        surname: 'Williams',
        role: 'caregiver'
      },
      attributes: ['id', 'firstName', 'surname', 'email', 'role']
    });

    if (sarahByName) {
      console.log('✅ Sarah Williams found by name:');
      console.log(`   Email: ${sarahByName.email}`);
      console.log(`   Role: ${sarahByName.role}`);
    } else {
      console.log('❌ No Sarah Williams found in caregivers');
    }

  } catch (error) {
    console.error('❌ Error checking caregiver:', error);
  } finally {
    process.exit(0);
  }
}

checkCaregiver();