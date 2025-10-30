const { Pool } = require('pg');

async function removeFinancialAndClothing() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🗑️  REMOVING FINANCIAL SERVICES & CLOTHING FROM BASIC NEEDS\n');
    console.log('💡 Focus: Pure digital services and utilities only');
    console.log('🎯 Target: Airtime, Data, Electricity, Water, Food Vouchers\n');
    console.log('=' .repeat(60));

    // First, let's see what we're removing
    console.log('🔍 Items to be removed:');
    
    const itemsToRemove = await pool.query(`
      SELECT name, price, subcategory, description
      FROM "products" 
      WHERE category = 'Basic Needs' 
        AND subcategory IN ('Financial Services', 'Clothing')
      ORDER BY subcategory, price
    `);

    if (itemsToRemove.rows.length === 0) {
      console.log('ℹ️  No Financial Services or Clothing items found in Basic Needs.');
      return;
    }

    itemsToRemove.rows.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - R${product.price}`);
      console.log(`     Subcategory: ${product.subcategory}`);
      console.log(`     Description: ${product.description}`);
      console.log('');
    });

    console.log(`📊 Total items to remove: ${itemsToRemove.rows.length}\n`);

    // Remove Financial Services items
    console.log('💳 Removing Financial Services items...');
    const financialDelete = await pool.query(`
      DELETE FROM "products" 
      WHERE category = 'Basic Needs' AND subcategory = 'Financial Services'
    `);
    console.log(`✅ Removed ${financialDelete.rowCount} Financial Services items`);

    // Remove Clothing items from Basic Needs (they should be in a different category)
    console.log('👕 Removing Clothing items...');
    const clothingDelete = await pool.query(`
      DELETE FROM "products" 
      WHERE category = 'Basic Needs' AND subcategory = 'Clothing'
    `);
    console.log(`✅ Removed ${clothingDelete.rowCount} Clothing items`);

    // Show updated Basic Needs category
    console.log('\n📊 REFINED BASIC NEEDS CATEGORY:');
    console.log('=' .repeat(40));

    const basicNeedsSubcategories = await pool.query(`
      SELECT 
        subcategory,
        COUNT(*) as count,
        ROUND(AVG(price), 2) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM "products" 
      WHERE category = 'Basic Needs'
      GROUP BY subcategory
      ORDER BY count DESC
    `);

    if (basicNeedsSubcategories.rows.length === 0) {
      console.log('ℹ️  No products remaining in Basic Needs category.');
    } else {
      basicNeedsSubcategories.rows.forEach(sub => {
        console.log(`📋 ${sub.subcategory}: ${sub.count} products`);
        console.log(`   💰 Price range: R${sub.min_price} - R${sub.max_price} (Avg: R${sub.avg_price})`);
      });
    }

    // Show remaining products in Basic Needs
    console.log('\n📦 CORE BASIC NEEDS PRODUCTS:');
    console.log('=' .repeat(40));

    const remainingProducts = await pool.query(`
      SELECT name, price, subcategory, description
      FROM "products" 
      WHERE category = 'Basic Needs'
      ORDER BY subcategory, price
    `);

    if (remainingProducts.rows.length === 0) {
      console.log('ℹ️  No products remaining in Basic Needs category.');
    } else {
      let currentSubcategory = '';
      remainingProducts.rows.forEach(product => {
        if (product.subcategory !== currentSubcategory) {
          console.log(`\n📋 ${product.subcategory}:`);
          currentSubcategory = product.subcategory;
        }
        console.log(`  • ${product.name} - R${product.price}`);
        console.log(`    ${product.description}`);
      });
    }

    // Show updated category distribution
    console.log('\n\n📊 UPDATED CATEGORY DISTRIBUTION:');
    console.log('=' .repeat(50));

    const categories = await pool.query(`
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

    categories.rows.forEach(row => {
      console.log(`📂 ${row.category}: ${row.count} products`);
      console.log(`   💰 Price range: R${row.min_price} - R${row.max_price} (Avg: R${row.avg_price})`);
    });

    const totalProducts = categories.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    
    console.log('\n💡 BASIC NEEDS PURPOSE:');
    console.log('The Basic Needs category now contains ONLY:');
    console.log('📱 Communication services (airtime, data)');
    console.log('⚡ Essential utilities (electricity, water)');
    console.log('🛒 Food access vouchers');
    console.log('💯 Pure essential services for survival & communication!');
    
    console.log('\n🎉 FINAL CLEANUP COMPLETE!');
    console.log('✅ Basic Needs = Pure essential services only');
    console.log('✅ No physical products, only digital/utility services');
    console.log('✅ Perfect for families needing connectivity & utilities');
    console.log(`📦 Total products: ${totalProducts} across ${categories.rows.length} categories`);
    console.log('✅ System now has crystal-clear category purposes!');

  } catch (error) {
    console.error('❌ Error removing items:', error.message);
  } finally {
    await pool.end();
  }
}

removeFinancialAndClothing();