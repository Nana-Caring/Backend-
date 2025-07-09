// Complete fix for Transaction table issues
// This fixes both ID generation and accountId type problems

const sequelize = require('./config/database');

async function fixTransactionTable() {
  try {
    console.log('🔧 Fixing Transaction table issues...\n');

    // Check if table exists
    const tableExists = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Transactions'
      );
    `);

    if (!tableExists[0][0].exists) {
      console.log('❌ Transactions table does not exist');
      console.log('💡 Create it by running: npx sequelize-cli db:migrate');
      return;
    }

    // Check current table structure
    console.log('Checking current table structure...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Transactions'
      ORDER BY ordinal_position;
    `);

    console.log('Current columns:');
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Clear existing data to avoid conflicts
    console.log('\nClearing existing transaction data...');
    await sequelize.query('DELETE FROM "Transactions"');
    console.log('✅ Cleared existing data');

    // Drop the table to recreate with correct structure
    console.log('\nDropping table to recreate...');
    await sequelize.query('DROP TABLE IF EXISTS "Transactions" CASCADE');
    console.log('✅ Table dropped');

    // Recreate table with correct structure
    console.log('\nRecreating table with UUID primary key...');
    await sequelize.query(`
      CREATE TABLE "Transactions" (
        "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "accountId" UUID NOT NULL,
        "amount" FLOAT NOT NULL,
        "type" VARCHAR(255) NOT NULL CHECK ("type" IN ('Debit', 'Credit')),
        "description" VARCHAR(255),
        "reference" VARCHAR(255) UNIQUE,
        "metadata" JSON,
        "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY ("accountId") REFERENCES "Accounts"("id") ON DELETE CASCADE
      );
    `);
    console.log('✅ Table recreated with correct structure');

    // Create indexes for performance
    console.log('\nCreating indexes...');
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "transactions_account_id_idx" ON "Transactions"("accountId");
      CREATE INDEX IF NOT EXISTS "transactions_reference_idx" ON "Transactions"("reference");
      CREATE INDEX IF NOT EXISTS "transactions_timestamp_idx" ON "Transactions"("timestamp");
    `);
    console.log('✅ Indexes created');

    // Test the fix
    console.log('\nTesting the fix...');
    
    // Get a test account
    const [accounts] = await sequelize.query('SELECT id FROM "Accounts" LIMIT 1');
    
    if (accounts.length === 0) {
      console.log('⚠️ No accounts found for testing');
      console.log('💡 Create an account first, then test transfers');
      console.log('✅ Transaction table structure is now correct');
      return;
    }

    const testAccountId = accounts[0].id;
    console.log('Using test account:', testAccountId);

    // Test transaction creation
    const testQuery = `
      INSERT INTO "Transactions" ("accountId", "amount", "type", "description", "reference")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    
    const [result] = await sequelize.query(testQuery, {
      bind: [testAccountId, 1.00, 'Credit', 'Test transaction', `TEST_${Date.now()}`]
    });

    if (result.length > 0) {
      console.log('✅ Test transaction created successfully:', result[0].id);
      
      // Clean up test transaction
      await sequelize.query('DELETE FROM "Transactions" WHERE id = $1', {
        bind: [result[0].id]
      });
      console.log('✅ Test transaction cleaned up');
    }

    console.log('\n🎉 Transaction table fix completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ ID: Changed from INTEGER to UUID with auto-generation');
    console.log('  ✅ accountId: Changed from INTEGER to UUID');
    console.log('  ✅ Foreign key constraints: Properly set up');
    console.log('  ✅ Indexes: Created for performance');
    console.log('\n💰 You can now run money transfers without database errors!');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Solutions:');
      console.log('  1. Run migrations: npx sequelize-cli db:migrate');
      console.log('  2. Or create tables manually');
    }
    
    if (error.message.includes('permission denied')) {
      console.log('\n💡 Database permission issue:');
      console.log('  Make sure your database user has CREATE/DROP permissions');
    }
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixTransactionTable();
