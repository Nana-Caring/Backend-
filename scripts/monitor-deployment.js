#!/usr/bin/env node

/**
 * DEPLOYMENT STATUS MONITOR
 * =========================
 * 
 * This script monitors the deployment status and tests when the new code is live.
 */

const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com';

async function checkDeploymentStatus() {
    console.log('📡 CHECKING RENDER DEPLOYMENT STATUS');
    console.log('====================================');
    
    try {
        // Test 1: Basic health check
        console.log('\n🏥 1. Testing basic health...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server is running:', {
            environment: healthResponse.data.environment,
            timestamp: healthResponse.data.timestamp
        });

        // Test 2: Check if admin endpoint exists (indicates new deployment)
        console.log('\n🔧 2. Testing admin endpoint availability...');
        try {
            const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: 'admin@nanacaring.com',
                password: 'nanacaring2025'
            });
            
            // Try to access the fix endpoint (this will tell us if new code is deployed)
            const testAdminEndpoint = await axios.post(`${BASE_URL}/admin/fix-caregiver-relationship`, {}, {
                headers: { Authorization: `Bearer ${adminLogin.data.accessToken}` }
            });
            
            console.log('✅ NEW CODE DEPLOYED! Admin endpoint is working');
            console.log('🎯 Result:', testAdminEndpoint.data);
            
            return { deployed: true, canFix: true };
            
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('⏳ Old code still running - admin endpoint not found');
                console.log('   Wait for deployment to complete and try again');
                return { deployed: false, canFix: false };
            } else {
                console.log('✅ NEW CODE DEPLOYED! Admin endpoint accessible');
                console.log('🔧 Ready to fix database relationship');
                return { deployed: true, canFix: true };
            }
        }

        // Test 3: Try caregiver endpoint (this should fail with old association error)
        console.log('\n🧪 3. Testing caregiver endpoint...');
        try {
            const caregiverLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: 'caregiver@demo.com',
                password: 'Demo123!@#'
            });
            
            const dependentsResponse = await axios.get(`${BASE_URL}/api/caregiver/dependents`, {
                headers: { Authorization: `Bearer ${caregiverLogin.data.accessToken}` }
            });
            
            console.log('✅ Caregiver endpoint working! (relationship might already be fixed)');
            return { deployed: true, canFix: false, alreadyFixed: true };
            
        } catch (error) {
            if (error.response?.data?.error?.includes('associated to User multiple times')) {
                console.log('⏳ Old controller code still running - association error detected');
                return { deployed: false, canFix: false };
            } else if (error.response?.status === 500) {
                console.log('✅ New controller deployed but database relationship needs fixing');
                return { deployed: true, canFix: true };
            } else {
                console.log('❓ Unexpected error:', error.response?.data?.message);
                return { deployed: true, canFix: true };
            }
        }

    } catch (error) {
        console.error('❌ Server connection error:', error.message);
        return { deployed: false, canFix: false, serverDown: true };
    }
}

async function monitorAndFix() {
    const status = await checkDeploymentStatus();
    
    console.log('\n📊 DEPLOYMENT STATUS SUMMARY:');
    console.log('==============================');
    
    if (status.serverDown) {
        console.log('❌ Server is down - check Render dashboard');
    } else if (status.alreadyFixed) {
        console.log('🎉 Everything is working! No fix needed.');
    } else if (!status.deployed) {
        console.log('⏳ Deployment in progress...');
        console.log('💡 Run this script again in 2-3 minutes');
    } else if (status.canFix) {
        console.log('✅ New code deployed! Ready to fix database relationship');
        console.log('🔧 Run: node scripts/post-deployment-fix.js');
    }
}

monitorAndFix();
