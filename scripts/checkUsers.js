const { User } = require('../models');

async function checkUsers() {
  try {
    const users = await User.findAll({ 
      attributes: ['id', 'email', 'firstName', 'surname', 'role'], 
      limit: 10 
    });
    
    console.log('Existing users:');
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach(u => {
        console.log(`${u.email} - ${u.firstName} ${u.surname} (${u.role})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
