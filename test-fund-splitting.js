const { User, Account, Transaction, PaymentCard } = require('./models');
const sequelize = require('./config/database');

async function testFundSplitting() {
    console.log('🧪 Testing Fund Splitting Logic...\n');

    try {
        // Find a dependent with sub-accounts
        const dependent = await User.findOne({
            where: { role: 'dependent' },
            include: [
                {
                    model: Account,
                    as: 'accounts'
                }
            ]
        });

        if (!dependent) {
            console.log('❌ No dependent found for testing');
            return;
        }

        console.log(`👤 Testing with dependent: ${dependent.firstName} ${dependent.surname}`);
        console.log(`📊 Found ${dependent.accounts.length} accounts:`);
        dependent.accounts.forEach(acc => {
            console.log(`   - ${acc.accountType}: ${acc.accountNumber} (Parent: ${acc.parentAccountId || 'None'})`);
        });
        
        // If no accounts, create a main account for testing
        if (dependent.accounts.length === 0) {
            console.log('🔧 Creating test main account...');
            const { generateUniqueAccountNumber } = require('./utils/generateUniqueAccountNumber');
            const mainAccountNumber = await generateUniqueAccountNumber();
            
            const testMainAccount = await Account.create({
                userId: dependent.id,
                accountType: 'Main',
                accountNumber: mainAccountNumber,
                balance: 0,
                currency: 'ZAR',
                status: 'active',
                parentAccountId: null,
                creationDate: new Date()
            });
            
            console.log(`✅ Created main account: ${testMainAccount.accountNumber}`);
            
            // Re-fetch dependent with accounts
            const updatedDependent = await User.findByPk(dependent.id, {
                include: [
                    {
                        model: Account,
                        as: 'accounts'
                    }
                ]
            });
            dependent.accounts = updatedDependent.accounts;
        }
        
        // Find their main account
        let mainAccount = dependent.accounts.find(acc => !acc.parentAccountId);
        if (!mainAccount) {
            console.log('❌ No main account found for dependent');
            
            // Try to find any account that could serve as main
            const anyAccount = dependent.accounts[0];
            if (!anyAccount) {
                console.log('❌ No accounts found at all');
                return;
            }
            
            console.log('🔄 Using first account as main account for testing...');
            // Use the first account for testing
            mainAccount = anyAccount;
        }

        console.log(`🏦 Main Account: ${mainAccount.accountNumber} (${mainAccount.accountType})`);
        console.log(`💰 Current Balance: R${mainAccount.balance}`);

        // Get sub-accounts
        const subAccounts = await Account.findAll({
            where: {
                parentAccountId: mainAccount.id,
                status: 'active'
            },
            order: [['accountType', 'ASC']]
        });

        console.log(`📊 Found ${subAccounts.length} sub-accounts:`);
        subAccounts.forEach(acc => {
            console.log(`   - ${acc.accountType}: ${acc.accountNumber} (Balance: R${acc.balance})`);
        });

        if (subAccounts.length === 0) {
            console.log('❌ No sub-accounts found - creating test sub-accounts...');
            
            const subAccountTypes = ['Education', 'Healthcare', 'Clothing', 'Entertainment', 'Baby Care', 'Pregnancy', 'Savings'];
            const { generateUniqueAccountNumber } = require('./utils/generateUniqueAccountNumber');
            
            for (const type of subAccountTypes) {
                const accountNumber = await generateUniqueAccountNumber();
                await Account.create({
                    userId: dependent.id,
                    accountType: type,
                    accountNumber: accountNumber,
                    balance: 0,
                    currency: 'ZAR',
                    status: 'active',
                    parentAccountId: mainAccount.id,
                    creationDate: new Date()
                });
                console.log(`   ✅ Created ${type} sub-account: ${accountNumber}`);
            }
            
            console.log('\n🔄 Re-fetching sub-accounts...\n');
            return testFundSplitting(); // Retry with new sub-accounts
        }

        // Test fund splitting with R100
        const testAmount = 100.00;
        console.log(`\n💸 Testing fund splitting with R${testAmount}...\n`);

        // Import the splitting function (we'll need to update the export)
        const { splitFundsAmongSubAccounts } = require('./controllers/transferController');
        
        // Start database transaction
        const dbTransaction = await sequelize.transaction();

        try {
            const transactionRef = `TEST-${Date.now()}`;
            
            // Test the splitting logic
            const splitResult = await splitFundsAmongSubAccounts(
                mainAccount.id,
                testAmount,
                transactionRef,
                'Test fund splitting',
                dbTransaction
            );

            console.log('📈 Splitting Results:');
            console.log(`   Total Split Amount: R${splitResult.totalSplitAmount}`);
            console.log(`   Remaining for Main: R${splitResult.remainingAmount}`);
            console.log(`   Message: ${splitResult.message}\n`);

            console.log('💳 Individual Splits:');
            splitResult.splits.forEach(split => {
                console.log(`   ${split.accountType}: R${split.amount} (${split.percentage.toFixed(1)}%)`);
                console.log(`      Account: ${split.accountNumber}`);
                console.log(`      Transaction: ${split.transactionId}\n`);
            });

            // Rollback the test transaction
            await dbTransaction.rollback();
            console.log('🔄 Test transaction rolled back (no actual money moved)');

        } catch (error) {
            await dbTransaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error details:', error.message);
    }
}

// Run the test
if (require.main === module) {
    testFundSplitting()
        .then(() => {
            console.log('\n✅ Fund splitting test completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Fund splitting test failed:', error);
            process.exit(1);
        });
}

module.exports = { testFundSplitting };
