// Comprehensive Payment Cards API Test Script with Multiple Test Cards
require('dotenv').config();
const http = require('http');

// Test configuration
const API_BASE = 'http://localhost:5000';
const TEST_USER = {
  email: 'funder@example.com', // Update with your actual test user
  password: 'Password123!'     // Update with your actual test password
};

// Multiple test cards for comprehensive testing
const TEST_CARDS = [
  {
    bankName: "Standard Bank",
    cardNumber: "4111111111111111", // Visa test card
    expiryDate: "12/25",
    ccv: "123",
    nickname: "Standard Bank Visa",
    isDefault: true
  },
  {
    bankName: "FNB",
    cardNumber: "4000000000000002", // Visa test card 2
    expiryDate: "08/26",
    ccv: "456",
    nickname: "FNB Business Card",
    isDefault: false
  },
  {
    bankName: "Capitec Bank",
    cardNumber: "5555555555554444", // Mastercard test card
    expiryDate: "03/27",
    ccv: "789",
    nickname: "Capitec Mastercard",
    isDefault: false
  },
  {
    bankName: "ABSA",
    cardNumber: "4242424242424242", // Another Visa test card
    expiryDate: "11/28",
    ccv: "321",
    nickname: "ABSA Premium Card",
    isDefault: false
  },
  {
    bankName: "Nedbank",
    cardNumber: "4000000000000077", // Visa test card with different ending
    expiryDate: "06/26",
    ccv: "654",
    nickname: "Nedbank Gold Card",
    isDefault: false
  }
];

let authToken = '';
let addedCards = [];

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Step 1: Login to get auth token
async function testLogin() {
  console.log('🔐 Step 1: Testing login...');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login successful');
      console.log(`   Token: ${authToken.substring(0, 30)}...`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

// Step 2: Test adding multiple cards
async function testAddCards() {
  console.log('\n💳 Step 2: Testing add payment cards...');
  
  for (let i = 0; i < TEST_CARDS.length; i++) {
    const card = TEST_CARDS[i];
    console.log(`\n   Adding ${card.bankName} card...`);
    
    try {
      const response = await makeRequest(
        'POST', 
        '/api/payment-cards/add', 
        card,
        { 'Authorization': `Bearer ${authToken}` }
      );
      
      if (response.status === 201) {
        console.log(`   ✅ ${card.bankName} card added successfully`);
        console.log(`      Card ID: ${response.data.card.id}`);
        console.log(`      Masked Number: ${response.data.card.cardNumber}`);
        console.log(`      Default: ${response.data.card.isDefault}`);
        
        addedCards.push(response.data.card);
      } else {
        console.log(`   ❌ Failed to add ${card.bankName} card:`, response.data);
      }
    } catch (error) {
      console.log(`   ❌ Error adding ${card.bankName} card:`, error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n   📊 Summary: ${addedCards.length}/${TEST_CARDS.length} cards added successfully`);
}

// Step 3: Test getting all cards
async function testGetAllCards() {
  console.log('\n📋 Step 3: Testing get all payment cards...');
  
  try {
    const response = await makeRequest(
      'GET', 
      '/api/payment-cards/my-cards',
      null,
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    if (response.status === 200) {
      console.log('✅ Cards retrieved successfully');
      console.log(`   Total cards: ${response.data.totalCards}`);
      
      response.data.cards.forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.bankName} - ${card.cardNumber} ${card.isDefault ? '(Default)' : ''}`);
        console.log(`      Nickname: ${card.nickname || 'None'}`);
        console.log(`      Expires: ${card.expiryDate}`);
      });
      
      return response.data.cards;
    } else {
      console.log('❌ Failed to get cards:', response.data);
      return [];
    }
  } catch (error) {
    console.log('❌ Get cards error:', error.message);
    return [];
  }
}

// Step 4: Test setting default card
async function testSetDefaultCard() {
  if (addedCards.length < 2) {
    console.log('\n⏭️  Step 4: Skipping set default test (need at least 2 cards)');
    return;
  }

  console.log('\n🎯 Step 4: Testing set default card...');
  
  // Set the second card as default
  const cardToSetDefault = addedCards[1];
  
  try {
    const response = await makeRequest(
      'PUT', 
      `/api/payment-cards/set-default/${cardToSetDefault.id}`,
      null,
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    if (response.status === 200) {
      console.log('✅ Default card updated successfully');
      console.log(`   New default: ${response.data.bankName} - ${response.data.cardNumber}`);
    } else {
      console.log('❌ Failed to set default card:', response.data);
    }
  } catch (error) {
    console.log('❌ Set default card error:', error.message);
  }
}

// Step 5: Test creating payment intent
async function testCreatePaymentIntent() {
  if (addedCards.length === 0) {
    console.log('\n⏭️  Step 5: Skipping payment intent test (no cards available)');
    return;
  }

  console.log('\n💰 Step 5: Testing create payment intent...');
  
  const paymentData = {
    amount: 150.75,
    cardId: addedCards[0].id,
    description: "Test payment for card functionality"
  };
  
  try {
    const response = await makeRequest(
      'POST', 
      '/api/payment-cards/create-payment-intent',
      paymentData,
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    if (response.status === 200) {
      console.log('✅ Payment intent created successfully');
      console.log(`   Amount: $${response.data.amount}`);
      console.log(`   Payment Intent ID: ${response.data.paymentIntentId}`);
      console.log(`   Client Secret: ${response.data.clientSecret.substring(0, 40)}...`);
      console.log(`   Card used: ${response.data.card.bankName} - ${response.data.card.cardNumber}`);
    } else {
      console.log('❌ Failed to create payment intent:', response.data);
    }
  } catch (error) {
    console.log('❌ Create payment intent error:', error.message);
  }
}

// Step 6: Test removing a card
async function testRemoveCard() {
  if (addedCards.length === 0) {
    console.log('\n⏭️  Step 6: Skipping remove card test (no cards to remove)');
    return;
  }

  console.log('\n🗑️  Step 6: Testing remove payment card...');
  
  // Remove the last added card
  const cardToRemove = addedCards[addedCards.length - 1];
  
  try {
    const response = await makeRequest(
      'DELETE', 
      `/api/payment-cards/remove/${cardToRemove.id}`,
      null,
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    if (response.status === 200) {
      console.log('✅ Card removed successfully');
      console.log(`   Removed: ${cardToRemove.bankName} - ${cardToRemove.cardNumber}`);
      
      // Remove from local array
      addedCards.pop();
    } else {
      console.log('❌ Failed to remove card:', response.data);
    }
  } catch (error) {
    console.log('❌ Remove card error:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 COMPREHENSIVE PAYMENT CARDS API TEST');
  console.log('=======================================\n');
  
  console.log('📋 Test Cards Available:');
  TEST_CARDS.forEach((card, index) => {
    console.log(`   ${index + 1}. ${card.bankName} - **** **** **** ${card.cardNumber.slice(-4)} (${card.nickname})`);
  });
  
  console.log(`\n🎯 Testing API at: ${API_BASE}`);
  console.log(`👤 Test user: ${TEST_USER.email}\n`);
  
  // Run all tests in sequence
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication. Please check:');
    console.log('   - Server is running on localhost:5000');
    console.log('   - Test user credentials are correct');
    console.log('   - Database is properly connected');
    return;
  }
  
  await testAddCards();
  await testGetAllCards();
  await testSetDefaultCard();
  await testCreatePaymentIntent();
  await testRemoveCard();
  
  // Final verification
  console.log('\n🔍 Final verification - Getting updated card list...');
  const finalCards = await testGetAllCards();
  
  console.log('\n🎉 TEST SUMMARY');
  console.log('===============');
  console.log(`✅ Login: Success`);
  console.log(`✅ Cards added: ${addedCards.length}/${TEST_CARDS.length}`);
  console.log(`✅ Cards remaining: ${finalCards.length}`);
  console.log(`✅ All endpoints tested`);
  
  console.log('\n📝 QUICK MANUAL TEST COMMANDS (PowerShell):');
  console.log('============================================');
  console.log(`
# 1. Login
$response = Invoke-RestMethod -Uri "${API_BASE}/api/auth/login" -Method Post -Body '{"email":"${TEST_USER.email}","password":"${TEST_USER.password}"}' -ContentType "application/json"
$token = $response.token

# 2. Add a card
$cardData = '{"bankName":"Test Bank","cardNumber":"4111111111111111","expiryDate":"12/25","ccv":"123","nickname":"My Test Card","isDefault":true}'
Invoke-RestMethod -Uri "${API_BASE}/api/payment-cards/add" -Method Post -Headers @{"Authorization"="Bearer $token";"Content-Type"="application/json"} -Body $cardData

# 3. Get all cards
Invoke-RestMethod -Uri "${API_BASE}/api/payment-cards/my-cards" -Method Get -Headers @{"Authorization"="Bearer $token"}
  `);
}
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testPaymentCardsAPI() {
  console.log('🧪 Testing Payment Cards API Endpoints\n');
  console.log('=' * 50);

  let authToken = null;
  let testCardId = null;

  try {
    // Test 1: Server Health Check
    console.log('\n1️⃣ Testing Server Health...');
    try {
      const healthResponse = await makeRequest('GET', '/health');
      if (healthResponse.status === 200) {
        console.log('✅ Server is running and responsive');
      } else {
        console.log('⚠️  Server responded with status:', healthResponse.status);
      }
    } catch (error) {
      console.log('❌ Server health check failed - server may not be running');
      console.log('💡 Please start the server with: npm start');
      return;
    }

    // Test 2: Authentication (Login)
    console.log('\n2️⃣ Testing Authentication...');
    try {
      const loginResponse = await makeRequest('POST', '/api/auth/login', TEST_USER);
      if (loginResponse.status === 200 && loginResponse.data.token) {
        authToken = loginResponse.data.token;
        console.log('✅ Authentication successful');
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
      } else {
        console.log('❌ Authentication failed:', loginResponse.data.message);
        console.log('💡 You may need to create a test user first');
        return;
      }
    } catch (error) {
      console.log('❌ Authentication error:', error.message);
      return;
    }

    const authHeaders = { 'Authorization': `Bearer ${authToken}` };

    // Test 3: Add Payment Card
    console.log('\n3️⃣ Testing: POST /api/payment-cards/add');
    try {
      const addResponse = await makeRequest('POST', '/api/payment-cards/add', TEST_CARD, authHeaders);
      if (addResponse.status === 201) {
        testCardId = addResponse.data.card.id;
        console.log('✅ Card added successfully');
        console.log(`   Card ID: ${testCardId}`);
        console.log(`   Bank: ${addResponse.data.card.bankName}`);
        console.log(`   Masked Number: ${addResponse.data.card.cardNumber}`);
        console.log(`   Default: ${addResponse.data.card.isDefault}`);
      } else {
        console.log('❌ Failed to add card:', addResponse.data.message);
        console.log('   Status:', addResponse.status);
      }
    } catch (error) {
      console.log('❌ Add card error:', error.message);
    }

    // Test 4: Get User's Payment Cards
    console.log('\n4️⃣ Testing: GET /api/payment-cards/my-cards');
    try {
      const cardsResponse = await makeRequest('GET', '/api/payment-cards/my-cards', null, authHeaders);
      if (cardsResponse.status === 200) {
        console.log('✅ Retrieved payment cards successfully');
        console.log(`   Total Cards: ${cardsResponse.data.totalCards || cardsResponse.data.cards?.length || 0}`);
        if (cardsResponse.data.cards && cardsResponse.data.cards.length > 0) {
          cardsResponse.data.cards.forEach((card, index) => {
            console.log(`   Card ${index + 1}: ${card.bankName} - ${card.cardNumber} (Default: ${card.isDefault})`);
          });
        }
      } else {
        console.log('❌ Failed to retrieve cards:', cardsResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Get cards error:', error.message);
    }

    // Test 5: Set Default Payment Card
    if (testCardId) {
      console.log('\n5️⃣ Testing: PUT /api/payment-cards/set-default/:cardId');
      try {
        const defaultResponse = await makeRequest('PUT', `/api/payment-cards/set-default/${testCardId}`, null, authHeaders);
        if (defaultResponse.status === 200) {
          console.log('✅ Default card set successfully');
          console.log(`   Card: ${defaultResponse.data.bankName} - ${defaultResponse.data.cardNumber}`);
        } else {
          console.log('❌ Failed to set default card:', defaultResponse.data.message);
        }
      } catch (error) {
        console.log('❌ Set default card error:', error.message);
      }
    }

    // Test 6: Create Payment Intent
    if (testCardId) {
      console.log('\n6️⃣ Testing: POST /api/payment-cards/create-payment-intent');
      try {
        const paymentData = {
          amount: 100.00,
          cardId: testCardId,
          description: 'Test payment intent'
        };
        const paymentResponse = await makeRequest('POST', '/api/payment-cards/create-payment-intent', paymentData, authHeaders);
        if (paymentResponse.status === 200) {
          console.log('✅ Payment intent created successfully');
          console.log(`   Amount: $${paymentResponse.data.amount}`);
          console.log(`   Client Secret: ${paymentResponse.data.clientSecret?.substring(0, 20)}...`);
        } else {
          console.log('❌ Failed to create payment intent:', paymentResponse.data.message);
        }
      } catch (error) {
        console.log('❌ Create payment intent error:', error.message);
      }
    }

    // Test 7: Remove Payment Card
    if (testCardId) {
      console.log('\n7️⃣ Testing: DELETE /api/payment-cards/remove/:cardId');
      try {
        const removeResponse = await makeRequest('DELETE', `/api/payment-cards/remove/${testCardId}`, null, authHeaders);
        if (removeResponse.status === 200) {
          console.log('✅ Card removed successfully');
        } else {
          console.log('❌ Failed to remove card:', removeResponse.data.message);
        }
      } catch (error) {
        console.log('❌ Remove card error:', error.message);
      }
    }

    console.log('\n' + '=' * 50);
    console.log('🎉 API Testing Complete!');
    console.log('\n📋 API Endpoints Summary:');
    console.log('POST   /api/payment-cards/add                    ✅ Add new card');
    console.log('GET    /api/payment-cards/my-cards              ✅ Get user cards');
    console.log('PUT    /api/payment-cards/set-default/:cardId   ✅ Set default card');
    console.log('DELETE /api/payment-cards/remove/:cardId        ✅ Remove card');
    console.log('POST   /api/payment-cards/create-payment-intent ✅ Create payment');

  } catch (error) {
    console.error('\n💥 Unexpected error during testing:', error.message);
  }
}

// Run the tests
console.log('🚀 Starting Payment Cards API Test Suite...');
testPaymentCardsAPI();
