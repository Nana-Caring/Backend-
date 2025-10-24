#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com/api';

async function debugFunderAccountEndpoint() {
  console.log('🔧 DEBUGGING FUNDER ACCOUNT ENDPOINT');
  console.log('====================================\n');

  try {
    // Step 1: Login as funder
    console.log('1️⃣ Logging in as funder...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'funder@demo.com',
      password: 'Demo123!@#'
    });

    const token = loginResponse.data.accessToken || loginResponse.data.jwt;
    console.log('✅ Funder login successful');

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Debug account endpoint
    console.log('\n2️⃣ Testing funder account endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/funder/deposit/account`, { headers });
      console.log('✅ Account endpoint success!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Account endpoint failed');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 404) {
        console.log('\n💡 Route might not be deployed yet or path is incorrect');
      } else if (error.response?.status === 500) {
        console.log('\n💡 Server error - might be database migration issue');
      }
    }

    // Step 3: Test transfer history endpoint
    console.log('\n3️⃣ Testing transfer history endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/funder/transfer/history`, { headers });
      console.log('✅ Transfer history endpoint success!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Transfer history endpoint failed');
      console.log('Status:', error.response?.status);
      console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
  }
}

debugFunderAccountEndpoint();
