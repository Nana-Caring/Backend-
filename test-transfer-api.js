// Test script for Money Transfer API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let cardId = '';
let beneficiaryId = '';

async function testTransferAPI() {
  console.log('🧪 Testing Money Transfer API...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'funder@example.com', // Replace with actual funder email
      password: 'your_password_here' // Replace with actual password
    });

    authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`Token: ${authToken.substring(0, 50)}...\n`);

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get payment cards
    console.log('2️⃣ Getting payment cards...');
    const cardsResponse = await axios.get(`${BASE_URL}/api/payment-cards/my-cards`, { headers });
    
    if (cardsResponse.data.cards.length > 0) {
      cardId = cardsResponse.data.cards[0].id;
      console.log('✅ Found payment card');
      console.log(`Card: ${cardsResponse.data.cards[0].bankName} ${cardsResponse.data.cards[0].cardNumber}\n`);
    } else {
      console.log('⚠️  No payment cards found. Adding a test card...');
      
      const addCardResponse = await axios.post(`${BASE_URL}/api/payment-cards/add-test`, {
        bankName: 'Standard Bank',
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        ccv: '123',
        nickname: 'Test Transfer Card',
        isDefault: true
      }, { headers });

      cardId = addCardResponse.data.card.id;
      console.log('✅ Test card added for transfers\n');
    }

    // Step 3: Get beneficiaries
    console.log('3️⃣ Getting beneficiaries...');
    const beneficiariesResponse = await axios.get(`${BASE_URL}/api/transfers/beneficiaries`, { headers });
    
    if (beneficiariesResponse.data.beneficiaries.length > 0) {
      const beneficiary = beneficiariesResponse.data.beneficiaries[0];
      beneficiaryId = beneficiary.id;
      console.log('✅ Found beneficiaries');
      console.log(`Beneficiary: ${beneficiary.name} (${beneficiary.email})`);
      console.log(`Account: ${beneficiary.account?.accountNumber} - Balance: R${beneficiary.account?.balance}\n`);
    } else {
      console.log('⚠️  No beneficiaries found. You need to link beneficiaries first.');
      console.log('💡 Create a dependent user and link them to this funder.\n');
      return;
    }

    // Step 4: Get transfer info
    console.log('4️⃣ Getting transfer information...');
    const infoResponse = await axios.get(`${BASE_URL}/api/transfers/info`, { headers });
    console.log('✅ Transfer limits and fees:');
    console.log(`Min: R${infoResponse.data.limits.minimum}, Max: R${infoResponse.data.limits.maximum}`);
    console.log(`Fees: ${infoResponse.data.fees.stripeProcessingFee}\n`);

    // Step 5: Send money to beneficiary
    console.log('5️⃣ Sending money to beneficiary...');
    const transferData = {
      cardId: cardId,
      beneficiaryId: beneficiaryId,
      amount: 100.00,
      description: 'Test transfer - API testing'
    };

    console.log('Transfer details:');
    console.log(`Amount: R${transferData.amount}`);
    console.log(`Description: ${transferData.description}`);

    try {
      const transferResponse = await axios.post(`${BASE_URL}/api/transfers/send-to-beneficiary`, transferData, { headers });
      
      console.log('✅ Transfer successful!');
      console.log(`Transaction Ref: ${transferResponse.data.transfer.transactionRef}`);
      console.log(`From: ${transferResponse.data.transfer.fromCard.bankName} ${transferResponse.data.transfer.fromCard.cardNumber}`);
      console.log(`To: ${transferResponse.data.transfer.toBeneficiary.name}`);
      console.log(`New Balance: R${transferResponse.data.balanceUpdate.beneficiaryNewBalance}\n`);

      // Step 6: Check transfer history
      console.log('6️⃣ Checking transfer history...');
      const historyResponse = await axios.get(`${BASE_URL}/api/transfers/history`, { headers });
      
      console.log('✅ Transfer history retrieved');
      console.log(`Total transfers: ${historyResponse.data.pagination.totalTransfers}`);
      
      if (historyResponse.data.transfers.length > 0) {
        const lastTransfer = historyResponse.data.transfers[0];
        console.log(`Latest: ${lastTransfer.transactionRef} - R${lastTransfer.amount} to ${lastTransfer.beneficiary.name}\n`);
      }

      console.log('🎉 ALL TESTS PASSED! Money transfer API is working correctly! 🎉');

    } catch (transferError) {
      console.error('❌ Transfer failed:');
      console.error(transferError.response?.data || transferError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error.response?.data || error.message);
  }
}

// Helper function to check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/transfers/info`);
    return true;
  } catch (error) {
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the server with: npm start');
    return;
  }

  console.log('✅ Server is running. Starting tests...\n');
  await testTransferAPI();
}

runTests();
