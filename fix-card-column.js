require('dotenv').config();
const { Client } = require('pg');

async function fixCardNumberColumn() {
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

    // Check if the PaymentCards table exists and what column type it has
    const columnInfo = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'PaymentCards' AND column_name = 'cardNumber';
    `);

    if (columnInfo.rows.length === 0) {
      console.log('❌ PaymentCards table or cardNumber column not found');
      return;
    }

    console.log('📋 Current cardNumber column:', columnInfo.rows[0]);

    // Update the column to VARCHAR(4) to store only last 4 digits
    await client.query(`
      ALTER TABLE "PaymentCards" 
      ALTER COLUMN "cardNumber" TYPE VARCHAR(4);
    `);

    console.log('✅ cardNumber column updated to VARCHAR(4)');

    // Verify the change
    const updatedColumnInfo = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'PaymentCards' AND column_name = 'cardNumber';
    `);

    console.log('📋 Updated cardNumber column:', updatedColumnInfo.rows[0]);
    console.log('🎉 Database column fix completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixCardNumberColumn();
