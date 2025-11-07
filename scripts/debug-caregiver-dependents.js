#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com/api';

async function debugCaregiverDependents() {
    try {
        console.log('🔍 DEBUGGING CAREGIVER-DEPENDENT RELATIONSHIP');
        console.log('==============================================');
        
        // Step 1: Login as caregiver
        console.log('\n🔐 1. Logging in as caregiver...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'caregiver@demo.com',
            password: 'Demo123!@#'
        });

        const caregiverToken = loginResponse.data.accessToken;
        const caregiverUser = loginResponse.data.user;
        
        console.log('✅ Caregiver login successful:', {
            id: caregiverUser.id,
            email: caregiverUser.email,
            role: caregiverUser.role,
            name: `${caregiverUser.firstName} ${caregiverUser.surname}`
        });

        // Step 2: Try to fetch dependents
        console.log('\n📊 2. Fetching caregiver dependents...');
        try {
            const dependentsResponse = await axios.get(`${BASE_URL}/caregiver/dependents`, {
                headers: { Authorization: `Bearer ${caregiverToken}` }
            });
            
            console.log('✅ Dependents found:', {
                count: dependentsResponse.data.data?.length || 0,
                dependents: dependentsResponse.data.data || []
            });
            
            if (dependentsResponse.data.data && dependentsResponse.data.data.length > 0) {
                dependentsResponse.data.data.forEach((dep, index) => {
                    console.log(`   Dependent ${index + 1}:`, {
                        id: dep.id,
                        name: `${dep.firstName} ${dep.surname}`,
                        email: dep.email,
                        role: dep.role
                    });
                });
            }
            
        } catch (error) {
            console.error('❌ Error fetching dependents:', {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                error: error.response?.data?.error,
                details: error.response?.data
            });
        }

        // Step 3: Login as dependent to check their data
        console.log('\n🔐 3. Logging in as dependent to check relationship...');
        const depLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'dependent@demo.com',
            password: 'Demo123!@#'
        });

        const dependentUser = depLoginResponse.data.user;
        console.log('✅ Dependent login successful:', {
            id: dependentUser.id,
            email: dependentUser.email,
            role: dependentUser.role,
            name: `${dependentUser.firstName} ${dependentUser.surname}`
        });

        // Step 4: Check dependent's accounts to see caregiver relationship
        console.log('\n📊 4. Checking dependent accounts for caregiver relationship...');
        const accountsResponse = await axios.get(`${BASE_URL}/accounts/dependent/my-accounts`, {
            headers: { Authorization: `Bearer ${depLoginResponse.data.accessToken}` }
        });

        console.log('✅ Dependent accounts:', {
            accountsCount: accountsResponse.data.accountsCount,
            accounts: accountsResponse.data.accounts?.map(acc => ({
                id: acc.id,
                type: acc.accountType,
                caregiverId: acc.caregiverId || 'Not set'
            }))
        });

        // Step 5: Recommendations
        console.log('\n💡 DIAGNOSTIC RESULTS:');
        console.log('======================');
        
        const hasAccounts = accountsResponse.data.accounts && accountsResponse.data.accounts.length > 0;
        const hasCaregiver = hasAccounts && accountsResponse.data.accounts.some(acc => acc.caregiverId === caregiverUser.id);
        
        if (!hasAccounts) {
            console.log('❌ Issue: Dependent has no accounts');
            console.log('   Solution: Accounts should be created when dependent is registered');
        } else if (!hasCaregiver) {
            console.log('❌ Issue: Dependent accounts are not linked to caregiver');
            console.log(`   Expected caregiverId: ${caregiverUser.id}`);
            console.log('   Actual caregiverIds:', accountsResponse.data.accounts.map(acc => acc.caregiverId));
            console.log('   Solution: Update accounts to link them to the caregiver');
        } else {
            console.log('✅ Relationship appears correct in database');
            console.log('❌ Issue might be in the controller logic');
        }

    } catch (error) {
        console.error('❌ Diagnostic error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
    }
}

debugCaregiverDependents();
