// Test script for user profile endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const testConfig = {
    // You'll need to provide a valid token for testing
    authToken: 'Bearer YOUR_JWT_TOKEN_HERE',
    baseURL: BASE_URL
};

async function testProfileEndpoints() {
    console.log('🧪 Testing User Profile Endpoints...\n');

    const headers = {
        'Authorization': testConfig.authToken,
        'Content-Type': 'application/json'
    };

    try {
        // Test 1: Get user profile
        console.log('1️⃣ Testing GET /api/users/profile');
        try {
            const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, { headers });
            console.log('   ✅ Profile endpoint working');
            console.log('   📄 Response:', profileResponse.status, profileResponse.statusText);
            console.log('   👤 User:', profileResponse.data.user?.firstName || 'Unknown');
        } catch (error) {
            console.log('   ❌ Profile endpoint failed:', error.response?.status, error.response?.data?.message);
        }

        console.log();

        // Test 2: Get profile completion status
        console.log('2️⃣ Testing GET /api/users/profile/completion');
        try {
            const completionResponse = await axios.get(`${BASE_URL}/api/users/profile/completion`, { headers });
            console.log('   ✅ Profile completion endpoint working');
            console.log('   📄 Response:', completionResponse.status, completionResponse.statusText);
            console.log('   📊 Completion:', completionResponse.data.completionPercentage + '%');
        } catch (error) {
            console.log('   ❌ Profile completion endpoint failed:', error.response?.status, error.response?.data?.message);
        }

        console.log();

        // Test 3: Update profile (optional test data)
        console.log('3️⃣ Testing PUT /api/users/profile (with test data)');
        try {
            const updateData = {
                phoneNumber: '+27123456789',
                postalCity: 'Cape Town'
            };
            const updateResponse = await axios.put(`${BASE_URL}/api/users/profile`, updateData, { headers });
            console.log('   ✅ Profile update endpoint working');
            console.log('   📄 Response:', updateResponse.status, updateResponse.statusText);
        } catch (error) {
            console.log('   ❌ Profile update endpoint failed:', error.response?.status, error.response?.data?.message);
        }

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Instructions for running the test
console.log('📋 User Profile Endpoint Test Suite');
console.log('=====================================');
console.log();
console.log('Before running this test:');
console.log('1. Make sure your server is running on port 5000');
console.log('2. Get a valid JWT token by logging in via /api/auth/login');
console.log('3. Replace YOUR_JWT_TOKEN_HERE in this file with your actual token');
console.log('4. Run: node test-profile-endpoints.js');
console.log();

// Only run tests if token is provided
if (testConfig.authToken.includes('YOUR_JWT_TOKEN_HERE')) {
    console.log('⚠️  Please provide a valid JWT token before running tests');
    console.log('💡 Tip: Login first and copy the token from the response');
} else {
    testProfileEndpoints();
}
