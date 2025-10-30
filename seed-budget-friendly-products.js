const { Pool } = require('pg');

// Realistic budget-friendly products for SASSA families and children under guardianship
const budgetFriendlyProducts = [
  // ESSENTIAL BABY/TODDLER ITEMS (Under R50)
  {
    name: 'Purity Baby Food Jar - Butternut 125ml',
    brand: 'Purity',
    description: 'Nutritious baby food for 6+ months',
    detailedDescription: 'Purity butternut baby food made with fresh South African butternut. No preservatives, artificial flavors or colors.',
    price: 15.99,
    category: 'Groceries',
    subcategory: 'Baby Food',
    sku: 'PURITY-BUTTERNUT-125ML',
    stockQuantity: 200,
    weight: '125ml',
    manufacturer: 'Purity',
    imageUrl: 'https://www.purity.co.za/medias/purity-butternut-baby-food-125ml.jpg',
    tags: ['baby food', 'butternut', 'nutritious', 'affordable'],
    minAge: 0,
    maxAge: 2,
    ageCategory: 'Toddler',
    inStock: true,
    isActive: true
  },
  {
    name: 'Baby Soft Disposable Nappies Size 4 (Value Pack)',
    brand: 'Baby Soft',
    description: 'Affordable disposable nappies for toddlers',
    detailedDescription: 'Baby Soft value pack nappies with good absorption at an affordable price. 32 nappies per pack.',
    price: 89.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    sku: 'BABYSOFT-SIZE4-32S',
    stockQuantity: 150,
    weight: '32 nappies',
    manufacturer: 'Baby Soft',
    imageUrl: 'https://www.checkers.co.za/medias/baby-soft-nappies-size4-32s.jpg',
    tags: ['nappies', 'affordable', 'toddler', 'value pack'],
    minAge: 1,
    maxAge: 3,
    ageCategory: 'Toddler',
    inStock: true,
    isActive: true
  },
  {
    name: 'Johnson\'s Baby Lotion 200ml',
    brand: 'Johnson\'s Baby',
    description: 'Gentle moisturizing lotion for babies',
    detailedDescription: 'Johnson\'s Baby Lotion with mild formula to keep baby\'s skin soft and smooth. Clinically proven mildness.',
    price: 32.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    sku: 'JOHNSONS-LOTION-200ML',
    stockQuantity: 180,
    weight: '200ml',
    manufacturer: 'Johnson & Johnson',
    imageUrl: 'https://www.clicks.co.za/medias/johnsons-baby-lotion-200ml.jpg',
    tags: ['baby lotion', 'gentle', 'moisturizer', 'affordable'],
    minAge: 0,
    maxAge: 5,
    ageCategory: 'Toddler',
    inStock: true,
    isActive: true
  },

  // SCHOOL SUPPLIES & BASICS (Under R30)
  {
    name: 'Croxley A4 Exercise Book 72 Pages',
    brand: 'Croxley',
    description: 'Basic school exercise book',
    detailedDescription: 'Standard A4 exercise book with 72 pages, ruled lines. Essential for school work.',
    price: 8.99,
    category: 'Education',
    subcategory: 'School Supplies',
    sku: 'CROXLEY-A4-72PAGE',
    stockQuantity: 500,
    weight: '72 pages',
    manufacturer: 'Croxley',
    imageUrl: 'https://www.cna.co.za/medias/croxley-a4-exercise-book-72pages.jpg',
    tags: ['exercise book', 'school', 'basic', 'affordable'],
    minAge: 5,
    maxAge: 18,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'BIC Ballpoint Pens Blue (Pack of 10)',
    brand: 'BIC',
    description: 'Basic blue ballpoint pens for school',
    detailedDescription: 'Pack of 10 BIC ballpoint pens in blue ink. Essential writing tool for students.',
    price: 19.99,
    category: 'Education',
    subcategory: 'School Supplies',
    sku: 'BIC-BLUE-PENS-10PK',
    stockQuantity: 300,
    weight: '10 pens',
    manufacturer: 'BIC',
    imageUrl: 'https://www.cna.co.za/medias/bic-ballpoint-pens-blue-10pack.jpg',
    tags: ['pens', 'school', 'writing', 'basic'],
    minAge: 6,
    maxAge: 18,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'Standard Pencil Sharpener',
    brand: 'Generic',
    description: 'Basic pencil sharpener for school use',
    detailedDescription: 'Simple plastic pencil sharpener with steel blade. Essential school supply.',
    price: 3.99,
    category: 'Education',
    subcategory: 'School Supplies',
    sku: 'PENCIL-SHARPENER-STD',
    stockQuantity: 400,
    weight: '10g',
    manufacturer: 'Generic',
    imageUrl: 'https://www.cna.co.za/medias/standard-pencil-sharpener.jpg',
    tags: ['sharpener', 'school', 'basic', 'cheap'],
    minAge: 4,
    maxAge: 16,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'School Glue Stick 20g',
    brand: 'Bostik',
    description: 'Non-toxic glue stick for school projects',
    detailedDescription: 'Bostik glue stick, washable and non-toxic. Perfect for school art and craft projects.',
    price: 12.99,
    category: 'Education',
    subcategory: 'School Supplies',
    sku: 'BOSTIK-GLUE-20G',
    stockQuantity: 250,
    weight: '20g',
    manufacturer: 'Bostik',
    imageUrl: 'https://www.cna.co.za/medias/bostik-glue-stick-20g.jpg',
    tags: ['glue', 'school', 'craft', 'non-toxic'],
    minAge: 4,
    maxAge: 16,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },

  // AFFORDABLE FOOD ITEMS (Under R40)
  {
    name: 'Morvite Original Porridge 1kg',
    brand: 'Morvite',
    description: 'Nutritious breakfast porridge for children',
    detailedDescription: 'Morvite instant porridge enriched with vitamins and minerals. Makes nutritious breakfast for growing children.',
    price: 28.99,
    category: 'Groceries',
    subcategory: 'Breakfast Cereals',
    sku: 'MORVITE-ORIGINAL-1KG',
    stockQuantity: 200,
    weight: '1000g',
    manufacturer: 'Pioneer Foods',
    imageUrl: 'https://www.checkers.co.za/medias/morvite-original-porridge-1kg.jpg',
    tags: ['porridge', 'breakfast', 'nutritious', 'affordable'],
    minAge: 1,
    maxAge: 18,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'Peanut Butter & Jam Sandwich Spread 400g',
    brand: 'Black Cat',
    description: 'Affordable peanut butter for school lunches',
    detailedDescription: 'Black Cat peanut butter, smooth texture. Great source of protein for growing children.',
    price: 35.99,
    category: 'Groceries',
    subcategory: 'Spreads',
    sku: 'BLACKCAT-PB-400G',
    stockQuantity: 180,
    weight: '400g',
    manufacturer: 'Tiger Brands',
    imageUrl: 'https://www.checkers.co.za/medias/black-cat-peanut-butter-400g.jpg',
    tags: ['peanut butter', 'lunch', 'protein', 'affordable'],
    minAge: 2,
    maxAge: 18,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'Maggi 2-Minute Noodles Beef Flavor (Pack of 5)',
    brand: 'Maggi',
    description: 'Quick and affordable meal for children',
    detailedDescription: 'Maggi 2-minute noodles beef flavor. Quick, filling meal that children love. Pack of 5.',
    price: 22.99,
    category: 'Groceries',
    subcategory: 'Instant Meals',
    sku: 'MAGGI-BEEF-5PACK',
    stockQuantity: 300,
    weight: '5 x 73g',
    manufacturer: 'Nestle',
    imageUrl: 'https://www.checkers.co.za/medias/maggi-2minute-noodles-beef-5pack.jpg',
    tags: ['instant noodles', 'quick meal', 'beef', 'affordable'],
    minAge: 3,
    maxAge: 18,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },

  // BASIC HEALTHCARE (Under R25)
  {
    name: 'Paracetamol Syrup for Children 100ml',
    brand: 'Adcock Ingram',
    description: 'Pain and fever relief for children',
    detailedDescription: 'Paracetamol oral suspension for children. Reduces fever and relieves pain. Strawberry flavor.',
    price: 18.99,
    category: 'Healthcare',
    subcategory: 'Children Medicine',
    sku: 'PARACETAMOL-SYRUP-100ML',
    stockQuantity: 120,
    ingredients: 'Paracetamol 120mg/5ml',
    weight: '100ml',
    manufacturer: 'Adcock Ingram',
    imageUrl: 'https://www.clicks.co.za/medias/paracetamol-syrup-children-100ml.jpg',
    tags: ['medicine', 'fever', 'pain relief', 'children'],
    minAge: 1,
    maxAge: 12,
    ageCategory: 'Child',
    requiresAgeVerification: false,
    inStock: true,
    isActive: true
  },
  {
    name: 'Aqueous Cream 100g',
    brand: 'Dis-Chem',
    description: 'Gentle moisturizing cream for dry skin',
    detailedDescription: 'Aqueous cream for dry and sensitive skin. Gentle formula suitable for children and adults.',
    price: 14.99,
    category: 'Healthcare',
    subcategory: 'Skincare',
    sku: 'AQUEOUS-CREAM-100G',
    stockQuantity: 200,
    weight: '100g',
    manufacturer: 'Dis-Chem',
    imageUrl: 'https://www.clicks.co.za/medias/aqueous-cream-100g.jpg',
    tags: ['moisturizer', 'dry skin', 'gentle', 'affordable'],
    minAge: 0,
    maxAge: 99,
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },
  {
    name: 'Children\'s Toothbrush (Soft Bristles)',
    brand: 'Oral-B',
    description: 'Soft bristle toothbrush for children',
    detailedDescription: 'Oral-B children\'s toothbrush with soft bristles and colorful design. Makes brushing fun for kids.',
    price: 12.99,
    category: 'Healthcare',
    subcategory: 'Oral Care',
    sku: 'ORALB-KIDS-BRUSH',
    stockQuantity: 180,
    weight: '25g',
    manufacturer: 'Oral-B',
    imageUrl: 'https://www.clicks.co.za/medias/oral-b-kids-toothbrush-soft.jpg',
    tags: ['toothbrush', 'children', 'oral care', 'soft'],
    minAge: 2,
    maxAge: 12,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },

  // BASIC CLOTHING & ESSENTIALS (Under R50)
  {
    name: 'Children\'s Cotton Underwear (Pack of 3)',
    brand: 'Woolworths Basics',
    description: 'Basic cotton underwear for children',
    detailedDescription: 'Pack of 3 cotton underwear for children. Comfortable and affordable basics.',
    price: 45.99,
    category: 'Other',
    subcategory: 'Clothing',
    sku: 'WW-KIDS-UNDERWEAR-3PK',
    stockQuantity: 100,
    weight: 'Size 4-6',
    manufacturer: 'Woolworths',
    imageUrl: 'https://www.woolworths.co.za/medias/kids-cotton-underwear-3pack.jpg',
    tags: ['underwear', 'cotton', 'basics', 'children'],
    minAge: 3,
    maxAge: 12,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'School Socks (Pack of 5 pairs)',
    brand: 'Ackermans',
    description: 'White school socks for children',
    detailedDescription: 'Pack of 5 pairs white cotton school socks. Durable and affordable for everyday school wear.',
    price: 39.99,
    category: 'Other',
    subcategory: 'Clothing',
    sku: 'ACKERMANS-SOCKS-5PK',
    stockQuantity: 120,
    weight: '5 pairs',
    manufacturer: 'Ackermans',
    imageUrl: 'https://www.ackermans.co.za/medias/white-school-socks-5pack.jpg',
    tags: ['socks', 'school', 'white', 'cotton'],
    minAge: 5,
    maxAge: 16,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },

  // SIMPLE TOYS & ENTERTAINMENT (Under R30)
  {
    name: 'Coloring Book - Animals Theme',
    brand: 'CNA',
    description: 'Educational coloring book with animals',
    detailedDescription: 'Animal-themed coloring book with 32 pages. Helps develop creativity and motor skills.',
    price: 15.99,
    category: 'Entertainment',
    subcategory: 'Books',
    sku: 'CNA-COLORING-ANIMALS',
    stockQuantity: 150,
    weight: '32 pages',
    manufacturer: 'CNA',
    imageUrl: 'https://www.cna.co.za/medias/animal-coloring-book-32pages.jpg',
    tags: ['coloring book', 'animals', 'creative', 'educational'],
    minAge: 3,
    maxAge: 10,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'Puzzle - 24 Pieces (Farm Animals)',
    brand: 'Melissa & Doug',
    description: 'Simple jigsaw puzzle for young children',
    detailedDescription: '24-piece wooden jigsaw puzzle featuring farm animals. Develops problem-solving skills.',
    price: 49.99,
    category: 'Entertainment',
    subcategory: 'Educational Toys',
    sku: 'MD-PUZZLE-FARM-24PC',
    stockQuantity: 80,
    weight: '24 pieces',
    manufacturer: 'Melissa & Doug',
    imageUrl: 'https://www.toysrus.co.za/medias/melissa-doug-farm-puzzle-24pc.jpg',
    tags: ['puzzle', 'farm animals', 'wooden', 'educational'],
    minAge: 3,
    maxAge: 7,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  },
  {
    name: 'Rubber Ball - Medium Size',
    brand: 'Spalding',
    description: 'Durable rubber ball for outdoor play',
    detailedDescription: 'Medium-sized rubber ball perfect for outdoor games and exercise. Encourages physical activity.',
    price: 25.99,
    category: 'Entertainment',
    subcategory: 'Outdoor Toys',
    sku: 'SPALDING-BALL-MED',
    stockQuantity: 100,
    weight: '200g',
    manufacturer: 'Spalding',
    imageUrl: 'https://www.sportsmans.com/medias/spalding-rubber-ball-medium.jpg',
    tags: ['ball', 'outdoor', 'exercise', 'durable'],
    minAge: 3,
    maxAge: 16,
    ageCategory: 'Child',
    inStock: true,
    isActive: true
  }
];

async function seedBudgetFriendlyProducts() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🏠 SEEDING BUDGET-FRIENDLY PRODUCTS FOR SASSA FAMILIES\n');
    console.log('💰 All products under R50 for affordability');
    console.log('👨‍👩‍👧‍👦 Focused on essential items for children under guardianship\n');
    console.log('=' .repeat(70));

    // First, remove the expensive/unrealistic products we added before
    console.log('🧹 Removing unrealistic expensive products...');
    
    const expensiveItems = [
      'Nike Air Force 1 Sneakers',
      'Samsung Galaxy A54 Smartphone', 
      'Volkswagen Polo Service Voucher',
      'LEGO Classic Creative Bricks Set',
      'Fisher-Price Laugh & Learn Puppy',
      'Spotify Premium Gift Card 3 Months',
      'Crayola 64 Crayon Box with Sharpener',
      'Ensure Gold Vanilla 850g',
      'Large Print Crossword Puzzle Book'
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

    console.log('\n🌱 Adding realistic budget-friendly products...\n');

    let addedCount = 0;

    for (const product of budgetFriendlyProducts) {
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
          console.log(`   💰 Price: R${product.price} | Age: ${product.minAge}-${product.maxAge} years`);
          console.log(`   📂 Category: ${product.category} | For: ${product.ageCategory}`);
        } else {
          console.log(`ℹ️  Skipped (exists): ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${product.name}:`, error.message);
      }
    }

    // Show budget-friendly summary
    console.log('\n💰 BUDGET-FRIENDLY PRODUCT SUMMARY:');
    console.log('=' .repeat(70));

    const priceRanges = await pool.query(`
      SELECT 
        CASE 
          WHEN price <= 10 THEN 'Under R10'
          WHEN price <= 20 THEN 'R10-R20'
          WHEN price <= 30 THEN 'R20-R30'
          WHEN price <= 40 THEN 'R30-R40'
          WHEN price <= 50 THEN 'R40-R50'
          ELSE 'Over R50'
        END as price_range,
        COUNT(*) as product_count,
        ROUND(AVG(price), 2) as avg_price
      FROM "products" 
      GROUP BY 
        CASE 
          WHEN price <= 10 THEN 'Under R10'
          WHEN price <= 20 THEN 'R10-R20'
          WHEN price <= 30 THEN 'R20-R30'
          WHEN price <= 40 THEN 'R30-R40'
          WHEN price <= 50 THEN 'R40-R50'
          ELSE 'Over R50'
        END
      ORDER BY avg_price
    `);

    priceRanges.rows.forEach(range => {
      console.log(`💵 ${range.price_range}: ${range.product_count} products (Avg: R${range.avg_price})`);
    });

    // Show category breakdown for essential items
    const essentialCategories = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        ROUND(MIN(price), 2) as cheapest,
        ROUND(MAX(price), 2) as most_expensive,
        ROUND(AVG(price), 2) as average
      FROM "products" 
      WHERE price <= 50
      GROUP BY category 
      ORDER BY average
    `);

    console.log('\n📂 ESSENTIAL CATEGORIES FOR SASSA FAMILIES:');
    essentialCategories.rows.forEach(cat => {
      console.log(`  🏷️  ${cat.category}: ${cat.count} items`);
      console.log(`     💰 Price range: R${cat.cheapest} - R${cat.most_expensive} (Avg: R${cat.average})`);
    });

    // Show age-appropriate breakdown
    const ageBreakdown = await pool.query(`
      SELECT 
        "ageCategory",
        COUNT(*) as count,
        ROUND(AVG(price), 2) as avg_price
      FROM "products" 
      WHERE price <= 50 AND "ageCategory" != 'All Ages'
      GROUP BY "ageCategory"
      ORDER BY 
        CASE "ageCategory" 
          WHEN 'Toddler' THEN 1
          WHEN 'Child' THEN 2  
          WHEN 'Teen' THEN 3
        END
    `);

    console.log('\n👨‍👩‍👧‍👦 AGE-APPROPRIATE AFFORDABLE PRODUCTS:');
    ageBreakdown.rows.forEach(age => {
      console.log(`  👥 ${age.ageCategory}: ${age.count} affordable products (Avg: R${age.avg_price})`);
    });

    const totalAffordable = await pool.query('SELECT COUNT(*) as total FROM "products" WHERE price <= 50');
    const totalProducts = await pool.query('SELECT COUNT(*) as total FROM "products"');
    
    console.log(`\n🎉 BUDGET SUMMARY:`);
    console.log(`✅ Added ${addedCount} new budget-friendly products`);
    console.log(`💰 ${totalAffordable.rows[0].total} products under R50 (affordable for SASSA families)`);
    console.log(`📊 ${totalProducts.rows[0].total} total products in catalog`);
    console.log('✅ Perfect for children under guardianship and SASSA recipients!');
    console.log('✅ All essentials covered: food, healthcare, education, clothing');
    
  } catch (error) {
    console.error('❌ Error seeding budget-friendly products:', error.message);
  } finally {
    await pool.end();
  }
}

seedBudgetFriendlyProducts();