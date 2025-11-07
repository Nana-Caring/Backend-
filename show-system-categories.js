const { Pool } = require('pg');

async function showSystemCategories() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🏷️  NANA CARING SYSTEM CATEGORIES\n');
    console.log('=' .repeat(50));

    // Get categories with detailed breakdown
    const categories = await pool.query(`
      SELECT 
        category,
        COUNT(*) as product_count,
        COUNT(DISTINCT subcategory) as subcategory_count,
        ROUND(AVG(price), 2) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM "products" 
      GROUP BY category 
      ORDER BY product_count DESC
    `);

    categories.rows.forEach((cat, index) => {
      console.log(`${index + 1}. 📂 **${cat.category}** (${cat.product_count} products)`);
      console.log(`   💰 Price Range: R${cat.min_price} - R${cat.max_price}`);
      console.log(`   📊 Average Price: R${cat.avg_price}`);
      console.log(`   🏷️  Subcategories: ${cat.subcategory_count}`);
      console.log('');
    });

    // Show subcategories for each main category
    console.log('\n📋 DETAILED SUBCATEGORY BREAKDOWN:');
    console.log('=' .repeat(50));

    for (const cat of categories.rows) {
      const subcategories = await pool.query(`
        SELECT DISTINCT subcategory, COUNT(*) as count
        FROM "products" 
        WHERE category = $1 
        GROUP BY subcategory 
        ORDER BY count DESC
      `, [cat.category]);

      console.log(`\n📂 ${cat.category}:`);
      subcategories.rows.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.subcategory} (${sub.count} products)`);
      });
    }

    // Show age categories distribution
    console.log('\n\n👥 AGE CATEGORY DISTRIBUTION:');
    console.log('=' .repeat(50));

    const ageCategories = await pool.query(`
      SELECT 
        "ageCategory",
        COUNT(*) as count,
        ROUND(AVG(price), 2) as avg_price
      FROM "products"
      GROUP BY "ageCategory"
      ORDER BY 
        CASE "ageCategory" 
          WHEN 'Toddler' THEN 1
          WHEN 'Child' THEN 2  
          WHEN 'Teen' THEN 3
          WHEN 'Adult' THEN 4
          WHEN 'Senior' THEN 5
          WHEN 'All Ages' THEN 6
        END
    `);

    ageCategories.rows.forEach((age, index) => {
      console.log(`${index + 1}. 👥 ${age.ageCategory}: ${age.count} products (Avg: R${age.avg_price})`);
    });

    console.log('\n\n📊 SYSTEM OVERVIEW:');
    console.log('=' .repeat(50));
    console.log(`🏷️  Main Categories: ${categories.rows.length}`);
    console.log(`📦 Total Products: ${categories.rows.reduce((sum, cat) => sum + parseInt(cat.product_count), 0)}`);
    console.log(`👥 Age Groups: ${ageCategories.rows.length}`);
    
    const totalSubcategories = await pool.query('SELECT COUNT(DISTINCT subcategory) as count FROM "products"');
    console.log(`🏷️  Total Subcategories: ${totalSubcategories.rows[0].count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

showSystemCategories();