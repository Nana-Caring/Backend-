// Configuration
const BASE_URL = 'http://localhost:3000'; // Adjust if different
const USER_EMAIL = 'funder@example.com';
const USER_PASSWORD = 'your_password_here';

// Stripe official test payment methods
const STRIPE_TEST_CARDS = [
    {
        payment_method_id: 'pm_card_visa',
        card_type: 'Visa',
        is_default: true
    },
    {
        payment_method_id: 'pm_card_mastercard',
        card_type: 'MasterCard',
        is_default: false
    },
    {
        payment_method_id: 'pm_card_amex',
        card_type: 'American Express',
        is_default: false
    }
];

async function makeRequest(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
}

async function setupStripeTestCards() {
    try {
        console.log('🚀 Setting up Stripe test cards for transfer testing...\n');

        // Step 1: Login to get token
        console.log('Step 1: Authenticating user...');
        const loginData = await makeRequest(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: USER_EMAIL,
                password: USER_PASSWORD
            })
        });

        const token = loginData.token;
        const userId = loginData.user.id;
        console.log(`✅ Authenticated as user ID: ${userId}\n`);

        // Step 2: Add each test card
        console.log('Step 2: Adding Stripe test cards...');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        for (const card of STRIPE_TEST_CARDS) {
            try {
                const cardData = {
                    payment_method_id: card.payment_method_id,
                    user_id: userId,
                    is_default: card.is_default
                };

                console.log(`Adding ${card.card_type}...`);
                const response = await makeRequest(
                    `${BASE_URL}/api/payment-cards/add`,
                    {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(cardData)
                    }
                );

                console.log(`✅ ${card.card_type} added successfully!`);
                console.log(`   Card ID: ${response.card.id}`);
                console.log(`   Last 4: ${response.card.last_four}`);
                console.log(`   Brand: ${response.card.brand}\n`);

            } catch (error) {
                console.log(`❌ Failed to add ${card.card_type}:`);
                console.log(`   Error: ${error.message}\n`);
            }
        }

        // Step 3: List all cards to verify
        console.log('Step 3: Verifying added cards...');
        const listResponse = await makeRequest(
            `${BASE_URL}/api/payment-cards`,
            { headers }
        );

        console.log('✅ Cards successfully added:');
        listResponse.cards.forEach(card => {
            console.log(`   - ${card.brand} ending in ${card.last_four} (${card.is_default ? 'Default' : 'Additional'})`);
        });

        console.log('\n🎉 Setup complete! You can now test money transfers with these cards.');
        console.log('\n💡 Usage in transfers:');
        console.log('   Use the card IDs from above in your transfer requests');
        console.log('   Example: POST /api/transfers/send-to-beneficiary');

    } catch (error) {
        console.log('❌ Setup failed:');
        console.log(`   Error: ${error.message}`);
        console.log('\n🔍 Troubleshooting:');
        console.log('   1. Make sure your server is running on the correct port');
        console.log('   2. Verify your login credentials');
        console.log('   3. Check that you have a valid Stripe configuration');
        console.log('   4. Ensure your user account exists in the database');
    }
}

// Run the setup
setupStripeTestCards();
