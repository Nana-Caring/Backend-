#!/usr/bin/env node

require('dotenv').config();
const { User, Account } = require('../models');

async function checkEmmaAccounts() {
    try {
        console.log('🔍 CHECKING EMMA\'S ACCOUNTS');
        console.log('==============================');
        
        // Find Emma (dependent user)
        const emma = await User.findByPk(13, {
            include: [
                {
                    model: Account,
                    as: 'Accounts'
                }
            ]
        });
        
        if (!emma) {
            console.log('❌ Emma (ID: 13) not found');
            return;
        }
        
        console.log('✅ Emma found:');
        console.log(`   Name: ${emma.firstName} ${emma.middleName || ''} ${emma.surname || ''}`.trim());
        console.log(`   Email: ${emma.email}`);
        console.log(`   Role: ${emma.role}`);
        console.log(`   Accounts: ${emma.Accounts ? emma.Accounts.length : 0} accounts`);
        
        if (emma.Accounts && emma.Accounts.length > 0) {
            emma.Accounts.forEach((account, index) => {
                console.log(`\n   Account ${index + 1}:`);
                console.log(`     Name: ${account.accountName}`);
                console.log(`     Number: ${account.accountNumber}`);
                console.log(`     Type: ${account.accountType}`);
                console.log(`     Balance: ZAR ${parseFloat(account.balance || 0).toFixed(2)}`);
                console.log(`     Caregiver ID: ${account.caregiverId}`);
            });
        } else {
            console.log('   ⚠️ No accounts found for Emma');
            
            // Check if there are any accounts with caregiverId pointing to Emma
            const accountsAsCare = await Account.findAll({
                where: { caregiverId: 13 }
            });
            
            console.log(`   Accounts where Emma is caregiver: ${accountsAsCare.length}`);
        }
        
    } catch (error) {
        console.error('❌ Error checking Emma\'s accounts:', error);
    }
}

checkEmmaAccounts();
