const fetch = require('node-fetch');

async function testPortal() {
  const BASE_URL = 'https://nanacaring-backend.onrender.com';
  
  console.log('🧪 Testing Portal API with Correct Credentials');
  console.log('================================================');
  
  try {
    // Step 1: Admin Login
    console.log('\n1️⃣ Testing Admin Login...');
    const adminResponse = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nanacaring.com',
        password: 'nanacaring2025'
      })
    });
    
    console.log(`Status: ${adminResponse.status}`);
    const adminData = await adminResponse.json();
    console.log('Response:', adminData);
    
    if (adminData.accessToken || adminData.jwt) {
      const token = adminData.accessToken || adminData.jwt;
      console.log('✅ Admin login successful!');
      
      // Step 2: Get Users
      console.log('\n2️⃣ Testing Get Users...');
      const usersResponse = await fetch(`${BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`Status: ${usersResponse.status}`);
      const usersData = await usersResponse.json();
      
      if (usersData.data && usersData.data.length > 0) {
        const testUser = usersData.data.find(u => u.role === 'funder');
        console.log(`✅ Found ${usersData.data.length} users, test user: ${testUser?.firstName || 'None'}`);
        
        if (testUser) {
          // Step 3: Portal Login
          console.log('\n3️⃣ Testing Portal Login...');
          const portalResponse = await fetch(`${BASE_URL}/api/portal/admin-login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: testUser.id })
          });
          
          console.log(`Status: ${portalResponse.status}`);
          const portalData = await portalResponse.json();
          console.log('Response:', portalData);
          
          if (portalData.data?.token) {
            console.log('✅ Portal login successful!');
            
            // Step 4: Test Portal Endpoints
            console.log('\n4️⃣ Testing Portal Endpoints...');
            const userResponse = await fetch(`${BASE_URL}/api/portal/me`, {
              headers: { 'Authorization': `Bearer ${portalData.data.token}` }
            });
            
            console.log(`User Details Status: ${userResponse.status}`);
            if (userResponse.ok) {
              console.log('✅ Portal user details working!');
            }
          }
        }
      }
    } else {
      console.log('❌ Admin login failed:', adminData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPortal();