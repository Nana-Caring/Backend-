// Test script to add proper Stripe cards and test money transfer
// Run with: node test-money-transfer.js

const BASE_URL = 'http://localhost:3000'; // Adjust port if needed

// Test configuration
const TEST_USER = {
    email: 'funder@example.com',
    password: 'your_password_here'
};

async function makeRequest(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }
    
    return data;
}

async function testMoneyTransfer() {
    try {
        console.log('🚀 Testing Money Transfer Flow...\n');

        // Step 1: Login
        console.log('Step 1: Logging in...');
        const loginData = await makeRequest(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        const token = loginData.token;
        const userId = loginData.user.id;
        console.log(`✅ Logged in as user ${userId}\n`);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Step 2: Add a proper Stripe test card
        console.log('Step 2: Adding Stripe test card...');
        try {
            // For now, let's add a test card using the test endpoint
            // but with a note that it won't work for actual transfers
            const cardData = {
                bankName: 'Standard Bank',
                cardNumber: '4111111111111111',
                expiryDate: '12/25',
                ccv: '123',
                nickname: 'Test Visa Card',
                isDefault: true
            };

            const cardResponse = await makeRequest(`${BASE_URL}/api/payment-cards/add`, {
                method: 'POST',
                headers,
                body: JSON.stringify(cardData)
            });

            console.log(`✅ Card added successfully!`);
            console.log(`   Card ID: ${cardResponse.card.id}`);
            console.log(`   Card Number: ${cardResponse.card.cardNumber}\n`);

            // Step 3: Get beneficiaries
            console.log('Step 3: Getting beneficiaries...');
            const beneficiariesData = await makeRequest(`${BASE_URL}/api/transfers/beneficiaries`, {
                headers
            });

            if (beneficiariesData.beneficiaries.length === 0) {
                console.log('❌ No beneficiaries found. You need to add beneficiaries first.');
                console.log('   Please add a dependent user and link them to this funder.\n');
                return;
            }

            const beneficiary = beneficiariesData.beneficiaries[0];
            console.log(`✅ Found beneficiary: ${beneficiary.name} (ID: ${beneficiary.id})\n`);

            // Step 4: Send money
            console.log('Step 4: Sending money...');
            const transferData = {
                cardId: cardResponse.card.id,
                beneficiaryId: beneficiary.id,
                amount: 100.00,
                description: 'Test transfer - money sending test'
            };

            const transferResponse = await makeRequest(`${BASE_URL}/api/transfers/send-to-beneficiary`, {
                method: 'POST',
                headers,
                body: JSON.stringify(transferData)
            });

            console.log('🎉 Money sent successfully!');
            console.log(`   Transaction Ref: ${transferResponse.transfer.transactionRef}`);
            console.log(`   Amount: R${transferResponse.transfer.amount}`);
            console.log(`   Beneficiary: ${transferResponse.transfer.toBeneficiary.name}`);
            console.log(`   New Balance: R${transferResponse.balanceUpdate.beneficiaryNewBalance}\n`);

            // Step 5: Check transfer history
            console.log('Step 5: Checking transfer history...');
            const historyData = await makeRequest(`${BASE_URL}/api/transfers/history`, {
                headers
            });

            console.log(`✅ Transfer history retrieved:`);
            historyData.transfers.forEach(transfer => {
                console.log(`   - ${transfer.transactionRef}: R${transfer.amount} to ${transfer.beneficiary.name}`);
            });

        } catch (cardError) {
            if (cardError.message.includes('No such PaymentMethod')) {
                console.log('❌ STRIPE ERROR: Cannot use test cards for real transfers!');
                console.log('\n🔧 SOLUTION: You need to use proper Stripe test payment methods:');
                console.log('   1. Use the production endpoint with official Stripe test payment methods');
                console.log('   2. Use payment method IDs like: pm_card_visa, pm_card_mastercard');
                console.log('\n📋 Try this request instead:');
                console.log('POST /api/payment-cards/add');
                console.log('{\n  "payment_method_id": "pm_card_visa",\n  "user_id": ' + userId + ',\n  "is_default": true\n}');
                console.log('\n💡 The test endpoint cards cannot be used for actual Stripe operations!');
            } else {
                console.log(`❌ Card/Transfer Error: ${cardError.message}`);
            }
        }

    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        console.log('\n🔍 Troubleshooting:');
        console.log('   1. Make sure your server is running');
        console.log('   2. Check your login credentials');
        console.log('   3. Ensure you have beneficiaries linked to your funder account');
        console.log('   4. Verify your Stripe configuration');
    }
}

async function addProperStripeCard() {
    try {
        console.log('\n🔧 ADDING PROPER STRIPE TEST CARD...\n');

        // Login first
        const loginData = await makeRequest(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        const token = loginData.token;
        const userId = loginData.user.id;

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Try to add a card with proper Stripe payment method
        // Note: This requires your controller to accept payment_method_id
        const stripeCardData = {
            payment_method_id: 'pm_card_visa',
            user_id: userId,
            is_default: true
        };

        try {
            const cardResponse = await makeRequest(`${BASE_URL}/api/payment-cards/add`, {
                method: 'POST',
                headers,
                body: JSON.stringify(stripeCardData)
            });

            console.log('✅ Stripe test card added successfully!');
            console.log(`   Card ID: ${cardResponse.card.id}`);
            console.log('   This card will work for money transfers!\n');

            return cardResponse.card.id;

        } catch (error) {
            console.log('❌ Failed to add Stripe card:', error.message);
            console.log('\n💡 Your controller might not support payment_method_id yet.');
            console.log('   You need to modify the addPaymentCard endpoint to accept Stripe payment methods directly.');
        }

    } catch (error) {
        console.log('❌ Failed to add proper Stripe card:', error.message);
    }
}

// Run the tests
console.log('='.repeat(60));
console.log('🧪 MONEY TRANSFER TEST SCRIPT');
console.log('='.repeat(60));

testMoneyTransfer().then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 TRYING PROPER STRIPE CARD...');
    console.log('='.repeat(60));
    return addProperStripeCard();
}).then(() => {
    console.log('\n✨ Test complete!');
}).catch(error => {
    console.log('\n❌ Script failed:', error.message);
});
