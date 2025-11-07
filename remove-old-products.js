const { Pool } = require('pg');

async function checkAndRemoveOldProducts() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🔍 Checking for existing products tables...\n');

    // Check what product-related tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name ILIKE '%product%'
      AND table_schema = 'public'
    `);

    console.log('📋 Product-related tables found:');
    tables.rows.forEach(table => {
      console.log(`  • ${table.table_name}`);
    });

    if (tables.rows.length === 0) {
      console.log('❌ No product tables found');
      return;
    }

    // Try different possible table names
    const possibleNames = ['Products', 'products', 'Product', 'product'];
    let actualTableName = null;

    for (const tableName of possibleNames) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as total FROM "${tableName}"`);
        actualTableName = tableName;
        console.log(`\n✅ Found table: "${tableName}" with ${result.rows[0].total} products`);
        break;
      } catch (error) {
        // Table doesn't exist with this name
      }
    }

    if (!actualTableName) {
      // Try the table name from the list we found
      if (tables.rows.length > 0) {
        actualTableName = tables.rows[0].table_name;
        const result = await pool.query(`SELECT COUNT(*) as total FROM "${actualTableName}"`);
        console.log(`\n✅ Using table: "${actualTableName}" with ${result.rows[0].total} products`);
      }
    }

    if (actualTableName) {
      // Show some existing products
      const existingProducts = await pool.query(`
        SELECT id, name, category, price 
        FROM "${actualTableName}" 
        ORDER BY id 
        LIMIT 10
      `);

      console.log('\n📦 Sample existing products:');
      existingProducts.rows.forEach(product => {
        console.log(`  • ID ${product.id}: ${product.name} - $${product.price} (${product.category})`);
      });

      // Ask for confirmation to delete
      console.log('\n🗑️  Preparing to remove all old products...');
      
      // Delete all products
      const deleteResult = await pool.query(`DELETE FROM "${actualTableName}"`);
      console.log(`✅ Removed ${deleteResult.rowCount} old products`);

      // Reset the ID sequence if it exists
      try {
        await pool.query(`ALTER SEQUENCE "${actualTableName}_id_seq" RESTART WITH 1`);
        console.log('✅ Reset ID sequence');
      } catch (seqError) {
        console.log('ℹ️  No sequence to reset or different sequence name');
      }

      // Verify deletion
      const finalCount = await pool.query(`SELECT COUNT(*) as total FROM "${actualTableName}"`);
      console.log(`\n📊 Final product count: ${finalCount.rows[0].total}`);

      console.log('\n🎉 Old products removed successfully! Ready for new seeding.');
    }
    
  } catch (error) {
    console.error('❌ Error removing old products:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndRemoveOldProducts();