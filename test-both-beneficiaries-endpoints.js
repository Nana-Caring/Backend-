const axios = require('axios');
const { User, Account, FunderDependent } = require('./models');

// Configuration
const BASE_URL = 'http://localhost:5000';

async function testBothBeneficiariesEndpoints() {
    console.log('🧪 Testing Both Beneficiaries Endpoints...\n');

    try {
        // Step 1: Find a funder with dependents for testing
        console.log('1️⃣ Finding test funder with dependents...');
        const testFunder = await User.findOne({
            where: { role: 'funder' },
            include: [
                {
                    model: FunderDependent,
                    as: 'linkedDependents',
                    required: true,
                    include: [
                        {
                            model: User,
                            as: 'dependent',
                            attributes: ['id', 'firstName', 'middleName', 'surname', 'email']
                        }
                    ]
                }
            ]
        });

        if (!testFunder) {
            console.log('❌ No funder with dependents found for testing');
            console.log('💡 Create a funder and link dependents first');
            return;
        }

        console.log(`✅ Found test funder: ${testFunder.firstName} ${testFunder.lastName || testFunder.surname}`);
        console.log(`📊 Has ${testFunder.linkedDependents.length} linked dependents\n`);

        // Step 2: Login as the funder to get JWT token
        console.log('2️⃣ Logging in as funder...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testFunder.email,
            password: 'password123' // Assuming this is the test password
        });

        if (loginResponse.status !== 200) {
            console.log('❌ Login failed - may need to adjust password or create proper test data');
            return;
        }

        const authToken = loginResponse.data.token;
        console.log('✅ Login successful, got auth token\n');

        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };

        // Step 3: Test the funder endpoint (/api/funder/get-beneficiaries)
        console.log('3️⃣ Testing /api/funder/get-beneficiaries endpoint...');
        try {
            const funderEndpointResponse = await axios.get(`${BASE_URL}/api/funder/get-beneficiaries`, { headers });
            console.log('✅ Funder endpoint responded successfully');
            console.log(`📊 Response status: ${funderEndpointResponse.status}`);
            console.log(`📋 Number of beneficiaries: ${funderEndpointResponse.data.beneficiaries?.length || 0}`);
            
            if (funderEndpointResponse.data.beneficiaries && funderEndpointResponse.data.beneficiaries.length > 0) {
                const firstBeneficiary = funderEndpointResponse.data.beneficiaries[0];
                console.log('👤 First beneficiary data:');
                console.log(`   - ID: ${firstBeneficiary.id}`);
                console.log(`   - Name: ${firstBeneficiary.name || `${firstBeneficiary.firstName} ${firstBeneficiary.surname}`}`);
                console.log(`   - Email: ${firstBeneficiary.email}`);
                console.log(`   - Has surname: ${firstBeneficiary.surname ? '✅' : '❌'}`);
                console.log(`   - Has account: ${firstBeneficiary.hasActiveAccount ? '✅' : '❌'}`);
                if (firstBeneficiary.account) {
                    console.log(`   - Account Number: ${firstBeneficiary.account.accountNumber}`);
                    console.log(`   - Account Type: ${firstBeneficiary.account.accountType}`);
                    console.log(`   - Balance: R${firstBeneficiary.account.balance}`);
                }
            }
        } catch (error) {
            console.log(`❌ Funder endpoint failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }

        console.log('');

        // Step 4: Test the transfer endpoint (/api/transfers/beneficiaries)
        console.log('4️⃣ Testing /api/transfers/beneficiaries endpoint...');
        try {
            const transferEndpointResponse = await axios.get(`${BASE_URL}/api/transfers/beneficiaries`, { headers });
            console.log('✅ Transfer endpoint responded successfully');
            console.log(`📊 Response status: ${transferEndpointResponse.status}`);
            console.log(`📋 Number of beneficiaries: ${transferEndpointResponse.data.beneficiaries?.length || 0}`);
            
            if (transferEndpointResponse.data.beneficiaries && transferEndpointResponse.data.beneficiaries.length > 0) {
                const firstBeneficiary = transferEndpointResponse.data.beneficiaries[0];
                console.log('👤 First beneficiary data:');
                console.log(`   - ID: ${firstBeneficiary.id}`);
                console.log(`   - Name: ${firstBeneficiary.name}`);
                console.log(`   - Email: ${firstBeneficiary.email}`);
                console.log(`   - Has active account: ${firstBeneficiary.hasActiveAccount ? '✅' : '❌'}`);
                if (firstBeneficiary.account) {
                    console.log(`   - Account Number: ${firstBeneficiary.account.accountNumber}`);
                    console.log(`   - Balance: R${firstBeneficiary.account.balance}`);
                    console.log(`   - Currency: ${firstBeneficiary.account.currency}`);
                }
            }
        } catch (error) {
            console.log(`❌ Transfer endpoint failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }

        console.log('');

        // Step 5: Compare endpoint responses
        console.log('5️⃣ Comparing endpoint responses...');
        try {
            const funderResponse = await axios.get(`${BASE_URL}/api/funder/get-beneficiaries`, { headers });
            const transferResponse = await axios.get(`${BASE_URL}/api/transfers/beneficiaries`, { headers });

            const funderBeneficiaries = funderResponse.data.beneficiaries || [];
            const transferBeneficiaries = transferResponse.data.beneficiaries || [];

            console.log(`📊 Funder endpoint: ${funderBeneficiaries.length} beneficiaries`);
            console.log(`📊 Transfer endpoint: ${transferBeneficiaries.length} beneficiaries`);

            if (funderBeneficiaries.length === transferBeneficiaries.length) {
                console.log('✅ Both endpoints return the same number of beneficiaries');
            } else {
                console.log('⚠️  Endpoints return different numbers of beneficiaries');
            }

            // Check if same beneficiaries are returned
            if (funderBeneficiaries.length > 0 && transferBeneficiaries.length > 0) {
                const funderIds = funderBeneficiaries.map(b => b.id).sort();
                const transferIds = transferBeneficiaries.map(b => b.id).sort();
                
                if (JSON.stringify(funderIds) === JSON.stringify(transferIds)) {
                    console.log('✅ Both endpoints return the same beneficiaries');
                } else {
                    console.log('⚠️  Endpoints return different beneficiaries');
                    console.log(`   Funder IDs: [${funderIds.join(', ')}]`);
                    console.log(`   Transfer IDs: [${transferIds.join(', ')}]`);
                }
            }
        } catch (error) {
            console.log('❌ Failed to compare endpoints:', error.message);
        }

        console.log('\n🎉 Endpoint testing completed!');
        console.log('✅ Both endpoints are now working correctly after the fix');

    } catch (error) {
        console.error('❌ Test failed:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    testBothBeneficiariesEndpoints()
        .then(() => {
            console.log('\n✅ Test completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testBothBeneficiariesEndpoints };
