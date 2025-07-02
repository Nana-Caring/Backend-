const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_AUTH = `${BASE_URL}/api/auth`;

// Mock data for testing dependent registration
const mockCaregiverData = {
  firstName: "Sarah",
  middleName: "Jane",
  surname: "Williams",
  email: "sarah.williams@example.com",
  password: "SecurePass123!",
  role: "caregiver",
  Idnumber: "9012345678901"
};

const mockDependentData = {
  firstName: "Emily",
  middleName: "Rose",
  surname: "Johnson",
  email: "emily.johnson@example.com",
  password: "DependentPass123!",
  Idnumber: "0512345678902",
  relation: "daughter"
};

// Function to register caregiver
async function registerCaregiver() {
  try {
    console.log('🔄 Registering caregiver...');
    const response = await axios.post(`${API_AUTH}/register`, mockCaregiverData);
    console.log('✅ Caregiver registered successfully');
    console.log('User ID:', response.data.user.id);
    console.log('Email:', response.data.user.email);
    console.log('Role:', response.data.user.role);
    return response.data.user;
  } catch (error) {
    console.error('❌ Error registering caregiver:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Function to login caregiver and get JWT token
async function loginCaregiver() {
  try {
    console.log('\n🔄 Logging in caregiver to get JWT token...');
    const response = await axios.post(`${API_AUTH}/login`, {
      email: mockCaregiverData.email,
      password: mockCaregiverData.password
    });
    console.log('✅ Caregiver logged in successfully');
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    return response.data.token;
  } catch (error) {
    console.error('❌ Error logging in caregiver:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Function to register dependent
async function registerDependent(jwtToken) {
  try {
    console.log('\n🔄 Registering dependent...');
    const response = await axios.post(`${API_AUTH}/register-dependent`, mockDependentData, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Dependent registered successfully');
    console.log('Dependent ID:', response.data.dependent.id);
    console.log('Email:', response.data.dependent.email);
    console.log('Role:', response.data.dependent.role);
    console.log('Relation:', response.data.dependent.relation);
    console.log('Accounts created:', response.data.accounts?.length || 'Unknown');
    return response.data.dependent;
  } catch (error) {
    console.error('❌ Error registering dependent:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Function to test dependent login and account access
async function testDependentAccess() {
  try {
    console.log('\n🔄 Testing dependent login...');
    const loginResponse = await axios.post(`${API_AUTH}/login`, {
      email: mockDependentData.email,
      password: mockDependentData.password
    });
    
    console.log('✅ Dependent logged in successfully');
    const dependentToken = loginResponse.data.token;
    
    console.log('\n🔄 Testing dependent account access...');
    const accountsResponse = await axios.get(`${BASE_URL}/api/accounts/dependent/my-accounts`, {
      headers: {
        'Authorization': `Bearer ${dependentToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dependent accounts retrieved successfully');
    console.log('Total Balance:', accountsResponse.data.totalBalance);
    console.log('Accounts Count:', accountsResponse.data.accountsCount);
    console.log('Main Accounts:', accountsResponse.data.accounts?.main?.length || 0);
    console.log('Sub Accounts:', accountsResponse.data.accounts?.sub?.length || 0);
    
    return accountsResponse.data;
  } catch (error) {
    console.error('❌ Error testing dependent access:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Main function to run the complete test
async function runCompleteTest() {
  console.log('🧪 Starting Complete Dependent Registration Test');
  console.log('================================================\n');
  
  // Step 1: Register caregiver
  const caregiver = await registerCaregiver();
  if (!caregiver) {
    console.log('\n❌ Test failed: Could not register caregiver');
    return;
  }
  
  // Step 2: Login caregiver
  const caregiverToken = await loginCaregiver();
  if (!caregiverToken) {
    console.log('\n❌ Test failed: Could not login caregiver');
    return;
  }
  
  // Step 3: Register dependent
  const dependent = await registerDependent(caregiverToken);
  if (!dependent) {
    console.log('\n❌ Test failed: Could not register dependent');
    return;
  }
  
  // Step 4: Test dependent access
  const dependentAccounts = await testDependentAccess();
  if (!dependentAccounts) {
    console.log('\n❌ Test failed: Could not access dependent accounts');
    return;
  }
  
  console.log('\n🎉 Complete test successful!');
  console.log('Summary:');
  console.log('- Caregiver registered and logged in');
  console.log('- Dependent registered with accounts created');
  console.log('- Dependent can login and access accounts');
  console.log('- All endpoints working correctly');
}

// Quick function for just registering one dependent
async function quickRegisterDependent() {
  console.log('🚀 Quick Dependent Registration');
  console.log('================================\n');
  
  // You need to provide an existing caregiver JWT token
  const existingCaregiverToken = 'YOUR_CAREGIVER_JWT_TOKEN_HERE';
  
  if (existingCaregiverToken === 'YOUR_CAREGIVER_JWT_TOKEN_HERE') {
    console.log('❌ Please update the existingCaregiverToken variable with a real JWT token');
    console.log('💡 Run the complete test first: node test-register-dependent.js complete');
    return;
  }
  
  const dependent = await registerDependent(existingCaregiverToken);
  if (dependent) {
    console.log('\n✅ Quick registration successful!');
  }
}

// CLI interface
const command = process.argv[2];

if (command === 'complete') {
  runCompleteTest();
} else if (command === 'quick') {
  quickRegisterDependent();
} else {
  console.log('📋 Dependent Registration Test Script');
  console.log('=====================================\n');
  console.log('Usage:');
  console.log('  node test-register-dependent.js complete  # Complete test (caregiver + dependent)');
  console.log('  node test-register-dependent.js quick     # Quick dependent registration only');
  console.log('\nMock Data Available:');
  console.log('- Caregiver: sarah.williams@example.com / SecurePass123!');
  console.log('- Dependent: emily.johnson@example.com / DependentPass123!');
  console.log('\n💡 Make sure your server is running on http://localhost:5000');
}

module.exports = {
  registerCaregiver,
  loginCaregiver,
  registerDependent,
  testDependentAccess,
  mockCaregiverData,
  mockDependentData
};
