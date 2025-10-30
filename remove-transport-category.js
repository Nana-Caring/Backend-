const { Pool } = require('pg');

async function removeTransportCategory() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🚗 REMOVING TRANSPORT CATEGORY FROM SYSTEM\n');
    console.log('📝 Reason: Not suitable for children under guardianship/SASSA families\n');
    console.log('=' .repeat(60));

    // First, let's see what Transport products we have
    console.log('🔍 Current Transport products:');
    const transportProducts = await pool.query(`
      SELECT name, price, subcategory, description
      FROM "products" 
      WHERE category = 'Transport'
      ORDER BY price
    `);

    if (transportProducts.rows.length === 0) {
      console.log('ℹ️  No Transport products found in the system.');
      return;
    }

    transportProducts.rows.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - R${product.price}`);
      console.log(`     Subcategory: ${product.subcategory}`);
      console.log(`     Description: ${product.description}`);
      console.log('');
    });

    console.log(`📊 Total Transport products to remove: ${transportProducts.rows.length}\n`);

    // Remove all Transport category products
    console.log('🗑️  Removing Transport products...');
    const deleteResult = await pool.query(`
      DELETE FROM "products" 
      WHERE category = 'Transport'
    `);

    console.log(`✅ Successfully removed ${deleteResult.rowCount} Transport products\n`);

    // Show updated category distribution
    console.log('📊 UPDATED CATEGORY DISTRIBUTION:');
    console.log('=' .repeat(40));

    const updatedCategories = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        ROUND(AVG(price), 2) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM "products" 
      GROUP BY category 
      ORDER BY count DESC
    `);

    updatedCategories.rows.forEach(row => {
      console.log(`📂 ${row.category}: ${row.count} products`);
      console.log(`   💰 Price range: R${row.min_price} - R${row.max_price} (Avg: R${row.avg_price})`);
    });

    const totalProducts = updatedCategories.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    console.log(`\n📈 Updated system summary:`);
    console.log(`🏷️  Categories: ${updatedCategories.rows.length}`);
    console.log(`📦 Total products: ${totalProducts}`);
    console.log('✅ System now focused on essentials for children and families!');

  } catch (error) {
    console.error('❌ Error removing Transport category:', error.message);
  } finally {
    await pool.end();
  }
}

removeTransportCategory();