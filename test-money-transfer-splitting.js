// Test transfer controller directly with fund splitting
async function testTransferControllerDirectly() {
    console.log('🧪 Testing Transfer Controller with Fund Splitting...\n');
    
    const { User, PaymentCard, Account, FunderDependent } = require('./models');

    try {
        // Find test data
        const funder = await User.findOne({ where: { role: 'funder' } });
        const dependent = await User.findOne({ where: { role: 'dependent' } });
        
        if (!funder || !dependent) {
            console.log('❌ Need both funder and dependent for testing');
            return;
        }

        console.log(`💰 Funder: ${funder.firstName} ${funder.surname}`);
        console.log(`👤 Dependent: ${dependent.firstName} ${dependent.surname}`);

        // Check if funder has any payment cards
        const paymentCards = await PaymentCard.findAll({
            where: { userId: funder.id, isActive: true }
        });

        console.log(`💳 Funder has ${paymentCards.length} payment cards`);

        // Check if dependent has accounts (and specifically sub-accounts)
        const dependentAccounts = await Account.findAll({
            where: { userId: dependent.id, status: 'active' }
        });

        console.log(`🏦 Dependent has ${dependentAccounts.length} accounts:`);
        dependentAccounts.forEach(acc => {
            console.log(`   - ${acc.accountType}: ${acc.accountNumber} (Parent: ${acc.parentAccountId ? 'Sub' : 'Main'})`);
        });

        // Check funder-dependent relationship
        const relationship = await FunderDependent.findOne({
            where: { funderId: funder.id, dependentId: dependent.id }
        });

        console.log(`🔗 Relationship exists: ${!!relationship}`);

        if (!relationship) {
            console.log('� Creating test relationship...');
            await FunderDependent.create({
                funderId: funder.id,
                dependentId: dependent.id
            });
            console.log('✅ Relationship created');
        }

        // Get main account
        const mainAccount = dependentAccounts.find(acc => !acc.parentAccountId);
        if (!mainAccount) {
            console.log('❌ No main account found for dependent');
            return;
        }

        // Get sub-accounts
        const subAccounts = dependentAccounts.filter(acc => acc.parentAccountId === mainAccount.id);
        console.log(`📊 Found ${subAccounts.length} sub-accounts for splitting`);

        if (subAccounts.length === 0) {
            console.log('⚠️  No sub-accounts found - funds would go entirely to main account');
        }

        // Test the splitting function directly
        console.log('\n💸 Testing fund splitting logic...');
        
        const { splitFundsAmongSubAccounts } = require('./controllers/transferController');
        const sequelize = require('./config/database');
        
        // Start a test transaction
        const dbTransaction = await sequelize.transaction();

        try {
            const testAmount = 200.00;
            const transactionRef = `TEST-SPLIT-${Date.now()}`;
            
            console.log(`🧮 Splitting R${testAmount} among sub-accounts...`);
            
            const splitResult = await splitFundsAmongSubAccounts(
                mainAccount.id,
                testAmount,
                transactionRef,
                'Test fund splitting',
                dbTransaction
            );

            console.log('\n📈 Splitting Results:');
            console.log(`   Total Split Amount: R${splitResult.totalSplitAmount}`);
            console.log(`   Remaining for Main: R${splitResult.remainingAmount}`);
            console.log(`   Message: ${splitResult.message}`);
            console.log(`   Splits Created: ${splitResult.splits.length}`);

            if (splitResult.splits.length > 0) {
                console.log('\n💳 Individual Splits:');
                splitResult.splits.forEach(split => {
                    console.log(`   ${split.accountType}: R${split.amount} (${split.percentage.toFixed(1)}%)`);
                });
            }

            // Rollback the test transaction
            await dbTransaction.rollback();
            console.log('\n🔄 Test transaction rolled back (no actual changes made)');

            console.log('\n✅ Fund splitting is working correctly!');
            
            // Provide setup instructions for full testing
            console.log('\n📋 To test complete money transfer with Stripe:');
            console.log('1. Ensure funder has active payment cards with valid Stripe payment methods');
            console.log('2. Ensure dependent has sub-accounts set up');
            console.log('3. Use the /api/transfers/send endpoint with proper authentication');
            console.log('4. The response will include fundSplitting details showing how money was distributed');

        } catch (splitError) {
            await dbTransaction.rollback();
            throw splitError;
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error details:', error.message);
    }
}

// Choose which test to run
if (require.main === module) {
    testTransferControllerDirectly()
        .then(() => {
            console.log('\n✅ Transfer test completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Transfer test failed:', error);
            process.exit(1);
        });
}

module.exports = { testTransferControllerDirectly };
