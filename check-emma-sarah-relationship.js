const { User, Account } = require('./models');

async function checkEmmaSarahRelationship() {
    try {
        // Find Emma Johnson
        const emma = await User.findOne({
            where: { email: 'dependent@demo.com' },
            include: [{
                model: Account,
                as: 'Accounts'
            }]
        });

        // Find Sarah (caregiver)
        const sarah = await User.findOne({
            where: { email: 'caregiver@demo.com' }
        });

        if (!emma || !sarah) {
            console.log('❌ Could not find Emma or Sarah');
            console.log('Emma found:', !!emma);
            console.log('Sarah found:', !!sarah);
            return;
        }

        console.log('=== EMMA & SARAH RELATIONSHIP ANALYSIS ===\n');

        console.log('👤 EMMA DETAILS:');
        console.log('- ID:', emma.id);
        console.log('- Name:', emma.firstName, emma.surname);
        console.log('- Email:', emma.email);
        console.log('- Role:', emma.role);
        console.log('- Total Accounts:', emma.Accounts.length);

        console.log('\n👤 SARAH DETAILS:');
        console.log('- ID:', sarah.id);
        console.log('- Name:', sarah.firstName, sarah.surname);
        console.log('- Email:', sarah.email);
        console.log('- Role:', sarah.role);

        // Check Emma's accounts to see if Sarah is the caregiver
        console.log('\n🔗 CAREGIVER RELATIONSHIP CHECK:');
        
        if (emma.Accounts.length > 0) {
            const mainAccount = emma.Accounts.find(acc => acc.accountType === 'Main');
            
            if (mainAccount && mainAccount.caregiverId) {
                console.log('- Emma\'s Main Account Caregiver ID:', mainAccount.caregiverId);
                console.log('- Sarah\'s User ID:', sarah.id);
                
                if (mainAccount.caregiverId === sarah.id) {
                    console.log('✅ YES - Emma is a dependent of Sarah!');
                    console.log('- Sarah is Emma\'s assigned caregiver');
                } else {
                    console.log('❌ NO - Emma is NOT a dependent of Sarah');
                    console.log('- Emma has a different caregiver');
                    
                    // Find who Emma's actual caregiver is
                    const actualCaregiver = await User.findByPk(mainAccount.caregiverId);
                    if (actualCaregiver) {
                        console.log('- Emma\'s actual caregiver:', actualCaregiver.firstName, actualCaregiver.surname, `(${actualCaregiver.email})`);
                    }
                }
            } else {
                console.log('❌ Emma\'s main account has no assigned caregiver');
            }
        } else {
            console.log('❌ Emma has no accounts to check caregiver relationship');
        }

        // Also check all of Emma's accounts for consistency
        console.log('\n📋 ALL EMMA\'S ACCOUNTS CAREGIVER CHECK:');
        emma.Accounts.forEach((account, index) => {
            console.log(`${index + 1}. ${account.accountType} (${account.accountNumber})`);
            console.log(`   Caregiver ID: ${account.caregiverId || 'Not set'}`);
            console.log(`   Matches Sarah: ${account.caregiverId === sarah.id ? '✅ YES' : '❌ NO'}`);
        });

        // Check if Sarah manages any accounts for Emma
        const sarahManagedAccounts = await Account.findAll({
            where: { 
                userId: emma.id,
                caregiverId: sarah.id 
            }
        });

        console.log('\n📊 SUMMARY:');
        console.log(`- Accounts Sarah manages for Emma: ${sarahManagedAccounts.length}/${emma.Accounts.length}`);
        
        if (sarahManagedAccounts.length === emma.Accounts.length && sarahManagedAccounts.length > 0) {
            console.log('✅ CONFIRMED: Sarah is Emma\'s primary caregiver (manages all accounts)');
        } else if (sarahManagedAccounts.length > 0) {
            console.log('⚠️  PARTIAL: Sarah manages some but not all of Emma\'s accounts');
        } else {
            console.log('❌ CONFIRMED: Sarah does NOT manage any of Emma\'s accounts');
        }

    } catch (error) {
        console.error('❌ Error checking relationship:', error);
    }
}

checkEmmaSarahRelationship();