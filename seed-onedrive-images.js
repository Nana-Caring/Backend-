const { Pool } = require('pg');

// STEP-BY-STEP GUIDE TO GET YOUR ONEDRIVE IMAGES
console.log('🎯 STEP-BY-STEP GUIDE: Adding Your OneDrive Images');
console.log('==================================================\n');

console.log('📁 1. OPEN YOUR ONEDRIVE FOLDER:');
console.log('   Go to: https://1drv.ms/f/c/c29be3c60d57f1f4/EjDuo-jcn5xDhzBngn6yQocBM1Rq8TY7WU7WXLtUKczT-A?e=zGSjUS\n');

console.log('🖼️  2. FOR EACH IMAGE FILE:');
console.log('   a) Click on the image to select it');
console.log('   b) Click the "Share" button (🔗 icon)');
console.log('   c) Click "Copy link" to get a shareable URL');
console.log('   d) The URL will look like: https://1drv.ms/i/c/c29be3c60d57f1f4/FILE_ID?e=ACCESS_KEY');
console.log('   e) Extract the FILE_ID part from the URL\n');

console.log('📝 3. REPLACE PLACEHOLDERS IN THE SCRIPT BELOW:\n');

// Products specifically matching your puzzle image and other common items
const productsWithRealOneDriveStructure = [
  {
    name: 'Educational Puzzle Set 500 Pieces - Country Life',
    brand: 'Country Life Puzzles',
    description: 'Beautiful 500-piece country life puzzle with vibrant colors',
    detailedDescription: 'This stunning puzzle features a colorful country life scene with flowers, birds, and rural landscapes. Perfect for developing cognitive skills and providing hours of entertainment for the whole family.',
    price: 159.99,
    category: 'Education',
    subcategory: 'Puzzles & Games',
    sku: 'PUZZLE-COUNTRY-500',
    stockQuantity: 45,
    weight: '600g',
    manufacturer: 'Country Life Puzzles',
    // REPLACE "YOUR_PUZZLE_FILE_ID" with actual file ID from your OneDrive
    imageUrl: 'https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21YOUR_PUZZLE_FILE_ID&authkey=!zGSjUS&width=800&height=600',
    tags: ['puzzle', 'educational', 'country life', '500 pieces', 'family fun'],
    inStock: true,
    isActive: true,
    minAge: 8,
    maxAge: 99,
    ageCategory: 'Child',
    requiresAgeVerification: false
  },
  {
    name: 'Fresh Organic Apples 1kg Bag',
    brand: 'Fresh Farm Produce',
    description: 'Premium quality organic apples, perfect for healthy snacking',
    detailedDescription: 'These crisp, juicy organic apples are sourced from local farms. Rich in vitamins, fiber, and natural antioxidants. Perfect for the whole family.',
    price: 45.99,
    category: 'Groceries',
    subcategory: 'Fresh Fruits',
    sku: 'APPLE-ORGANIC-1KG',
    stockQuantity: 100,
    weight: '1000g',
    manufacturer: 'Fresh Farm Co-op',
    // REPLACE "YOUR_APPLE_FILE_ID" with actual file ID
    imageUrl: 'https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21YOUR_APPLE_FILE_ID&authkey=!zGSjUS&width=800&height=600',
    tags: ['organic', 'fresh fruit', 'healthy', 'vitamin C', 'family'],
    inStock: true,
    isActive: true,
    nutritionalInfo: {
      calories: 52,
      protein: 0.3,
      carbohydrates: 14,
      fiber: 2.4,
      sugar: 10
    },
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages'
  },
  {
    name: 'Children\'s Educational Tablet 10 Inch',
    brand: 'KidsLearn Pro',
    description: 'Kid-friendly learning tablet with educational apps and parental controls',
    detailedDescription: 'Specially designed educational tablet featuring pre-loaded learning apps, interactive games, and robust parental controls. Durable, child-safe design perfect for young learners.',
    price: 899.99,
    category: 'Education',
    subcategory: 'Electronics',
    sku: 'TABLET-KIDS-10IN',
    stockQuantity: 25,
    weight: '450g',
    manufacturer: 'KidsLearn Technologies',
    // REPLACE "YOUR_TABLET_FILE_ID" with actual file ID
    imageUrl: 'https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21YOUR_TABLET_FILE_ID&authkey=!zGSjUS&width=800&height=600',
    tags: ['tablet', 'educational', 'children', 'learning apps', 'parental controls'],
    inStock: true,
    isActive: true,
    minAge: 3,
    maxAge: 12,
    ageCategory: 'Child',
    requiresAgeVerification: false
  },
  {
    name: 'Multivitamin Gummies for Kids',
    brand: 'Healthy Kids Plus',
    description: 'Delicious fruit-flavored vitamin gummies for children\'s health',
    detailedDescription: 'Fun, chewable vitamin gummies packed with essential nutrients including Vitamin C, D3, and B vitamins. Natural fruit flavors with no artificial colors.',
    price: 129.99,
    category: 'Healthcare',
    subcategory: 'Vitamins & Supplements',
    sku: 'GUMMY-VIT-KIDS',
    stockQuantity: 60,
    weight: '250g',
    manufacturer: 'Healthy Kids Nutrition',
    // REPLACE "YOUR_VITAMINS_FILE_ID" with actual file ID
    imageUrl: 'https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21YOUR_VITAMINS_FILE_ID&authkey=!zGSjUS&width=800&height=600',
    tags: ['vitamins', 'children', 'gummies', 'health', 'fruit flavored'],
    inStock: true,
    isActive: true,
    minAge: 2,
    maxAge: 12,
    ageCategory: 'Child',
    requiresAgeVerification: false
  },
  {
    name: 'Complete Family First Aid Kit',
    brand: 'MediSafe',
    description: 'Comprehensive first aid kit for home, office, and travel',
    detailedDescription: 'Professional-grade first aid kit containing bandages, antiseptics, thermometer, and 50+ essential medical supplies for emergency care.',
    price: 299.99,
    category: 'Healthcare',
    subcategory: 'First Aid & Safety',
    sku: 'FIRSTAID-COMPLETE',
    stockQuantity: 30,
    weight: '800g',
    manufacturer: 'MediSafe Medical Supplies',
    // REPLACE "YOUR_FIRSTAID_FILE_ID" with actual file ID
    imageUrl: 'https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21YOUR_FIRSTAID_FILE_ID&authkey=!zGSjUS&width=800&height=600',
    tags: ['first aid', 'emergency', 'family safety', 'medical supplies'],
    inStock: true,
    isActive: true,
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages',
    requiresAgeVerification: false
  }
];

console.log('📋 EXAMPLE OF HOW TO UPDATE FILE IDs:');
console.log('=====================================');
console.log('If your OneDrive gives you this link for the puzzle:');
console.log('https://1drv.ms/i/c/c29be3c60d57f1f4/EabcDEF123xyz?e=AbCdEf');
console.log('');
console.log('Extract: EabcDEF123xyz (this is your FILE_ID)');
console.log('');
console.log('Replace in script:');
console.log('FROM: YOUR_PUZZLE_FILE_ID');
console.log('TO:   EabcDEF123xyz');
console.log('');

console.log('🚀 QUICK SETUP SCRIPT:');
console.log('======================');
console.log('1. Get all your OneDrive image file IDs');
console.log('2. Run this command to update the URLs automatically:');
console.log('');
console.log('node update-onedrive-urls.js YOUR_PUZZLE_FILE_ID YOUR_APPLE_FILE_ID YOUR_TABLET_FILE_ID YOUR_VITAMINS_FILE_ID YOUR_FIRSTAID_FILE_ID');
console.log('');

// Function to update URLs with actual file IDs
function updateProductURLs(fileIds) {
  if (!Array.isArray(fileIds) || fileIds.length < 5) {
    console.log('❌ Please provide 5 file IDs in this order:');
    console.log('   1. Puzzle image file ID');
    console.log('   2. Apple/fruit image file ID');  
    console.log('   3. Tablet image file ID');
    console.log('   4. Vitamins image file ID');
    console.log('   5. First aid kit image file ID');
    return productsWithRealOneDriveStructure;
  }

  return productsWithRealOneDriveStructure.map((product, index) => {
    if (index < fileIds.length) {
      product.imageUrl = product.imageUrl.replace(/YOUR_[A-Z_]+_FILE_ID/, fileIds[index]);
    }
    return product;
  });
}

// Database seeding function
async function seedWithOneDriveImages(fileIds = []) {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nanacaring',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('🌱 Seeding products with your OneDrive images...');

    const products = updateProductURLs(fileIds);
    let insertedCount = 0;

    for (const product of products) {
      try {
        // Check if product exists
        const existingProduct = await pool.query(
          'SELECT id FROM products WHERE sku = $1',
          [product.sku]
        );

        if (existingProduct.rows.length > 0) {
          console.log(`⚠️  Product ${product.sku} already exists, skipping...`);
          continue;
        }

        // Insert product
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
          product.name, product.brand, product.description, product.detailedDescription,
          product.price, product.category, product.subcategory, product.sku,
          product.stockQuantity, product.weight, product.manufacturer, product.imageUrl,
          JSON.stringify(product.tags), product.inStock, product.isActive,
          product.nutritionalInfo ? JSON.stringify(product.nutritionalInfo) : null,
          product.minAge, product.maxAge, product.ageCategory, product.requiresAgeVerification
        ];

        const result = await pool.query(insertQuery, values);
        console.log(`✅ Added: ${result.rows[0].name}`);
        insertedCount++;

      } catch (error) {
        console.error(`❌ Error inserting ${product.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully added ${insertedCount} products with OneDrive images!`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

// CLI interface
if (require.main === module) {
  const fileIds = process.argv.slice(2);
  
  if (fileIds.length === 0) {
    console.log('\n💡 To run with your actual file IDs:');
    console.log('node seed-onedrive-images.js FILE_ID_1 FILE_ID_2 FILE_ID_3 FILE_ID_4 FILE_ID_5');
    console.log('\nRunning with placeholder URLs for now...');
  }
  
  seedWithOneDriveImages(fileIds);
}

module.exports = { 
  seedWithOneDriveImages, 
  updateProductURLs, 
  productsWithRealOneDriveStructure 
};