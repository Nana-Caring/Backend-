const { Pool } = require('pg');

async function markAccountMigrationsCompleted() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('Marking account-related migrations as completed...');
    
    const migrations = [
      '20251023197000-add-account-fields-safe.js',
      '20251026120000-update-emma-account-id.js'
    ];

    for (const migration of migrations) {
      await pool.query(`
        INSERT INTO "SequelizeMeta" (name) 
        VALUES ($1) 
        ON CONFLICT DO NOTHING
      `, [migration]);
      console.log(`✅ Marked ${migration} as completed`);
    }

    console.log('\n✅ Account migrations marked as completed!');
    
  } catch (error) {
    console.error('❌ Error marking migrations:', error.message);
  } finally {
    await pool.end();
  }
}

markAccountMigrationsCompleted();