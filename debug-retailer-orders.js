require('dotenv').config();
const fetch = require('node-fetch');

async function debugRetailerOrderAccess() {
  try {
    console.log('🔍 Debugging Retailer Order Access...\n');

    // Step 1: Login as retailer
    console.log('1️⃣ Logging in as retailer...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/retailer-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'retailer_admin@clicksstore.com',
        password: 'retailer_admin2025',
        storeId: 'main_store'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const { accessToken, retailer } = loginData;
    console.log(`✅ Login successful - Role: ${retailer.role}, Store: ${retailer.storeId}\n`);

    // Step 2: Test different order endpoints
    console.log('2️⃣ Testing different order endpoints...\n');

    // Test POS endpoint (should work)
    console.log('📋 Testing POS endpoint: /api/orders/pos/pending');
    const posResponse = await fetch('http://localhost:5000/api/orders/pos/pending', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (posResponse.ok) {
      const posData = await posResponse.json();
      console.log(`✅ POS Endpoint Success: Found ${posData.data?.length || 0} orders`);
      if (posData.data?.length > 0) {
        console.log('   Sample order:', {
          id: posData.data[0].id,
          orderNumber: posData.data[0].orderNumber,
          storeCode: posData.data[0].storeCode,
          customerName: posData.data[0].customerName
        });
      }
    } else {
      const posError = await posResponse.json();
      console.log('❌ POS Endpoint Failed:', posError.message);
    }

    // Test regular orders endpoint (might not work for retailers)
    console.log('\n📋 Testing regular endpoint: /api/orders');
    const regularResponse = await fetch('http://localhost:5000/api/orders', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (regularResponse.ok) {
      const regularData = await regularResponse.json();
      console.log(`✅ Regular Endpoint Success: Found ${regularData.data?.length || regularData.orders?.length || 0} orders`);
    } else {
      const regularError = await regularResponse.json();
      console.log('❌ Regular Endpoint Failed:', regularError.message || regularError.error);
      console.log('   This is expected - retailers should use POS endpoints');
    }

    // Step 3: Recommendations
    console.log('\n💡 Frontend Integration Recommendations:');
    console.log('   1. Use /api/orders/pos/pending for retailer dashboards');
    console.log('   2. Check user.role === "retailer" to determine which endpoint to call');
    console.log('   3. Store accessToken and include in Authorization header');
    console.log('   4. Handle different response formats for POS vs regular endpoints');

  } catch (error) {
    console.error('❌ Debug Error:', error.message);
  }
}

debugRetailerOrderAccess();