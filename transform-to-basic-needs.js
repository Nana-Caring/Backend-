const { Pool } = require('pg');

// Basic needs products for SASSA families - airtime, data, electricity
const basicNeedsProducts = [
  // AIRTIME VOUCHERS
  {
    name: 'Vodacom Airtime Voucher R10',
    brand: 'Vodacom',
    description: 'R10 airtime voucher for calls and SMS',
    detailedDescription: 'Vodacom prepaid airtime voucher worth R10. Can be used for calls, SMS, and data bundles.',
    price: 10.00,
    category: 'Basic Needs',
    subcategory: 'Airtime',
    sku: 'VODACOM-AIRTIME-10',
    stockQuantity: 500,
    manufacturer: 'Vodacom',
    imageUrl: 'https://www.vodacom.co.za/medias/vodacom-airtime-voucher-r10.jpg',
    tags: ['airtime', 'vodacom', 'calls', 'sms'],
    minAge: 0,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },
  {
    name: 'MTN Airtime Voucher R20',
    brand: 'MTN',
    description: 'R20 airtime voucher for communication',
    detailedDescription: 'MTN prepaid airtime voucher worth R20. Essential for staying connected with family and services.',
    price: 20.00,
    category: 'Basic Needs',
    subcategory: 'Airtime',
    sku: 'MTN-AIRTIME-20',
    stockQuantity: 500,
    manufacturer: 'MTN',
    imageUrl: 'https://www.mtn.co.za/medias/mtn-airtime-voucher-r20.jpg',
    tags: ['airtime', 'mtn', 'communication', 'prepaid'],
    minAge: 0,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },
  {
    name: 'Cell C Airtime Voucher R50',
    brand: 'Cell C',
    description: 'R50 airtime voucher for extended communication',
    detailedDescription: 'Cell C prepaid airtime voucher worth R50. Ideal for families needing more talk time and SMS.',
    price: 50.00,
    category: 'Basic Needs',
    subcategory: 'Airtime',
    sku: 'CELLC-AIRTIME-50',
    stockQuantity: 300,
    manufacturer: 'Cell C',
    imageUrl: 'https://www.cellc.co.za/medias/cellc-airtime-voucher-r50.jpg',
    tags: ['airtime', 'cell c', 'family communication', 'prepaid'],
    minAge: 0,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },

  // DATA BUNDLES
  {
    name: 'Vodacom Data Bundle 500MB',
    brand: 'Vodacom',
    description: '500MB data bundle for internet access',
    detailedDescription: 'Vodacom 500MB data bundle valid for 30 days. Perfect for essential internet access, WhatsApp, and school research.',
    price: 25.00,
    category: 'Basic Needs',
    subcategory: 'Data',
    sku: 'VODACOM-DATA-500MB',
    stockQuantity: 400,
    manufacturer: 'Vodacom',
    imageUrl: 'https://www.vodacom.co.za/medias/vodacom-data-bundle-500mb.jpg',
    tags: ['data', 'internet', 'vodacom', '500mb'],
    minAge: 5,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },
  {
    name: 'MTN Data Bundle 1GB',
    brand: 'MTN',
    description: '1GB data bundle for internet and learning',
    detailedDescription: 'MTN 1GB data bundle valid for 30 days. Essential for online learning, homework research, and family communication.',
    price: 49.00,
    category: 'Basic Needs',
    subcategory: 'Data',
    sku: 'MTN-DATA-1GB',
    stockQuantity: 400,
    manufacturer: 'MTN',
    imageUrl: 'https://www.mtn.co.za/medias/mtn-data-bundle-1gb.jpg',
    tags: ['data', 'internet', 'mtn', '1gb', 'learning'],
    minAge: 5,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },

  // ELECTRICITY VOUCHERS
  {
    name: 'Eskom Electricity Voucher R50',
    brand: 'Eskom',
    description: 'R50 prepaid electricity voucher',
    detailedDescription: 'Eskom prepaid electricity voucher worth R50. Essential utility for lighting, cooking, and powering devices.',
    price: 50.00,
    category: 'Basic Needs',
    subcategory: 'Electricity',
    sku: 'ESKOM-ELEC-50',
    stockQuantity: 300,
    manufacturer: 'Eskom',
    imageUrl: 'https://www.eskom.co.za/medias/eskom-electricity-voucher-r50.jpg',
    tags: ['electricity', 'eskom', 'utilities', 'prepaid'],
    minAge: 0,
    maxAge: 99,
    ageCategory: 'All Ages',
    requiresAgeVerification: true, // Adults manage utilities
    inStock: true,
    isActive: true
  },
  {
    name: 'City Power Electricity Voucher R100',
    brand: 'City Power',
    description: 'R100 prepaid electricity voucher for Johannesburg',
    detailedDescription: 'City Power prepaid electricity voucher worth R100. For households in Johannesburg municipal area.',
    price: 100.00,
    category: 'Basic Needs',
    subcategory: 'Electricity',
    sku: 'CITYPOWER-ELEC-100',
    stockQuantity: 200,
    manufacturer: 'City Power',
    imageUrl: 'https://www.citypower.co.za/medias/city-power-voucher-r100.jpg',
    tags: ['electricity', 'city power', 'johannesburg', 'municipal'],
    minAge: 0,
    maxAge: 99,
    ageCategory: 'All Ages',
    requiresAgeVerification: true,
    inStock: true,
    isActive: true
  },

  // WATER & MUNICIPAL SERVICES
  {
    name: 'Municipal Water Account Credit R30',
    brand: 'Municipal Services',
    description: 'R30 credit for municipal water services',
    detailedDescription: 'Municipal water account credit worth R30. Helps cover essential water supply costs for households.',
    price: 30.00,
    category: 'Basic Needs',
    subcategory: 'Water & Utilities',
    sku: 'MUNICIPAL-WATER-30',
    stockQuantity: 250,
    manufacturer: 'Municipal Services',
    imageUrl: 'https://www.municipal.gov.za/medias/water-account-credit-r30.jpg',
    tags: ['water', 'municipal', 'utilities', 'essential'],
    minAge: 0,
    maxAge: 99,
    ageCategory: 'All Ages',
    requiresAgeVerification: true,
    inStock: true,
    isActive: true
  },

  // BANKING & FINANCIAL SERVICES
  {
    name: 'FNB EasyPay Prepaid Card R20',
    brand: 'FNB',
    description: 'R20 prepaid card for essential purchases',
    detailedDescription: 'FNB EasyPay prepaid card loaded with R20. Can be used at participating stores for groceries and essentials.',
    price: 20.00,
    category: 'Basic Needs',
    subcategory: 'Financial Services',
    sku: 'FNB-EASYPAY-20',
    stockQuantity: 200,
    manufacturer: 'First National Bank',
    imageUrl: 'https://www.fnb.co.za/medias/fnb-easypay-card-r20.jpg',
    tags: ['prepaid card', 'fnb', 'shopping', 'financial'],
    minAge: 16,
    maxAge: 99,
    ageCategory: 'Adult',
    requiresAgeVerification: true,
    inStock: true,
    isActive: true
  },

  // TRANSPORTATION (affordable local transport)
  {
    name: 'MyCiTi Bus Card R25',
    brand: 'MyCiTi',
    description: 'R25 credit for MyCiTi bus transport',
    detailedDescription: 'MyCiTi bus card loaded with R25 credit. Essential for affordable public transport in Cape Town area.',
    price: 25.00,
    category: 'Basic Needs',
    subcategory: 'Public Transport',
    sku: 'MYCITI-BUS-25',
    stockQuantity: 150,
    manufacturer: 'City of Cape Town',
    imageUrl: 'https://www.myciti.org.za/medias/myciti-bus-card-r25.jpg',
    tags: ['bus', 'transport', 'cape town', 'public transport'],
    minAge: 5,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },

  // BASIC GROCERY VOUCHERS
  {
    name: 'Shoprite Voucher R50',
    brand: 'Shoprite',
    description: 'R50 grocery voucher for Shoprite stores',
    detailedDescription: 'Shoprite grocery voucher worth R50. Can be used for food and essential items at any Shoprite or Checkers store.',
    price: 50.00,
    category: 'Basic Needs',
    subcategory: 'Food Vouchers',
    sku: 'SHOPRITE-VOUCHER-50',
    stockQuantity: 300,
    manufacturer: 'Shoprite Holdings',
    imageUrl: 'https://www.shoprite.co.za/medias/shoprite-voucher-r50.jpg',
    tags: ['grocery voucher', 'shoprite', 'food', 'essentials'],
    minAge: 0,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  }
];

async function transformToBasicNeeds() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🔄 TRANSFORMING "OTHER" TO "BASIC NEEDS" CATEGORY\n');
    console.log('💡 Focus: Airtime, Data, Electricity & Essential Services');
    console.log('🎯 Target: Services SASSA families actually need\n');
    console.log('=' .repeat(70));

    // First, remove inappropriate expensive items from "Other"
    console.log('🗑️  Removing inappropriate expensive items...');
    
    const expensiveItems = [
      'Samsung Galaxy Earbuds2 Pro',
      'Samsung Galaxy A54 Smartphone'
    ];

    for (const itemName of expensiveItems) {
      try {
        const deleted = await pool.query(
          'DELETE FROM "products" WHERE name = $1',
          [itemName]
        );
        if (deleted.rowCount > 0) {
          console.log(`❌ Removed: ${itemName}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not remove ${itemName}: ${error.message}`);
      }
    }

    // Update remaining "Other" products to "Basic Needs"
    console.log('\n🔄 Converting remaining "Other" products to "Basic Needs"...');
    
    const updateCategory = await pool.query(`
      UPDATE "products" 
      SET category = 'Basic Needs' 
      WHERE category = 'Other'
    `);
    
    console.log(`✅ Updated ${updateCategory.rowCount} products to "Basic Needs" category`);

    // Add new basic needs products
    console.log('\n🌱 Adding essential services and utilities...\n');

    let addedCount = 0;

    for (const product of basicNeedsProducts) {
      try {
        // Check if product already exists
        const existing = await pool.query(
          'SELECT id FROM "products" WHERE sku = $1',
          [product.sku]
        );

        if (existing.rows.length === 0) {
          const result = await pool.query(`
            INSERT INTO "products" (
              name, brand, description, "detailedDescription", price, 
              category, subcategory, sku, "stockQuantity", ingredients,
              weight, manufacturer, image, tags, "minAge", "maxAge",
              "ageCategory", "requiresAgeVerification", "inStock", "isActive",
              "createdAt", "updatedAt"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
              $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
              NOW(), NOW()
            ) RETURNING id, name
          `, [
            product.name,
            product.brand,
            product.description,
            product.detailedDescription,
            product.price,
            product.category,
            product.subcategory,
            product.sku,
            product.stockQuantity,
            product.ingredients || null,
            product.weight || null,
            product.manufacturer,
            product.imageUrl,
            JSON.stringify(product.tags),
            product.minAge || 0,
            product.maxAge || 150,
            product.ageCategory,
            product.requiresAgeVerification || false,
            product.inStock,
            product.isActive
          ]);

          addedCount++;
          console.log(`✅ ${addedCount}. Added: ${result.rows[0].name} - R${product.price}`);
          console.log(`   🏷️  Subcategory: ${product.subcategory} | ${product.description}`);
        } else {
          console.log(`ℹ️  Skipped (exists): ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${product.name}:`, error.message);
      }
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

    // Show Basic Needs subcategories
    console.log('\n\n🏷️  BASIC NEEDS SUBCATEGORIES:');
    console.log('=' .repeat(40));

    const basicNeedsSubcategories = await pool.query(`
      SELECT 
        subcategory,
        COUNT(*) as count,
        ROUND(AVG(price), 2) as avg_price
      FROM "products" 
      WHERE category = 'Basic Needs'
      GROUP BY subcategory
      ORDER BY count DESC
    `);

    basicNeedsSubcategories.rows.forEach(sub => {
      console.log(`  📋 ${sub.subcategory}: ${sub.count} products (Avg: R${sub.avg_price})`);
    });

    const totalProducts = categories.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    
    console.log('\n🎉 BASIC NEEDS TRANSFORMATION COMPLETE!');
    console.log('✅ Added essential services: airtime, data, electricity');
    console.log('✅ Removed expensive inappropriate items');
    console.log('✅ Perfect for SASSA families and children under guardianship');
    console.log(`📦 Total products: ${totalProducts} across ${categories.rows.length} categories`);
    console.log('✅ System now covers true basic needs and essential services!');

  } catch (error) {
    console.error('❌ Error transforming to Basic Needs:', error.message);
  } finally {
    await pool.end();
  }
}

transformToBasicNeeds();