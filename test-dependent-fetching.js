const { User, Account, FunderDependent } = require('./models');

async function testDependentFetching() {
    console.log('🔍 Testing Dependent Fetching Issues...\n');

    try {
        // 1. Check if dependents exist in the database
        console.log('1. Checking all dependents in database...');
        const allDependents = await User.findAll({
            where: { role: 'dependent' },
            attributes: ['id', 'firstName', 'surname', 'email', 'role']
        });
        
        console.log(`   Found ${allDependents.length} dependents:`);
        allDependents.forEach(dep => {
            console.log(`   - ${dep.firstName} ${dep.surname} (${dep.email})`);
        });

        if (allDependents.length === 0) {
            console.log('   ❌ No dependents found in database');
            return;
        }

        // 2. Check funder-dependent relationships
        console.log('\n2. Checking funder-dependent relationships...');
        const relationships = await FunderDependent.findAll({
            include: [
                {
                    model: User,
                    as: 'funder',
                    attributes: ['id', 'firstName', 'surname']
                },
                {
                    model: User,
                    as: 'dependent',
                    attributes: ['id', 'firstName', 'surname']
                }
            ]
        });

        console.log(`   Found ${relationships.length} relationships:`);
        relationships.forEach(rel => {
            console.log(`   - Funder: ${rel.funder.firstName} ${rel.funder.surname} -> Dependent: ${rel.dependent.firstName} ${rel.dependent.surname}`);
        });

        // 3. Test fetching dependents for a specific funder
        console.log('\n3. Testing funder-specific dependent fetching...');
        const funder = await User.findOne({ where: { role: 'funder' } });
        
        if (!funder) {
            console.log('   ❌ No funder found');
            return;
        }

        console.log(`   Testing with funder: ${funder.firstName} ${funder.surname}`);

        // Method 1: Through FunderDependent relationships
        const funderDependents = await FunderDependent.findAll({
            where: { funderId: funder.id },
            include: [
                {
                    model: User,
                    as: 'dependent',
                    attributes: ['id', 'firstName', 'surname', 'email'],
                    include: [
                        {
                            model: Account,
                            as: 'accounts',
                            required: false
                        }
                    ]
                }
            ]
        });

        console.log(`   Method 1 - Through FunderDependent: Found ${funderDependents.length} dependents`);

        // Method 2: Through Account caregiverId (if using caregiver model)
        const accountDependents = await Account.findAll({
            where: { caregiverId: funder.id },
            include: [
                {
                    model: User,
                    as: 'user',
                    where: { role: 'dependent' },
                    attributes: ['id', 'firstName', 'surname', 'email']
                }
            ]
        });

        console.log(`   Method 2 - Through Account caregiverId: Found ${accountDependents.length} accounts`);

        // 4. Check account structure for dependents
        console.log('\n4. Checking dependent account structure...');
        for (const dep of allDependents) {
            const accounts = await Account.findAll({
                where: { userId: dep.id },
                attributes: ['id', 'accountType', 'parentAccountId', 'status']
            });
            
            console.log(`   ${dep.firstName} ${dep.surname} has ${accounts.length} accounts:`);
            accounts.forEach(acc => {
                console.log(`     - ${acc.accountType} (${acc.parentAccountId ? 'Sub' : 'Main'}) - ${acc.status}`);
            });
        }

        // 5. Test the API endpoint logic
        console.log('\n5. Testing API endpoint logic...');
        
        // Simulate getBeneficiariesList logic
        const apiRelationships = await FunderDependent.findAll({
            where: { funderId: funder.id },
            include: [{
                model: User,
                as: 'dependent',
                attributes: ['id', 'firstName', 'surname', 'email'],
                include: [{
                    model: Account,
                    as: 'accounts',
                    where: { status: 'active' },
                    required: false
                }]
            }]
        });

        console.log(`   API simulation: Found ${apiRelationships.length} beneficiaries`);
        
        const beneficiaries = apiRelationships.map(rel => {
            const user = rel.dependent;
            const account = user.accounts && user.accounts[0];
            
            return {
                id: user.id,
                name: `${user.firstName} ${user.surname}`,
                email: user.email,
                account: account ? {
                    id: account.id,
                    accountNumber: account.accountNumber,
                    balance: account.balance,
                    currency: account.currency
                } : null,
                hasActiveAccount: !!account
            };
        });

        console.log('   Formatted beneficiaries:');
        beneficiaries.forEach(b => {
            console.log(`     - ${b.name} (${b.email}) - Account: ${b.hasActiveAccount ? 'Yes' : 'No'}`);
        });

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
if (require.main === module) {
    testDependentFetching()
        .then(() => {
            console.log('\n✅ Dependent fetching test completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Dependent fetching test failed:', error);
            process.exit(1);
        });
}

module.exports = { testDependentFetching };
