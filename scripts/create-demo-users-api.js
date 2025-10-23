const axios = require('axios');
require('dotenv').config({ path: '.env.production' });

const API_BASE = 'http://localhost:5000/api';

// Demo users data
const demoUsers = {
  caregiver: {
    firstName: 'Sarah',
    middleName: 'Michelle',
    surname: 'Williams',
    email: 'caregiver@demo.com',
    password: 'Demo123!@#',
    phoneNumber: '+27834567890',
    Idnumber: '8807125800090',
    dateOfBirth: '1988-07-12',
    homeAddressLine1: '789 Pine Road',
    homeCity: 'Durban',
    homeProvince: 'KwaZulu-Natal',
    homeCode: '4001',
    postalAddressLine1: 'PO Box 789',
    postalCity: 'Durban',
    postalProvince: 'KwaZulu-Natal',
    postalCode: '4001'
  },
  funder: {
    firstName: 'John',
    middleName: 'David',
    surname: 'Smith',
    email: 'funder@demo.com',
    password: 'Demo123!@#',
    phoneNumber: '+27812345678',
    Idnumber: '8501015800088',
    dateOfBirth: '1985-01-01',
    homeAddressLine1: '123 Main Street',
    homeCity: 'Cape Town',
    homeProvince: 'Western Cape',
    homeCode: '8001',
    postalAddressLine1: 'PO Box 123',
    postalCity: 'Cape Town',
    postalProvince: 'Western Cape',
    postalCode: '8001'
  },
  dependent: {
    firstName: 'Emma',
    lastName: 'Johnson', // Required by the validation
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
  }
};

let caregiverToken = null;

async function createDemoUsers() {
  console.log('🚀 Creating demo users through registration API...');
  
  // Step 1: Create Caregiver
  try {
    console.log('📝 Creating caregiver: caregiver@demo.com...');
    
    const caregiverResponse = await axios.post(`${API_BASE}/auth/register`, {
      ...demoUsers.caregiver,
      role: 'caregiver'
    });
    
    console.log('✅ Caregiver created successfully:', caregiverResponse.data.message);
    
    // Login caregiver to get token for dependent registration
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: demoUsers.caregiver.email,
      password: demoUsers.caregiver.password
    });
    
    caregiverToken = loginResponse.data.accessToken; // Fixed: use accessToken not token
    console.log('✅ Caregiver logged in successfully');
    console.log('🔑 Token obtained');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error creating caregiver:', error.response.data);
    } else {
      console.log('❌ Network error creating caregiver:', error.message);
    }
    return;
  }
  
  // Step 2: Create Funder
  try {
    console.log('📝 Creating funder: funder@demo.com...');
    
    const funderResponse = await axios.post(`${API_BASE}/auth/register`, {
      ...demoUsers.funder,
      role: 'funder'
    });
    
    console.log('✅ Funder created successfully:', funderResponse.data.message);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error creating funder:', error.response.data);
    } else {
      console.log('❌ Network error creating funder:', error.message);
    }
  }
  
  // Step 3: Create Dependent (by caregiver)
  try {
    console.log('📝 Creating dependent: dependent@demo.com...');
    
    const dependentResponse = await axios.post(`${API_BASE}/auth/register-dependent`, 
      demoUsers.dependent,
      {
        headers: {
          'Authorization': `Bearer ${caregiverToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Dependent created successfully:', dependentResponse.data.message);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error creating dependent:', error.response.data);
    } else {
      console.log('❌ Network error creating dependent:', error.message);
    }
  }
}

async function testLoginAll() {
  console.log('\n🔐 Testing login for all demo users...');
  
  const users = [
    { email: demoUsers.caregiver.email, role: 'caregiver' },
    { email: demoUsers.funder.email, role: 'funder' },
    { email: demoUsers.dependent.email, role: 'dependent' }
  ];
  
  for (const user of users) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: user.email,
        password: 'Demo123!@#'
      });
      
      console.log(`✅ ${user.role} login successful: ${user.email}`);
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${user.role} login failed: ${user.email} -`, error.response.data.message);
      } else {
        console.log(`❌ ${user.role} login network error: ${user.email}`);
      }
    }
  }
}

async function main() {
  try {
    await createDemoUsers();
    
    // Wait a bit before testing logins
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testLoginAll();
    
    console.log('\n🎉 Demo user creation and testing completed!');
    console.log('\n📋 Demo User Credentials:');
    console.log('�‍⚕️ Caregiver: caregiver@demo.com / Demo123!@#');
    console.log('👨‍� Funder: funder@demo.com / Demo123!@#');
    console.log('� Dependent: dependent@demo.com / Demo123!@# (registered by caregiver)');
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

main();
