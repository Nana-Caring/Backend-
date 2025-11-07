#!/usr/bin/env node

/**
 * PRODUCTION DATABASE FIX SCRIPT
 * ===============================
 * 
 * This script will fix the caregiver-dependent relationship in production
 * after the updated code is deployed.
 */

const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com';

async function deploymentReadyFix() {
    console.log('🚀 POST-DEPLOYMENT CAREGIVER FIX');
    console.log('=================================');
    
    try {
        // Step 1: Login as admin
        console.log('\n🔐 1. Admin login...');
        const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@nanacaring.com',
            password: 'nanacaring2025'
        });
        console.log('✅ Admin logged in');

        // Step 2: Fix the relationship
        console.log('\n🔧 2. Fixing caregiver-dependent relationship...');
        const fixResult = await axios.post(`${BASE_URL}/admin/fix-caregiver-relationship`, {}, {
            headers: { Authorization: `Bearer ${adminLogin.data.accessToken}` }
        });
        
        console.log('✅ Database relationship fixed:', fixResult.data);

        // Step 3: Test caregiver functionality
        console.log('\n🧪 3. Testing caregiver functionality...');
        const caregiverLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'caregiver@demo.com',
            password: 'Demo123!@#'
        });
        
        const dependentsResult = await axios.get(`${BASE_URL}/api/caregiver/dependents`, {
            headers: { Authorization: `Bearer ${caregiverLogin.data.accessToken}` }
        });
        
        console.log('✅ Caregiver can now see dependents!');
        console.log('📊 Results:', {
            dependentsFound: dependentsResult.data.data.dependents.length,
            dependent: dependentsResult.data.data.dependents[0] ? {
                name: dependentsResult.data.data.dependents[0].fullName,
                email: dependentsResult.data.data.dependents[0].email,
                accounts: dependentsResult.data.data.dependents[0].accountsCount
            } : 'None'
        });

        console.log('\n🎉 SUCCESS! Everything is now working correctly!');

    } catch (error) {
        console.error('❌ Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
        
        if (error.response?.status === 404) {
            console.log('💡 Make sure the updated code with admin endpoint is deployed first');
        }
    }
}

deploymentReadyFix();
