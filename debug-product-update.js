const axios = require('axios');

// Product Update Test Script
// This script helps debug ASP.NET frontend issues by testing the backend directly

const BASE_URL = 'https://nanacaring-backend.onrender.com';

// Test credentials (use actual admin credentials)
const ADMIN_CREDENTIALS = {
    email: 'admin@nanacaring.com', // Replace with actual admin email
    password: 'admin2025' // Replace with actual admin password
};

// High Court credentials (alternative)
const HIGHCOURT_CREDENTIALS = {
    email: 'highcourt@nanacaring.com',
    password: 'highcourt2025'
};

async function getAdminToken() {
    try {
        console.log('🔐 Getting admin token...');
        
        const response = await axios.post(`${BASE_URL}/api/auth/admin-login`, ADMIN_CREDENTIALS);
        
        if (response.data.accessToken || response.data.jwt) {
            const token = response.data.accessToken || response.data.jwt;
            console.log('✅ Admin token obtained successfully');
            return token;
        } else {
            throw new Error('No token in response');
        }
    } catch (error) {
        console.log('❌ Admin login failed, trying High Court credentials...');
        
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/admin-login`, HIGHCOURT_CREDENTIALS);
            const token = response.data.accessToken || response.data.jwt;
            console.log('✅ High Court token obtained successfully');
            return token;
        } catch (hcError) {
            console.error('❌ Both admin and High Court login failed:');
            console.error('Admin error:', error.response?.data || error.message);
            console.error('High Court error:', hcError.response?.data || hcError.message);
            throw new Error('Failed to authenticate');
        }
    }
}

async function getFirstProduct(token) {
    try {
        console.log('📦 Getting first product for testing...');
        
        const response = await axios.get(`${BASE_URL}/admin/products?limit=1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.data && response.data.data.length > 0) {
            const product = response.data.data[0];
            console.log(`✅ Found product: ${product.name} (ID: ${product.id})`);
            return product;
        } else {
            throw new Error('No products found');
        }
    } catch (error) {
        console.error('❌ Failed to get products:', error.response?.data || error.message);
        throw error;
    }
}

async function testProductUpdate(token, productId, updateData) {
    try {
        console.log(`🔄 Testing product update for ID: ${productId}`);
        console.log('📝 Update data:', JSON.stringify(updateData, null, 2));
        
        const response = await axios.put(`${BASE_URL}/admin/products/${productId}`, updateData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Product update successful!');
        console.log('📊 Response:', JSON.stringify(response.data, null, 2));
        return response.data;
        
    } catch (error) {
        console.error('❌ Product update failed:');
        console.error('Status:', error.response?.status);
        console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
        throw error;
    }
}

async function runTests() {
    try {
        // Step 1: Get authentication token
        const token = await getAdminToken();
        
        // Step 2: Get a product to test with
        const product = await getFirstProduct(token);
        
        // Step 3: Test minimal update (only required fields)
        console.log('\n🧪 Test 1: Minimal update (name only)');
        await testProductUpdate(token, product.id, {
            name: `${product.name} - Updated ${new Date().getTime()}`
        });
        
        // Step 4: Test full update with all common fields
        console.log('\n🧪 Test 2: Full update with all fields');
        await testProductUpdate(token, product.id, {
            name: `${product.name} - Full Update`,
            brand: product.brand || 'Test Brand',
            price: 99.99,
            category: 'Healthcare',
            description: 'Updated description from test script',
            stockQuantity: 100,
            minAge: 18,
            maxAge: 65,
            ageCategory: 'Adult',
            requiresAgeVerification: false,
            isActive: true,
            inStock: true
        });
        
        // Step 5: Test with potential problematic values
        console.log('\n🧪 Test 3: Edge case values');
        await testProductUpdate(token, product.id, {
            name: product.name,
            price: 0.01, // Minimum price
            minAge: 0,   // Minimum age
            maxAge: 150, // Maximum age
            stockQuantity: 0
        });
        
        console.log('\n✅ All tests passed! The backend is working correctly.');
        console.log('🔍 If your ASP.NET app is still failing, the issue is in your frontend code.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n🔍 Debugging suggestions:');
        console.log('1. Check your admin credentials');
        console.log('2. Verify the backend is accessible');
        console.log('3. Ensure you have products in the database');
        console.log('4. Check network connectivity');
    }
}

// Common test scenarios for ASP.NET debugging
async function testSpecificIssues(token, productId) {
    console.log('\n🔧 Testing common ASP.NET integration issues...\n');
    
    // Test 1: Wrong data types
    console.log('🧪 Test: Wrong data types (should fail)');
    try {
        await testProductUpdate(token, productId, {
            price: "99.99", // String instead of number - should fail
            stockQuantity: "50", // String instead of number
            requiresAgeVerification: "true" // String instead of boolean
        });
    } catch (error) {
        console.log('✅ Expected failure - wrong data types caught by backend');
    }
    
    // Test 2: Invalid enum values
    console.log('\n🧪 Test: Invalid enum values (should fail)');
    try {
        await testProductUpdate(token, productId, {
            category: "health", // Should be "Healthcare"
            ageCategory: "adult" // Should be "Adult"
        });
    } catch (error) {
        console.log('✅ Expected failure - invalid enum values caught by backend');
    }
    
    // Test 3: Invalid URL
    console.log('\n🧪 Test: Invalid image URL (should fail)');
    try {
        await testProductUpdate(token, productId, {
            image: "not-a-valid-url"
        });
    } catch (error) {
        console.log('✅ Expected failure - invalid URL caught by backend');
    }
    
    // Test 4: Out of range values
    console.log('\n🧪 Test: Out of range age values (should fail)');
    try {
        await testProductUpdate(token, productId, {
            minAge: -1, // Below minimum
            maxAge: 151 // Above maximum
        });
    } catch (error) {
        console.log('✅ Expected failure - out of range values caught by backend');
    }
}

// Generate sample C# code based on successful test
function generateCSharpCode(updateData) {
    console.log('\n📄 Sample C# code for your ASP.NET application:\n');
    
    console.log(`
var updateData = new
{
    name = "${updateData.name}",
    brand = "${updateData.brand}",
    price = ${updateData.price}m, // Note the 'm' for decimal
    category = "${updateData.category}",
    description = "${updateData.description}",
    stockQuantity = ${updateData.stockQuantity},
    minAge = ${updateData.minAge},
    maxAge = ${updateData.maxAge},
    ageCategory = "${updateData.ageCategory}",
    requiresAgeVerification = ${updateData.requiresAgeVerification.toString().toLowerCase()},
    isActive = ${updateData.isActive.toString().toLowerCase()},
    inStock = ${updateData.inStock.toString().toLowerCase()}
};

var json = JsonSerializer.Serialize(updateData);
var content = new StringContent(json, Encoding.UTF8, "application/json");

using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

var response = await client.PutAsync("${BASE_URL}/admin/products/{productId}", content);
    `);
}

// Main execution
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    getAdminToken,
    testProductUpdate,
    testSpecificIssues,
    generateCSharpCode
};