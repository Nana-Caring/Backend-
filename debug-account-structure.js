#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugAccountStructure() {
  console.log('🔍 DEBUGGING ACCOUNT STRUCTURE FOR AUTO-DISTRIBUTION');
  console.log('==================================================\n');

  try {
    // Login and get beneficiary details
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'funder@demo.com',
      password: 'Demo123!@#'
    });

    const token = loginResponse.data.accessToken || loginResponse.data.jwt;
    const headers = { Authorization: `Bearer ${token}` };

    const beneficiariesResponse = await axios.get(`${BASE_URL}/funder/get-beneficiaries`, { headers });
    const beneficiary = beneficiariesResponse.data.beneficiaries[0];

    console.log('👤 Beneficiary:', beneficiary.name || `${beneficiary.firstName} ${beneficiary.surname}`);
    console.log('🆔 Beneficiary ID:', beneficiary.id);
    console.log('\n📊 Account Analysis:');
    
    beneficiary.Accounts.forEach((account, index) => {
      console.log(`\n   Account ${index + 1}:`);
      console.log(`     Type: ${account.accountType}`);
      console.log(`     Number: ${account.accountNumber}`);
      console.log(`     Balance: ${account.balance}`);
      console.log(`     Is Main: ${account.isMainAccount || 'undefined'}`);
      console.log(`     Category: ${account.category || 'undefined'}`);
      
      // Check if this looks like main account
      if (account.accountType === 'Main' || account.accountType?.toLowerCase() === 'main') {
        console.log('     ⭐ This appears to be the Main Account');
      }
      
      // Check for category accounts
      const categoryTypes = ['Healthcare', 'Education', 'Groceries', 'Transport', 'Entertainment', 'Other'];
      if (categoryTypes.includes(account.accountType)) {
        console.log('     🏷️ This appears to be a Category Account');
      }
    });

    // Check what the distribution logic is looking for
    console.log('\n🔍 Distribution Logic Requirements:');
    console.log('   Looking for: isMainAccount === true AND accountType === "Main"');
    console.log('   Category accounts: isMainAccount === false AND category !== null');

    const mainAccounts = beneficiary.Accounts.filter(acc => 
      acc.accountType === 'Main' || acc.isMainAccount === true
    );
    const categoryAccounts = beneficiary.Accounts.filter(acc => 
      acc.category !== null && acc.category !== undefined
    );

    console.log(`\n📈 Found ${mainAccounts.length} main account(s)`);
    console.log(`📈 Found ${categoryAccounts.length} category account(s)`);

    if (mainAccounts.length === 0) {
      console.log('\n⚠️ ISSUE: No main account found with isMainAccount=true');
      console.log('   This explains why auto-distribution is not working');
    }

    if (categoryAccounts.length === 0) {
      console.log('\n⚠️ ISSUE: No category accounts found with category field set');
      console.log('   Auto-distribution needs category accounts to work');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAccountStructure();