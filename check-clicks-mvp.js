require('dotenv').config();
const pool = require('./db');

async function showCurrentState() {
  try {
    console.log('🔍 CHECKING CURRENT PRODUCT STATE FOR CLICKS MVP\n');
    
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully\n');
    
    // Get total product count
    const totalResult = await client.query('SELECT COUNT(*) FROM products');
    const totalProducts = parseInt(totalResult.rows[0].count);
    console.log(`📦 Total Products: ${totalProducts}\n`);
    
    // Get products by shop
    const shopResult = await client.query(`
      SELECT shop, COUNT(*) as count 
      FROM products 
      WHERE shop IS NOT NULL 
      GROUP BY shop 
      ORDER BY count DESC
    `);
    
    console.log('🏪 PRODUCTS BY SHOP:');
    console.log('═══════════════════');
    shopResult.rows.forEach(row => {
      console.log(`${row.shop}: ${row.count} products`);
    });
    
    // Get Clicks products specifically
    const clicksResult = await client.query(`
      SELECT id, name, price, sku, image_url 
      FROM products 
      WHERE shop = 'Clicks' OR shop ILIKE '%clicks%'
      ORDER BY name
    `);
    
    console.log(`\n🎯 CLICKS PRODUCTS (${clicksResult.rows.length} found):`);
    console.log('═══════════════════════════════════════════');
    clicksResult.rows.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Price: R${product.price}`);
      console.log(`   Image: ${product.image_url ? 'Has image' : 'No image'}`);
      console.log('');
    });
    
    // Get categories
    const categoryResult = await client.query(`
      SELECT categories, COUNT(*) as count 
      FROM products 
      WHERE categories IS NOT NULL 
      GROUP BY categories 
      ORDER BY count DESC
    `);
    
    console.log('📂 CATEGORIES:');
    console.log('══════════════');
    categoryResult.rows.forEach(row => {
      console.log(`${row.categories}: ${row.count} products`);
    });
    
    client.release();
    
    console.log('\n🎯 CLICKS MVP RECOMMENDATION:');
    console.log('═══════════════════════════════');
    console.log('✅ Keep existing Clicks products');
    console.log('🗑️  Remove non-Clicks products for MVP focus');
    console.log('🖼️  Update all images with professional Clicks.co.za images');
    console.log('📦 Target: ~15-20 core health/beauty products');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showCurrentState();