const { Pool } = require('pg');

async function checkOtherCategory() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🔍 ANALYZING "OTHER" CATEGORY\n');
    console.log('=' .repeat(50));

    // Get all products in "Other" category
    const otherProducts = await pool.query(`
      SELECT 
        name, 
        brand,
        price, 
        subcategory, 
        description,
        "detailedDescription",
        "ageCategory",
        "minAge",
        "maxAge"
      FROM "products" 
      WHERE category = 'Other'
      ORDER BY price
    `);

    if (otherProducts.rows.length === 0) {
      console.log('ℹ️  No products found in "Other" category.');
      return;
    }

    console.log(`📦 Products in "Other" category (${otherProducts.rows.length} items):\n`);

    otherProducts.rows.forEach((product, index) => {
      console.log(`${index + 1}. 📱 **${product.name}** - R${product.price}`);
      console.log(`   🏷️  Brand: ${product.brand}`);
      console.log(`   📂 Subcategory: ${product.subcategory}`);
      console.log(`   📝 Description: ${product.description}`);
      console.log(`   👥 Age: ${product.minAge || 'N/A'}-${product.maxAge || 'N/A'} years (${product.ageCategory})`);
      console.log(`   📖 Details: ${product.detailedDescription}`);
      console.log('');
    });

    // Analyze subcategories in "Other"
    const subcategories = await pool.query(`
      SELECT 
        subcategory,
        COUNT(*) as count,
        ROUND(AVG(price), 2) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM "products" 
      WHERE category = 'Other'
      GROUP BY subcategory
      ORDER BY count DESC
    `);

    console.log('📊 SUBCATEGORIES IN "OTHER":');
    console.log('-' .repeat(30));
    subcategories.rows.forEach(sub => {
      console.log(`🏷️  ${sub.subcategory}: ${sub.count} products`);
      console.log(`   💰 Price range: R${sub.min_price} - R${sub.max_price} (Avg: R${sub.avg_price})`);
    });

    console.log('\n\n💡 ANALYSIS OF "OTHER" CATEGORY:');
    console.log('=' .repeat(50));
    
    // Check what types of items are in "Other"
    const itemTypes = otherProducts.rows.map(p => {
      if (p.subcategory.toLowerCase().includes('clothing')) return 'Clothing Items';
      if (p.subcategory.toLowerCase().includes('audio') || p.name.toLowerCase().includes('headphones')) return 'Electronics/Audio';
      if (p.subcategory.toLowerCase().includes('household')) return 'Household Items';
      if (p.name.toLowerCase().includes('smartphone') || p.name.toLowerCase().includes('phone')) return 'Mobile Devices';
      return 'Miscellaneous';
    });

    const typeCount = {};
    itemTypes.forEach(type => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    console.log('📋 Item types in "Other":');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count} items`);
    });

    console.log('\n📝 PURPOSE OF "OTHER" CATEGORY:');
    console.log('The "Other" category appears to be used for:');
    console.log('• Items that don\'t fit into the main categories');
    console.log('• Clothing and personal items');
    console.log('• Electronics and technology products'); 
    console.log('• Household goods and miscellaneous items');
    console.log('• Products that span multiple age groups or uses');

    // Check if we should rename or reorganize
    console.log('\n💡 RECOMMENDATIONS:');
    if (subcategories.rows.some(s => s.subcategory === 'Clothing')) {
      console.log('• Consider creating a "Clothing" main category');
    }
    if (subcategories.rows.some(s => s.subcategory === 'Audio' || s.subcategory === 'Electronics')) {
      console.log('• Consider creating an "Electronics" main category');
    }
    if (subcategories.rows.some(s => s.subcategory === 'Household')) {
      console.log('• Consider creating a "Household" main category');
    }
    console.log('• Or keep "Other" for miscellaneous items that don\'t fit elsewhere');

  } catch (error) {
    console.error('❌ Error checking Other category:', error.message);
  } finally {
    await pool.end();
  }
}

checkOtherCategory();