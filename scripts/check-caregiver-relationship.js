#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com/api';

async function checkAndFixCaregiverRelationship() {
    try {
        console.log('🔍 CHECKING AND FIXING CAREGIVER-DEPENDENT RELATIONSHIP');
        console.log('=======================================================');
        
        // Step 1: Get user IDs
        console.log('\n🔐 1. Getting user IDs...');
        
        const caregiverLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'caregiver@demo.com',
            password: 'Demo123!@#'
        });
        const caregiverId = caregiverLogin.data.user.id;
        console.log(`✅ Caregiver ID: ${caregiverId}`);

        const dependentLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'dependent@demo.com',
            password: 'Demo123!@#'
        });
        const dependentId = dependentLogin.data.user.id;
        console.log(`✅ Dependent ID: ${dependentId}`);

        // Step 2: Check dependent's accounts
        console.log('\n📊 2. Checking dependent accounts...');
        const accountsResponse = await axios.get(`${BASE_URL}/accounts/dependent/my-accounts`, {
            headers: { Authorization: `Bearer ${dependentLogin.data.accessToken}` }
        });

        console.log('✅ Account response structure:', {
            keys: Object.keys(accountsResponse.data),
            accountsCount: accountsResponse.data.accountsCount
        });

        // Check if accounts have caregiverId
        if (accountsResponse.data.allAccounts && accountsResponse.data.allAccounts.length > 0) {
            const firstAccount = accountsResponse.data.allAccounts[0];
            console.log('📋 First account details:', {
                id: firstAccount.id,
                accountType: firstAccount.accountType,
                userId: firstAccount.userId,
                caregiverId: firstAccount.caregiverId || 'NOT SET',
                balance: firstAccount.balance
            });

            // Check if caregiver relationship is missing
            if (!firstAccount.caregiverId) {
                console.log('\n❌ ISSUE FOUND: Accounts do not have caregiverId set!');
                console.log('💡 SOLUTION: Need to update accounts to link them to caregiver');
                
                console.log('\n🔧 To fix this, run this SQL in your database:');
                console.log(`UPDATE "Accounts" SET "caregiverId" = ${caregiverId} WHERE "userId" = ${dependentId};`);
            } else if (firstAccount.caregiverId === caregiverId) {
                console.log('✅ Accounts are correctly linked to caregiver');
            } else {
                console.log(`❌ Accounts are linked to wrong caregiver: ${firstAccount.caregiverId} (expected: ${caregiverId})`);
            }
        } else {
            console.log('❌ No accounts found for dependent');
        }

        // Step 3: Test the fixed caregiver endpoint (if running locally)
        console.log('\n🧪 3. Testing caregiver dependents endpoint...');
        try {
            const dependentsResponse = await axios.get(`${BASE_URL}/caregiver/dependents`, {
                headers: { Authorization: `Bearer ${caregiverLogin.data.accessToken}` }
            });
            
            console.log('✅ Dependents endpoint working:', {
                dependentsCount: dependentsResponse.data.data?.dependents?.length || 0
            });
            
        } catch (error) {
            console.log('❌ Dependents endpoint still failing:', {
                status: error.response?.status,
                message: error.response?.data?.message
            });
        }

    } catch (error) {
        console.error('❌ Script error:', {
            message: error.message,
            response: error.response?.data
        });
    }
}

checkAndFixCaregiverRelationship();
