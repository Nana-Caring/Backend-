const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nanacaring',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Products with OneDrive image URLs
// Note: OneDrive share URLs need to be converted to direct image URLs
// The format is usually: https://onedrive.live.com/download?cid=YOUR_CID&resid=FILE_ID&authkey=AUTH_KEY
const productsWithOneDriveImages = [
  // GROCERIES
  {
    name: 'Organic Fresh Apples 1kg',
    brand: 'Fresh Produce Co.',
    description: 'Fresh organic apples, perfect for healthy snacking',
    detailedDescription: 'Premium quality organic apples sourced from local farms. Rich in vitamins and fiber, these apples are perfect for the whole family.',
    price: 45.99,
    category: 'Groceries',
    subcategory: 'Fresh Fruits',
    sku: 'APPLE-ORG-1KG',
    stockQuantity: 100,
    weight: '1000g',
    manufacturer: 'Fresh Produce Co.',
    // OneDrive image URL - you'll need to replace with actual direct links
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image1.jpg', 
    tags: ['organic', 'fresh', 'healthy', 'vitamin C'],
    inStock: true,
    isActive: true,
    nutritionalInfo: {
      calories: 52,
      protein: 0.3,
      carbohydrates: 14,
      fiber: 2.4,
      sugar: 10
    },
    minAge: 6,
    maxAge: 100,
    ageCategory: 'All Ages'
  },
  {
    name: 'Whole Grain Bread Loaf',
    brand: 'Baker\'s Best',
    description: 'Nutritious whole grain bread for daily meals',
    detailedDescription: 'Freshly baked whole grain bread made with premium ingredients. Perfect for sandwiches, toast, or as a side with meals.',
    price: 22.99,
    category: 'Groceries',
    subcategory: 'Bakery',
    sku: 'BREAD-WG-LOAF',
    stockQuantity: 80,
    weight: '700g',
    manufacturer: 'Baker\'s Best Bakery',
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image2.jpg',
    tags: ['whole grain', 'fresh', 'daily bread', 'nutritious'],
    inStock: true,
    isActive: true,
    nutritionalInfo: {
      calories: 247,
      protein: 8.2,
      carbohydrates: 49,
      fiber: 7.4,
      sugar: 3.2
    },
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages'
  },
  
  // EDUCATION
  {
    name: 'Educational Puzzle Set 500 Pieces',
    brand: 'Learning Fun',
    description: 'Colorful 500-piece puzzle for cognitive development',
    detailedDescription: 'Beautiful landscape puzzle that helps develop problem-solving skills, patience, and concentration. Perfect for family bonding time.',
    price: 159.99,
    category: 'Education',
    subcategory: 'Puzzles & Games',
    sku: 'PUZZLE-500-LF',
    stockQuantity: 45,
    weight: '600g',
    manufacturer: 'Learning Fun Co.',
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image3.jpg', // This should match your puzzle image
    tags: ['puzzle', 'educational', 'cognitive development', '500 pieces'],
    inStock: true,
    isActive: true,
    minAge: 8,
    maxAge: 99,
    ageCategory: 'Child',
    requiresAgeVerification: false
  },
  {
    name: 'Children\'s Learning Tablet',
    brand: 'EduTech Kids',
    description: 'Interactive learning tablet designed for children',
    detailedDescription: 'Kid-friendly educational tablet with pre-loaded learning apps, games, and parental controls. Durable design perfect for young learners.',
    price: 899.99,
    category: 'Education',
    subcategory: 'Electronics',
    sku: 'TABLET-EDU-KIDS',
    stockQuantity: 25,
    weight: '450g',
    manufacturer: 'EduTech Solutions',
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image4.jpg',
    tags: ['tablet', 'educational', 'children', 'interactive learning'],
    inStock: true,
    isActive: true,
    minAge: 3,
    maxAge: 12,
    ageCategory: 'Child',
    requiresAgeVerification: false
  },
  
  // HEALTHCARE
  {
    name: 'Children\'s Multivitamin Gummies',
    brand: 'Healthy Kids',
    description: 'Delicious multivitamin gummies for children\'s health',
    detailedDescription: 'Fun fruit-flavored gummy vitamins packed with essential nutrients to support growing children. No artificial colors or flavors.',
    price: 129.99,
    category: 'Healthcare',
    subcategory: 'Vitamins & Supplements',
    sku: 'VIT-GUMMY-KIDS',
    stockQuantity: 60,
    weight: '250g',
    manufacturer: 'Healthy Kids Nutrition',
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image5.jpg',
    tags: ['vitamins', 'children', 'gummies', 'health'],
    inStock: true,
    isActive: true,
    minAge: 2,
    maxAge: 12,
    ageCategory: 'Child',
    requiresAgeVerification: false
  },
  {
    name: 'Family First Aid Kit',
    brand: 'SafeCare',
    description: 'Complete first aid kit for home and travel',
    detailedDescription: 'Comprehensive first aid kit containing bandages, antiseptics, thermometer, and essential medical supplies for emergency care.',
    price: 299.99,
    category: 'Healthcare',
    subcategory: 'First Aid',
    sku: 'FIRSTAID-FAMILY',
    stockQuantity: 30,
    weight: '800g',
    manufacturer: 'SafeCare Medical',
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image6.jpg',
    tags: ['first aid', 'emergency', 'family', 'medical'],
    inStock: true,
    isActive: true,
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages',
    requiresAgeVerification: false
  },
  
  // ENTERTAINMENT
  {
    name: 'Family Board Game Collection',
    brand: 'Fun Times',
    description: 'Collection of classic board games for family entertainment',
    detailedDescription: 'A wonderful collection including Monopoly, Scrabble, and Snakes & Ladders. Perfect for family game nights and building memories.',
    price: 399.99,
    category: 'Entertainment',
    subcategory: 'Board Games',
    sku: 'BOARDGAME-COLLECTION',
    stockQuantity: 35,
    weight: '1200g',
    manufacturer: 'Fun Times Games',
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image7.jpg',
    tags: ['board games', 'family', 'entertainment', 'collection'],
    inStock: true,
    isActive: true,
    minAge: 6,
    maxAge: 99,
    ageCategory: 'All Ages',
    requiresAgeVerification: false
  },
  {
    name: 'Bluetooth Wireless Headphones',
    brand: 'SoundWave',
    description: 'High-quality wireless headphones for music and calls',
    detailedDescription: 'Premium Bluetooth headphones with noise cancellation, long battery life, and superior sound quality. Perfect for music lovers.',
    price: 749.99,
    category: 'Entertainment',
    subcategory: 'Audio Equipment',
    sku: 'HEADPHONES-BT-SW',
    stockQuantity: 40,
    weight: '300g',
    manufacturer: 'SoundWave Audio',
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image8.jpg',
    tags: ['headphones', 'bluetooth', 'wireless', 'music'],
    inStock: true,
    isActive: true,
    minAge: 12,
    maxAge: 99,
    ageCategory: 'Teen',
    requiresAgeVerification: false
  },
  
  // PREGNANCY
  {
    name: 'Prenatal Vitamin Complex',
    brand: 'MomCare',
    description: 'Essential prenatal vitamins for expecting mothers',
    detailedDescription: 'Complete prenatal vitamin formula with folic acid, iron, and DHA to support healthy pregnancy and fetal development.',
    price: 249.99,
    category: 'Pregnancy',
    subcategory: 'Prenatal Care',
    sku: 'PRENATAL-VIT-MC',
    stockQuantity: 50,
    weight: '150g',
    manufacturer: 'MomCare Health',
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image9.jpg',
    tags: ['prenatal', 'vitamins', 'pregnancy', 'health'],
    inStock: true,
    isActive: true,
    minAge: 18,
    maxAge: 50,
    ageCategory: 'Adult',
    requiresAgeVerification: true
  },
  {
    name: 'Maternity Support Pillow',
    brand: 'ComfortMom',
    description: 'Ergonomic support pillow for pregnant women',
    detailedDescription: 'Specially designed maternity pillow that provides optimal support for back, belly, and legs during pregnancy and breastfeeding.',
    price: 599.99,
    category: 'Pregnancy',
    subcategory: 'Maternity Accessories',
    sku: 'MAT-PILLOW-CM',
    stockQuantity: 25,
    weight: '1500g',
    manufacturer: 'ComfortMom Products',
    imageUrl: 'https://1drv.ms/i/c/c29be3c60d57f1f4/image10.jpg',
    tags: ['maternity', 'pillow', 'support', 'pregnancy comfort'],
    inStock: true,
    isActive: true,
    minAge: 18,
    maxAge: 50,
    ageCategory: 'Adult',
    requiresAgeVerification: false
  }
];

async function seedOneDriveProducts() {
  try {
    console.log('🌱 Starting to seed products with OneDrive images...');

    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    // Check if products table exists and has required columns
    const checkTable = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    
    if (checkTable.rows.length === 0) {
      console.log('❌ Products table not found');
      return;
    }

    console.log('📋 Products table structure:');
    checkTable.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type}`);
    });

    let insertedCount = 0;
    let errorCount = 0;

    for (const product of productsWithOneDriveImages) {
      try {
        // Check if product already exists by SKU
        const existingProduct = await pool.query(
          'SELECT id FROM products WHERE sku = $1',
          [product.sku]
        );

        if (existingProduct.rows.length > 0) {
          console.log(`⚠️  Product ${product.sku} already exists, skipping...`);
          continue;
        }

        // Insert the product
        const insertQuery = `
          INSERT INTO products (
            name, brand, description, "detailedDescription", price, category, 
            subcategory, sku, "stockQuantity", weight, manufacturer, 
            "imageUrl", tags, "inStock", "isActive", "nutritionalInfo",
            "minAge", "maxAge", "ageCategory", "requiresAgeVerification",
            "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
          ) RETURNING id, name
        `;

        const values = [
          product.name,
          product.brand,
          product.description,
          product.detailedDescription,
          product.price,
          product.category,
          product.subcategory || null,
          product.sku,
          product.stockQuantity || 0,
          product.weight || null,
          product.manufacturer || null,
          product.imageUrl,
          product.tags ? JSON.stringify(product.tags) : null,
          product.inStock !== undefined ? product.inStock : true,
          product.isActive !== undefined ? product.isActive : true,
          product.nutritionalInfo ? JSON.stringify(product.nutritionalInfo) : null,
          product.minAge || null,
          product.maxAge || null,
          product.ageCategory || 'All Ages',
          product.requiresAgeVerification || false
        ];

        const result = await pool.query(insertQuery, values);
        console.log(`✅ Added product: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
        insertedCount++;

      } catch (error) {
        console.error(`❌ Error inserting product ${product.name}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 SEEDING SUMMARY:');
    console.log(`✅ Successfully inserted: ${insertedCount} products`);
    console.log(`❌ Errors encountered: ${errorCount} products`);
    
    // Show final product count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM products WHERE "isActive" = true');
    console.log(`📦 Total active products in database: ${countResult.rows[0].total}`);

    // Show products by category
    const categoryResult = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM products 
      WHERE "isActive" = true 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    console.log('\n📋 Products by category:');
    categoryResult.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} products`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Instructions for converting OneDrive URLs
function printOneDriveInstructions() {
  console.log('\n📝 IMPORTANT: OneDrive Image URL Instructions');
  console.log('================================================');
  console.log('To use your OneDrive images, you need to:');
  console.log('');
  console.log('1. Open your OneDrive folder: https://1drv.ms/f/c/c29be3c60d57f1f4/EjDuo-jcn5xDhzBngn6yQocBM1Rq8TY7WU7WXLtUKczT-A?e=zGSjUS');
  console.log('2. For each image, right-click and select "Embed"');
  console.log('3. Copy the direct image URL from the embed code');
  console.log('4. Replace the placeholder URLs in this script with actual direct links');
  console.log('');
  console.log('Example OneDrive direct URL format:');
  console.log('https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21[FILE_ID]&authkey=[AUTH_KEY]&width=800&height=600');
  console.log('');
  console.log('Or use the download format:');
  console.log('https://onedrive.live.com/download?resid=C29BE3C60D57F1F4%21[FILE_ID]&authkey=[AUTH_KEY]');
  console.log('');
}

// Run the seeding
if (require.main === module) {
  printOneDriveInstructions();
  console.log('Starting in 5 seconds...');
  setTimeout(seedOneDriveProducts, 5000);
}

module.exports = { seedOneDriveProducts, productsWithOneDriveImages };