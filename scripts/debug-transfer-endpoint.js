#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com/api';

async function debugTransferEndpoint() {
  console.log('🔧 DEBUGGING TRANSFER ENDPOINT');
  console.log('==============================\n');

  try {
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'funder@demo.com',
      password: 'Demo123!@#'
    });

    const token = loginResponse.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Funder login successful');

    // Get beneficiaries
    const beneficiariesResponse = await axios.get(`${BASE_URL}/funder/get-beneficiaries`, { headers });
    const beneficiary = beneficiariesResponse.data.beneficiaries[0];
    const targetAccount = beneficiary.Accounts[0];
    
    console.log('✅ Beneficiary info:');
    console.log('   ID:', beneficiary.id);
    console.log('   Name:', beneficiary.firstName, beneficiary.surname);
    console.log('   Target Account ID:', targetAccount.id);
    console.log('   Target Account Type:', targetAccount.accountType);

    // Test simple transfer
    console.log('\n🔄 Testing simple transfer...');
    try {
      const transferResponse = await axios.post(`${BASE_URL}/funder/transfer`, {
        beneficiaryId: beneficiary.id,
        targetAccountId: targetAccount.id,
        amount: 10.00,
        description: 'Debug test transfer'
      }, { headers });

      console.log('✅ Transfer successful!');
      console.log('Response:', JSON.stringify(transferResponse.data, null, 2));

    } catch (error) {
      console.log('❌ Transfer failed');
      console.log('Status:', error.response?.status);
      console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.data?.error) {
        console.log('\n🔍 Detailed Error Analysis:');
        const errorMsg = error.response.data.error;
        
        if (errorMsg.includes('column') && errorMsg.includes('does not exist')) {
          console.log('   💡 Database column missing - migration needed');
        } else if (errorMsg.includes('enum')) {
          console.log('   💡 Enum value issue - model mismatch');
        } else if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
          console.log('   💡 Database relationship issue');
        } else {
          console.log('   💡 Unknown database error');
        }
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugTransferEndpoint();
