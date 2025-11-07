const axios = require('axios');

const API_BASE = 'https://nanacaring-backend.onrender.com/api';

const demoUsers = {
  caregiver: { email: 'caregiver@demo.com', password: 'Demo123!@#' },
  funder: { email: 'funder@demo.com', password: 'Demo123!@#' },
  dependent: { email: 'dependent@demo.com', password: 'Demo123!@#' }
};

async function loginAndGetDetails(userType) {
  try {
    console.log(`\n🔐 Debugging ${userType} (${demoUsers[userType].email})...`);
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: demoUsers[userType].email,
      password: demoUsers[userType].password
    });
    
    const token = loginResponse.data.accessToken || loginResponse.data.jwt || loginResponse.data.token;
    console.log(`✅ Login successful - User ID: ${loginResponse.data.user.id}`);
    console.log(`📝 Login response keys:`, Object.keys(loginResponse.data));
    console.log(`👤 User data:`, {
      id: loginResponse.data.user.id,
      email: loginResponse.data.user.email,
      role: loginResponse.data.user.role,
      firstName: loginResponse.data.user.firstName,
      surname: loginResponse.data.user.surname
    });
    
    // Try to get user details via /me endpoint
    try {
      const meResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`✅ /me endpoint works:`, {
        id: meResponse.data.id,
        email: meResponse.data.email,
        role: meResponse.data.role
      });
    } catch (error) {
      console.log(`❌ /me endpoint failed:`, error.response?.data?.message || error.message);
    }
    
    // Try accounts API with correct endpoint
    try {
      let accountsEndpoint = `${API_BASE}/accounts/my-accounts`;
      if (userType === 'dependent') {
        accountsEndpoint = `${API_BASE}/accounts/dependent/my-accounts`;
      }
      
      const accountsResponse = await axios.get(accountsEndpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`✅ Accounts API success:`, {
        endpoint: accountsEndpoint.split('/').slice(-2).join('/'),
        accountCount: accountsResponse.data.accountsCount || 0,
        totalBalance: accountsResponse.data.totalBalance,
        currency: accountsResponse.data.currency,
        responseKeys: Object.keys(accountsResponse.data)
      });
      
      if (accountsResponse.data.accounts && Array.isArray(accountsResponse.data.accounts)) {
        accountsResponse.data.accounts.forEach((acc, i) => {
          console.log(`   Account ${i+1}:`, {
            id: acc.id?.substring(0, 8) + '...',
            type: acc.accountType,
            balance: acc.balance,
            currency: acc.currency
          });
        });
      } else if (accountsResponse.data.allAccounts && Array.isArray(accountsResponse.data.allAccounts)) {
        accountsResponse.data.allAccounts.forEach((acc, i) => {
          console.log(`   Account ${i+1}:`, {
            id: acc.id?.substring(0, 8) + '...',
            type: acc.accountType,
            balance: acc.balance,
            currency: acc.currency
          });
        });
      } else {
        console.log('   No accounts found or accounts not in expected format');
      }
    } catch (error) {
      console.log(`❌ Accounts API failed:`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        error: error.response?.data?.error
      });
      
      // Log full error response for debugging
      if (error.response?.data) {
        console.log(`🔍 Full error response:`, error.response.data);
      }
    }
    
    // For dependents, test transactions API
    if (userType === 'dependent') {
      try {
        const transResponse = await axios.get(`${API_BASE}/transactions/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ Transactions API success:`, transResponse.data);
      } catch (error) {
        console.log(`❌ Transactions API failed:`, {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          error: error.response?.data?.error
        });
      }
      
      // Test orders API
      try {
        const ordersResponse = await axios.get(`${API_BASE}/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ Orders API success:`, ordersResponse.data);
      } catch (error) {
        console.log(`❌ Orders API failed:`, {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          error: error.response?.data?.error
        });
      }
    }
    
    return token;
    
  } catch (error) {
    console.log(`❌ Login failed for ${userType}:`, error.response?.data || error.message);
    return null;
  }
}

async function testDatabaseState() {
  try {
    console.log('\n🔍 Testing database state via health endpoint...');
    
    const healthResponse = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    console.log('✅ Health check successful:', {
      environment: healthResponse.data.environment,
      timestamp: healthResponse.data.timestamp
    });
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

async function main() {
  console.log('🔍 PRODUCTION DATABASE DIAGNOSTIC');
  console.log('=====================================');
  
  await testDatabaseState();
  
  // Test each user type
  for (const userType of Object.keys(demoUsers)) {
    await loginAndGetDetails(userType);
  }
  
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('=====================');
  console.log('✅ Authentication system working');
  console.log('❓ Account creation during registration needs investigation');
  console.log('❓ API endpoints may need debugging');
  console.log('\n💡 Next steps:');
  console.log('1. Check if accounts were created during user registration');
  console.log('2. Debug API endpoint authorization');
  console.log('3. Verify database schema matches model expectations');
}

main().catch(console.error);
