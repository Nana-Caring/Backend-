const { User, Account } = require('./models');

async function checkEmmaAccounts() {
    try {
        // Find Emma Johnson
        const emma = await User.findOne({
            where: { email: 'dependent@demo.com' },
            include: [{
                model: Account,
                as: 'Accounts'
            }]
        });

        if (!emma) {
            console.log('Emma Johnson not found');
            return;
        }

        console.log('\n=== EMMA JOHNSON ACCOUNT ANALYSIS ===');
        console.log('User ID:', emma.id);
        console.log('Email:', emma.email);
        console.log('Role:', emma.role);
        console.log('Total Accounts:', emma.Accounts.length);
        
        console.log('\nCurrent Accounts:');
        emma.Accounts.forEach((account, index) => {
            console.log(`${index + 1}. ${account.accountType} - ${account.accountNumber} (Balance: R${account.balance})`);
        });

        // Check what account types are missing
        const currentTypes = emma.Accounts.map(acc => acc.accountType);
        const requiredTypes = ['Main', 'Healthcare', 'Groceries', 'Education', 'Clothing', 'Baby Care', 'Entertainment', 'Pregnancy'];
        const missingTypes = requiredTypes.filter(type => !currentTypes.includes(type));

        console.log('\nMissing Account Types:');
        if (missingTypes.length > 0) {
            missingTypes.forEach(type => console.log(`- ${type}`));
        } else {
            console.log('None - Emma has all required accounts');
        }

    } catch (error) {
        console.error('Error checking Emma accounts:', error);
    }
}

checkEmmaAccounts();