const { Pool } = require('pg');

async function checkCategoryDistribution() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    const result = await pool.query(`
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

    console.log('📊 CURRENT PRODUCT DISTRIBUTION BY CATEGORY:');
    console.log('=' .repeat(60));
    
    result.rows.forEach(row => {
      console.log(`📂 ${row.category}: ${row.count} products`);
      console.log(`   💰 Price range: R${row.min_price} - R${row.max_price} (Avg: R${row.avg_price})`);
    });

    console.log(`\n📈 Total categories: ${result.rows.length}`);
    console.log(`📦 Total products: ${result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkCategoryDistribution();