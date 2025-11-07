const { Pool } = require('pg');

async function checkTransactionsTable() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('Checking Transactions table structure...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Transactions' 
      ORDER BY ordinal_position
    `);

    console.log('📋 Transactions Table Columns:');
    result.rows.forEach(row => {
      console.log(`  • ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      if (row.column_default) {
        console.log(`    Default: ${row.column_default}`);
      }
    });

    // Check if the new columns exist
    const newColumns = ['balanceAfter', 'status', 'recipientAccountId', 'senderAccountId'];
    console.log('\n✅ New Enhancement Columns:');
    
    newColumns.forEach(col => {
      const exists = result.rows.find(row => row.column_name === col);
      if (exists) {
        console.log(`  ✓ ${col}: ${exists.data_type}`);
      } else {
        console.log(`  ❌ ${col}: NOT FOUND`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking table:', error.message);
  } finally {
    await pool.end();
  }
}

checkTransactionsTable();