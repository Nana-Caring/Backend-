const { Client } = require('pg');
require('dotenv').config();

async function testAgeCategoryFiltering() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'prince123',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nanapocket',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 TESTING AGE-BASED CATEGORY FILTERING SYSTEM\n');
    console.log('=' .repeat(60));

    await client.connect();

    // First, get some real dependent users and their ages
    console.log('\n📊 STEP 1: Checking Real Dependents and Their Ages');
    console.log('-' .repeat(50));
    
    const dependents = await client.query(`
      SELECT 
        id, 
        "firstName", 
        "surname", 
        "Idnumber", 
        role,
        "isBlocked",
        CASE 
          WHEN LENGTH("Idnumber") = 13 THEN
            CASE 
              WHEN CAST(SUBSTRING("Idnumber", 1, 2) AS INTEGER) <= 29 
              THEN 2000 + CAST(SUBSTRING("Idnumber", 1, 2) AS INTEGER)
              ELSE 1900 + CAST(SUBSTRING("Idnumber", 1, 2) AS INTEGER)
            END - EXTRACT(YEAR FROM CURRENT_DATE)
          ELSE NULL
        END as calculated_age,
        CASE 
          WHEN LENGTH("Idnumber") = 13 THEN
            CASE 
              WHEN CAST(SUBSTRING("Idnumber", 1, 2) AS INTEGER) <= 29 
              THEN 2000 + CAST(SUBSTRING("Idnumber", 1, 2) AS INTEGER)
              ELSE 1900 + CAST(SUBSTRING("Idnumber", 1, 2) AS INTEGER)
            END
          ELSE NULL
        END as birth_year
      FROM public."Users" 
      WHERE role = 'dependent' 
      AND "isBlocked" = false
      AND "Idnumber" IS NOT NULL
      ORDER BY calculated_age DESC NULLS LAST
      LIMIT 5
    `);

    console.log(`Found ${dependents.rows.length} active dependents:`);
    dependents.rows.forEach(dep => {
      const ageCategory = getAgeCategory(dep.calculated_age);
      console.log(`   👤 ${dep.firstName} ${dep.surname} (ID: ${dep.id})`);
      console.log(`      Age: ${dep.calculated_age || 'Unknown'} years - Category: ${ageCategory}`);
      console.log(`      ID Number: ${dep.Idnumber}`);
      console.log('');
    });

    // Get product statistics with age restrictions
    console.log('\n📦 STEP 2: Product Age Restrictions Overview');
    console.log('-' .repeat(50));
    
    const productStats = await client.query(`
      SELECT 
        category,
        COUNT(*) as total_products,
        COUNT(CASE WHEN "minAge" IS NOT NULL THEN 1 END) as with_min_age,
        COUNT(CASE WHEN "maxAge" IS NOT NULL THEN 1 END) as with_max_age,
        MIN("minAge") as lowest_min_age,
        MAX("maxAge") as highest_max_age,
        COUNT(CASE WHEN "minAge" IS NOT NULL OR "maxAge" IS NOT NULL THEN 1 END) as age_restricted,
        "ageCategory",
        AVG("minAge") as avg_min_age
      FROM public."Products" 
      WHERE "isActive" = true
      GROUP BY category, "ageCategory"
      ORDER BY category, "ageCategory"
    `);

    console.log('Product category breakdown with age restrictions:');
    const categoryMap = {};
    productStats.rows.forEach(stat => {
      if (!categoryMap[stat.category]) {
        categoryMap[stat.category] = {
          total: 0,
          ageRestricted: 0,
          ageCategories: []
        };
      }
      categoryMap[stat.category].total += parseInt(stat.total_products);
      categoryMap[stat.category].ageRestricted += parseInt(stat.age_restricted);
      categoryMap[stat.category].ageCategories.push({
        ageCategory: stat.ageCategory,
        count: stat.total_products,
        minAge: stat.lowest_min_age,
        maxAge: stat.highest_max_age,
        avgMinAge: stat.avg_min_age ? parseFloat(stat.avg_min_age).toFixed(1) : null
      });
    });

    Object.entries(categoryMap).forEach(([category, data]) => {
      console.log(`\n🏷️ ${category}: ${data.total} total products (${data.ageRestricted} age-restricted)`);
      data.ageCategories.forEach(ageCat => {
        const restrictionInfo = ageCat.minAge || ageCat.maxAge 
          ? `(Age: ${ageCat.minAge || '0'}-${ageCat.maxAge || '∞'})` 
          : '(No age restrictions)';
        console.log(`   📊 ${ageCat.ageCategory}: ${ageCat.count} products ${restrictionInfo}`);
      });
    });

    // Test specific age scenarios
    console.log('\n🧪 STEP 3: Testing Age-Based Product Filtering');
    console.log('-' .repeat(50));
    
    const testAges = [
      { age: 1, category: 'Toddler', description: '1-year-old toddler' },
      { age: 8, category: 'Child', description: '8-year-old child' },
      { age: 15, category: 'Teen', description: '15-year-old teenager' },
      { age: 25, category: 'Adult', description: '25-year-old adult' },
      { age: 70, category: 'Senior', description: '70-year-old senior' }
    ];

    for (const testCase of testAges) {
      console.log(`\n🎯 Testing ${testCase.description} (Age: ${testCase.age})`);
      
      // Age-based product filtering query (mimics the controller logic)
      const ageFilteredProducts = await client.query(`
        SELECT 
          category,
          COUNT(*) as available_products,
          COUNT(CASE WHEN "minAge" IS NOT NULL THEN 1 END) as with_min_restriction,
          COUNT(CASE WHEN "maxAge" IS NOT NULL THEN 1 END) as with_max_restriction,
          string_agg(DISTINCT "ageCategory", ', ') as age_categories_available
        FROM public."Products" 
        WHERE "isActive" = true 
        AND "inStock" = true
        AND (("minAge" IS NULL OR "minAge" <= $1))
        AND (("maxAge" IS NULL OR "maxAge" >= $1))
        GROUP BY category
        ORDER BY category
      `, [testCase.age]);

      console.log(`   Products available by category:`);
      ageFilteredProducts.rows.forEach(result => {
        console.log(`     🛍️ ${result.category}: ${result.available_products} products`);
        console.log(`        Age categories: ${result.age_categories_available}`);
        if (result.with_min_restriction > 0 || result.with_max_restriction > 0) {
          console.log(`        Restrictions: ${result.with_min_restriction} min-age, ${result.with_max_restriction} max-age`);
        }
      });

      // Get total products vs available products
      const totalProducts = await client.query(`
        SELECT COUNT(*) as total
        FROM public."Products" 
        WHERE "isActive" = true AND "inStock" = true
      `);

      const availableProducts = await client.query(`
        SELECT COUNT(*) as available
        FROM public."Products" 
        WHERE "isActive" = true 
        AND "inStock" = true
        AND (("minAge" IS NULL OR "minAge" <= $1))
        AND (("maxAge" IS NULL OR "maxAge" >= $1))
      `, [testCase.age]);

      const totalCount = parseInt(totalProducts.rows[0].total);
      const availableCount = parseInt(availableProducts.rows[0].available);
      const restrictedCount = totalCount - availableCount;
      
      console.log(`   📊 Summary: ${availableCount}/${totalCount} products available (${restrictedCount} age-restricted)`);
    }

    // Check specific products with age restrictions
    console.log('\n🔍 STEP 4: Sample Age-Restricted Products');
    console.log('-' .repeat(50));
    
    const ageRestrictedProducts = await client.query(`
      SELECT 
        name,
        category,
        "ageCategory",
        "minAge",
        "maxAge",
        price,
        brand
      FROM public."Products" 
      WHERE "isActive" = true 
      AND ("minAge" IS NOT NULL OR "maxAge" IS NOT NULL)
      ORDER BY "minAge" ASC NULLS LAST, "maxAge" ASC NULLS LAST
      LIMIT 10
    `);

    console.log('Sample products with age restrictions:');
    ageRestrictedProducts.rows.forEach((product, index) => {
      const ageRange = `${product.minAge || 0}-${product.maxAge || '∞'}`;
      console.log(`   ${index + 1}. ${product.name} (${product.category})`);
      console.log(`      Age: ${ageRange} years | Category: ${product.ageCategory}`);
      console.log(`      Price: R${product.price} | Brand: ${product.brand}`);
      console.log('');
    });

    // Test the age category calculation function
    console.log('\n📋 STEP 5: Age Category Verification');
    console.log('-' .repeat(50));
    
    console.log('Age category mappings (based on utils/ageCalculator.js):');
    for (let age = 0; age <= 80; age += 5) {
      const category = getAgeCategory(age);
      console.log(`   Age ${age}: ${category}`);
    }

    console.log('\n✅ AGE-BASED CATEGORY FILTERING TEST COMPLETE');

  } catch (error) {
    console.error('❌ Error during age category testing:', error);
  } finally {
    await client.end();
  }
}

// Helper function to match the backend age category logic
function getAgeCategory(age) {
  if (age < 0) return 'Invalid';
  if (age <= 2) return 'Toddler';
  if (age <= 12) return 'Child';
  if (age <= 17) return 'Teen';
  if (age <= 64) return 'Adult';
  return 'Senior';
}

// Run the test
testAgeCategoryFiltering().catch(console.error);