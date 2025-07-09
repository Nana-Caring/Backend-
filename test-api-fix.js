// Test the payment cards API with the validation fix
const https = require('https');
const http = require('http');

// Your JWT token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwicm9sZSI6ImZ1bmRlciIsImlhdCI6MTc1MjA5MjI0OX0.w67gSkENeZZw_YbIp9mZLT5V01LgKLIQ9t8p4O5KoHQ';

async function testAddCard() {
  const cardData = {
    bankName: "Standard Bank",
    cardNumber: "4111111111111111",
    expiryDate: "12/25",
    ccv: "123",
    nickname: "My Test Visa Card",
    isDefault: true
  };

  const postData = JSON.stringify(cardData);

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/payment-cards/add-test',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', JSON.parse(data));
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testGetCards() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/payment-cards/my-cards',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('\n--- GET CARDS ---');
        console.log('Status:', res.statusCode);
        console.log('Response:', JSON.parse(data));
        resolve(data);
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Payment Cards API...\n');
  
  try {
    console.log('--- ADD CARD TEST ---');
    await testAddCard();
    
    await testGetCards();
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests();
