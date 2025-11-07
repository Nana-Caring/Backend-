const { Client } = require('pg');
require('dotenv').config();

async function testAgeFiltering() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'prince123',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nanapocket',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 AGE-BASED CATEGORY FILTERING TEST\n');
    console.log('=' .repeat(50));

    await client.connect();

    // Check products with age restrictions
    console.log('\n📦 STEP 1: Products with Age Restrictions');
    console.log('-' .repeat(40));
    
    const ageRestrictedProducts = await client.query(`
      SELECT 
        name,
        category,
        "ageCategory",
        "minAge",
        "maxAge",
        price,
        brand,
        "requiresAgeVerification",
        "isActive",
        "inStock"
      FROM public.products 
      WHERE ("minAge" IS NOT NULL OR "maxAge" IS NOT NULL OR "requiresAgeVerification" = true)
      ORDER BY category, "minAge" ASC NULLS LAST
      LIMIT 15
    `);

    console.log(`Found ${ageRestrictedProducts.rows.length} products with age restrictions:`);
    ageRestrictedProducts.rows.forEach((product, index) => {
      const ageRange = `${product.minAge || 'No Min'}-${product.maxAge || 'No Max'}`;
      const status = product.isActive && product.inStock ? '✅ Available' : '❌ Not Available';
      console.log(`\n   ${index + 1}. ${product.name}`);
      console.log(`      Category: ${product.category} | Age Category: ${product.ageCategory}`);
      console.log(`      Age Range: ${ageRange} | Verification: ${product.requiresAgeVerification || false}`);
      console.log(`      Brand: ${product.brand} | Price: R${product.price} | ${status}`);
    });

    // Test filtering for different ages
    console.log('\n🧪 STEP 2: Age-Based Filtering Tests');
    console.log('-' .repeat(40));
    
    const testAges = [1, 8, 15, 18, 25, 70];
    
    for (const age of testAges) {
      console.log(`\n🎯 Age ${age} years (${getAgeCategory(age)}):`);
      
      // Get available products for this age
      const availableProducts = await client.query(`
        SELECT 
          category,
          COUNT(*) as count,
          ARRAY_AGG("ageCategory") as age_categories
        FROM public.products 
        WHERE "isActive" = true 
        AND "inStock" = true
        AND (("minAge" IS NULL OR "minAge" <= $1))
        AND (("maxAge" IS NULL OR "maxAge" >= $1))
        GROUP BY category
        ORDER BY count DESC
      `, [age]);

      console.log(`   Available products by category:`);
      availableProducts.rows.forEach(cat => {
        const uniqueAgeCategories = [...new Set(cat.age_categories)].join(', ');
        console.log(`     🛍️ ${cat.category}: ${cat.count} products (${uniqueAgeCategories})`);
      });

      // Get total available vs restricted
      const totalAvailable = await client.query(`
        SELECT COUNT(*) as count
        FROM public.products 
        WHERE "isActive" = true 
        AND "inStock" = true
        AND (("minAge" IS NULL OR "minAge" <= $1))
        AND (("maxAge" IS NULL or "maxAge" >= $1))
      `, [age]);

      const totalProducts = await client.query(`
        SELECT COUNT(*) as count
        FROM public.products 
        WHERE "isActive" = true AND "inStock" = true
      `);

      const available = parseInt(totalAvailable.rows[0].count);
      const total = parseInt(totalProducts.rows[0].count);
      const restricted = total - available;

      console.log(`   📊 Summary: ${available}/${total} available (${restricted} restricted)`);
    }

    // Check product categories and their age policies
    console.log('\n📂 STEP 3: Category Age Policies');
    console.log('-' .repeat(40));
    
    const categoryPolicies = await client.query(`
      SELECT 
        category,
        COUNT(*) as total_products,
        COUNT(CASE WHEN "minAge" IS NOT NULL THEN 1 END) as with_min_age,
        COUNT(CASE WHEN "maxAge" IS NOT NULL THEN 1 END) as with_max_age,
        COUNT(CASE WHEN "requiresAgeVerification" = true THEN 1 END) as requires_verification,
        MIN("minAge") as lowest_min_age,
        MAX("maxAge") as highest_max_age,
        AVG("minAge") as avg_min_age
      FROM public.products 
      WHERE "isActive" = true
      GROUP BY category
      ORDER BY category
    `);

    console.log('Age policies by category:');
    categoryPolicies.rows.forEach(cat => {
      console.log(`\n   🏷️ ${cat.category}: ${cat.total_products} products`);
      console.log(`      Min Age Restrictions: ${cat.with_min_age} products`);
      console.log(`      Max Age Restrictions: ${cat.with_max_age} products`);
      console.log(`      Age Verification Required: ${cat.requires_verification} products`);
      if (cat.lowest_min_age || cat.highest_max_age) {
        console.log(`      Age Range: ${cat.lowest_min_age || 'No Min'} - ${cat.highest_max_age || 'No Max'}`);
      }
      if (cat.avg_min_age) {
        console.log(`      Average Min Age: ${parseFloat(cat.avg_min_age).toFixed(1)} years`);
      }
    });

    // Test specific scenarios
    console.log('\n🎪 STEP 4: Real-World Scenarios');
    console.log('-' .repeat(40));
    
    // Scenario 1: Healthcare products for different ages
    console.log('\n💊 Healthcare Products by Age:');
    for (const age of [5, 12, 18, 30]) {
      const healthcareProducts = await client.query(`
        SELECT COUNT(*) as count
        FROM public.products 
        WHERE category = 'Healthcare'
        AND "isActive" = true 
        AND "inStock" = true
        AND (("minAge" IS NULL OR "minAge" <= $1))
        AND (("maxAge" IS NULL OR "maxAge" >= $1))
      `, [age]);
      
      console.log(`   Age ${age}: ${healthcareProducts.rows[0].count} healthcare products available`);
    }

    // Scenario 2: Products that require age verification
    console.log('\n🔒 Products Requiring Age Verification:');
    const verificationProducts = await client.query(`
      SELECT name, category, "minAge", "maxAge", brand
      FROM public.products 
      WHERE "requiresAgeVerification" = true
      AND "isActive" = true
      LIMIT 5
    `);
    
    if (verificationProducts.rows.length > 0) {
      verificationProducts.rows.forEach(product => {
        const ageRange = `${product.minAge || 'No Min'}-${product.maxAge || 'No Max'}`;
        console.log(`   🔐 ${product.name} (${product.category}) - Age: ${ageRange}`);
      });
    } else {
      console.log('   No products require age verification');
    }

    // Show the filtering logic in action
    console.log('\n🔧 STEP 5: Filtering Logic Examples');
    console.log('-' .repeat(40));
    
    console.log('\nThe age filtering uses this SQL logic:');
    console.log('   WHERE (minAge IS NULL OR minAge <= user_age)');
    console.log('   AND (maxAge IS NULL OR maxAge >= user_age)');
    
    console.log('\nThis means:');
    console.log('   - Products with no minAge are available to all ages');
    console.log('   - Products with no maxAge have no upper age limit'); 
    console.log('   - User must be >= minAge and <= maxAge to access product');

    console.log('\n✅ AGE-BASED FILTERING TEST COMPLETE');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

// Helper function to determine age category
function getAgeCategory(age) {
  if (age === null || age === undefined || age < 0) return 'Invalid';
  if (age <= 2) return 'Toddler';
  if (age <= 12) return 'Child';
  if (age <= 17) return 'Teen';
  if (age <= 64) return 'Adult';
  return 'Senior';
}

testAgeFiltering().catch(console.error);