const { Pool } = require('pg');

async function checkAgeCategories() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    // Get available age categories
    const ageCategories = await pool.query(`
      SELECT unnest(enum_range(NULL::"enum_products_ageCategory")) as age_category
    `);
    
    console.log('Available age categories:');
    ageCategories.rows.forEach(cat => console.log(`- ${cat.age_category}`));

    // Add the final product with correct age category
    console.log('\n🌱 Adding final product...');
    
    const result = await pool.query(`
      INSERT INTO "products" (
        name, brand, description, "detailedDescription", price, 
        category, subcategory, sku, "stockQuantity",
        weight, manufacturer, image, tags, "minAge", "maxAge",
        "ageCategory", "inStock", "isActive",
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, $15, $16, $17, $18,
        NOW(), NOW()
      ) RETURNING id, name
    `, [
      'Pick n Pay School Lunch Box',
      'Pick n Pay',
      'Durable plastic lunch box for school children',
      'High-quality, BPA-free plastic lunch box with multiple compartments. Perfect for school lunches and snacks.',
      79.99,
      'Education',
      'School Supplies',
      'PNP-LUNCHBOX-001',
      90,
      '200g',
      'Pick n Pay',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      JSON.stringify(['lunch box', 'school', 'kids', 'food container']),
      3,
      18,
      'All Ages', // Using valid age category
      true,
      true
    ]);

    console.log(`✅ Added: ${result.rows[0].name} (ID: ${result.rows[0].id})`);

    // Final summary
    const totalProducts = await pool.query('SELECT COUNT(*) as total FROM "products"');
    console.log(`\n📊 Final Total: ${totalProducts.rows[0].total} products`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAgeCategories();