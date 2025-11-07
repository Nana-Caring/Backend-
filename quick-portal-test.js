const axios = require('axios');

// Set timeout for axios
axios.defaults.timeout = 10000; // 10 seconds

async function testPortalQuick() {
  try {
    console.log('🔄 Testing portal admin-login...');
    
    const response = await axios.post('https://nanacaring-backend.onrender.com/api/portal/admin-login', {
      username: "dependent@demo.com",
      password: "Emma123!"
    }, {
      timeout: 10000
    });
    
    console.log('✅ Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('🎉 Portal login successful!');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testPortalQuick();