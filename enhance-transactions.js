require('dotenv').config();
const { Client } = require('pg');

async function enhanceTransactionsTable() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    // Check if columns exist before adding them
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Transactions' 
      AND column_name IN ('description', 'reference', 'metadata');
    `);

    const existingColumns = columnCheck.rows.map(row => row.column_name);

    if (!existingColumns.includes('description')) {
      await client.query('ALTER TABLE "Transactions" ADD COLUMN description VARCHAR(255);');
      console.log('✅ Added description column');
    }

    if (!existingColumns.includes('reference')) {
      await client.query('ALTER TABLE "Transactions" ADD COLUMN reference VARCHAR(255) UNIQUE;');
      console.log('✅ Added reference column');
    }

    if (!existingColumns.includes('metadata')) {
      await client.query('ALTER TABLE "Transactions" ADD COLUMN metadata JSON;');
      console.log('✅ Added metadata column');
    }

    // Create index for reference if it doesn't exist
    try {
      await client.query('CREATE INDEX IF NOT EXISTS transactions_reference_idx ON "Transactions"(reference);');
      console.log('✅ Created reference index');
    } catch (indexError) {
      console.log('ℹ️  Reference index may already exist');
    }

    console.log('🎉 Transaction table enhancement completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

enhanceTransactionsTable();
