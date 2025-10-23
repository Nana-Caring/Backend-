const { Product } = require('./models');

async function seedProducts() {
  try {
    console.log('🌱 Seeding sample products with age restrictions...');

    const sampleProducts = [
      {
        name: 'Pregnavit M 30 Capsules',
        brand: 'Clicks',
        description: 'Prenatal vitamins for expecting mothers',
        detailedDescription: 'Pregnavit M 30 Capsules are formulated for women before, during and after pregnancy. It contains folic acid and a range of essential vitamins and minerals to improve energy, maintain healthy cells, and promote strong bones and teeth.',
        price: 189.99,
        category: 'Healthcare',
        subcategory: 'Vitamins & Supplements',
        sku: 'PREG001',
        stockQuantity: 50,
        ingredients: 'Folic Acid, Iron, Calcium, Vitamin D3, Vitamin B12',
        weight: '30 capsules',
        manufacturer: 'Clicks Pharmaceuticals',
        tags: ['pregnancy', 'vitamins', 'prenatal', 'health'],
        minAge: 18,
        maxAge: 50,
        ageCategory: 'Adult',
        requiresAgeVerification: true,
        inStock: true,
        isActive: true,
        createdBy: 1 // Admin user ID
      },
      {
        name: 'Children\'s Multivitamin Gummies',
        brand: 'Kids Health',
        description: 'Fun and tasty multivitamin gummies for children',
        detailedDescription: 'Delicious fruit-flavored gummies packed with essential vitamins and minerals to support your child\'s healthy growth and development.',
        price: 99.99,
        category: 'Healthcare',
        subcategory: 'Children\'s Health',
        sku: 'KIDS001',
        stockQuantity: 75,
        ingredients: 'Vitamin C, Vitamin D, Vitamin B6, Vitamin B12, Zinc',
        weight: '60 gummies',
        manufacturer: 'Kids Health Co.',
        tags: ['children', 'vitamins', 'gummies', 'health'],
        minAge: 2,
        maxAge: 12,
        ageCategory: 'Child',
        requiresAgeVerification: false,
        inStock: true,
        isActive: true,
        createdBy: 1
      },
      {
        name: 'High School Mathematics Textbook',
        brand: 'EduBooks',
        description: 'Comprehensive mathematics textbook for grades 10-12',
        detailedDescription: 'A complete mathematics curriculum covering algebra, geometry, calculus, and statistics. Perfect for high school students preparing for exams.',
        price: 450.00,
        category: 'Education',
        subcategory: 'Textbooks',
        sku: 'MATH001',
        stockQuantity: 25,
        weight: '2.5kg',
        manufacturer: 'EduBooks Publishing',
        tags: ['mathematics', 'textbook', 'education', 'high school'],
        minAge: 14,
        maxAge: 18,
        ageCategory: 'Teen',
        requiresAgeVerification: false,
        inStock: true,
        isActive: true,
        createdBy: 1
      },
      {
        name: 'Baby Food - Apple Puree',
        brand: 'BabyFirst',
        description: 'Organic apple puree for babies 6+ months',
        detailedDescription: 'Pure organic apple puree made from fresh apples. No added sugar, preservatives, or artificial flavors. Perfect first food for babies.',
        price: 25.99,
        category: 'Groceries',
        subcategory: 'Baby Food',
        sku: 'BABY001',
        stockQuantity: 100,
        ingredients: '100% Organic Apples',
        weight: '120g jar',
        manufacturer: 'BabyFirst Foods',
        tags: ['baby', 'organic', 'apple', 'puree', 'food'],
        minAge: 0,
        maxAge: 2,
        ageCategory: 'Toddler',
        requiresAgeVerification: false,
        inStock: true,
        isActive: true,
        createdBy: 1
      },
      {
        name: 'Energy Drink - RedBull',
        brand: 'RedBull',
        description: 'Energy drink with caffeine and taurine',
        detailedDescription: 'RedBull Energy Drink contains caffeine, taurine, B-vitamins, and sugar. Provides energy and mental alertness.',
        price: 15.99,
        category: 'Groceries',
        subcategory: 'Beverages',
        sku: 'ENERGY001',
        stockQuantity: 200,
        ingredients: 'Caffeine, Taurine, B-vitamins, Sugar, Water',
        weight: '250ml',
        manufacturer: 'Red Bull GmbH',
        tags: ['energy', 'drink', 'caffeine', 'sports'],
        minAge: 16,
        maxAge: null, // No upper age limit
        ageCategory: 'Adult',
        requiresAgeVerification: true,
        inStock: true,
        isActive: true,
        createdBy: 1
      },
      {
        name: 'Tablet for Kids - Educational Games',
        brand: 'KidsTech',
        description: 'Educational tablet with pre-loaded learning games',
        detailedDescription: 'Kid-friendly tablet with educational games, parental controls, and durable design. Perfect for learning and entertainment.',
        price: 1299.99,
        category: 'Entertainment',
        subcategory: 'Electronics',
        sku: 'TAB001',
        stockQuantity: 15,
        weight: '500g',
        manufacturer: 'KidsTech Solutions',
        tags: ['tablet', 'education', 'games', 'children', 'technology'],
        minAge: 3,
        maxAge: 12,
        ageCategory: 'Child',
        requiresAgeVerification: false,
        inStock: true,
        isActive: true,
        createdBy: 1
      }
    ];

    // Create products
    const createdProducts = [];
    for (const productData of sampleProducts) {
      try {
        const product = await Product.create(productData);
        createdProducts.push(product);
        console.log(`✅ Created product: ${product.name} (ID: ${product.id})`);
      } catch (error) {
        console.error(`❌ Failed to create product ${productData.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully created ${createdProducts.length} products!`);
    
    // Display summary by category and age restrictions
    console.log('\n📊 Products Summary:');
    const categories = {};
    const ageGroups = {};
    
    createdProducts.forEach(product => {
      // Count by category
      if (!categories[product.category]) categories[product.category] = 0;
      categories[product.category]++;
      
      // Count by age category
      if (!ageGroups[product.ageCategory]) ageGroups[product.ageCategory] = 0;
      ageGroups[product.ageCategory]++;
    });
    
    console.log('\n📦 By Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    console.log('\n👶 By Age Group:');
    Object.entries(ageGroups).forEach(([ageGroup, count]) => {
      console.log(`   ${ageGroup}: ${count} products`);
    });

    console.log('\n🔧 Next Steps:');
    console.log('1. Upload images for products using: POST /api/products/:id/images/main');
    console.log('2. Test age-based filtering with: GET /api/products/dependent/:dependentId');
    console.log('3. Run the image upload test: node test-image-upload.js');

    return createdProducts;

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('🎉 Product seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Product seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProducts };
