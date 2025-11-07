const { Pool } = require('pg');

async function showAllCategoriesProducts() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🛍️  COMPLETE PRODUCT CATALOG BY CATEGORY\n');
    console.log('=' .repeat(70));

    // Get all categories and their products
    const categories = await pool.query(`
      SELECT DISTINCT category
      FROM "products" 
      ORDER BY category
    `);

    for (const categoryRow of categories.rows) {
      const categoryName = categoryRow.category;
      
      console.log(`\n📂 **${categoryName.toUpperCase()} CATEGORY**`);
      console.log('=' .repeat(50));

      // Get category statistics
      const categoryStats = await pool.query(`
        SELECT 
          COUNT(*) as total_products,
          ROUND(AVG(price), 2) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          COUNT(DISTINCT subcategory) as subcategory_count
        FROM "products" 
        WHERE category = $1
      `, [categoryName]);

      const stats = categoryStats.rows[0];
      console.log(`📊 Overview: ${stats.total_products} products across ${stats.subcategory_count} subcategories`);
      console.log(`💰 Price Range: R${stats.min_price} - R${stats.max_price} (Average: R${stats.avg_price})`);

      // Get subcategories
      const subcategories = await pool.query(`
        SELECT DISTINCT subcategory
        FROM "products" 
        WHERE category = $1
        ORDER BY subcategory
      `, [categoryName]);

      console.log(`\n🏷️  Subcategories: ${subcategories.rows.map(s => s.subcategory).join(', ')}`);

      // Get all products in this category
      const products = await pool.query(`
        SELECT 
          name, 
          brand,
          price, 
          subcategory, 
          description,
          "ageCategory",
          "minAge",
          "maxAge",
          "requiresAgeVerification"
        FROM "products" 
        WHERE category = $1
        ORDER BY subcategory, price
      `, [categoryName]);

      console.log(`\n📦 PRODUCTS:`);
      
      let currentSubcategory = '';
      products.rows.forEach((product, index) => {
        if (product.subcategory !== currentSubcategory) {
          console.log(`\n  📋 ${product.subcategory}:`);
          currentSubcategory = product.subcategory;
        }
        
        const ageInfo = product.minAge && product.maxAge 
          ? `(Ages ${product.minAge}-${product.maxAge})` 
          : `(${product.ageCategory})`;
        
        const ageVerification = product.requiresAgeVerification ? ' 🔒' : '';
        
        console.log(`    ${index + 1}. ${product.name} - R${product.price}${ageVerification}`);
        console.log(`       Brand: ${product.brand} | ${ageInfo}`);
        console.log(`       Description: ${product.description}`);
        console.log('');
      });

      // Show age distribution for this category
      const ageDistribution = await pool.query(`
        SELECT 
          "ageCategory",
          COUNT(*) as count
        FROM "products" 
        WHERE category = $1
        GROUP BY "ageCategory"
        ORDER BY count DESC
      `, [categoryName]);

      console.log(`👥 Age Distribution:`);
      ageDistribution.rows.forEach(age => {
        console.log(`   • ${age.ageCategory}: ${age.count} products`);
      });

      console.log('\n' + '-'.repeat(50));
    }

    // Overall system summary
    console.log(`\n\n📈 SYSTEM SUMMARY:`);
    console.log('=' .repeat(50));

    const systemStats = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(DISTINCT category) as total_categories,
        COUNT(DISTINCT subcategory) as total_subcategories,
        ROUND(AVG(price), 2) as overall_avg_price,
        MIN(price) as cheapest_product,
        MAX(price) as most_expensive,
        COUNT(CASE WHEN price <= 50 THEN 1 END) as affordable_products
      FROM "products"
    `);

    const summary = systemStats.rows[0];
    console.log(`📦 Total Products: ${summary.total_products}`);
    console.log(`📂 Categories: ${summary.total_categories}`);
    console.log(`🏷️  Subcategories: ${summary.total_subcategories}`);
    console.log(`💰 Overall Average Price: R${summary.overall_avg_price}`);
    console.log(`🏷️  Cheapest Product: R${summary.cheapest_product}`);
    console.log(`💸 Most Expensive: R${summary.most_expensive}`);
    console.log(`💵 Affordable Products (≤R50): ${summary.affordable_products} (${Math.round(summary.affordable_products/summary.total_products*100)}%)`);

    // Age verification summary
    const ageVerificationStats = await pool.query(`
      SELECT 
        COUNT(CASE WHEN "requiresAgeVerification" = true THEN 1 END) as restricted_products,
        COUNT(CASE WHEN "requiresAgeVerification" = false OR "requiresAgeVerification" IS NULL THEN 1 END) as open_products
      FROM "products"
    `);

    const ageStats = ageVerificationStats.rows[0];
    console.log(`🔒 Age-Restricted Products: ${ageStats.restricted_products}`);
    console.log(`✅ Open Access Products: ${ageStats.open_products}`);

    console.log('\n🎯 PERFECT FOR SASSA FAMILIES AND CHILDREN UNDER GUARDIANSHIP!');

  } catch (error) {
    console.error('❌ Error showing products:', error.message);
  } finally {
    await pool.end();
  }
}

showAllCategoriesProducts();