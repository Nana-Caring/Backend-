#!/usr/bin/env node

require('dotenv').config();
const { User, Account, Transaction, sequelize } = require('../models');

async function simulateSuccessfulDeposit() {
  console.log('💰 SIMULATING SUCCESSFUL FUNDER DEPOSIT');
  console.log('======================================\n');

  try {
    // Find funder (John Smith, ID: 12)
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
      console.log('❌ Funder or funder account not found');
      return;
    }

    const funderAccount = funder.Accounts[0];
    console.log('✅ Funder found:', funder.firstName, funder.surname);
    console.log('   Current balance:', `ZAR ${parseFloat(funderAccount.balance || 0).toFixed(2)}`);
    console.log('   Account Number:', funderAccount.accountNumber);

    // Add R100.00 to simulate successful Stripe deposit
    const depositAmount = 100.00;
    const newBalance = parseFloat(funderAccount.balance || 0) + depositAmount;

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
        amount: depositAmount,
        description: `Simulated Stripe deposit - demo_payment_${Date.now()}`,
        reference: `demo_pi_${Date.now()}`
      }, { transaction });

      await transaction.commit();

      console.log('✅ Deposit simulation successful!');
      console.log('   Amount deposited:', `ZAR ${depositAmount.toFixed(2)}`);
      console.log('   New balance:', `ZAR ${newBalance.toFixed(2)}`);
      console.log('\n💡 Now you can test transfers to beneficiaries!');
      console.log('   Run: node scripts/test-complete-funder-flow.js');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error simulating deposit:', error);
  }
}

simulateSuccessfulDeposit();
