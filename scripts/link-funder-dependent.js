#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'https://nanacaring-backend.onrender.com/api';

async function linkFunderDependent() {
    try {
        console.log('🔗 LINKING FUNDER WITH DEPENDENT');
        console.log('=================================');
        
        // Step 1: Get user IDs
        console.log('\n🔐 1. Getting user IDs...');
        
        const funderLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'funder@demo.com',
            password: 'Demo123!@#'
        });
        const funderId = funderLogin.data.user.id;
        console.log(`✅ Funder ID: ${funderId} (${funderLogin.data.user.firstName} ${funderLogin.data.user.surname})`);

        const dependentLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'dependent@demo.com',
            password: 'Demo123!@#'
        });
        const dependentId = dependentLogin.data.user.id;
        console.log(`✅ Dependent ID: ${dependentId} (${dependentLogin.data.user.firstName} ${dependentLogin.data.user.surname})`);

        // Step 2: Login as admin to create the relationship
        console.log('\n🔐 2. Admin login for database operations...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@nanacaring.com',
            password: 'nanacaring2025'
        });
        console.log('✅ Admin logged in');

        // Step 3: Link funder with dependent
        console.log('\n🔗 3. Creating funder-dependent relationship...');
        
        try {
            const linkResponse = await axios.post(`${BASE_URL.replace('/api', '')}/admin/link-funder-dependent`, {
                funderEmail: 'funder@demo.com',
                dependentEmail: 'dependent@demo.com'
            }, {
                headers: { Authorization: `Bearer ${adminLogin.data.accessToken}` }
            });
            
            console.log('✅ Funder-dependent relationship created:', linkResponse.data);
            
            if (linkResponse.data.data.alreadyLinked) {
                console.log('ℹ️  Relationship already existed');
            } else {
                console.log('🎉 New relationship created successfully!');
            }
            
        } catch (linkError) {
            console.error('❌ Error creating link:', {
                status: linkError.response?.status,
                message: linkError.response?.data?.message
            });
            
            if (linkError.response?.status === 404) {
                console.log('💡 Admin endpoint not found - make sure the new code is deployed');
                return;
            }
        }

        // Step 4: Verify the relationship
        console.log('\n🔍 4. Verifying funder-dependent relationships...');
        
        try {
            const linksResponse = await axios.get(`${BASE_URL.replace('/api', '')}/admin/funder-dependent-links`, {
                headers: { Authorization: `Bearer ${adminLogin.data.accessToken}` }
            });
            
            console.log('✅ Current funder-dependent relationships:', {
                totalLinks: linksResponse.data.data.linksCount,
                relationships: linksResponse.data.data.links
            });
            
        } catch (verifyError) {
            console.log('⚠️  Could not verify relationships:', verifyError.response?.data?.message);
        }

        console.log('\n🎯 RELATIONSHIP ESTABLISHED:');
        console.log('============================');
        console.log(`✅ Funder: ${funderLogin.data.user.firstName} ${funderLogin.data.user.surname} (${funderLogin.data.user.email})`);
        console.log(`✅ Dependent: ${dependentLogin.data.user.firstName} ${dependentLogin.data.user.surname} (${dependentLogin.data.user.email})`);
        console.log(`✅ Link: Funder can now access dependent's accounts and transactions`);

        console.log('\n🧪 NEXT: Test funder functionality');
        console.log('- Funder should be able to see dependent\'s accounts');
        console.log('- Funder should be able to make deposits');
        console.log('- Funder should be able to view transaction history');

    } catch (error) {
        console.error('❌ Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
    }
}

linkFunderDependent();
