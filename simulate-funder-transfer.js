const { Pool } = require('pg');

async function simulateFunderTransferToEmma() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('💸 Simulating Funder Transfer to Emma Williams...\n');

    // First, let's check if there are ANY transactions in the system
    const allTransactions = await pool.query(`
      SELECT COUNT(*) as total FROM "Transactions"
    `);
    console.log(`📊 Total transactions in system: ${allTransactions.rows[0].total}`);

    // Check if there are transactions for other users
    const otherTransactions = await pool.query(`
      SELECT t.*, a."accountName" 
      FROM "Transactions" t
      JOIN "Accounts" a ON t."accountId" = a.id
      ORDER BY t."createdAt" DESC
      LIMIT 5
    `);

    if (otherTransactions.rows.length > 0) {
      console.log('\n📋 Recent transactions in system:');
      otherTransactions.rows.forEach((tx, i) => {
        console.log(`  ${i+1}. Account: ${tx.accountName} | Amount: $${tx.amount} | Type: ${tx.type}`);
      });
    }

    // Get Emma's main account (dependent type)
    const emmaMainAccount = await pool.query(`
      SELECT * FROM "Accounts" 
      WHERE "accountName" LIKE '%Emma Williams%' 
      AND "accountType" = 'dependent'
      LIMIT 1
    `);

    if (emmaMainAccount.rows.length === 0) {
      console.log('❌ Emma\'s main account not found');
      return;
    }

    const emmaAccount = emmaMainAccount.rows[0];
    console.log(`\n👤 Found Emma's main account: ID ${emmaAccount.id} (${emmaAccount.accountNumber})`);

    // Get a funder account (assuming Sarah is the funder)
    const funderAccount = await pool.query(`
      SELECT * FROM "Accounts" 
      WHERE "accountName" LIKE '%Sarah%' 
      AND "accountType" = 'primary'
      LIMIT 1
    `);

    if (funderAccount.rows.length === 0) {
      console.log('❌ No funder account found');
      return;
    }

    const funder = funderAccount.rows[0];
    console.log(`💼 Found funder account: ID ${funder.id} (${funder.accountName})`);

    // Create a transfer from funder to Emma
    const transferAmount = 500.00;
    const emergencyAmount = transferAmount * 0.20; // 20% to emergency fund
    const categoryAmount = transferAmount * 0.80;  // 80% to categories

    console.log(`\n💰 Creating transfer of $${transferAmount}:`);
    console.log(`  • Emergency Fund: $${emergencyAmount} (20%)`);
    console.log(`  • Category Distribution: $${categoryAmount} (80%)`);

    // 1. Create the main transfer_in transaction to Emma's main account
    const mainTransfer = await pool.query(`
      INSERT INTO "Transactions" (
        "accountId", amount, type, status, 
        "senderAccountId", "recipientAccountId",
        description, "senderName", "recipientName",
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, 'transfer_in', 'completed',
        $3, $1,
        'Funder transfer with smart distribution',
        $4, $5,
        NOW(), NOW()
      ) RETURNING id
    `, [
      emmaAccount.id, 
      transferAmount, 
      funder.id,
      funder.accountName,
      emmaAccount.accountName
    ]);

    console.log(`✅ Created main transfer transaction: ID ${mainTransfer.rows[0].id}`);

    // 2. Get Emma's category accounts for distribution
    const categoryAccounts = await pool.query(`
      SELECT * FROM "Accounts" 
      WHERE "accountName" LIKE '%Emma Williams%' 
      AND "accountType" = 'category'
      AND category IS NOT NULL
      ORDER BY category
    `);

    console.log(`\n📂 Found ${categoryAccounts.rows.length} category accounts for distribution`);

    if (categoryAccounts.rows.length > 0) {
      const amountPerCategory = categoryAmount / categoryAccounts.rows.length;

      for (const categoryAccount of categoryAccounts.rows) {
        await pool.query(`
          INSERT INTO "Transactions" (
            "accountId", amount, type, status,
            "senderAccountId", "recipientAccountId", 
            description, "senderName", "recipientName",
            "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, 'transfer_in', 'completed',
            $3, $1,
            $4, $5, $6,
            NOW(), NOW()
          )
        `, [
          categoryAccount.id,
          amountPerCategory,
          emmaAccount.id,
          `Auto-distribution to ${categoryAccount.category}`,
          'Smart Distribution System',
          categoryAccount.accountName
        ]);
      }

      console.log(`✅ Distributed $${amountPerCategory.toFixed(2)} to each of ${categoryAccounts.rows.length} categories`);
    }

    // 3. Create emergency fund allocation (20%)
    const emergencyAccount = await pool.query(`
      SELECT * FROM "Accounts" 
      WHERE "accountName" LIKE '%Emma Williams%' 
      AND ("accountNumber" LIKE '%EME%' OR category = 'Emergency')
      LIMIT 1
    `);

    if (emergencyAccount.rows.length > 0) {
      await pool.query(`
        INSERT INTO "Transactions" (
          "accountId", amount, type, status,
          "senderAccountId", "recipientAccountId",
          description, "senderName", "recipientName", 
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, 'transfer_in', 'completed',
          $3, $1,
          'Emergency fund allocation (20%)', 
          'Smart Distribution System', $4,
          NOW(), NOW()
        )
      `, [
        emergencyAccount.rows[0].id,
        emergencyAmount,
        emmaAccount.id,
        emergencyAccount.rows[0].accountName
      ]);
      
      console.log(`✅ Allocated $${emergencyAmount} to emergency fund`);
    } else {
      // Allocate to main account if no emergency account found
      await pool.query(`
        INSERT INTO "Transactions" (
          "accountId", amount, type, status,
          description, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, 'deposit', 'completed',
          'Emergency fund allocation (20%) - to main account',
          NOW(), NOW()
        )
      `, [emmaAccount.id, emergencyAmount]);
      
      console.log(`✅ Allocated $${emergencyAmount} to main account (emergency fund)`);
    }

    console.log('\n🎉 Funder transfer with smart distribution completed successfully!');
    
  } catch (error) {
    console.error('❌ Error simulating funder transfer:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

simulateFunderTransferToEmma();