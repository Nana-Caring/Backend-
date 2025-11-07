const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com';

async function quickTest() {
  console.log('🔄 Quick Portal Test Starting...');
  
  try {
    // Test admin login
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@nanacaring.com',
      password: 'nanacaring2025'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.data.success}`);
    
    if (response.data.success) {
      console.log('✅ Admin login working!');
      console.log(`🎫 Token received: ${response.data.data.token.substring(0, 50)}...`);
    } else {
      console.log('❌ Admin login failed');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data)}`);
    }
  }
  
  console.log('🏁 Test Complete');
}

quickTest();