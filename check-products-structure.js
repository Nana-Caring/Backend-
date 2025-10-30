const { Pool } = require('pg');

async function checkProductsTableStructure() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🔍 Checking products table structure...\n');

    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);

    console.log('📋 Products table columns:');
    columns.rows.forEach(col => {
      console.log(`  • ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      if (col.column_default) {
        console.log(`    Default: ${col.column_default}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  } finally {
    await pool.end();
  }
}

checkProductsTableStructure();