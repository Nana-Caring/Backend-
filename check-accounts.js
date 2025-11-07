const { Pool } = require('pg');

async function checkAccounts() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('Checking current accounts...\n');

    const result = await pool.query(`
      SELECT id, "accountName", "accountNumber", "accountType" 
      FROM "Accounts" 
      ORDER BY id 
      LIMIT 10
    `);

    console.log('📋 Current Accounts:');
    result.rows.forEach(row => {
      console.log(`  • ID: ${row.id} (${typeof row.id})`);
      console.log(`    Name: ${row.accountName}`);
      console.log(`    Number: ${row.accountNumber}`);
      console.log(`    Type: ${row.accountType}`);
      console.log('');
    });

    // Also check if there's an Emma account
    const emmaResult = await pool.query(`
      SELECT * FROM "Accounts" 
      WHERE "accountName" ILIKE '%emma%'
    `);
    
    if (emmaResult.rows.length > 0) {
      console.log('👤 Emma\'s Account:');
      emmaResult.rows.forEach(row => {
        console.log(`  ID: ${row.id}, Name: ${row.accountName}, Number: ${row.accountNumber}`);
      });
    } else {
      console.log('ℹ️  No Emma account found');
    }
    
  } catch (error) {
    console.error('❌ Error checking accounts:', error.message);
  } finally {
    await pool.end();
  }
}

checkAccounts();