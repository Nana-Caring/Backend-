#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com/api';

async function simulateCompleteDepositAndTransferFlow() {
  console.log('🎬 SIMULATING COMPLETE FUNDER DEPOSIT & TRANSFER FLOW');
  console.log('===================================================\n');

  try {
    let token, funderAccount, paymentIntentId;

    // Step 1: Login as funder
    console.log('1️⃣ Funder Login');
    console.log('---------------');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'funder@demo.com',
      password: 'Demo123!@#'
    });
    token = loginResponse.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful: John Smith');

    // Step 2: Check initial balance
    console.log('\n2️⃣ Initial Account Status');
    console.log('-------------------------');
    const initialBalance = await axios.get(`${BASE_URL}/funder/deposit/account`, { headers });
    console.log(`💰 Current Balance: ${initialBalance.data.data.balance}`);
    console.log(`🏦 Account Number: ${initialBalance.data.data.accountNumber}`);

    // Step 3: Create Stripe deposit intent
    console.log('\n3️⃣ Creating Stripe Payment Intent');
    console.log('----------------------------------');
    const depositIntent = await axios.post(`${BASE_URL}/funder/deposit/create-intent`, {
      amount: 15000, // R150.00 in cents
      currency: 'zar'
    }, { headers });
    
    paymentIntentId = depositIntent.data.data.paymentIntentId;
    console.log('✅ Stripe payment intent created');
    console.log(`💳 Payment Intent ID: ${paymentIntentId}`);
    console.log(`💰 Amount: R${depositIntent.data.data.amount / 100}`);
    console.log('🔗 Client Secret provided for frontend integration');

    // Step 4: Simulate manual balance addition for demo
    console.log('\n4️⃣ Demo: Manual Balance Addition');
    console.log('--------------------------------');
    console.log('💡 In production: Stripe processes payment → calls confirm endpoint');
    console.log('💡 For demo: We\'ll manually add R150 to test the transfer functionality');
    
    // Add balance manually to the database for demo
    const addBalanceResponse = await axios.post(`${BASE_URL}/funder/deposit/demo-add-balance`, {
      amount: 150.00,
      description: 'Demo deposit for testing'
    }, { headers });

    if (addBalanceResponse.data.success) {
      console.log('✅ Demo balance added successfully');
      console.log(`💰 New Balance: ZAR ${addBalanceResponse.data.data.newBalance.toFixed(2)}`);
    }

    // Step 5: Verify updated balance
    console.log('\n5️⃣ Confirming Updated Balance');
    console.log('-----------------------------');
    const updatedBalance = await axios.get(`${BASE_URL}/funder/deposit/account`, { headers });
    console.log(`💰 Updated Balance: ${updatedBalance.data.data.balance}`);
    console.log(`📊 Recent Transactions: ${updatedBalance.data.data.transactions.length}`);

    // Step 6: Get beneficiaries
    console.log('\n6️⃣ Loading Beneficiaries');
    console.log('------------------------');
    const beneficiaries = await axios.get(`${BASE_URL}/funder/get-beneficiaries`, { headers });
    const beneficiary = beneficiaries.data.beneficiaries[0];
    console.log(`👤 Beneficiary: ${beneficiary.name}`);
    console.log(`💳 Available Accounts: ${beneficiary.Accounts.length}`);

    // Step 7: Perform transfer
    console.log('\n7️⃣ Transferring Funds to Beneficiary');
    console.log('------------------------------------');
    const targetAccount = beneficiary.Accounts.find(acc => acc.accountType === 'Education');
    const transferAmount = 50.00;

    const transferResponse = await axios.post(`${BASE_URL}/funder/transfer`, {
      beneficiaryId: beneficiary.id,
      targetAccountId: targetAccount.id,
      amount: transferAmount,
      description: 'Monthly education allowance'
    }, { headers });

    if (transferResponse.data.success) {
      console.log('✅ Transfer completed successfully!');
      console.log(`🔄 Reference: ${transferResponse.data.data.transferReference}`);
      console.log(`💰 Amount Transferred: ZAR ${transferResponse.data.data.amount}`);
      console.log(`🏦 From: Funder Main Account`);
      console.log(`📚 To: ${transferResponse.data.data.beneficiary.accountType} Account`);
      console.log(`💳 Funder New Balance: ZAR ${transferResponse.data.data.funder.newBalance}`);
      console.log(`💳 Beneficiary New Balance: ZAR ${transferResponse.data.data.beneficiary.newBalance}`);
    }

    // Step 8: Check final balances
    console.log('\n8️⃣ Final Account Status');
    console.log('-----------------------');
    const finalBalance = await axios.get(`${BASE_URL}/funder/deposit/account`, { headers });
    console.log(`💰 Funder Final Balance: ${finalBalance.data.data.balance}`);
    
    const updatedBeneficiaries = await axios.get(`${BASE_URL}/funder/get-beneficiaries`, { headers });
    const updatedBeneficiary = updatedBeneficiaries.data.beneficiaries[0];
    const updatedEducationAccount = updatedBeneficiary.Accounts.find(acc => acc.accountType === 'Education');
    console.log(`📚 Education Account Balance: ${updatedEducationAccount.balance}`);

    // Step 9: View transaction history
    console.log('\n9️⃣ Transaction History');
    console.log('----------------------');
    const history = await axios.get(`${BASE_URL}/funder/transfer/history`, { headers });
    console.log(`📜 Total Transactions: ${history.data.data.transfers.length}`);
    
    if (history.data.data.transfers.length > 0) {
      console.log('📋 Recent Transactions:');
      history.data.data.transfers.slice(0, 3).forEach(tx => {
        console.log(`   • ${tx.type}: ZAR ${Math.abs(tx.amount)} - ${tx.description}`);
      });
    }

    console.log('\n🎉 COMPLETE FLOW SIMULATION SUCCESSFUL!');
    console.log('\n📋 Production Integration Steps:');
    console.log('1. Frontend creates Stripe payment intent via: POST /api/funder/deposit/create-intent');
    console.log('2. Frontend handles Stripe payment confirmation');
    console.log('3. Frontend calls: POST /api/funder/deposit/confirm with paymentIntentId');
    console.log('4. Backend updates account balance and creates transaction record');
    console.log('5. Funder can transfer funds to beneficiaries via: POST /api/funder/transfer');
    
  } catch (error) {
    console.error('\n❌ Flow simulation failed:', error.response?.data?.message || error.message);
    if (error.response?.status === 404 && error.config.url.includes('demo-add-balance')) {
      console.log('\n💡 Demo endpoint not available - this is expected in production');
      console.log('💡 Use Stripe payment confirmation instead');
    }
  }
}

simulateCompleteDepositAndTransferFlow();
