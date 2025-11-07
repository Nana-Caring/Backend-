const bcrypt = require('bcryptjs');
const { User, sequelize } = require('./models');

async function resetEmmaPassword() {
  try {
    console.log('🔑 === Resetting Emma\'s Password for Testing ===\n');
    
    const emma = await User.findOne({
      where: { firstName: 'Emma', surname: 'Johnson' }
    });

    if (!emma) {
      console.log('❌ Emma Johnson not found');
      return;
    }

    // Set a simple test password
    const testPassword = 'Emma123!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    await emma.update({ password: hashedPassword });
    
    console.log('✅ Emma\'s password reset successfully');
    console.log('📝 Test Credentials:');
    console.log(`   Email: ${emma.email}`);
    console.log(`   Password: ${testPassword}`);
    
    // Verify the password works
    const passwordCheck = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`   Password Verification: ${passwordCheck ? '✅ Valid' : '❌ Invalid'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

resetEmmaPassword();