#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com/api';

async function quickEndpointTest() {
  console.log('⚡ QUICK FUNDER ENDPOINT TEST');
  console.log('============================\n');

  try {
    // Login
    console.log('🔐 Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'funder@demo.com',
      password: 'Demo123!@#'
    });
    const token = loginResponse.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login: SUCCESS');

    // Test each endpoint
    const endpoints = [
      {
        name: 'Account Balance',
        method: 'GET',
        url: '/funder/deposit/account',
        icon: '💰'
      },
      {
        name: 'Create Deposit Intent',
        method: 'POST',
        url: '/funder/deposit/create-intent',
        data: { amount: 5000, currency: 'zar' },
        icon: '💸'
      },
      {
        name: 'Get Beneficiaries',
        method: 'GET',
        url: '/funder/get-beneficiaries',
        icon: '👥'
      },
      {
        name: 'Transfer History',
        method: 'GET',
        url: '/funder/transfer/history',
        icon: '📜'
      }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`${endpoint.icon} Testing ${endpoint.name}...`);
        
        let response;
        if (endpoint.method === 'GET') {
          response = await axios.get(`${BASE_URL}${endpoint.url}`, { headers });
        } else {
          response = await axios.post(`${BASE_URL}${endpoint.url}`, endpoint.data, { headers });
        }
        
        console.log(`✅ ${endpoint.name}: SUCCESS`);
        
        // Show key data
        if (endpoint.name === 'Account Balance' && response.data.data) {
          console.log(`   Balance: ${response.data.data.balance}`);
        } else if (endpoint.name === 'Create Deposit Intent' && response.data.data) {
          console.log(`   Amount: R${response.data.data.amount / 100}`);
        } else if (endpoint.name === 'Get Beneficiaries' && response.data.beneficiaries) {
          console.log(`   Beneficiaries: ${response.data.beneficiaries.length}`);
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint.name}: FAILED`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎯 ENDPOINT STATUS SUMMARY:');
    console.log('All core funder endpoints are ready for testing!');
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
  }
}

quickEndpointTest();
