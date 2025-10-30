const { Pool } = require('pg');

async function markMigrationCompleted() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('Marking migration as completed...');
    
    await pool.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES ('20251024000001-enhance-transactions-for-funder-system.js') 
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Migration 20251024000001-enhance-transactions-for-funder-system.js marked as completed!');
    
    // Check current migration status
    console.log('\nChecking migration status...');
    const result = await pool.query('SELECT name FROM "SequelizeMeta" ORDER BY name');
    console.log(`Total completed migrations: ${result.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error marking migration:', error.message);
  } finally {
    await pool.end();
  }
}

markMigrationCompleted();