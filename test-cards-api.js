// Comprehensive Payment Cards API Test Script
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

// Test functions
async function testLogin() {
  console.log('🔐 Step 1: Testing login...');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login successful');
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

async function testAddCards() {
  console.log('\\n💳 Step 2: Testing add payment cards...');
  
  for (let i = 0; i < TEST_CARDS.length; i++) {
    const card = TEST_CARDS[i];
    console.log(`   Adding ${card.bankName} card...`);
    
    try {
      const response = await makeRequest(
        'POST', 
        '/api/payment-cards/add', 
        card,
        { 'Authorization': `Bearer ${authToken}` }
      );
      
      if (response.status === 201) {
        console.log(`   ✅ ${card.bankName} card added successfully`);
        addedCards.push(response.data.card);
      } else {
        console.log(`   ❌ Failed to add ${card.bankName} card:`, response.data);
      }
    } catch (error) {
      console.log(`   ❌ Error adding ${card.bankName} card:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function testGetAllCards() {
  console.log('\\n📋 Step 3: Testing get all payment cards...');
  
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
        console.log(`   ${index + 1}. ${card.bankName} - ${card.cardNumber}`);
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

async function runAllTests() {
  console.log('🧪 COMPREHENSIVE PAYMENT CARDS API TEST');
  console.log('=======================================\\n');
  
  console.log('📋 Test Cards Available:');
  TEST_CARDS.forEach((card, index) => {
    console.log(`   ${index + 1}. ${card.bankName} - ${card.nickname}`);
  });
  
  console.log(`\\n🎯 Testing API at: ${API_BASE}`);
  console.log(`👤 Test user: ${TEST_USER.email}\\n`);
  
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\\n❌ Cannot proceed without authentication');
    return;
  }
  
  await testAddCards();
  await testGetAllCards();
  
  console.log('\\n🎉 Test completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { TEST_CARDS, runAllTests };
