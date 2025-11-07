#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'https://nanacaring-backend.onrender.com/api';

async function debugTransferIssue() {
  console.log('🔍 DEBUGGING FUNDER TRANSFER ISSUE');
  console.log('==================================\n');

  try {
    // Login as funder
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'funder@demo.com',
      password: 'Demo123!@#'
    });

    const token = loginResponse.data.accessToken || loginResponse.data.jwt;
    const headers = { Authorization: `Bearer ${token}` };

    // Get beneficiaries
    const beneficiariesResponse = await axios.get(`${BASE_URL}/funder/get-beneficiaries`, { headers });
    const beneficiary = beneficiariesResponse.data.beneficiaries[0];
    const account = beneficiary.Accounts[0];

    console.log('🎯 Test Data:');
    console.log('   Beneficiary ID:', beneficiary.id, typeof beneficiary.id);
    console.log('   Account Number:', account.accountNumber, typeof account.accountNumber);
    console.log('   Test Amount: 10', typeof 10);
    console.log('   Description: "Test transfer"', typeof "Test transfer");
    console.log('');

    // Test the exact payload
    const testPayload = {
      beneficiaryId: beneficiary.id,
      accountNumber: account.accountNumber,
      amount: 10,
      description: 'Test transfer'
    };

    console.log('📤 Request Payload:');
    console.log(JSON.stringify(testPayload, null, 2));
    console.log('');

    try {
      const transferResponse = await axios.post(`${BASE_URL}/funder/transfer`, testPayload, { 
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Transfer successful!');
      console.log('Response:', JSON.stringify(transferResponse.data, null, 2));

    } catch (error) {
      console.log('❌ Transfer failed with detailed error:');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Request Headers:', JSON.stringify(error.config?.headers, null, 2));
      console.log('Request Data:', error.config?.data);
    }

  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

debugTransferIssue();