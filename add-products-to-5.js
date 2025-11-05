require('dotenv').config();
const { Product } = require('./models');

async function addProductsTo5PerCategory() {
  try {
    console.log('🎯 ADDING PRODUCTS TO REACH 5 PER CATEGORY');
    console.log('===========================================\n');

    // Get current product counts by category
    const currentProducts = await Product.findAll({
      attributes: ['category', 'sku'],
      where: { isActive: true }
    });

    const categoryCount = {};
    currentProducts.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });

    console.log('📊 Current Product Count by Category:');
    Object.keys(categoryCount).sort().forEach(cat => {
      const count = categoryCount[cat];
      const needed = Math.max(0, 5 - count);
      console.log(`   ${cat}: ${count} products ${needed > 0 ? `(need ${needed} more)` : '✅ complete'}`);
    });

    // Products to add to reach 5 per category
    const productsToAdd = [];

    // EDUCATION - Need to add if less than 5
    const educationNeeded = Math.max(0, 5 - (categoryCount['Education'] || 0));
    const educationProducts = [
      {
        name: 'Interactive World Map Learning Poster',
        brand: 'Geography Adventures',
        description: 'Large educational world map with QR codes for interactive learning',
        detailedDescription: 'Educational world map poster featuring QR codes for each country linking to online content. Includes country facts, cultures, and geography lessons.',
        price: 129.99,
        category: 'Education',
        subcategory: 'Geography & Maps',
        sku: 'MAP-WORLD-QR-NEW-001',
        stockQuantity: 70,
        weight: '200g',
        manufacturer: 'Geography Adventures',
        imageUrl: 'https://images.unsplash.com/photo-1527176930608-09cb256ab504?w=800&h=600&fit=crop',
        tags: ['world map', 'interactive', 'QR codes', 'geography'],
        inStock: true,
        isActive: true,
        minAge: 6,
        maxAge: 18,
        ageCategory: 'Child'
      },
      {
        name: 'STEM Coding Kit for Beginners',
        brand: 'CodeKids Academy',
        description: 'Programming basics kit teaching coding through fun activities',
        detailedDescription: 'Complete coding education kit for children to learn programming fundamentals. Includes visual programming cards and coding games.',
        price: 199.99,
        category: 'Education',
        subcategory: 'Programming & Tech',
        sku: 'CODE-KIT-BEGIN-NEW-001',
        stockQuantity: 40,
        weight: '800g',
        manufacturer: 'CodeKids Academy',
        imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop',
        tags: ['coding', 'programming', 'kids', 'STEM'],
        inStock: true,
        isActive: true,
        minAge: 7,
        maxAge: 14,
        ageCategory: 'Child'
      }
    ];

    // ENTERTAINMENT - Need to add if less than 5 (currently has 9, so good)
    
    // GROCERIES - Need to add if less than 5 (currently has 8, so good)

    // HEALTHCARE - Need to add if less than 5 (currently has 7, so good)

    // OTHER - Need to add if less than 5 (currently has 6, so good)
    
    // PREGNANCY - Need to add if less than 5 (currently has 6, so good)

    // Add education products if needed
    if (educationNeeded > 0) {
      for (let i = 0; i < Math.min(educationNeeded, educationProducts.length); i++) {
        productsToAdd.push(educationProducts[i]);
      }
    }

    // Since all other categories already have 5+ products, let's add some variety products to categories that could use more diversity

    // Add a few more high-quality products to round out the catalog
    const additionalProducts = [
      // Education - Third product if needed
      {
        name: 'Microscope Kit for Young Scientists',
        brand: 'Young Scientists Lab',
        description: '400x magnification microscope with prepared slides',
        detailedDescription: 'Professional-quality microscope designed for children with 400x magnification, LED lighting, and 20 prepared slides.',
        price: 389.99,
        category: 'Education',
        subcategory: 'Science Equipment',
        sku: 'MICROSCOPE-400X-NEW-001',
        stockQuantity: 25,
        weight: '1500g',
        manufacturer: 'Young Scientists Lab',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
        tags: ['microscope', 'science', '400x magnification', 'educational'],
        inStock: true,
        isActive: true,
        minAge: 10,
        maxAge: 16,
        ageCategory: 'Child'
      },
      // Additional grocery item for variety
      {
        name: 'Organic Quinoa Superfood 500g',
        brand: 'Nature\'s Best',
        description: 'Premium organic quinoa packed with protein and nutrients',
        detailedDescription: 'Certified organic quinoa from South American highlands. High in protein, fiber, and essential amino acids. Gluten-free superfood.',
        price: 89.99,
        category: 'Groceries',
        subcategory: 'Health Foods',
        sku: 'QUINOA-ORG-500G-NEW-001',
        stockQuantity: 60,
        weight: '500g',
        manufacturer: 'Nature\'s Best Organic',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop',
        tags: ['organic', 'quinoa', 'superfood', 'gluten-free', 'protein'],
        inStock: true,
        isActive: true,
        minAge: 12,
        maxAge: 100,
        ageCategory: 'Teen'
      },
      // Additional healthcare item
      {
        name: 'Natural Immune Boost Tea Blend',
        brand: 'Wellness Tea Co.',
        description: 'Herbal tea blend with echinacea and ginger for immune support',
        detailedDescription: 'Natural herbal tea blend featuring echinacea, ginger, lemon, and honey. Supports immune system health with no caffeine.',
        price: 69.99,
        category: 'Healthcare',
        subcategory: 'Natural Remedies',
        sku: 'TEA-IMMUNE-BLEND-NEW-001',
        stockQuantity: 80,
        weight: '100g',
        manufacturer: 'Wellness Tea Co.',
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
        tags: ['herbal tea', 'immune support', 'echinacea', 'natural', 'caffeine-free'],
        inStock: true,
        isActive: true,
        minAge: 16,
        maxAge: 100,
        ageCategory: 'Teen'
      },
      // Additional entertainment item
      {
        name: 'Portable Chess Set with Tutorial App',
        brand: 'ChessMaster Pro',
        description: 'Magnetic travel chess set with companion learning app',
        detailedDescription: 'Premium magnetic chess set with foldable board and QR code linking to chess tutorial app. Perfect for learning and travel.',
        price: 149.99,
        category: 'Entertainment',
        subcategory: 'Strategy Games',
        sku: 'CHESS-MAGNETIC-APP-NEW-001',
        stockQuantity: 45,
        weight: '400g',
        manufacturer: 'ChessMaster Pro',
        imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&h=600&fit=crop',
        tags: ['chess', 'magnetic', 'travel', 'learning app', 'strategy'],
        inStock: true,
        isActive: true,
        minAge: 8,
        maxAge: 99,
        ageCategory: 'Child'
      }
    ];

    // Add additional products if we still need to balance categories
    if (educationNeeded > 2) {
      productsToAdd.push(additionalProducts[0]); // Microscope
    }
    
    // Add variety products regardless
    productsToAdd.push(additionalProducts[1]); // Quinoa
    productsToAdd.push(additionalProducts[2]); // Tea
    productsToAdd.push(additionalProducts[3]); // Chess

    if (productsToAdd.length === 0) {
      console.log('✅ All categories already have 5+ products! Adding some variety items...');
      productsToAdd.push(...additionalProducts);
    }

    console.log(`\n🌱 Adding ${productsToAdd.length} new products...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const productData of productsToAdd) {
      try {
        // Check if SKU already exists
        const existingProduct = await Product.findOne({ 
          where: { sku: productData.sku }
        });

        if (existingProduct) {
          console.log(`⚠️  Product ${productData.sku} already exists, skipping...`);
          continue;
        }

        const product = await Product.create(productData);
        console.log(`✅ Added: ${product.name} (${product.category})`);
        console.log(`   SKU: ${product.sku} | Price: R${product.price} | Stock: ${product.stockQuantity}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error adding ${productData.name}:`, error.message);
        errorCount++;
      }
    }

    // Final verification
    const finalProducts = await Product.findAll({
      attributes: ['category'],
      where: { isActive: true }
    });

    const finalCategoryCount = {};
    finalProducts.forEach(product => {
      finalCategoryCount[product.category] = (finalCategoryCount[product.category] || 0) + 1;
    });

    console.log('\n📊 FINAL RESULTS:');
    console.log('==================');
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📦 Total products: ${finalProducts.length}`);

    console.log('\n📋 Final Product Count by Category:');
    Object.keys(finalCategoryCount).sort().forEach(cat => {
      const count = finalCategoryCount[cat];
      const status = count >= 5 ? '✅' : '⚠️';
      console.log(`   ${status} ${cat}: ${count} products`);
    });

  } catch (error) {
    console.error('❌ Operation failed:', error);
  }
}

// Run the operation
if (require.main === module) {
  addProductsTo5PerCategory()
    .then(() => {
      console.log('\n🏁 Product addition completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Operation failed:', error);
      process.exit(1);
    });
}

module.exports = { addProductsTo5PerCategory };