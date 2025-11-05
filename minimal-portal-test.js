const fetch = require('node-fetch');

const BASE_URL = 'https://nanacaring-backend.onrender.com';

async function quickTest() {
  console.log('🔄 Quick Portal Test Starting...');
  
  try {
    // Test admin login
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nanacaring.com',
        password: 'nanacaring2025'
      })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log('✅ Admin login working!');
    } else {
      console.log('❌ Admin login failed');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('🏁 Test Complete');
}

quickTest();