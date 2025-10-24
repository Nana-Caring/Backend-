#!/usr/bin/env node

require('dotenv').config();
const { User, Account } = require('../models');

async function checkFunderAccount() {
    try {
        console.log('🔍 CHECKING FUNDER ACCOUNT SETUP');
        console.log('================================');
        
        // Find John (funder)
        const funder = await User.findByPk(12, {
            include: [
                {
                    model: Account,
                    as: 'Accounts'
                }
            ]
        });
        
        if (!funder) {
            console.log('❌ Funder (ID: 12) not found');
            return;
        }
        
        console.log('✅ Funder found:');
        console.log(`   Name: ${funder.firstName} ${funder.surname}`);
        console.log(`   Email: ${funder.email}`);
        console.log(`   Role: ${funder.role}`);
        console.log(`   Accounts: ${funder.Accounts ? funder.Accounts.length : 0} accounts`);
        
        if (funder.Accounts && funder.Accounts.length > 0) {
            console.log('\n   📋 Existing accounts:');
            funder.Accounts.forEach((account, index) => {
                console.log(`     ${index + 1}. ${account.accountType} (${account.accountNumber})`);
                console.log(`        Balance: ZAR ${parseFloat(account.balance || 0).toFixed(2)}`);
                console.log(`        User ID: ${account.userId}`);
            });
        } else {
            console.log('\n   ⚠️ No accounts found for funder');
            console.log('   💡 Funder needs a Main account for deposits and transfers');
            
            // Create Main account for funder
            console.log('\n   🔧 Creating Main account for funder...');
            
            const generateAccountNumber = () => {
                return Math.floor(1000000000 + Math.random() * 9000000000).toString();
            };
            
            const newAccount = await Account.create({
                userId: funder.id,
                accountType: 'Main',
                accountNumber: generateAccountNumber(),
                balance: 0.00,
                currency: 'ZAR',
                status: 'active'
            });
            
            console.log('   ✅ Main account created successfully!');
            console.log(`      Account Number: ${newAccount.accountNumber}`);
            console.log(`      Account Type: ${newAccount.accountType}`);
            console.log(`      Balance: ZAR ${parseFloat(newAccount.balance).toFixed(2)}`);
        }
        
    } catch (error) {
        console.error('❌ Error checking funder account:', error);
    }
}

checkFunderAccount();
