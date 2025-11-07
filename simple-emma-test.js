const fetch = require('node-fetch');

async function testEmmaLogin() {
  console.log('🧪 Testing Emma login with Emma123!...');
  
  try {
    const response = await fetch('https://nanacaring-backend.onrender.com/api/portal/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "dependent@demo.com",
        password: "Emma123!"
      }),
      timeout: 5000
    });
    
    const data = await response.json();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', data);
    
    if (data.token) {
      console.log('🎉 SUCCESS! Portal login works!');
      console.log('🔐 Token received:', data.token.substring(0, 50) + '...');
    } else {
      console.log('❌ No token received');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmmaLogin();