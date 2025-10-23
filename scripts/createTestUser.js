const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ where: { email: 'test.dependent@demo.com' } });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      console.log('User details:');
      console.log(`- Name: ${existingUser.firstName} ${existingUser.surname}`);
      console.log(`- Role: ${existingUser.role}`);
      console.log(`- Email: ${existingUser.email}`);
      console.log('- Password: testpassword123');
      process.exit(0);
    }

    // Create new test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const testUser = await User.create({
      firstName: 'Test',
      surname: 'Dependent',
      email: 'test.dependent@demo.com',
      password: hashedPassword,
      role: 'dependent',
      Idnumber: '9901015555087', // Valid SA ID format
      isBlocked: false,
      isEmailVerified: true
    });

    console.log('✅ Test dependent user created successfully!');
    console.log('Login credentials:');
    console.log('- Email: test.dependent@demo.com');
    console.log('- Password: testpassword123');
    console.log(`- User ID: ${testUser.id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();
