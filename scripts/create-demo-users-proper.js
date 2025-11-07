const axios = require('axios');
require('dotenv').config({ path: '.env.production' });

const BASE_URL = 'http://localhost:5000/api';

// Demo user data
const demoUsers = {
  funder: {
    firstName: 'John',
    middleName: 'Michael',
    surname: 'Smith',
    email: 'funder@demo.com',
    password: 'Demo123!',
    role: 'funder',
    Idnumber: '8901234567890'
  },
  caregiver: {
    firstName: 'Sarah',
    middleName: 'Jane',
    surname: 'Johnson',
    email: 'caregiver@demo.com',
    password: 'Demo123!',
    role: 'caregiver',
    Idnumber: '9012345678901'
  },
  dependent: {
    firstName: 'Emma',
    middleName: 'Rose',
    surname: 'Williams',
    email: 'dependent@demo.com',
    password: 'Demo123!',
    Idnumber: '0123456789012',
    relation: 'daughter'
  }
};

async function createDemoUsers() {
  try {
    console.log('🚀 Creating demo users through proper registration endpoints...\n');

    // 1. Register Funder
    console.log('📝 Registering funder...');
    try {
      const funderResponse = await axios.post(`${BASE_URL}/auth/register`, demoUsers.funder);
      console.log('✅ Funder created successfully');
      console.log(`   - Email: ${demoUsers.funder.email}`);
      console.log(`   - Account created: ${funderResponse.data.user.account ? 'Yes' : 'No'}`);
    } catch (error) {
      console.log(`❌ Funder creation failed: ${error.response?.data?.message || error.message}`);
    }

    // 2. Register Caregiver
    console.log('\n📝 Registering caregiver...');
    try {
      const caregiverResponse = await axios.post(`${BASE_URL}/auth/register`, demoUsers.caregiver);
      console.log('✅ Caregiver created successfully');
      console.log(`   - Email: ${demoUsers.caregiver.email}`);
    } catch (error) {
      console.log(`❌ Caregiver creation failed: ${error.response?.data?.message || error.message}`);
    }

    // 3. Login as caregiver to get token for dependent registration
    console.log('\n🔐 Logging in as caregiver to register dependent...');
    let caregiverToken = null;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: demoUsers.caregiver.email,
        password: demoUsers.caregiver.password
      });
      caregiverToken = loginResponse.data.token;
      console.log('✅ Caregiver logged in successfully');
    } catch (error) {
      console.log(`❌ Caregiver login failed: ${error.response?.data?.message || error.message}`);
      return;
    }

    // 4. Register Dependent through caregiver
    console.log('\n📝 Registering dependent...');
    try {
      const dependentResponse = await axios.post(
        `${BASE_URL}/auth/register-dependent`,
        demoUsers.dependent,
        {
          headers: {
            Authorization: `Bearer ${caregiverToken}`
          }
        }
      );
      console.log('✅ Dependent created successfully');
      console.log(`   - Email: ${demoUsers.dependent.email}`);
      console.log(`   - Accounts created: ${dependentResponse.data.dependent?.accounts?.length || 0}`);
    } catch (error) {
      console.log(`❌ Dependent creation failed: ${error.response?.data?.message || error.message}`);
    }

    // 5. Test login for each user
    console.log('\n🧪 Testing login for all demo users...');
    
    for (const [userType, userData] of Object.entries(demoUsers)) {
      if (userType === 'dependent') continue; // Skip dependent for now
      
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: userData.email,
          password: userData.password
        });
        
        console.log(`✅ ${userType} login successful`);
        console.log(`   - Token: ${loginResponse.data.token.substring(0, 20)}...`);
        console.log(`   - User ID: ${loginResponse.data.user.id}`);
        console.log(`   - Role: ${loginResponse.data.user.role}`);
      } catch (error) {
        console.log(`❌ ${userType} login failed: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎉 Demo user creation process completed!');
    console.log('\n📋 Demo User Credentials:');
    console.log('========================');
    console.log('Funder:');
    console.log(`  Email: ${demoUsers.funder.email}`);
    console.log(`  Password: ${demoUsers.funder.password}`);
    console.log('\nCaregiver:');
    console.log(`  Email: ${demoUsers.caregiver.email}`);
    console.log(`  Password: ${demoUsers.caregiver.password}`);
    console.log('\nDependent:');
    console.log(`  Email: ${demoUsers.dependent.email}`);
    console.log(`  Password: ${demoUsers.dependent.password}`);
    
  } catch (error) {
    console.error('❌ Error in demo user creation process:', error.message);
  }
}

// Run the script
createDemoUsers();
