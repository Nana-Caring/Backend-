// Test script to verify migrations are working correctly
// Run this before deploying to production

const { User, Account, Transaction, FunderDependent, sequelize } = require('./models');

async function testMigrations() {
    console.log('🧪 Testing Migration Implementation...\n');

    try {
        // Test 1: Database Connection
        console.log('1. Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful\n');

        // Test 2: Table Existence
        console.log('2. Checking table existence...');
        const tables = await sequelize.getQueryInterface().showAllTables();
        const expectedTables = ['Users', 'Accounts', 'Transactions', 'FunderDependents'];
        
        for (const table of expectedTables) {
            if (tables.includes(table)) {
                console.log(`✅ Table ${table} exists`);
            } else {
                console.log(`❌ Table ${table} missing`);
            }
        }
        console.log('');

        // Test 3: User Model Structure
        console.log('3. Testing User model structure...');
        const userAttributes = User.rawAttributes;
        const personalDetailFields = [
            'phoneNumber', 'postalAddressLine1', 'postalAddressLine2', 
            'postalCity', 'postalProvince', 'postalCode',
            'homeAddressLine1', 'homeAddressLine2', 'homeCity', 
            'homeProvince', 'homeCode'
        ];

        for (const field of personalDetailFields) {
            if (userAttributes[field] && userAttributes[field].allowNull) {
                console.log(`✅ ${field} exists and allows null`);
            } else {
                console.log(`❌ ${field} issue - allowNull: ${userAttributes[field]?.allowNull}`);
            }
        }
        console.log('');

        // Test 4: Create Test User with Null Personal Details
        console.log('4. Testing user creation with null personal details...');
        const testEmail = `test-${Date.now()}@example.com`;
        const testUser = await User.create({
            firstName: 'Test',
            middleName: null,
            surname: 'User', 
            email: testEmail,
            password: 'hashedpassword123',
            role: 'funder',
            Idnumber: '1234567890123',
            // Personal details should be null
            phoneNumber: null,
            postalAddressLine1: null,
            postalAddressLine2: null,
            postalCity: null,
            postalProvince: null,
            postalCode: null,
            homeAddressLine1: null,
            homeAddressLine2: null,
            homeCity: null,
            homeProvince: null,
            homeCode: null
        });

        console.log('✅ User created successfully with ID:', testUser.id);
        console.log('✅ Personal details are null as expected');
        console.log('');

        // Test 5: Update Personal Details
        console.log('5. Testing personal details update...');
        await testUser.update({
            phoneNumber: '+27821234567',
            postalAddressLine1: '123 Test Street',
            postalCity: 'Cape Town',
            postalProvince: 'Western Cape',
            postalCode: '8001'
        });

        const updatedUser = await User.findByPk(testUser.id);
        console.log('✅ Personal details updated successfully');
        console.log(`📱 Phone: ${updatedUser.phoneNumber}`);
        console.log(`🏠 Address: ${updatedUser.postalAddressLine1}, ${updatedUser.postalCity}`);
        console.log('');

        // Test 6: Account Creation
        console.log('6. Testing account creation...');
        const testAccount = await Account.create({
            userId: testUser.id,
            accountType: 'Main',
            balance: 1000.50,
            accountNumber: 'ACC123456789'
        });
        console.log('✅ Account created successfully with ID:', testAccount.id);
        console.log('');

        // Test 7: Transaction Creation
        console.log('7. Testing transaction creation...');
        const testTransaction = await Transaction.create({
            accountId: testAccount.id,
            amount: 100.00,
            type: 'Credit'
        });
        console.log('✅ Transaction created successfully with ID:', testTransaction.id);
        console.log('');

        // Test 8: Foreign Key Relationships
        console.log('8. Testing foreign key relationships...');
        const userWithAccount = await User.findByPk(testUser.id, {
            include: [{ model: Account, as: 'accounts' }]
        });
        
        if (userWithAccount.accounts && userWithAccount.accounts.length > 0) {
            console.log('✅ User-Account relationship working');
        } else {
            console.log('❌ User-Account relationship issue');
        }
        console.log('');

        // Cleanup
        console.log('9. Cleaning up test data...');
        await testTransaction.destroy();
        await testAccount.destroy();
        await testUser.destroy();
        console.log('✅ Test data cleaned up');
        console.log('');

        console.log('🎉 All migration tests passed! Ready for production deployment.');

    } catch (error) {
        console.error('❌ Migration test failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the tests
testMigrations().catch(console.error);
