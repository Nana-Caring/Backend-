const { User, Account } = require('./models');

async function testDependentFetching() {
    try {
        // Fetch all dependents
        const dependents = await User.findAll({
            where: { role: 'dependent' },
            include: [
                {
                    model: Account,
                    as: 'Accounts',
                    attributes: ['id', 'accountNumber', 'accountType', 'balance', 'status']
                }
            ],
            attributes: ['id', 'firstName', 'surname', 'email', 'role']
        });

        if (dependents.length === 0) {
            console.log('❌ No dependents found in database');
            return;
        }

        console.log(`✅ Found ${dependents.length} dependents:`);
        dependents.forEach(dep => {
            console.log(`- ${dep.firstName} ${dep.surname} (${dep.email})`);
            if (dep.Accounts && dep.Accounts.length > 0) {
                dep.Accounts.forEach(acc => {
                    console.log(`   Account: ${acc.accountType} (${acc.accountNumber}) - Balance: ${acc.balance} - Status: ${acc.status}`);
                });
            } else {
                console.log('   No accounts found for this dependent');
            }
        });
    } catch (error) {
        console.error('Error fetching dependents:', error);
    }
}

// Run the test if executed directly
if (require.main === module) {
    testDependentFetching();
}
