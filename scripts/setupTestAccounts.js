const { User, Account, Transaction } = require('../models');
const { generateUniqueAccountNumber } = require('../utils/generateUniqueAccountNumber');

async function setupTestUserAccounts() {
  try {
    const testUser = await User.findOne({ 
      where: { email: 'test.dependent@demo.com' } 
    });
    
    if (!testUser) {
      console.log('Test user not found. Please run createTestUser.js first.');
      process.exit(1);
    }

    console.log(`Setting up accounts for user: ${testUser.firstName} ${testUser.surname}`);

    // Check if accounts already exist
    const existingAccounts = await Account.findAll({ 
      where: { userId: testUser.id } 
    });
    
    if (existingAccounts.length > 0) {
      console.log('Accounts already exist for this user:');
      existingAccounts.forEach(acc => {
        console.log(`- ${acc.accountName}: R${acc.balance} (${acc.category || 'main'})`);
      });
      
      // Create some test transactions
      await createTestTransactions(existingAccounts);
      process.exit(0);
    }

    // Create main account
    const mainAccount = await Account.create({
      userId: testUser.id,
      accountNumber: await generateUniqueAccountNumber(),
      accountName: `${testUser.firstName} ${testUser.surname} - Main Savings`,
      balance: 1500.00,
      accountType: 'savings',
      category: null,
      isMainAccount: true,
      status: 'active'
    });

    // Create category accounts
    const categories = [
      { name: 'Healthcare', percentage: 25, balance: 375.00 },
      { name: 'Groceries', percentage: 30, balance: 450.00 },
      { name: 'Education', percentage: 20, balance: 300.00 },
      { name: 'Transport', percentage: 15, balance: 225.00 },
      { name: 'Entertainment', percentage: 5, balance: 75.00 },
      { name: 'Other', percentage: 5, balance: 75.00 }
    ];

    const categoryAccounts = [];
    for (const category of categories) {
      const account = await Account.create({
        userId: testUser.id,
        accountNumber: await generateUniqueAccountNumber(),
        accountName: `${testUser.firstName} ${testUser.surname} - ${category.name}`,
        balance: category.balance,
        accountType: 'category',
        category: category.name.toLowerCase(),
        isMainAccount: false,
        status: 'active'
      });
      categoryAccounts.push(account);
    }

    console.log('✅ Accounts created successfully!');
    console.log('Main Account:', `R${mainAccount.balance}`);
    categoryAccounts.forEach(acc => {
      console.log(`${acc.category}: R${acc.balance}`);
    });

    // Create some test transactions
    await createTestTransactions([mainAccount, ...categoryAccounts]);

    process.exit(0);
  } catch (error) {
    console.error('Error setting up test accounts:', error.message);
    process.exit(1);
  }
}

async function createTestTransactions(accounts) {
  console.log('\n📊 Creating test transactions...');
  
  const mainAccount = accounts.find(acc => acc.isMainAccount);
  const groceryAccount = accounts.find(acc => acc.category === 'groceries');
  const healthcareAccount = accounts.find(acc => acc.category === 'healthcare');
  
  const testTransactions = [];
  
  // Deposit transaction
  if (mainAccount) {
    testTransactions.push({
      accountId: mainAccount.id,
      amount: 500.00,
      type: 'Credit',
      description: 'Deposit from funder',
      reference: 'DEPOSIT_123456',
      metadata: { source: 'funder', distributedToCategories: true }
    });
  }

  // Purchase transactions
  if (groceryAccount) {
    testTransactions.push({
      accountId: groceryAccount.id,
      amount: 85.50,
      type: 'Debit',
      description: 'Grocery shopping - Fresh produce',
      reference: 'ORDER_789',
      metadata: { orderNumber: 'ORD1698123456', storeCode: 'GRC12345' }
    });
  }

  if (healthcareAccount) {
    testTransactions.push({
      accountId: healthcareAccount.id,
      amount: 45.00,
      type: 'Debit',
      description: 'Pharmacy - Vitamins',
      reference: 'ORDER_790',
      metadata: { orderNumber: 'ORD1698123457', storeCode: 'HC78901' }
    });
  }

  // Create the transactions
  for (const txnData of testTransactions) {
    try {
      const txn = await Transaction.create(txnData);
      console.log(`✅ Created ${txn.type} transaction: ${txn.description} (R${txn.amount})`);
    } catch (error) {
      console.warn(`⚠️ Could not create transaction: ${error.message}`);
    }
  }
}

setupTestUserAccounts();
