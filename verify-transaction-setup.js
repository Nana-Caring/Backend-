// Node.js script to verify Transaction table setup and test money transfers
// Run this after setting up the Transaction table to verify everything works

const { Sequelize } = require('sequelize');
const config = require('./config/config.json');

// Import models
const { User, Account, Transaction, PaymentCard } = require('./models');

async function verifyTransactionTableSetup() {
    console.log('🔍 Verifying Transaction table setup...\n');

    try {
        // 1. Check database connection
        console.log('1. Testing database connection...');
        await Transaction.sequelize.authenticate();
        console.log('✓ Database connection successful\n');

        // 2. Check Transaction table structure
        console.log('2. Checking Transaction table structure...');
        const tableInfo = await Transaction.sequelize.getQueryInterface().describeTable('Transactions');
        console.log('Transaction table columns:');
        Object.entries(tableInfo).forEach(([column, info]) => {
            console.log(`  - ${column}: ${info.type} (nullable: ${info.allowNull})`);
        });
        console.log('');

        // 3. Test UUID generation
        console.log('3. Testing UUID generation...');
        const [results] = await Transaction.sequelize.query('SELECT gen_random_uuid() AS test_uuid');
        console.log(`✓ UUID generation works: ${results[0].test_uuid}\n`);

        // 4. Check for existing accounts
        console.log('4. Checking for existing accounts...');
        const accounts = await Account.findAll({ limit: 3 });
        if (accounts.length === 0) {
            console.log('⚠️  No accounts found. You may need to create accounts first.\n');
            return;
        }
        
        console.log(`✓ Found ${accounts.length} accounts:`);
        accounts.forEach(account => {
            console.log(`  - ${account.accountName} (ID: ${account.id})`);
        });
        console.log('');

        // 5. Test transaction creation
        console.log('5. Testing transaction creation...');
        const testAccount = accounts[0];
        
        const testTransaction = await Transaction.create({
            accountId: testAccount.id,
            amount: 15.75,
            type: 'Credit',
            description: 'Setup verification test transaction',
            reference: `setup-test-${Date.now()}`,
            metadata: { source: 'setup-verification', test: true }
        });

        console.log(`✓ Transaction created successfully:`);
        console.log(`  - ID: ${testTransaction.id}`);
        console.log(`  - Account ID: ${testTransaction.accountId}`);
        console.log(`  - Amount: $${testTransaction.amount}`);
        console.log(`  - Type: ${testTransaction.type}`);
        console.log(`  - Reference: ${testTransaction.reference}\n`);

        // 6. Test foreign key relationship
        console.log('6. Testing foreign key relationship...');
        const transactionWithAccount = await Transaction.findByPk(testTransaction.id, {
            include: [{ model: Account, as: 'account' }]
        });

        if (transactionWithAccount && transactionWithAccount.account) {
            console.log(`✓ Foreign key relationship works:`);
            console.log(`  - Transaction belongs to account: ${transactionWithAccount.account.accountName}\n`);
        } else {
            console.log('⚠️  Foreign key relationship issue - transaction found but no account association\n');
        }

        // 7. Check transaction count
        console.log('7. Checking transaction statistics...');
        const transactionCount = await Transaction.count();
        const accountsWithTransactions = await Account.findAll({
            include: [{ model: Transaction, as: 'transactions' }],
            where: { '$transactions.id$': { [Sequelize.Op.not]: null } }
        });

        console.log(`✓ Total transactions in database: ${transactionCount}`);
        console.log(`✓ Accounts with transactions: ${accountsWithTransactions.length}\n`);

        // 8. Test payment card check (if any exist)
        console.log('8. Checking payment cards...');
        const paymentCards = await PaymentCard.findAll({ limit: 3 });
        if (paymentCards.length > 0) {
            console.log(`✓ Found ${paymentCards.length} payment cards - money transfers should work`);
            paymentCards.forEach(card => {
                console.log(`  - Card ending in ${card.lastFourDigits} (${card.isActive ? 'Active' : 'Inactive'})`);
            });
        } else {
            console.log('⚠️  No payment cards found. Add a payment card to test money transfers.');
        }
        console.log('');

        // 9. Clean up test transaction
        console.log('9. Cleaning up test transaction...');
        await testTransaction.destroy();
        console.log('✓ Test transaction removed\n');

        // 10. Final verification
        console.log('🎉 Transaction table setup verification complete!');
        console.log('\nNext steps:');
        console.log('- Test adding a payment card via POST /api/payment-cards/add-test');
        console.log('- Test money transfer via POST /api/transfers/send');
        console.log('- Check transaction creation in real transfers');
        console.log('- Verify account balance updates work correctly\n');

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        console.error('\nFull error details:');
        console.error(error);
        
        if (error.name === 'SequelizeDatabaseError') {
            console.log('\n🔧 Database Error Troubleshooting:');
            console.log('1. Check if the Transaction table exists');
            console.log('2. Verify the table has UUID columns (id, accountId)');
            console.log('3. Run the manual SQL setup script if needed');
            console.log('4. Check foreign key constraints are properly set');
        }
    }
}

async function testMoneyTransferFlow() {
    console.log('\n💸 Testing complete money transfer flow...\n');

    try {
        // Find a funder with payment cards and dependents
        const funders = await User.findAll({
            where: { role: 'funder' },
            include: [
                { model: PaymentCard, as: 'paymentCards', where: { isActive: true }, required: false },
                { model: Account, as: 'accounts', required: false }
            ]
        });

        if (funders.length === 0) {
            console.log('⚠️  No funders found. Create a funder to test money transfers.\n');
            return;
        }

        const funder = funders.find(f => f.paymentCards.length > 0 && f.accounts.length > 0);
        if (!funder) {
            console.log('⚠️  No funder with both payment cards and accounts found.\n');
            console.log('To test money transfers:');
            console.log('1. Add a payment card to a funder');
            console.log('2. Ensure the funder has an account');
            console.log('3. Add dependents to the funder\n');
            return;
        }

        console.log(`✓ Found test funder: ${funder.firstName} ${funder.lastName}`);
        console.log(`  - Payment cards: ${funder.paymentCards.length}`);
        console.log(`  - Accounts: ${funder.accounts.length}\n`);

        // Check for dependents
        const dependents = await User.findAll({
            where: { parentId: funder.id },
            include: [{ model: Account, as: 'accounts' }]
        });

        if (dependents.length === 0) {
            console.log('⚠️  No dependents found for this funder. Add dependents to test transfers.\n');
            return;
        }

        const dependentWithAccount = dependents.find(d => d.accounts.length > 0);
        if (!dependentWithAccount) {
            console.log('⚠️  No dependent with account found. Ensure dependents have accounts.\n');
            return;
        }

        console.log(`✓ Found test dependent: ${dependentWithAccount.firstName} ${dependentWithAccount.lastName}`);
        console.log(`  - Account: ${dependentWithAccount.accounts[0].accountName}\n`);

        // Simulate transfer data
        const transferData = {
            funderId: funder.id,
            dependentId: dependentWithAccount.id,
            paymentCardId: funder.paymentCards[0].id,
            amount: 25.00,
            description: 'Test transfer verification'
        };

        console.log('✓ Transfer prerequisites verified:');
        console.log(`  - Funder: ${funder.firstName} ${funder.lastName} (${funder.id})`);
        console.log(`  - Dependent: ${dependentWithAccount.firstName} ${dependentWithAccount.lastName} (${dependentWithAccount.id})`);
        console.log(`  - Payment Card: ***${funder.paymentCards[0].lastFourDigits} (${funder.paymentCards[0].id})`);
        console.log(`  - Amount: $${transferData.amount}`);
        console.log(`  - Target Account: ${dependentWithAccount.accounts[0].accountName}\n`);

        console.log('🎯 Ready for money transfer testing!');
        console.log('Use this data to test POST /api/transfers/send:');
        console.log(JSON.stringify(transferData, null, 2));

    } catch (error) {
        console.error('❌ Money transfer flow test failed:', error.message);
        console.error(error);
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting Transaction Table Verification\n');
    console.log('='.repeat(50));

    try {
        await verifyTransactionTableSetup();
        await testMoneyTransferFlow();
    } catch (error) {
        console.error('❌ Verification script failed:', error.message);
        process.exit(1);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Verification complete!');
    process.exit(0);
}

if (require.main === module) {
    main();
}

module.exports = { verifyTransactionTableSetup, testMoneyTransferFlow };
