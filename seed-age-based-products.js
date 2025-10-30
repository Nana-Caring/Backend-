const { Pool } = require('pg');

// Age-specific products for better filtering and user experience
const ageBasedProducts = [
  // TODDLER PRODUCTS (Ages 1-3)
  {
    name: 'Pampers Baby Dry Nappies Size 3',
    brand: 'Pampers',
    description: 'Ultra-absorbent baby nappies for toddlers',
    detailedDescription: 'Pampers Baby Dry nappies provide up to 12-hour protection with 3 Extra Absorb Channels and a comfortable fit for active toddlers.',
    price: 159.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    sku: 'PAMPERS-SIZE3-44',
    stockQuantity: 80,
    weight: '44 nappies',
    manufacturer: 'Procter & Gamble',
    imageUrl: 'https://www.clicks.co.za/medias/pampers-baby-dry-size3-44s.jpg',
    tags: ['baby', 'nappies', 'toddler', 'pampers'],
    minAge: 1,
    maxAge: 3,
    ageCategory: 'Toddler',
    requiresAgeVerification: false,
    inStock: true,
    isActive: true
  },
  {
    name: 'Nestle NAN 3 Growing Up Milk 900g',
    brand: 'Nestle NAN',
    description: 'Growing up milk for toddlers 1-3 years',
    detailedDescription: 'NAN 3 is specially formulated for toddlers from 1-3 years with OPTIPRO protein blend and essential nutrients for healthy growth.',
    price: 189.99,
    category: 'Groceries',
    subcategory: 'Baby Food',
    sku: 'NAN3-900G',
    stockQuantity: 60,
    weight: '900g',
    manufacturer: 'Nestle',
    imageUrl: 'https://www.checkers.co.za/medias/nestle-nan3-900g-tin.jpg',
    tags: ['baby formula', 'toddler', 'nutrition', 'nestle'],
    minAge: 1,
    maxAge: 3,
    ageCategory: 'Toddler',
    inStock: true,
    isActive: true
  },
  {
    name: 'Fisher-Price Laugh & Learn Puppy',
    brand: 'Fisher-Price',
    description: 'Interactive learning toy for toddlers',
    detailedDescription: 'Smart Stages technology adapts learning content as baby grows with 75+ songs, sounds and phrases teaching letters, colors, counting and more.',
    price: 449.99,
    category: 'Entertainment',
    subcategory: 'Educational Toys',
    sku: 'FP-PUPPY-LEARN',
    stockQuantity: 25,
    weight: '500g',
    manufacturer: 'Mattel',
    imageUrl: 'https://www.toysrus.co.za/medias/fisher-price-laugh-learn-puppy.jpg',
    tags: ['educational toy', 'toddler', 'learning', 'fisher-price'],
    minAge: 1,
    maxAge: 3,
    ageCategory: 'Toddler',
    inStock: true,
    isActive: true
  },

  // CHILD PRODUCTS (Ages 4-12)
  {
    name: 'LEGO Classic Creative Bricks Set',
    brand: 'LEGO',
    description: 'Creative building blocks for children',
    detailedDescription: '484 pieces of classic LEGO bricks in 35 different colors with building ideas booklet to inspire creativity and imagination.',
    price: 599.99,
    category: 'Entertainment',
    subcategory: 'Building Toys',
    sku: 'LEGO-CLASSIC-484',
    stockQuantity: 40,
    weight: '484 pieces',
    manufacturer: 'LEGO Group',
    imageUrl: 'https://www.lego.com/cdn/cs/set/assets/blt-classic-creative-bricks.jpg',
    tags: ['lego', 'building', 'creative', 'children'],
    minAge: 4,
    maxAge: 12,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'Crayola 64 Crayon Box with Sharpener',
    brand: 'Crayola',
    description: 'Premium crayons for coloring and art projects',
    detailedDescription: 'Crayola crayons with vibrant colors that are smooth and even. Includes built-in sharpener for perfect crayon points.',
    price: 89.99,
    category: 'Education',
    subcategory: 'Art Supplies',
    sku: 'CRAYOLA-64-SHARP',
    stockQuantity: 100,
    weight: '64 crayons',
    manufacturer: 'Crayola LLC',
    imageUrl: 'https://www.crayola.com/medias/crayola-64-crayon-box-sharpener.jpg',
    tags: ['crayons', 'art', 'coloring', 'school'],
    minAge: 4,
    maxAge: 12,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'Jungle Oats Original 1kg',
    brand: 'Jungle Oats',
    description: 'Nutritious breakfast cereal for growing children',
    detailedDescription: 'South Africa\'s favorite oats, packed with fiber and nutrients. Perfect for a healthy breakfast that keeps kids energized all morning.',
    price: 35.99,
    category: 'Groceries',
    subcategory: 'Breakfast Cereals',
    sku: 'JUNGLE-OATS-1KG',
    stockQuantity: 120,
    weight: '1000g',
    manufacturer: 'Pioneer Foods',
    imageUrl: 'https://www.checkers.co.za/medias/jungle-oats-original-1kg.jpg',
    tags: ['oats', 'breakfast', 'healthy', 'children'],
    minAge: 2,
    maxAge: 15,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'Aquafresh Kids Toothpaste Bubblemint',
    brand: 'Aquafresh',
    description: 'Gentle toothpaste specially designed for children',
    detailedDescription: 'Aquafresh Kids toothpaste with fluoride protection and gentle formula suitable for children aged 3-5 years with bubblemint flavor.',
    price: 24.99,
    category: 'Healthcare',
    subcategory: 'Oral Care',
    sku: 'AQUAFRESH-KIDS-75ML',
    stockQuantity: 85,
    ingredients: 'Sodium Fluoride, Aqua, Sorbitol',
    weight: '75ml',
    manufacturer: 'GSK',
    imageUrl: 'https://www.clicks.co.za/medias/aquafresh-kids-toothpaste-bubblemint.jpg',
    tags: ['toothpaste', 'kids', 'oral care', 'fluoride'],
    minAge: 3,
    maxAge: 8,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },

  // TEEN PRODUCTS (Ages 13-19)
  {
    name: 'Nike Air Force 1 Sneakers',
    brand: 'Nike',
    description: 'Classic basketball sneakers for teens and young adults',
    detailedDescription: 'Iconic Nike Air Force 1 with leather upper, Air-Sole unit, and pivot points for traction. A timeless classic that never goes out of style.',
    price: 1899.99,
    category: 'Other',
    subcategory: 'Footwear',
    sku: 'NIKE-AF1-WHITE-42',
    stockQuantity: 15,
    weight: 'Size 8',
    manufacturer: 'Nike Inc.',
    imageUrl: 'https://www.nike.com/medias/nike-air-force-1-white-sneakers.jpg',
    tags: ['sneakers', 'nike', 'basketball', 'fashion'],
    minAge: 13,
    maxAge: 25,
    ageCategory: 'Teen',
    inStock: true,
    isActive: true
  },
  {
    name: 'Spotify Premium Gift Card 3 Months',
    brand: 'Spotify',
    description: '3-month Spotify Premium subscription gift card',
    detailedDescription: 'Enjoy ad-free music, offline listening, and unlimited skips with Spotify Premium. Perfect gift for music-loving teens.',
    price: 179.97,
    category: 'Entertainment',
    subcategory: 'Music Streaming',
    sku: 'SPOTIFY-3M-GIFT',
    stockQuantity: 100,
    manufacturer: 'Spotify AB',
    imageUrl: 'https://www.spotify.com/medias/spotify-premium-gift-card.jpg',
    tags: ['music', 'streaming', 'premium', 'gift card'],
    minAge: 13,
    maxAge: 30,
    ageCategory: 'Teen',
    inStock: true,
    isActive: true
  },
  {
    name: 'Clearasil Daily Face Wash',
    brand: 'Clearasil',
    description: 'Daily face wash for teenage acne treatment',
    detailedDescription: 'Clearasil Daily Face Wash helps fight breakouts and prevent new ones with salicylic acid. Gentle enough for daily use.',
    price: 59.99,
    category: 'Healthcare',
    subcategory: 'Skincare',
    sku: 'CLEARASIL-WASH-150ML',
    stockQuantity: 70,
    ingredients: 'Salicylic Acid, Aqua, Glycerin',
    weight: '150ml',
    manufacturer: 'Reckitt Benckiser',
    imageUrl: 'https://www.clicks.co.za/medias/clearasil-daily-face-wash.jpg',
    tags: ['face wash', 'acne', 'skincare', 'teen'],
    minAge: 12,
    maxAge: 25,
    ageCategory: 'Teen',
    inStock: true,
    isActive: true
  },

  // ADULT PRODUCTS (Ages 18+)
  {
    name: 'Rooibos Tea Bags 80s',
    brand: 'Rooibos Ltd',
    description: 'Premium South African Rooibos tea',
    detailedDescription: 'Pure South African Rooibos tea, naturally caffeine-free with antioxidants. Perfect for any time of day with a naturally sweet taste.',
    price: 45.99,
    category: 'Groceries',
    subcategory: 'Beverages',
    sku: 'ROOIBOS-TEA-80S',
    stockQuantity: 95,
    weight: '80 tea bags',
    manufacturer: 'Rooibos Ltd',
    imageUrl: 'https://www.checkers.co.za/medias/rooibos-tea-bags-80s.jpg',
    tags: ['rooibos', 'tea', 'caffeine-free', 'south african'],
    minAge: 18,
    maxAge: 99,
    ageCategory: 'Adult',
    inStock: true,
    isActive: true
  },
  {
    name: 'Volkswagen Polo Service Voucher',
    brand: 'Volkswagen',
    description: 'R1000 service voucher for Volkswagen vehicles',
    detailedDescription: 'Pre-paid service voucher worth R1000 for Volkswagen vehicle maintenance at authorized VW service centers across South Africa.',
    price: 1000.00,
    category: 'Transport',
    subcategory: 'Vehicle Maintenance',
    sku: 'VW-SERVICE-1000',
    stockQuantity: 30,
    manufacturer: 'Volkswagen SA',
    imageUrl: 'https://www.vw.co.za/medias/vw-service-voucher-1000.jpg',
    tags: ['volkswagen', 'service', 'maintenance', 'voucher'],
    minAge: 18,
    maxAge: 70,
    ageCategory: 'Adult',
    requiresAgeVerification: true,
    inStock: true,
    isActive: true
  },
  {
    name: 'Samsung Galaxy A54 Smartphone',
    brand: 'Samsung',
    description: 'Mid-range smartphone with excellent camera',
    detailedDescription: 'Samsung Galaxy A54 with 128GB storage, triple camera system, and long-lasting battery. Perfect balance of performance and affordability.',
    price: 7999.00,
    category: 'Other',
    subcategory: 'Electronics',
    sku: 'SAMSUNG-A54-128GB',
    stockQuantity: 12,
    weight: '202g',
    manufacturer: 'Samsung Electronics',
    imageUrl: 'https://images.samsung.com/medias/samsung-galaxy-a54-smartphone.jpg',
    tags: ['smartphone', 'samsung', 'android', 'camera'],
    minAge: 18,
    maxAge: 65,
    ageCategory: 'Adult',
    requiresAgeVerification: true,
    inStock: true,
    isActive: true
  },

  // SENIOR PRODUCTS (Ages 60+)
  {
    name: 'Panado Extra Pain Relief Tablets',
    brand: 'Panado',
    description: 'Extra strength pain relief for seniors',
    detailedDescription: 'Panado Extra contains paracetamol and caffeine for enhanced pain relief. Suitable for headaches, muscle pain, and arthritis discomfort.',
    price: 28.99,
    category: 'Healthcare',
    subcategory: 'Pain Relief',
    sku: 'PANADO-EXTRA-24S',
    stockQuantity: 150,
    ingredients: 'Paracetamol 500mg, Caffeine 65mg',
    weight: '24 tablets',
    manufacturer: 'Johnson & Johnson',
    imageUrl: 'https://www.clicks.co.za/medias/panado-extra-tablets-24s.jpg',
    tags: ['pain relief', 'senior', 'arthritis', 'paracetamol'],
    minAge: 60,
    maxAge: 99,
    ageCategory: 'Senior',
    requiresAgeVerification: true,
    inStock: true,
    isActive: true
  },
  {
    name: 'Ensure Gold Vanilla 850g',
    brand: 'Ensure',
    description: 'Complete nutrition supplement for seniors',
    detailedDescription: 'Ensure Gold provides complete, balanced nutrition with 28 vitamins and minerals. Specially formulated for adults 50+ to support bone health and immunity.',
    price: 329.99,
    category: 'Healthcare',
    subcategory: 'Nutrition Supplements',
    sku: 'ENSURE-GOLD-850G',
    stockQuantity: 45,
    ingredients: 'Protein, Vitamins, Minerals, Calcium',
    weight: '850g',
    manufacturer: 'Abbott',
    imageUrl: 'https://www.clicks.co.za/medias/ensure-gold-vanilla-850g.jpg',
    tags: ['nutrition', 'senior', 'supplement', 'vanilla'],
    minAge: 50,
    maxAge: 99,
    ageCategory: 'Senior',
    inStock: true,
    isActive: true
  },
  {
    name: 'Large Print Crossword Puzzle Book',
    brand: 'Readers Digest',
    description: 'Large print crossword puzzles for seniors',
    detailedDescription: 'Collection of 100 crossword puzzles in large, easy-to-read print. Perfect for keeping the mind active and entertained.',
    price: 79.99,
    category: 'Entertainment',
    subcategory: 'Books & Puzzles',
    sku: 'RD-CROSSWORD-LP',
    stockQuantity: 35,
    weight: '200g',
    manufacturer: 'Readers Digest',
    imageUrl: 'https://www.cna.co.za/medias/readers-digest-large-print-crosswords.jpg',
    tags: ['crossword', 'large print', 'puzzle', 'senior'],
    minAge: 55,
    maxAge: 99,
    ageCategory: 'Senior',
    inStock: true,
    isActive: true
  },

  // ALL AGES PRODUCTS
  {
    name: 'Sunlight Bar Soap 125g',
    brand: 'Sunlight',
    description: 'Multi-purpose bar soap for the whole family',
    detailedDescription: 'Sunlight bar soap is gentle on skin yet tough on dirt. Perfect for washing hands, face, and body for the entire family.',
    price: 8.99,
    category: 'Healthcare',
    subcategory: 'Personal Care',
    sku: 'SUNLIGHT-BAR-125G',
    stockQuantity: 200,
    weight: '125g',
    manufacturer: 'Unilever',
    imageUrl: 'https://www.sunlight.co.za/medias/sunlight-bar-soap-125g.jpg',
    tags: ['soap', 'family', 'personal care', 'sunlight'],
    minAge: 0,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },
  {
    name: 'Woolworths Fruit & Nut Mix 500g',
    brand: 'Woolworths',
    description: 'Premium mixed nuts and dried fruits',
    detailedDescription: 'A healthy mix of almonds, cashews, raisins, and dried cranberries. Perfect snack for all ages, packed with nutrients and natural energy.',
    price: 124.99,
    category: 'Groceries',
    subcategory: 'Snacks',
    sku: 'WW-FRUITNUT-500G',
    stockQuantity: 75,
    weight: '500g',
    manufacturer: 'Woolworths',
    imageUrl: 'https://www.woolworths.co.za/medias/woolworths-fruit-nut-mix-500g.jpg',
    tags: ['healthy snack', 'nuts', 'dried fruit', 'premium'],
    minAge: 3,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  }
];

async function seedAgeBasedProducts() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🌱 Seeding age-based products for better filtering...\n');

    let addedCount = 0;

    for (const product of ageBasedProducts) {
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
            product.weight,
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
          console.log(`✅ ${addedCount}. Added: ${result.rows[0].name}`);
          console.log(`   Age Group: ${product.ageCategory} (${product.minAge}-${product.maxAge} years)`);
          console.log(`   Category: ${product.category} | Price: R${product.price}`);
        } else {
          console.log(`ℹ️  Skipped (exists): ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${product.name}:`, error.message);
      }
    }

    // Show comprehensive summary by age group
    console.log('\n📊 AGE-BASED PRODUCT DISTRIBUTION:');
    console.log('=' .repeat(60));

    const ageStats = await pool.query(`
      SELECT 
        "ageCategory",
        COUNT(*) as product_count,
        MIN("minAge") as min_age,
        MAX("maxAge") as max_age,
        ROUND(AVG(price), 2) as avg_price
      FROM "products" 
      GROUP BY "ageCategory"
      ORDER BY 
        CASE "ageCategory" 
          WHEN 'Toddler' THEN 1
          WHEN 'Child' THEN 2  
          WHEN 'Teen' THEN 3
          WHEN 'Adult' THEN 4
          WHEN 'Senior' THEN 5
          WHEN 'All Ages' THEN 6
        END
    `);

    ageStats.rows.forEach(stat => {
      console.log(`👥 ${stat.ageCategory}: ${stat.product_count} products`);
      console.log(`   Age Range: ${stat.min_age}-${stat.max_age} years`);
      console.log(`   Avg Price: R${stat.avg_price}`);
      console.log('');
    });

    // Show category distribution
    const categoryStats = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM "products" 
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log('📂 PRODUCTS BY CATEGORY:');
    categoryStats.rows.forEach(stat => {
      console.log(`  • ${stat.category}: ${stat.count} products`);
    });

    // Final totals
    const totalProducts = await pool.query('SELECT COUNT(*) as total FROM "products"');
    console.log(`\n🎉 TOTAL PRODUCTS: ${totalProducts.rows[0].total}`);
    console.log(`✅ Added ${addedCount} new age-specific products`);
    console.log('✅ Age-based filtering now available for all dependents!');
    
  } catch (error) {
    console.error('❌ Error seeding age-based products:', error.message);
  } finally {
    await pool.end();
  }
}

seedAgeBasedProducts();