const { Pool } = require('pg');

async function removeHouseholdAndTransport() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🗑️  REMOVING HOUSEHOLD & PUBLIC TRANSPORT FROM BASIC NEEDS\n');
    console.log('💡 Focus: Keep only essential digital services and utilities');
    console.log('🎯 Target: Airtime, Data, Electricity, Water, Financial Services\n');
    console.log('=' .repeat(60));

    // First, let's see what we're removing
    console.log('🔍 Items to be removed:');
    
    const itemsToRemove = await pool.query(`
      SELECT name, price, subcategory, description
      FROM "products" 
      WHERE category = 'Basic Needs' 
        AND subcategory IN ('Household', 'Public Transport')
      ORDER BY subcategory, price
    `);

    if (itemsToRemove.rows.length === 0) {
      console.log('ℹ️  No Household or Public Transport items found in Basic Needs.');
      return;
    }

    itemsToRemove.rows.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - R${product.price}`);
      console.log(`     Subcategory: ${product.subcategory}`);
      console.log(`     Description: ${product.description}`);
      console.log('');
    });

    console.log(`📊 Total items to remove: ${itemsToRemove.rows.length}\n`);

    // Remove Household items
    console.log('🧽 Removing Household items...');
    const householdDelete = await pool.query(`
      DELETE FROM "products" 
      WHERE category = 'Basic Needs' AND subcategory = 'Household'
    `);
    console.log(`✅ Removed ${householdDelete.rowCount} Household items`);

    // Remove Public Transport items
    console.log('🚌 Removing Public Transport items...');
    const transportDelete = await pool.query(`
      DELETE FROM "products" 
      WHERE category = 'Basic Needs' AND subcategory = 'Public Transport'
    `);
    console.log(`✅ Removed ${transportDelete.rowCount} Public Transport items`);

    // Show updated Basic Needs category
    console.log('\n📊 UPDATED BASIC NEEDS CATEGORY:');
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

    basicNeedsSubcategories.rows.forEach(sub => {
      console.log(`📋 ${sub.subcategory}: ${sub.count} products`);
      console.log(`   💰 Price range: R${sub.min_price} - R${sub.max_price} (Avg: R${sub.avg_price})`);
    });

    // Show remaining products in Basic Needs
    console.log('\n📦 REMAINING BASIC NEEDS PRODUCTS:');
    console.log('=' .repeat(40));

    const remainingProducts = await pool.query(`
      SELECT name, price, subcategory
      FROM "products" 
      WHERE category = 'Basic Needs'
      ORDER BY subcategory, price
    `);

    let currentSubcategory = '';
    remainingProducts.rows.forEach(product => {
      if (product.subcategory !== currentSubcategory) {
        console.log(`\n📋 ${product.subcategory}:`);
        currentSubcategory = product.subcategory;
      }
      console.log(`  • ${product.name} - R${product.price}`);
    });

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
    
    console.log('\n🎉 CLEANUP COMPLETE!');
    console.log('✅ Removed non-essential household and transport items');
    console.log('✅ Basic Needs now focused on core digital/utility services');
    console.log('✅ Perfect for SASSA families: airtime, data, electricity, water');
    console.log(`📦 Total products: ${totalProducts} across ${categories.rows.length} categories`);
    console.log('✅ System optimized for essential services only!');

  } catch (error) {
    console.error('❌ Error removing items:', error.message);
  } finally {
    await pool.end();
  }
}

removeHouseholdAndTransport();