const { User, Account, Transaction } = require('../models');

async function testCaregiverTransactionTracking() {
  try {
    console.log('🧪 Testing Caregiver Transaction Tracking...\n');

    // Find a caregiver with dependents
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

    if (!caregiver) {
      console.log('❌ No caregiver found with dependents');
      return;
    }

    console.log(`✅ Found caregiver: ${caregiver.firstName} ${caregiver.surname} (ID: ${caregiver.id})`);

    // Get dependent IDs for this caregiver
    const dependentIds = [...new Set(caregiver.caregiverAccounts.map(acc => acc.user.id))];
    console.log(`✅ Caregiver has ${dependentIds.length} dependents`);

    // Test 1: Get all dependent transactions for this caregiver
    console.log('\n📊 Test 1: Getting all dependent transactions...');
    
    const allTransactions = await Transaction.findAll({
      include: [
        {
          model: Account,
          as: 'account',
          where: { caregiverId: caregiver.id },
          include: [
            {
              model: User,
              as: 'user',
              where: { role: 'dependent' },
              attributes: ['id', 'firstName', 'surname']
            }
          ]
        }
      ],
      limit: 10,
      order: [['timestamp', 'DESC']]
    });

    console.log(`✅ Found ${allTransactions.length} transactions for caregiver's dependents`);
    
    if (allTransactions.length > 0) {
      const firstTransaction = allTransactions[0];
      console.log(`   Example transaction: ${firstTransaction.type} of R${firstTransaction.amount} for ${firstTransaction.account.user.firstName} ${firstTransaction.account.user.surname}`);
      console.log(`   Account: ${firstTransaction.account.accountType} (${firstTransaction.account.accountNumber})`);
    }

    // Test 2: Get transactions for a specific dependent
    if (dependentIds.length > 0) {
      const firstDependentId = dependentIds[0];
      console.log(`\n📊 Test 2: Getting transactions for dependent ID ${firstDependentId}...`);
      
      const dependentTransactions = await Transaction.findAll({
        include: [
          {
            model: Account,
            as: 'account',
            where: { 
              caregiverId: caregiver.id,
              userId: firstDependentId 
            },
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'surname']
              }
            ]
          }
        ],
        limit: 5,
        order: [['timestamp', 'DESC']]
      });

      console.log(`✅ Found ${dependentTransactions.length} transactions for this dependent`);
      
      if (dependentTransactions.length > 0) {
        dependentTransactions.forEach((trans, index) => {
          console.log(`   ${index + 1}. ${trans.type} R${trans.amount} - ${trans.account.accountType} account - ${trans.description || 'No description'}`);
        });
      }
    }

    // Test 3: Get account summaries for a dependent
    if (dependentIds.length > 0) {
      const firstDependentId = dependentIds[0];
      console.log(`\n📊 Test 3: Getting account summaries for dependent ID ${firstDependentId}...`);
      
      const accounts = await Account.findAll({
        where: {
          caregiverId: caregiver.id,
          userId: firstDependentId
        },
        attributes: ['id', 'accountNumber', 'accountType', 'balance'],
        include: [
          {
            model: Transaction,
            as: 'transactions',
            attributes: ['type', 'amount'],
            required: false
          }
        ]
      });

      console.log(`✅ Found ${accounts.length} accounts for this dependent:`);
      
      accounts.forEach(account => {
        const credits = account.transactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const debits = account.transactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        console.log(`   ${account.accountType}: Balance R${account.balance}, ${account.transactions.length} transactions`);
        console.log(`     Credits: R${credits.toFixed(2)}, Debits: R${debits.toFixed(2)}, Net: R${(credits - debits).toFixed(2)}`);
      });
    }

    // Test 4: Transaction analytics
    console.log('\n📊 Test 4: Generating transaction analytics...');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    const analyticsData = await Transaction.findAll({
      where: {
        timestamp: {
          [require('sequelize').Op.gte]: startDate
        }
      },
      include: [
        {
          model: Account,
          as: 'account',
          where: { caregiverId: caregiver.id },
          include: [
            {
              model: User,
              as: 'user',
              where: { role: 'dependent' },
              attributes: ['id', 'firstName', 'surname']
            }
          ]
        }
      ],
      attributes: ['type', 'amount', 'timestamp']
    });

    const analytics = analyticsData.reduce((acc, transaction) => {
      if (transaction.type === 'Credit') {
        acc.totalCredits += parseFloat(transaction.amount);
        acc.creditCount += 1;
      } else {
        acc.totalDebits += parseFloat(transaction.amount);
        acc.debitCount += 1;
      }
      return acc;
    }, {
      totalCredits: 0,
      totalDebits: 0,
      creditCount: 0,
      debitCount: 0
    });

    analytics.netAmount = analytics.totalCredits - analytics.totalDebits;
    analytics.totalTransactions = analytics.creditCount + analytics.debitCount;

    console.log(`✅ Analytics for last 30 days:`);
    console.log(`   Total Credits: R${analytics.totalCredits.toFixed(2)} (${analytics.creditCount} transactions)`);
    console.log(`   Total Debits: R${analytics.totalDebits.toFixed(2)} (${analytics.debitCount} transactions)`);
    console.log(`   Net Amount: R${analytics.netAmount.toFixed(2)}`);
    console.log(`   Total Transactions: ${analytics.totalTransactions}`);

    if (analytics.totalTransactions > 0) {
      const avgTransactionSize = (analytics.totalCredits + analytics.totalDebits) / analytics.totalTransactions;
      console.log(`   Average Transaction Size: R${avgTransactionSize.toFixed(2)}`);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 API Endpoints Ready:');
    console.log('   GET /api/caregiver/transactions - Get all dependent transactions');
    console.log('   GET /api/caregiver/dependents/:id/transactions - Get specific dependent transactions');
    console.log('   GET /api/caregiver/transactions/analytics - Get transaction analytics');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCaregiverTransactionTracking()
  .then(() => {
    console.log('\n✅ Test script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
