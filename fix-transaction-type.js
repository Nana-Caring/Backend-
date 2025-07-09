// Quick fix for Transaction accountId type mismatch
// Run this to fix the database issue immediately

const { Transaction, Account } = require('./models');
const sequelize = require('./config/database');

async function fixTransactionAccountIdType() {
  try {
    console.log('🔧 Fixing Transaction accountId type mismatch...\n');

    // Check current Transaction table structure
    console.log('Checking current table structure...');
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Transactions' 
      AND column_name = 'accountId'
    `);

    if (results.length > 0) {
      console.log('Current accountId column:', results[0]);
      
      if (results[0].data_type === 'integer') {
        console.log('❌ Found INTEGER type - needs to be changed to UUID');
        
        // Drop foreign key constraint first
        console.log('Dropping foreign key constraint...');
        await sequelize.query(`
          ALTER TABLE "Transactions" 
          DROP CONSTRAINT IF EXISTS "Transactions_accountId_fkey"
        `);
        
        // Change column type
        console.log('Changing accountId column type to UUID...');
        await sequelize.query(`
          ALTER TABLE "Transactions" 
          ALTER COLUMN "accountId" TYPE UUID USING "accountId"::text::uuid
        `);
        
        // Add foreign key constraint back
        console.log('Adding foreign key constraint back...');
        await sequelize.query(`
          ALTER TABLE "Transactions" 
          ADD CONSTRAINT "Transactions_accountId_fkey" 
          FOREIGN KEY ("accountId") REFERENCES "Accounts"("id") ON DELETE CASCADE
        `);
        
        console.log('✅ Transaction table fixed!');
      } else {
        console.log('✅ accountId is already UUID type');
      }
    } else {
      console.log('ℹ️ Transactions table or accountId column not found');
    }

    // Test the fix
    console.log('\nTesting the fix...');
    const testAccount = await Account.findOne({ limit: 1 });
    
    if (testAccount) {
      console.log('Test account found:', testAccount.id);
      console.log('Account ID type:', typeof testAccount.id);
      
      // This should now work without error
      const testTransaction = {
        accountId: testAccount.id,
        amount: 1.00,
        type: 'Credit',
        description: 'Test transaction for fix verification',
        reference: `TEST_${Date.now()}`
      };
      
      console.log('Creating test transaction...');
      const transaction = await Transaction.create(testTransaction);
      console.log('✅ Test transaction created successfully:', transaction.id);
      
      // Clean up test transaction
      await transaction.destroy();
      console.log('✅ Test transaction cleaned up');
    }

    console.log('\n🎉 Fix completed successfully!');
    console.log('You can now run money transfers without database errors.');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('invalid input syntax for type uuid')) {
      console.log('\n💡 The database might have existing integer data.');
      console.log('You may need to clear the Transactions table first:');
      console.log('DELETE FROM "Transactions";');
    }
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixTransactionAccountIdType();
