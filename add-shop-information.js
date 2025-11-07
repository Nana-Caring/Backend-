const { Pool } = require('pg');

async function addShopInformation() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🏪 ADDING SHOP/RETAILER INFORMATION TO PRODUCTS\n');
    console.log('🛒 Will add realistic South African retailers for each product');
    console.log('🎯 Enable filtering by preferred shops for families\n');
    console.log('=' .repeat(70));

    // First, let's add a shop column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE "products" 
        ADD COLUMN IF NOT EXISTS shop VARCHAR(100),
        ADD COLUMN IF NOT EXISTS "shopCategory" VARCHAR(50)
      `);
      console.log('✅ Added shop and shopCategory columns to products table');
    } catch (error) {
      console.log('ℹ️  Shop columns may already exist:', error.message);
    }

    // Define shop mappings based on product categories and brands
    const shopMappings = [
      // HEALTHCARE PRODUCTS
      { category: 'Healthcare', subcategory: 'Baby Care', shop: 'Clicks', shopCategory: 'Pharmacy' },
      { category: 'Healthcare', subcategory: 'Children Medicine', shop: 'Clicks', shopCategory: 'Pharmacy' },
      { category: 'Healthcare', subcategory: 'Pain Relief', shop: 'Dis-Chem', shopCategory: 'Pharmacy' },
      { category: 'Healthcare', subcategory: 'Oral Care', shop: 'Pick n Pay', shopCategory: 'Supermarket' },
      { category: 'Healthcare', subcategory: 'Personal Care', shop: 'Shoprite', shopCategory: 'Supermarket' },
      { category: 'Healthcare', subcategory: 'Skin Care', shop: 'Clicks', shopCategory: 'Pharmacy' },
      { category: 'Healthcare', subcategory: 'Skincare', shop: 'Dis-Chem', shopCategory: 'Pharmacy' },
      { category: 'Healthcare', subcategory: 'First Aid', shop: 'Clicks', shopCategory: 'Pharmacy' },

      // GROCERIES
      { category: 'Groceries', subcategory: 'Baby Food', shop: 'Pick n Pay', shopCategory: 'Supermarket' },
      { category: 'Groceries', subcategory: 'Beverages', shop: 'Shoprite', shopCategory: 'Supermarket' },
      { category: 'Groceries', subcategory: 'Breakfast Cereals', shop: 'Checkers', shopCategory: 'Supermarket' },
      { category: 'Groceries', subcategory: 'Dairy & Eggs', shop: 'Woolworths', shopCategory: 'Supermarket' },
      { category: 'Groceries', subcategory: 'Grains & Cereals', shop: 'Shoprite', shopCategory: 'Supermarket' },
      { category: 'Groceries', subcategory: 'Instant Meals', shop: 'Pick n Pay', shopCategory: 'Supermarket' },
      { category: 'Groceries', subcategory: 'Snacks', shop: 'Woolworths', shopCategory: 'Supermarket' },
      { category: 'Groceries', subcategory: 'Spreads', shop: 'Checkers', shopCategory: 'Supermarket' },

      // EDUCATION
      { category: 'Education', subcategory: 'School Supplies', shop: 'CNA', shopCategory: 'Stationery Store' },
      { category: 'Education', subcategory: 'Notebooks & Paper', shop: 'Takealot', shopCategory: 'Online Store' },
      { category: 'Education', subcategory: 'Stationery', shop: 'CNA', shopCategory: 'Stationery Store' },

      // ENTERTAINMENT
      { category: 'Entertainment', subcategory: 'Books', shop: 'CNA', shopCategory: 'Bookstore' },
      { category: 'Entertainment', subcategory: 'Educational Toys', shop: 'Toy Kingdom', shopCategory: 'Toy Store' },
      { category: 'Entertainment', subcategory: 'Outdoor Toys', shop: 'Sportsmans Warehouse', shopCategory: 'Sports Store' },
      { category: 'Entertainment', subcategory: 'Gaming', shop: 'Game Stores', shopCategory: 'Electronics Store' },
      { category: 'Entertainment', subcategory: 'Streaming', shop: 'Online', shopCategory: 'Digital Store' },
      { category: 'Entertainment', subcategory: 'Food & Dining', shop: 'KFC', shopCategory: 'Restaurant' },

      // BASIC NEEDS
      { category: 'Basic Needs', subcategory: 'Airtime', shop: 'Pick n Pay', shopCategory: 'Supermarket' },
      { category: 'Basic Needs', subcategory: 'Data', shop: 'Vodacom Store', shopCategory: 'Mobile Store' },
      { category: 'Basic Needs', subcategory: 'Electricity', shop: 'Pick n Pay', shopCategory: 'Supermarket' },
      { category: 'Basic Needs', subcategory: 'Water & Utilities', shop: 'Municipal Office', shopCategory: 'Government Office' },
      { category: 'Basic Needs', subcategory: 'Food Vouchers', shop: 'Shoprite', shopCategory: 'Supermarket' }
    ];

    console.log('🏪 Updating products with shop information...\n');

    let updatedCount = 0;

    for (const mapping of shopMappings) {
      try {
        const result = await pool.query(`
          UPDATE "products" 
          SET shop = $1, "shopCategory" = $2
          WHERE category = $3 AND subcategory = $4 AND (shop IS NULL OR shop = '')
        `, [mapping.shop, mapping.shopCategory, mapping.category, mapping.subcategory]);

        if (result.rowCount > 0) {
          updatedCount += result.rowCount;
          console.log(`✅ Updated ${result.rowCount} ${mapping.category}/${mapping.subcategory} products → ${mapping.shop}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${mapping.category}/${mapping.subcategory}:`, error.message);
      }
    }

    // Update some specific high-value brands to go to their dedicated stores
    const specificUpdates = [
      { name: 'Pampers Baby Dry Nappies Size 3', shop: 'Baby City', shopCategory: 'Baby Store' },
      { name: 'Nestle NAN 3 Growing Up Milk 900g', shop: 'Baby City', shopCategory: 'Baby Store' },
      { name: 'Johnson\'s Baby Lotion 200ml', shop: 'Baby City', shopCategory: 'Baby Store' },
      { name: 'PlayStation Store Gift Card R250', shop: 'Game Stores', shopCategory: 'Electronics Store' },
      { name: 'Netflix Gift Card R200', shop: 'Takealot', shopCategory: 'Online Store' },
      { name: 'Vodacom Data Bundle 1GB', shop: 'Vodacom Store', shopCategory: 'Mobile Store' },
      { name: 'MTN Data Bundle 1GB', shop: 'MTN Store', shopCategory: 'Mobile Store' }
    ];

    console.log('\n🎯 Updating specific brand products with dedicated stores...');

    for (const update of specificUpdates) {
      try {
        const result = await pool.query(`
          UPDATE "products" 
          SET shop = $1, "shopCategory" = $2
          WHERE name = $3
        `, [update.shop, update.shopCategory, update.name]);

        if (result.rowCount > 0) {
          console.log(`✅ ${update.name} → ${update.shop}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${update.name}:`, error.message);
      }
    }

    // Show shop distribution
    console.log('\n\n🏪 SHOP DISTRIBUTION:');
    console.log('=' .repeat(50));

    const shopDistribution = await pool.query(`
      SELECT 
        shop,
        "shopCategory",
        COUNT(*) as product_count,
        ROUND(AVG(price), 2) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM "products"
      WHERE shop IS NOT NULL AND shop != ''
      GROUP BY shop, "shopCategory"
      ORDER BY product_count DESC
    `);

    shopDistribution.rows.forEach((shop, index) => {
      console.log(`${index + 1}. 🏪 **${shop.shop}** (${shop.shopCategory})`);
      console.log(`   📦 ${shop.product_count} products | 💰 R${shop.min_price}-R${shop.max_price} (Avg: R${shop.avg_price})`);
    });

    // Show shop categories
    console.log('\n\n📂 SHOP CATEGORIES:');
    console.log('=' .repeat(40));

    const shopCategories = await pool.query(`
      SELECT 
        "shopCategory",
        COUNT(*) as product_count,
        COUNT(DISTINCT shop) as shop_count
      FROM "products"
      WHERE "shopCategory" IS NOT NULL AND "shopCategory" != ''
      GROUP BY "shopCategory"
      ORDER BY product_count DESC
    `);

    shopCategories.rows.forEach(category => {
      console.log(`📋 ${category.shopCategory}: ${category.product_count} products across ${category.shop_count} shops`);
    });

    // Show products by shop for verification
    console.log('\n\n🛒 PRODUCTS BY SHOP (Sample):');
    console.log('=' .repeat(50));

    const productsByShop = await pool.query(`
      SELECT shop, name, price, category
      FROM "products"
      WHERE shop IS NOT NULL AND shop != ''
      ORDER BY shop, price
      LIMIT 20
    `);

    let currentShop = '';
    productsByShop.rows.forEach(product => {
      if (product.shop !== currentShop) {
        console.log(`\n🏪 ${product.shop}:`);
        currentShop = product.shop;
      }
      console.log(`  • ${product.name} - R${product.price} (${product.category})`);
    });

    console.log('\n\n🎉 SHOP INFORMATION ADDED SUCCESSFULLY!');
    console.log(`✅ Updated ${updatedCount} products with shop information`);
    console.log(`🏪 ${shopDistribution.rows.length} different shops available`);
    console.log(`📂 ${shopCategories.rows.length} shop categories for filtering`);
    console.log('✅ Users can now filter by preferred retailers!');
    console.log('✅ Perfect for families who prefer specific shops!');

  } catch (error) {
    console.error('❌ Error adding shop information:', error.message);
  } finally {
    await pool.end();
  }
}

addShopInformation();