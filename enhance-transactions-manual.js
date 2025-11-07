const { Pool } = require('pg');
require('dotenv').config();

async function enhanceTransactionsTable() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('Adding balanceAfter column...');
    await pool.query(`
      ALTER TABLE "Transactions" 
      ADD COLUMN IF NOT EXISTS "balanceAfter" FLOAT;
    `);

    console.log('Adding status column...');
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_transactions_status') THEN
          CREATE TYPE enum_transactions_status AS ENUM('pending', 'completed', 'failed', 'cancelled');
        END IF;
      END $$;
    `);
    
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Transactions' AND column_name = 'status') THEN
          ALTER TABLE "Transactions" ADD COLUMN "status" enum_transactions_status DEFAULT 'completed';
        END IF;
      END $$;
    `);

    console.log('Adding recipientAccountId column...');
    await pool.query(`
      ALTER TABLE "Transactions" 
      ADD COLUMN IF NOT EXISTS "recipientAccountId" INTEGER 
      REFERENCES "Accounts"(id);
    `);

    console.log('Adding senderAccountId column...');
    await pool.query(`
      ALTER TABLE "Transactions" 
      ADD COLUMN IF NOT EXISTS "senderAccountId" INTEGER 
      REFERENCES "Accounts"(id);
    `);

    console.log('Updating transaction type enum...');
    await pool.query(`
      ALTER TYPE "enum_Transactions_type" 
      ADD VALUE IF NOT EXISTS 'deposit';
    `);
    
    await pool.query(`
      ALTER TYPE "enum_Transactions_type" 
      ADD VALUE IF NOT EXISTS 'transfer_out';
    `);
    
    await pool.query(`
      ALTER TYPE "enum_Transactions_type" 
      ADD VALUE IF NOT EXISTS 'transfer_in';
    `);

    console.log('✅ Transaction table enhancement completed successfully!');
    
  } catch (error) {
    console.error('❌ Error enhancing transactions table:', error.message);
  } finally {
    await pool.end();
  }
}

enhanceTransactionsTable();