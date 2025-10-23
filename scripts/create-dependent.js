const axios = require('axios');
require('dotenv').config({ path: '.env.production' });

const API_BASE = 'https://nanacaring-backend.onrender.com/api';

const dependentData = {
  firstName: 'Emma',
  lastName: 'Johnson', // Required by validation
  surname: 'Johnson',
  email: 'dependent@demo.com',
  password: 'Demo123!@#',
  phoneNumber: '+27823456789',
  Idnumber: '9012155800089',
  relation: 'child', // Required by validation
  dateOfBirth: '1990-12-15',
  homeAddressLine1: '456 Oak Avenue',
  homeCity: 'Johannesburg',
  homeProvince: 'Gauteng',
  homeCode: '2001',
  postalAddressLine1: 'PO Box 456',
  postalCity: 'Johannesburg',
  postalProvince: 'Gauteng',
  postalCode: '2001'
};

async function createDependent() {
  console.log('🚀 Creating dependent through caregiver login...');
  
  try {
    // Step 1: Login caregiver
    console.log('🔐 Logging in caregiver...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'caregiver@demo.com',
      password: 'Demo123!@#'
    });
    
    const caregiverToken = loginResponse.data.accessToken || loginResponse.data.jwt;
    console.log('✅ Caregiver logged in successfully');
    console.log('🔑 Token received:', caregiverToken ? 'Yes' : 'No');
    console.log('🔑 Token type:', typeof caregiverToken);
    console.log('🔑 Token length:', caregiverToken ? caregiverToken.length : 'N/A');
    
    // Step 2: Create dependent using caregiver token
    console.log('📝 Creating dependent: dependent@demo.com...');
    
    const dependentResponse = await axios.post(
      `${API_BASE}/auth/register-dependent`,
      dependentData,
      {
        headers: {
          'Authorization': `Bearer ${caregiverToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Dependent created successfully!');
    console.log('📋 Response:', dependentResponse.data.message);
    
    // Step 3: Test dependent login
    console.log('\n🔐 Testing dependent login...');
    
    const dependentLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'dependent@demo.com',
      password: 'Demo123!@#'
    });
    
    console.log('✅ Dependent can login successfully!');
    const depToken = dependentLoginResponse.data.accessToken || dependentLoginResponse.data.jwt;
    console.log('🔑 Dependent token received:', depToken ? 'Yes' : 'No');
    
    return true;
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.data);
      console.log('📊 Status:', error.response.status);
    } else {
      console.log('❌ Network error:', error.message);
    }
    return false;
  }
}

async function verifyAllUsers() {
  console.log('\n📊 Verifying all demo users...');
  
  const users = [
    { email: 'caregiver@demo.com', role: 'caregiver' },
    { email: 'funder@demo.com', role: 'funder' },
    { email: 'dependent@demo.com', role: 'dependent' }
  ];
  
  for (const user of users) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: user.email,
        password: 'Demo123!@#'
      });
      
      console.log(`✅ ${user.role}: ${user.email} - Login successful`);
      
      // Get user details
      try {
        const token = response.data.accessToken || response.data.jwt;
        const userResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`   📋 ID: ${userResponse.data.user.id}, Role: ${userResponse.data.user.role}`);
      } catch (meError) {
        console.log(`   ❌ Could not get user details`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${user.role}: ${user.email} - ${error.response.data.message || 'Login failed'}`);
      } else {
        console.log(`❌ ${user.role}: ${user.email} - Network error`);
      }
    }
  }
}

async function main() {
  const success = await createDependent();
  
  if (success) {
    await verifyAllUsers();
    
    console.log('\n🎉 All demo users setup completed!');
    console.log('\n📋 Production Demo Users:');
    console.log('👩‍⚕️ Caregiver: caregiver@demo.com / Demo123!@#');
    console.log('👨‍💼 Funder: funder@demo.com / Demo123!@#');
    console.log('👤 Dependent: dependent@demo.com / Demo123!@#');
    console.log('\n🌐 API Base URL: https://nanacaring-backend.onrender.com');
  } else {
    console.log('\n❌ Failed to create dependent. Please check the logs above.');
  }
}

main();
