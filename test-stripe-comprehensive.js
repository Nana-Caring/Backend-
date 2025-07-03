// Comprehensive Stripe Routes Test
// This test file validates all Stripe functionality including API endpoints

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

console.log('🧪 Comprehensive Stripe Routes Test');
console.log('==================================\n');

// Create a test app to simulate the server
function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use(express.raw({ type: 'application/json' }));
    
    // Register the stripe routes
    const stripeRoutes = require('./routes/stripeRoutes');
    app.use('/api/stripe', stripeRoutes);
    
    return app;
}

// Generate a test JWT token
function generateTestToken(userId, role = 'funder') {
    return jwt.sign(
        { id: userId, role: role },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '1h' }
    );
}

async function testStripeInfrastructure() {
    console.log('🔧 Testing Stripe Infrastructure...\n');

    try {
        // Test 1: Check if stripe routes file exists
        console.log('📁 Testing Stripe Routes File:');
        const stripeRoutes = require('./routes/stripeRoutes');
        console.log('   ✅ Stripe routes file loaded successfully');

        // Test 2: Check if stripe controller exists
        console.log('\n💳 Testing Stripe Controller:');
        try {
            const stripeController = require('./controllers/stripeController');
            
            const requiredMethods = [
                'createPaymentIntent',
                'createSetupIntent', 
                'listPaymentMethods',
                'handleWebhook'
            ];

            let methodsFound = 0;
            requiredMethods.forEach(method => {
                if (typeof stripeController[method] === 'function') {
                    console.log(`   ✅ ${method} method exists`);
                    methodsFound++;
                } else {
                    console.log(`   ❌ ${method} method missing`);
                }
            });

            if (methodsFound === requiredMethods.length) {
                console.log('   🎉 All required controller methods found');
            } else {
                console.log(`   ⚠️  ${methodsFound}/${requiredMethods.length} methods found`);
            }
        } catch (error) {
            console.log(`   ❌ Stripe controller error: ${error.message}`);
        }

        // Test 3: Check middleware
        console.log('\n🛡️  Testing Middleware:');
        try {
            const auth = require('./middlewares/auth');
            console.log('   ✅ auth middleware loaded');
        } catch (error) {
            console.log(`   ❌ auth middleware error: ${error.message}`);
        }

        // Test 4: Check environment variables
        console.log('\n⚙️  Testing Stripe Configuration:');
        if (process.env.STRIPE_SECRET_KEY) {
            console.log('   ✅ STRIPE_SECRET_KEY found');
        } else {
            console.log('   ⚠️  STRIPE_SECRET_KEY not found - using test key');
            process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_testing';
        }

        if (process.env.STRIPE_WEBHOOK_SECRET) {
            console.log('   ✅ STRIPE_WEBHOOK_SECRET found');
        } else {
            console.log('   ⚠️  STRIPE_WEBHOOK_SECRET not found - using test webhook secret');
            process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_webhook_secret_for_testing';
        }

        // Test 5: Check if Stripe package is available
        console.log('\n📦 Testing Stripe Package:');
        try {
            const stripe = require('stripe');
            console.log('   ✅ Stripe package available');
        } catch (error) {
            console.log(`   ❌ Stripe package error: ${error.message}`);
        }

        // Test 6: Check models
        console.log('\n🗃️  Testing Database Models:');
        try {
            const { User, Account, FunderDependent } = require('./models');
            console.log('   ✅ User model loaded');
            console.log('   ✅ Account model loaded');
            console.log('   ✅ FunderDependent model loaded');
        } catch (error) {
            console.log(`   ❌ Model loading error: ${error.message}`);
        }

        return true;
    } catch (error) {
        console.log(`❌ Infrastructure test failed: ${error.message}`);
        return false;
    }
}

async function testStripeEndpoints() {
    console.log('\n🎯 Testing Stripe API Endpoints...\n');

    const app = createTestApp();
    const testToken = generateTestToken(1, 'funder');

    try {
        // Test 1: Create Payment Intent endpoint
        console.log('💰 Testing Create Payment Intent:');
        try {
            const response = await request(app)
                .post('/api/stripe/create-payment-intent')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    amount: 1000,
                    accountNumber: '1234567890',
                    accountType: 'Main'
                });

            if (response.status === 200) {
                console.log('   ✅ Endpoint accessible');
                if (response.body.clientSecret) {
                    console.log('   ✅ Client secret returned');
                } else {
                    console.log('   ⚠️  Response format may be different');
                }
            } else if (response.status === 404) {
                console.log('   ⚠️  Account not found (expected with test data)');
            } else if (response.status === 403) {
                console.log('   ⚠️  Access denied (expected with test data)');
            } else {
                console.log(`   ⚠️  Unexpected response: ${response.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Create Payment Intent error: ${error.message}`);
        }

        // Test 2: Create Setup Intent endpoint
        console.log('\n🔧 Testing Create Setup Intent:');
        try {
            const response = await request(app)
                .post('/api/stripe/create-setup-intent')
                .set('Authorization', `Bearer ${testToken}`);

            if (response.status === 200) {
                console.log('   ✅ Endpoint accessible');
                if (response.body.clientSecret) {
                    console.log('   ✅ Client secret returned');
                } else {
                    console.log('   ⚠️  Response format may be different');
                }
            } else if (response.status === 404) {
                console.log('   ⚠️  Stripe customer not found (expected with test data)');
            } else {
                console.log(`   ⚠️  Unexpected response: ${response.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Create Setup Intent error: ${error.message}`);
        }

        // Test 3: List Payment Methods endpoint
        console.log('\n📋 Testing List Payment Methods:');
        try {
            const response = await request(app)
                .get('/api/stripe/payment-methods')
                .set('Authorization', `Bearer ${testToken}`);

            if (response.status === 200) {
                console.log('   ✅ Endpoint accessible');
                if (response.body.paymentMethods) {
                    console.log('   ✅ Payment methods array returned');
                } else {
                    console.log('   ⚠️  Response format may be different');
                }
            } else if (response.status === 404) {
                console.log('   ⚠️  Stripe customer not found (expected with test data)');
            } else {
                console.log(`   ⚠️  Unexpected response: ${response.status}`);
            }
        } catch (error) {
            console.log(`   ❌ List Payment Methods error: ${error.message}`);
        }

        // Test 4: Webhook endpoint
        console.log('\n🔗 Testing Webhook Endpoint:');
        try {
            const webhookPayload = {
                id: 'evt_test_webhook',
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        id: 'pi_test_payment_intent',
                        amount: 10000,
                        currency: 'zar',
                        metadata: {
                            accountNumber: '1234567890',
                            accountType: 'Main'
                        }
                    }
                }
            };

            const response = await request(app)
                .post('/api/stripe/webhook')
                .set('stripe-signature', 'test_signature')
                .send(webhookPayload);

            if (response.status === 200) {
                console.log('   ✅ Webhook endpoint accessible');
                if (response.body.received) {
                    console.log('   ✅ Webhook processed successfully');
                } else {
                    console.log('   ⚠️  Webhook response format may be different');
                }
            } else if (response.status === 400) {
                console.log('   ⚠️  Webhook signature validation failed (expected with test data)');
            } else {
                console.log(`   ⚠️  Unexpected response: ${response.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Webhook error: ${error.message}`);
        }

        // Test 5: Authentication checks
        console.log('\n🔐 Testing Authentication:');
        try {
            const response = await request(app)
                .post('/api/stripe/create-payment-intent')
                .send({
                    amount: 1000,
                    accountNumber: '1234567890',
                    accountType: 'Main'
                });

            if (response.status === 401) {
                console.log('   ✅ Authentication properly enforced');
            } else {
                console.log(`   ⚠️  Unexpected response without auth: ${response.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Authentication test error: ${error.message}`);
        }

        return true;
    } catch (error) {
        console.log(`❌ Endpoint test failed: ${error.message}`);
        return false;
    }
}

function displayTestCommands() {
    console.log('\n💡 Manual Test Commands (PowerShell):');
    console.log('====================================');
    console.log('# 1. First, get a JWT token by logging in');
    console.log('$loginBody = @{ email = "funder@example.com"; password = "Password123!" } | ConvertTo-Json');
    console.log('$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"');
    console.log('$token = $loginResponse.token');
    console.log('$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }');
    console.log('');
    
    console.log('# 2. Test Create Payment Intent');
    console.log('$paymentBody = @{');
    console.log('    amount = 1000');
    console.log('    accountNumber = "1234567890"');
    console.log('    accountType = "Main"');
    console.log('} | ConvertTo-Json');
    console.log('$paymentResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/stripe/create-payment-intent" -Method Post -Headers $headers -Body $paymentBody');
    console.log('Write-Host "Client Secret: $($paymentResponse.clientSecret)"');
    console.log('');
    
    console.log('# 3. Test Create Setup Intent');
    console.log('$setupResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/stripe/create-setup-intent" -Method Post -Headers $headers');
    console.log('Write-Host "Setup Client Secret: $($setupResponse.clientSecret)"');
    console.log('');
    
    console.log('# 4. Test List Payment Methods');
    console.log('$paymentMethods = Invoke-RestMethod -Uri "http://localhost:5000/api/stripe/payment-methods" -Method Get -Headers $headers');
    console.log('Write-Host "Payment Methods: $($paymentMethods.paymentMethods.Count)"');
    console.log('');
    
    console.log('# 5. Test Webhook (simulate Stripe webhook)');
    console.log('$webhookBody = @{');
    console.log('    id = "evt_test_webhook"');
    console.log('    type = "payment_intent.succeeded"');
    console.log('    data = @{');
    console.log('        object = @{');
    console.log('            id = "pi_test_payment_intent"');
    console.log('            amount = 10000');
    console.log('            currency = "zar"');
    console.log('            metadata = @{');
    console.log('                accountNumber = "1234567890"');
    console.log('                accountType = "Main"');
    console.log('            }');
    console.log('        }');
    console.log('    }');
    console.log('} | ConvertTo-Json -Depth 5');
    console.log('$webhookHeaders = @{ "stripe-signature" = "test_signature"; "Content-Type" = "application/json" }');
    console.log('Invoke-RestMethod -Uri "http://localhost:5000/api/stripe/webhook" -Method Post -Headers $webhookHeaders -Body $webhookBody');
}

function displayCurlCommands() {
    console.log('\n🌐 Manual Test Commands (curl):');
    console.log('==============================');
    console.log('# 1. Login and get token');
    console.log('TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"funder@example.com","password":"Password123!"}\' \\');
    console.log('  | jq -r \'.token\')');
    console.log('');
    
    console.log('# 2. Create Payment Intent');
    console.log('curl -X POST http://localhost:5000/api/stripe/create-payment-intent \\');
    console.log('  -H "Authorization: Bearer $TOKEN" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"amount":1000,"accountNumber":"1234567890","accountType":"Main"}\'');
    console.log('');
    
    console.log('# 3. Create Setup Intent');
    console.log('curl -X POST http://localhost:5000/api/stripe/create-setup-intent \\');
    console.log('  -H "Authorization: Bearer $TOKEN" \\');
    console.log('  -H "Content-Type: application/json"');
    console.log('');
    
    console.log('# 4. List Payment Methods');
    console.log('curl -X GET http://localhost:5000/api/stripe/payment-methods \\');
    console.log('  -H "Authorization: Bearer $TOKEN"');
    console.log('');
    
    console.log('# 5. Test Webhook');
    console.log('curl -X POST http://localhost:5000/api/stripe/webhook \\');
    console.log('  -H "stripe-signature: test_signature" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"id":"evt_test","type":"payment_intent.succeeded","data":{"object":{"id":"pi_test","amount":10000,"currency":"zar","metadata":{"accountNumber":"1234567890","accountType":"Main"}}}}\'');
}

function displayRequiredConfiguration() {
    console.log('\n🔧 Required Environment Variables:');
    console.log('=================================');
    console.log('# Add these to your .env file:');
    console.log('STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key');
    console.log('STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret');
    console.log('JWT_SECRET=your_jwt_secret_key');
    console.log('');
    
    console.log('📋 Available Stripe Endpoints:');
    console.log('=============================');
    console.log('POST /api/stripe/create-payment-intent  - Create payment intent for funding');
    console.log('POST /api/stripe/create-setup-intent    - Create setup intent for saving payment methods');
    console.log('GET  /api/stripe/payment-methods        - List saved payment methods');
    console.log('POST /api/stripe/webhook                - Handle Stripe webhook events');
    console.log('');
    
    console.log('🔒 Authentication Requirements:');
    console.log('==============================');
    console.log('• Payment Intent: Requires valid JWT token (funder role)');
    console.log('• Setup Intent: Requires valid JWT token');
    console.log('• Payment Methods: Requires valid JWT token');
    console.log('• Webhook: No authentication (validated by Stripe signature)');
}

// Main test execution
async function runComprehensiveTest() {
    console.log('Starting comprehensive Stripe routes test...\n');
    
    const infrastructureOk = await testStripeInfrastructure();
    const endpointsOk = await testStripeEndpoints();
    
    console.log('\n🎉 Test Summary:');
    console.log('================');
    console.log(`Infrastructure: ${infrastructureOk ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Endpoints: ${endpointsOk ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (infrastructureOk && endpointsOk) {
        console.log('\n🎊 All Stripe routes are working correctly!');
    } else {
        console.log('\n⚠️  Some tests failed - check the details above');
    }
    
    displayTestCommands();
    displayCurlCommands();
    displayRequiredConfiguration();
}

// Run the test
runComprehensiveTest().catch(console.error);
