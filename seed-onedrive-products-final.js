require('dotenv').config();
const { Product } = require('./models');

/**
 * 🎯 OneDrive Image Products Seeder
 * 
 * This script helps you add products with your OneDrive images.
 * 
 * STEP 1: Get your OneDrive image URLs
 * ====================================
 * 1. Go to: https://1drv.ms/f/c/c29be3c60d57f1f4/EjDuo-jcn5xDhzBngn6yQocBM1Rq8TY7WU7WXLtUKczT-A?e=zGSjUS
 * 2. For each image:
 *    - Click on the image
 *    - Click "Share" button 
 *    - Click "Copy link"
 *    - You'll get a URL like: https://1drv.ms/i/c/c29be3c60d57f1f4/YOUR_FILE_ID?e=ACCESS_KEY
 * 3. Extract the YOUR_FILE_ID part and replace below
 */

// 🖼️ REPLACE THESE FILE IDs WITH YOUR ACTUAL ONEDRIVE FILE IDs
const IMAGE_FILE_IDS = {
  PUZZLE: 'YOUR_PUZZLE_FILE_ID',        // The beautiful country life puzzle from your attachment
  APPLE: 'YOUR_APPLE_FILE_ID',          // Fresh fruit/apple image
  TABLET: 'YOUR_TABLET_FILE_ID',        // Educational tablet image  
  VITAMINS: 'YOUR_VITAMINS_FILE_ID',    // Children's vitamins image
  FIRSTAID: 'YOUR_FIRSTAID_FILE_ID',    // First aid kit image
  BREAD: 'YOUR_BREAD_FILE_ID',          // Bread/bakery image
  BOARDGAME: 'YOUR_BOARDGAME_FILE_ID',  // Board games image
  HEADPHONES: 'YOUR_HEADPHONES_FILE_ID', // Headphones image
  PRENATAL: 'YOUR_PRENATAL_FILE_ID',    // Prenatal vitamins image
  PILLOW: 'YOUR_PILLOW_FILE_ID'         // Maternity pillow image
};

// Function to generate OneDrive direct image URL
function generateOneDriveURL(fileId) {
  if (fileId.startsWith('YOUR_') || !fileId) {
    // Return placeholder if not updated yet
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop`;
  }
  
  // Convert to direct OneDrive image URL
  const baseUrl = 'https://onedrive.live.com/embed';
  const resid = `C29BE3C60D57F1F4%21${fileId}`;
  const authkey = '!zGSjUS';
  
  return `${baseUrl}?resid=${resid}&authkey=${authkey}&width=800&height=600`;
}

// 🛍️ Products with OneDrive Images
const oneDriveProducts = [
  {
    name: 'Educational Puzzle Set 500 Pieces - Country Life',
    brand: 'Country Life Puzzles',
    description: 'Beautiful 500-piece country life puzzle with vibrant colors and rural scenes',
    detailedDescription: 'This stunning puzzle features a colorful country life scene with sunflowers, birds, and beautiful rural landscapes. Perfect for developing problem-solving skills, patience, and concentration. Great for family bonding time and suitable for ages 8 and up.',
    price: 159.99,
    category: 'Education',
    subcategory: 'Puzzles & Games',
    sku: 'PUZZLE-COUNTRY-500',
    stockQuantity: 45,
    weight: '600g',
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.PUZZLE),
    tags: ['puzzle', 'educational', 'country life', '500 pieces', 'family fun', 'cognitive development'],
    inStock: true,
    isActive: true,
    minAge: 8,
    maxAge: 99,
    ageCategory: 'Child'
  },
  {
    name: 'Fresh Organic Red Apples 1kg',
    brand: 'Farm Fresh Produce',
    description: 'Premium quality organic red apples, perfect for healthy snacking',
    detailedDescription: 'These crisp, juicy organic red apples are sourced from local certified organic farms. Rich in vitamins C and fiber, antioxidants, and natural sweetness. Perfect for lunch boxes, healthy snacking, or baking.',
    price: 45.99,
    category: 'Groceries',
    subcategory: 'Fresh Fruits',
    sku: 'APPLE-ORGANIC-RED-1KG',
    stockQuantity: 120,
    weight: '1000g',
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.APPLE),
    tags: ['organic', 'fresh fruit', 'healthy', 'vitamin C', 'family', 'red apples'],
    inStock: true,
    isActive: true,
    // nutritionalInfo will be stored as JSON string in database
    minAge: 6,
    maxAge: 100,
    ageCategory: 'All Ages'
  },
  {
    name: 'Children\'s Educational Learning Tablet 10"',
    brand: 'KidsLearn Pro',
    description: 'Kid-friendly educational tablet with pre-loaded learning apps and parental controls',
    detailedDescription: 'Specially designed educational tablet featuring 100+ pre-loaded learning apps, interactive games, and comprehensive parental controls. Durable, child-safe design with rubber bumper case. Perfect for young learners aged 3-12.',
    price: 899.99,
    category: 'Education', 
    subcategory: 'Educational Electronics',
    sku: 'TABLET-KIDS-LEARN-10',
    stockQuantity: 25,
    weight: '450g',
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.TABLET),
    tags: ['tablet', 'educational', 'children', 'learning apps', 'parental controls', 'safe'],
    inStock: true,
    isActive: true,
    minAge: 3,
    maxAge: 12,
    ageCategory: 'Child'
  },
  {
    name: 'Children\'s Multivitamin Gummies - Mixed Fruit',
    brand: 'Healthy Kids Plus',
    description: 'Delicious fruit-flavored vitamin gummies for children\'s daily nutrition',
    detailedDescription: 'Fun, chewable vitamin gummies packed with 12 essential nutrients including Vitamins A, C, D3, E, and B-complex vitamins. Natural mixed fruit flavors (strawberry, orange, grape) with no artificial colors or high fructose corn syrup.',
    price: 129.99,
    category: 'Healthcare',
    subcategory: 'Children\'s Vitamins',
    sku: 'GUMMY-VIT-KIDS-FRUIT',
    stockQuantity: 75,
    weight: '250g',
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.VITAMINS),
    tags: ['vitamins', 'children', 'gummies', 'health', 'fruit flavored', 'essential nutrients'],
    inStock: true,
    isActive: true,
    minAge: 2,
    maxAge: 12,
    ageCategory: 'Child'
  },
  {
    name: 'Complete Family First Aid Emergency Kit',
    brand: 'MediSafe Pro',
    description: 'Comprehensive 150-piece first aid kit for home, office, and travel emergencies',
    detailedDescription: 'Professional-grade first aid kit containing 150+ essential medical supplies including bandages, gauze, antiseptics, digital thermometer, scissors, tweezers, and emergency guide. Organized in a durable, portable case.',
    price: 299.99,
    category: 'Healthcare',
    subcategory: 'First Aid & Emergency',
    sku: 'FIRSTAID-COMPLETE-150',
    stockQuantity: 30,
    weight: '800g', 
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.FIRSTAID),
    tags: ['first aid', 'emergency', 'family safety', 'medical supplies', '150 pieces', 'portable'],
    inStock: true,
    isActive: true,
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages'
  },
  {
    name: 'Artisan Whole Grain Bread Loaf',
    brand: 'Baker\'s Choice',
    description: 'Freshly baked whole grain bread made with organic flour and seeds',
    detailedDescription: 'Premium artisan whole grain bread baked fresh daily with organic wheat flour, sunflower seeds, and flax seeds. No preservatives, high in fiber and protein. Perfect for sandwiches or toast.',
    price: 28.99,
    category: 'Groceries',
    subcategory: 'Fresh Bakery',
    sku: 'BREAD-WHOLEGRAIN-ARTISAN',
    stockQuantity: 60,
    weight: '700g',
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.BREAD),
    tags: ['whole grain', 'fresh bread', 'organic', 'artisan', 'no preservatives', 'high fiber'],
    inStock: true,
    isActive: true,
    // nutritionalInfo will be stored as JSON string in database
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages'
  },
  {
    name: 'Family Board Game Collection Set',
    brand: 'Game Night Fun',
    description: 'Classic board game collection including Monopoly, Scrabble, and Snakes & Ladders',
    detailedDescription: 'Ultimate family entertainment package featuring three beloved board games: Monopoly (property trading), Scrabble (word building), and Snakes & Ladders (classic race game). Perfect for family game nights and building lasting memories.',
    price: 399.99,
    category: 'Entertainment',
    subcategory: 'Board Games',
    sku: 'BOARDGAME-FAMILY-3SET',
    stockQuantity: 35,
    weight: '1200g',
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.BOARDGAME),
    tags: ['board games', 'family', 'entertainment', 'monopoly', 'scrabble', '3-game set'],
    inStock: true,
    isActive: true,
    minAge: 6,
    maxAge: 99,
    ageCategory: 'All Ages'
  },
  {
    name: 'Wireless Bluetooth Noise-Cancelling Headphones',
    brand: 'SoundWave Pro',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery',
    detailedDescription: 'High-quality Bluetooth 5.0 headphones featuring active noise cancellation, superior sound quality, and up to 30 hours of battery life. Comfortable over-ear design with built-in microphone for calls. Perfect for music, study, or work.',
    price: 749.99,
    category: 'Entertainment',
    subcategory: 'Audio Equipment',
    sku: 'HEADPHONES-BT-NC-PRO',
    stockQuantity: 40,
    weight: '300g',
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.HEADPHONES),
    tags: ['headphones', 'bluetooth', 'wireless', 'noise cancelling', '30-hour battery', 'premium'],
    inStock: true,
    isActive: true,
    minAge: 12,
    maxAge: 99,
    ageCategory: 'Teen'
  },
  {
    name: 'Prenatal Complete Vitamin Complex with DHA',
    brand: 'MomCare Essential',
    description: 'Complete prenatal vitamin formula with folic acid, iron, and DHA for pregnancy',
    detailedDescription: 'Comprehensive prenatal vitamin supplement containing 25+ essential nutrients including 800mcg folic acid, iron, calcium, DHA omega-3, and vitamins D3, B6, B12. Supports healthy pregnancy and fetal brain development. Easy-to-swallow capsules.',
    price: 249.99,
    category: 'Pregnancy',
    subcategory: 'Prenatal Vitamins',
    sku: 'PRENATAL-COMPLETE-DHA',
    stockQuantity: 50,
    weight: '150g',
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.PRENATAL),
    tags: ['prenatal', 'vitamins', 'pregnancy', 'DHA', 'folic acid', 'iron', 'essential nutrients'],
    inStock: true,
    isActive: true,
    minAge: 18,
    maxAge: 50,
    ageCategory: 'Adult',
    requiresAgeVerification: true
  },
  {
    name: 'Ergonomic Maternity Support Pillow - Full Body',
    brand: 'ComfortMom Pro',
    description: 'Premium full-body maternity pillow for pregnancy and nursing comfort',
    detailedDescription: 'Specially designed C-shaped maternity pillow providing optimal support for back, belly, hips, and legs during pregnancy and breastfeeding. Made with hypoallergenic memory foam and breathable cotton cover. Machine washable cover included.',
    price: 599.99,
    category: 'Pregnancy',
    subcategory: 'Maternity Comfort',
    sku: 'MAT-PILLOW-FULLBODY-C',
    stockQuantity: 25,
    weight: '1500g',
    imageUrl: generateOneDriveURL(IMAGE_FILE_IDS.PILLOW),
    tags: ['maternity pillow', 'pregnancy support', 'full body', 'ergonomic', 'memory foam', 'nursing'],
    inStock: true,
    isActive: true,
    minAge: 18,
    maxAge: 50,
    ageCategory: 'Adult'
  }
];

async function seedOneDriveProducts() {
  try {
    console.log('🎯 Seeding Products with OneDrive Images');
    console.log('=========================================\n');

    // Check if we have updated file IDs
    const hasRealFileIDs = Object.values(IMAGE_FILE_IDS).some(id => !id.startsWith('YOUR_'));
    
    if (!hasRealFileIDs) {
      console.log('⚠️  NOTICE: Using placeholder images because OneDrive file IDs not updated yet.');
      console.log('📝 To use your actual OneDrive images:');
      console.log('   1. Edit this file: seed-onedrive-products-final.js');
      console.log('   2. Replace YOUR_*_FILE_ID values with actual OneDrive file IDs');
      console.log('   3. Run this script again\n');
    } else {
      console.log('✅ Using your OneDrive images!\n');
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const productData of oneDriveProducts) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ 
          where: { sku: productData.sku } 
        });

        if (existingProduct) {
          console.log(`⚠️  Product ${productData.sku} already exists, skipping...`);
          skipCount++;
          continue;
        }

        // Create the product
        const product = await Product.create(productData);
        console.log(`✅ Added: ${product.name} (SKU: ${product.sku})`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error adding ${productData.name}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 SEEDING RESULTS:');
    console.log('===================');
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`⚠️  Skipped (existing): ${skipCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);

    // Show current product counts
    const totalProducts = await Product.count({ where: { isActive: true } });
    console.log(`📦 Total active products in database: ${totalProducts}`);

    // Show products by category
    const categories = await Product.findAll({
      attributes: ['category', [Product.sequelize.fn('COUNT', '*'), 'count']],
      where: { isActive: true },
      group: ['category'],
      order: [[Product.sequelize.fn('COUNT', '*'), 'DESC']]
    });

    console.log('\n📋 Products by category:');
    categories.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.dataValues.count} products`);
    });

    if (!hasRealFileIDs) {
      console.log('\n💡 NEXT STEPS:');
      console.log('==============');
      console.log('1. Get your OneDrive file IDs from: https://1drv.ms/f/c/c29be3c60d57f1f4/EjDuo-jcn5xDhzBngn6yQocBM1Rq8TY7WU7WXLtUKczT-A?e=zGSjUS');
      console.log('2. Update the IMAGE_FILE_IDS object in this script');
      console.log('3. Run again to use your actual images!');
    }

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// CLI execution
if (require.main === module) {
  seedOneDriveProducts()
    .then(() => {
      console.log('🏁 Seeding completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  seedOneDriveProducts, 
  oneDriveProducts,
  IMAGE_FILE_IDS,
  generateOneDriveURL 
};