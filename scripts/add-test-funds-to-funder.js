#!/usr/bin/env node

require('dotenv').config();
const { User, Account, Transaction, sequelize } = require('../models');

async function addTestFundsToFunder() {
    try {
        console.log('💰 ADDING TEST FUNDS TO FUNDER ACCOUNT');
        console.log('======================================');
        
        // Get funder (John Smith, ID: 12)
        const funder = await User.findByPk(12, {
            include: [
                {
                    model: Account,
                    as: 'Accounts',
                    where: { accountType: 'Main' }
                }
            ]
        });
        
        if (!funder || !funder.Accounts || funder.Accounts.length === 0) {
            console.log('❌ Funder main account not found');
            return;
        }
        
        const funderAccount = funder.Accounts[0];
        console.log('✅ Funder found:');
        console.log(`   Name: ${funder.firstName} ${funder.surname}`);
        console.log(`   Account: ${funderAccount.accountNumber}`);
        console.log(`   Current Balance: ZAR ${parseFloat(funderAccount.balance || 0).toFixed(2)}`);
        
        // Add R100.00 for testing
        const testAmount = 100.00;
        const newBalance = parseFloat(funderAccount.balance || 0) + testAmount;
        
        const transaction = await sequelize.transaction();
        
        try {
            // Update account balance
            await funderAccount.update(
                { balance: newBalance },
                { transaction }
            );
            
            // Create transaction record
            await Transaction.create({
                accountId: funderAccount.id,
                type: 'Credit',
                amount: testAmount,
                description: 'Test deposit for funder system testing',
                reference: `TEST-${Date.now()}`
            }, { transaction });
            
            await transaction.commit();
            
            console.log('✅ Test funds added successfully!');
            console.log(`   Amount added: ZAR ${testAmount.toFixed(2)}`);
            console.log(`   New balance: ZAR ${newBalance.toFixed(2)}`);
            console.log('');
            console.log('🎯 Now you can test transfers to beneficiaries!');
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Error adding test funds:', error);
    }
}

addTestFundsToFunder();
