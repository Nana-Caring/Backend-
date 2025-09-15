const { User, Account, Transaction } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function createSampleTransactions() {
  try {
    console.log('🎯 Creating sample transactions for testing...\n');

    // Find caregiver and their dependents
    const caregiver = await User.findOne({
      where: { role: 'caregiver' },
      include: [{
        model: Account,
        as: 'caregiverAccounts',
        include: [{
          model: User,
          as: 'user',
          where: { role: 'dependent' }
        }]
      }]
    });

    if (!caregiver || caregiver.caregiverAccounts.length === 0) {
      console.log('❌ No caregiver with dependents found');
      return;
    }

    console.log(`✅ Using caregiver: ${caregiver.firstName} ${caregiver.surname}`);

    // Get first dependent and their accounts
    const firstDependent = caregiver.caregiverAccounts[0].user;
    console.log(`✅ Creating transactions for dependent: ${firstDependent.firstName} ${firstDependent.surname}`);

    const dependentAccounts = await Account.findAll({
      where: { 
        caregiverId: caregiver.id,
        userId: firstDependent.id 
      }
    });

    console.log(`✅ Found ${dependentAccounts.length} accounts for this dependent`);

    // Create sample transactions for different account types
    const sampleTransactions = [
      // Main account transactions
      {
        accountType: 'Main',
        amount: 1000,
        type: 'Credit',
        description: 'Monthly allowance',
        daysAgo: 30
      },
      {
        accountType: 'Main',
        amount: 200,
        type: 'Debit',
        description: 'ATM withdrawal',
        daysAgo: 25
      },
      {
        accountType: 'Main',
        amount: 500,
        type: 'Credit',
        description: 'Bonus allowance',
        daysAgo: 20
      },
      
      // Education account transactions
      {
        accountType: 'Education',
        amount: 300,
        type: 'Credit',
        description: 'Education fund deposit',
        daysAgo: 28
      },
      {
        accountType: 'Education',
        amount: 150,
        type: 'Debit',
        description: 'School supplies purchase',
        daysAgo: 15
      },
      {
        accountType: 'Education',
        amount: 80,
        type: 'Debit',
        description: 'Textbook purchase',
        daysAgo: 10
      },

      // Healthcare account transactions
      {
        accountType: 'Healthcare',
        amount: 250,
        type: 'Credit',
        description: 'Healthcare fund allocation',
        daysAgo: 25
      },
      {
        accountType: 'Healthcare',
        amount: 120,
        type: 'Debit',
        description: 'Doctor visit',
        daysAgo: 18
      },

      // Entertainment account transactions
      {
        accountType: 'Entertainment',
        amount: 100,
        type: 'Credit',
        description: 'Entertainment allowance',
        daysAgo: 22
      },
      {
        accountType: 'Entertainment',
        amount: 45,
        type: 'Debit',
        description: 'Cinema tickets',
        daysAgo: 12
      },
      {
        accountType: 'Entertainment',
        amount: 30,
        type: 'Debit',
        description: 'Gaming purchase',
        daysAgo: 8
      },

      // Clothing account transactions
      {
        accountType: 'Clothing',
        amount: 400,
        type: 'Credit',
        description: 'Clothing fund deposit',
        daysAgo: 26
      },
      {
        accountType: 'Clothing',
        amount: 180,
        type: 'Debit',
        description: 'Shoes purchase',
        daysAgo: 14
      },

      // Savings account transactions
      {
        accountType: 'Savings',
        amount: 200,
        type: 'Credit',
        description: 'Monthly savings',
        daysAgo: 30
      },
      {
        accountType: 'Savings',
        amount: 150,
        type: 'Credit',
        description: 'Bonus savings',
        daysAgo: 15
      }
    ];

    let createdCount = 0;

    for (const sampleTx of sampleTransactions) {
      // Find the account for this transaction
      const account = dependentAccounts.find(acc => acc.accountType === sampleTx.accountType);
      
      if (account) {
        // Create timestamp based on days ago
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - sampleTx.daysAgo);

        // Create the transaction
        const transaction = await Transaction.create({
          id: uuidv4(),
          accountId: account.id,
          amount: sampleTx.amount,
          type: sampleTx.type,
          description: sampleTx.description,
          reference: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          timestamp: timestamp,
          metadata: {
            createdBy: 'sample-data-script',
            category: sampleTx.accountType.toLowerCase()
          }
        });

        // Update account balance
        if (sampleTx.type === 'Credit') {
          account.balance = parseFloat(account.balance) + sampleTx.amount;
        } else {
          account.balance = parseFloat(account.balance) - sampleTx.amount;
        }
        await account.save();

        console.log(`✅ Created ${sampleTx.type} transaction: R${sampleTx.amount} for ${sampleTx.accountType} account`);
        createdCount++;
      } else {
        console.log(`⚠️  Account not found for type: ${sampleTx.accountType}`);
      }
    }

    console.log(`\n🎉 Created ${createdCount} sample transactions!`);

    // Show updated account balances
    console.log('\n💰 Updated account balances:');
    const updatedAccounts = await Account.findAll({
      where: { 
        caregiverId: caregiver.id,
        userId: firstDependent.id 
      },
      order: [['accountType', 'ASC']]
    });

    updatedAccounts.forEach(account => {
      console.log(`   ${account.accountType}: R${parseFloat(account.balance).toFixed(2)}`);
    });

    console.log('\n🧪 Now you can test the APIs:');
    console.log(`   Caregiver ID: ${caregiver.id}`);
    console.log(`   Dependent ID: ${firstDependent.id}`);
    console.log('   Use these IDs in your frontend to test transaction tracking!');

  } catch (error) {
    console.error('❌ Error creating sample transactions:', error);
  }
}

createSampleTransactions()
  .then(() => {
    console.log('\n✅ Sample data creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Sample data creation failed:', error);
    process.exit(1);
  });
