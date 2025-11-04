const { User } = require('./models');
const { Op } = require('sequelize');

async function searchForUser() {
  try {
    console.log('🔍 Searching for users with similar email patterns...');
    
    // Search for users with emails containing "princeng" or "komashumu"
    const users = await User.findAll({
      where: {
        email: {
          [Op.or]: [
            { [Op.like]: '%princeng%' },
            { [Op.like]: '%komashumu%' },
            { [Op.like]: '%princengwakomashumu%' }
          ]
        }
      },
      attributes: ['id', 'firstName', 'surname', 'email', 'role', 'createdAt']
    });

    if (users.length === 0) {
      console.log('❌ No users found with similar email patterns');
      
      // Let's also search by first name or surname
      console.log('\n🔍 Searching by name patterns...');
      const nameUsers = await User.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.like]: '%prince%' } },
            { surname: { [Op.like]: '%ngwa%' } },
            { surname: { [Op.like]: '%komashumu%' } }
          ]
        },
        attributes: ['id', 'firstName', 'surname', 'email', 'role', 'createdAt']
      });

      if (nameUsers.length === 0) {
        console.log('❌ No users found with similar name patterns either');
      } else {
        console.log(`\n✅ Found ${nameUsers.length} users with similar names:`);
        nameUsers.forEach(user => {
          console.log(`   ID: ${user.id} | ${user.firstName} ${user.surname} | ${user.email} | ${user.role}`);
        });
      }
    } else {
      console.log(`\n✅ Found ${users.length} users with similar email patterns:`);
      users.forEach(user => {
        console.log(`   ID: ${user.id} | ${user.firstName} ${user.surname} | ${user.email} | ${user.role}`);
      });
    }

    // Also show all users to help identify the correct one
    console.log('\n📋 All users in the database:');
    const allUsers = await User.findAll({
      attributes: ['id', 'firstName', 'surname', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Showing last ${Math.min(allUsers.length, 20)} users:`);
      allUsers.forEach(user => {
        console.log(`   ID: ${user.id} | ${user.firstName} ${user.surname} | ${user.email} | ${user.role} | Created: ${user.createdAt}`);
      });
    }

  } catch (error) {
    console.error('❌ Error searching for users:', error);
  }
}

// Run the search
searchForUser().then(() => {
  console.log('\n🏁 Search completed.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Search failed:', error);
  process.exit(1);
});