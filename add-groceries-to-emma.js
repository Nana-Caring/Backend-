const { User, Account } = require('./models');
const { generateUniqueAccountNumber } = require('./utils/generateUniqueAccountNumber');

async function addGroceriesAccountToEmma() {
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
            console.log('❌ Emma Johnson not found');
            return;
        }

        // Check if Groceries account already exists
        const existingGroceries = emma.Accounts.find(acc => acc.accountType === 'Groceries');
        if (existingGroceries) {
            console.log('✅ Groceries account already exists:', existingGroceries.accountNumber);
            return;
        }

        // Find the Main account to get caregiver info
        const mainAccount = emma.Accounts.find(acc => acc.accountType === 'Main');
        if (!mainAccount) {
            console.log('❌ Main account not found for Emma');
            return;
        }

        console.log('📊 Before adding Groceries account:');
        console.log('Current accounts:', emma.Accounts.length);
        emma.Accounts.forEach((acc, index) => {
            console.log(`  ${index + 1}. ${acc.accountType} - ${acc.accountNumber}`);
        });

        // Generate unique account number
        const accountNumber = await generateUniqueAccountNumber();

        // Create the Groceries account
        const groceriesAccount = await Account.create({
            userId: emma.id,
            accountType: 'Groceries',
            accountNumber: accountNumber,
            balance: 75.60, // Same as other category accounts
            currency: 'ZAR',
            parentAccountId: mainAccount.id,
            caregiverId: mainAccount.caregiverId,
            isActive: true,
            allocatedAmount: 75.60
        });

        console.log('\n✅ Successfully created Groceries account!');
        console.log('Account Details:');
        console.log('- Account Type:', groceriesAccount.accountType);
        console.log('- Account Number:', groceriesAccount.accountNumber);
        console.log('- Balance: R' + groceriesAccount.balance);
        console.log('- Parent Account:', mainAccount.accountNumber);
        console.log('- Caregiver ID:', groceriesAccount.caregiverId);

        // Verify the addition by checking updated account count
        const updatedEmma = await User.findOne({
            where: { email: 'dependent@demo.com' },
            include: [{
                model: Account,
                as: 'Accounts'
            }]
        });

        console.log('\n📊 After adding Groceries account:');
        console.log('Total accounts:', updatedEmma.Accounts.length);
        console.log('Account types:');
        updatedEmma.Accounts
            .sort((a, b) => a.accountType === 'Main' ? -1 : a.accountType.localeCompare(b.accountType))
            .forEach((acc, index) => {
                console.log(`  ${index + 1}. ${acc.accountType} - ${acc.accountNumber} (R${acc.balance})`);
            });

        console.log('\n🎉 Emma Johnson now has a complete 8-account structure!');

    } catch (error) {
        console.error('❌ Error adding Groceries account:', error);
    }
}

addGroceriesAccountToEmma();