const { User, sequelize } = require('./models');

async function checkEmmaCredentials() {
  try {
    console.log('🔍 === Checking Emma\'s Credentials ===\n');
    
    const emma = await User.findOne({
      where: { firstName: 'Emma', surname: 'Johnson' },
      attributes: ['id', 'firstName', 'surname', 'email', 'role']
    });

    if (!emma) {
      console.log('❌ Emma Johnson not found');
      return;
    }

    console.log('👤 Emma Johnson Details:');
    console.log(`   - ID: ${emma.id}`);
    console.log(`   - Name: ${emma.firstName} ${emma.surname}`);
    console.log(`   - Email: ${emma.email}`);
    console.log(`   - Role: ${emma.role}`);
    
    // Check if there are any other users to compare
    console.log('\n📋 All Users in Database:');
    const allUsers = await User.findAll({
      attributes: ['id', 'firstName', 'surname', 'email', 'role'],
      limit: 10
    });
    
    allUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.surname} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkEmmaCredentials();