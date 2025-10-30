const { Pool } = require('pg');

async function checkEmmaTransactions() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🔍 Checking Emma\'s transactions...\n');

    // First, get Emma's account IDs
    const emmaAccounts = await pool.query(`
      SELECT id, "accountName", "accountNumber", "accountType", category
      FROM "Accounts" 
      WHERE "accountName" LIKE '%Emma Williams%' 
      ORDER BY id
    `);

    console.log('👤 Emma\'s Accounts:');
    const accountIds = [];
    emmaAccounts.rows.forEach(account => {
      console.log(`  • ID ${account.id}: ${account.accountType} - ${account.category || 'main'} (${account.accountNumber})`);
      accountIds.push(account.id);
    });

    if (accountIds.length === 0) {
      console.log('❌ No accounts found for Emma Williams');
      return;
    }

    // Check transactions for Emma's accounts (using ANY to avoid parameter limit)
    const transactions = await pool.query(`
      SELECT 
        id, 
        "accountId", 
        amount, 
        type, 
        status,
        "recipientAccountId",
        "senderAccountId",
        description,
        "createdAt",
        "senderName",
        "recipientName"
      FROM "Transactions" 
      WHERE "accountId" = ANY($1::int[])
      OR "recipientAccountId" = ANY($1::int[])
      OR "senderAccountId" = ANY($1::int[])
      ORDER BY "createdAt" DESC
      LIMIT 20
    `, [accountIds]);

    console.log(`\n💳 Emma's Transactions (${transactions.rows.length} found):`);
    
    if (transactions.rows.length === 0) {
      console.log('   No transactions found for Emma\'s accounts');
    } else {
      transactions.rows.forEach((tx, index) => {
        console.log(`\n   ${index + 1}. Transaction ID: ${tx.id}`);
        console.log(`      Account: ${tx.accountId}`);
        console.log(`      Amount: $${tx.amount}`);
        console.log(`      Type: ${tx.type}`);
        console.log(`      Status: ${tx.status || 'N/A'}`);
        console.log(`      Description: ${tx.description || 'N/A'}`);
        console.log(`      Date: ${tx.createdAt}`);
        if (tx.senderName) console.log(`      Sender: ${tx.senderName}`);
        if (tx.recipientName) console.log(`      Recipient: ${tx.recipientName}`);
        if (tx.recipientAccountId) console.log(`      Recipient Account ID: ${tx.recipientAccountId}`);
        if (tx.senderAccountId) console.log(`      Sender Account ID: ${tx.senderAccountId}`);
      });
    }

    // Also check account balances
    console.log('\n💰 Current Account Balances:');
    for (const account of emmaAccounts.rows) {
      const balanceResult = await pool.query(`
        SELECT 
          COALESCE(SUM(CASE 
            WHEN type IN ('Credit', 'deposit', 'transfer_in') THEN amount 
            ELSE -amount 
          END), 0) as balance
        FROM "Transactions" 
        WHERE "accountId" = $1
      `, [account.id]);
      
      const balance = balanceResult.rows[0]?.balance || 0;
      console.log(`   Account ${account.id} (${account.accountType}): $${balance}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking Emma\'s transactions:', error.message);
  } finally {
    await pool.end();
  }
}

checkEmmaTransactions();