require('dotenv').config();
const { Product } = require('./models');

async function clearAndSeedProducts() {
  try {
    console.log('🧹 Clearing all existing products...');
    
    // Get current product count by category
    const currentProducts = await Product.findAll({
      attributes: ['category', 'name', 'sku'],
      order: ['category', 'name']
    });

    console.log('\n📊 Current Products by Category:');
    const byCategory = {};
    currentProducts.forEach(p => {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push(p);
    });

    Object.keys(byCategory).forEach(cat => {
      console.log(`  ${cat}: ${byCategory[cat].length} products`);
    });
    console.log(`Total: ${currentProducts.length} products`);

    // Clear all products
    const deletedCount = await Product.destroy({ where: {}, force: true });
    console.log(`🗑️  Deleted ${deletedCount} products\n`);

    // 5 Products per category with OneDrive image support
    const productsToSeed = [
      // GROCERIES (5 products)
      {
        name: 'Premium Organic Apples 1kg',
        brand: 'Fresh Farm Co-op',
        description: 'Crisp, juicy organic red apples perfect for healthy snacking',
        detailedDescription: 'Premium quality organic apples sourced from certified local farms. Rich in vitamins C and fiber, these apples are perfect for lunch boxes, healthy snacking, or baking. No pesticides or artificial treatments.',
        price: 45.99,
        category: 'Groceries',
        subcategory: 'Fresh Fruits',
        sku: 'APPLE-ORG-1KG-001',
        stockQuantity: 150,
        weight: '1000g',
        manufacturer: 'Fresh Farm Co-op',
        imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=600&fit=crop',
        tags: ['organic', 'fresh', 'healthy', 'vitamin C', 'no pesticides'],
        inStock: true,
        isActive: true,
        minAge: 0,
        maxAge: 100,
        ageCategory: 'All Ages'
      },
      {
        name: 'Artisan Whole Grain Bread Loaf',
        brand: 'Baker\'s Choice Premium',
        description: 'Freshly baked whole grain bread with seeds and ancient grains',
        detailedDescription: 'Premium artisan bread made with organic whole wheat flour, sunflower seeds, flax seeds, and quinoa. Baked fresh daily with no preservatives. High in fiber and protein.',
        price: 32.99,
        category: 'Groceries',
        subcategory: 'Fresh Bakery',
        sku: 'BREAD-WG-ARTISAN-001',
        stockQuantity: 80,
        weight: '700g',
        manufacturer: 'Baker\'s Choice Bakery',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
        tags: ['whole grain', 'artisan', 'no preservatives', 'high fiber', 'fresh daily'],
        inStock: true,
        isActive: true,
        minAge: 1,
        maxAge: 100,
        ageCategory: 'All Ages'
      },
      {
        name: 'Free-Range Chicken Eggs (12 pack)',
        brand: 'Happy Farm Eggs',
        description: 'Fresh free-range chicken eggs from pasture-raised hens',
        detailedDescription: 'Premium free-range eggs from hens that roam freely on green pastures. Rich in omega-3 fatty acids and high-quality protein. Farm fresh and collected daily.',
        price: 65.99,
        category: 'Groceries',
        subcategory: 'Dairy & Eggs',
        sku: 'EGGS-FR-12PK-001',
        stockQuantity: 120,
        weight: '720g',
        manufacturer: 'Happy Farm Co-op',
        imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=600&fit=crop',
        tags: ['free-range', 'omega-3', 'high protein', 'farm fresh', 'pasture raised'],
        inStock: true,
        isActive: true,
        minAge: 0,
        maxAge: 100,
        ageCategory: 'All Ages'
      },
      {
        name: 'Organic Baby Spinach 200g',
        brand: 'Green Leaf Organics',
        description: 'Fresh organic baby spinach leaves, perfect for salads and cooking',
        detailedDescription: 'Tender organic baby spinach leaves grown without pesticides. Rich in iron, vitamins A, C, and K. Perfect for fresh salads, smoothies, or cooking. Pre-washed and ready to eat.',
        price: 28.99,
        category: 'Groceries',
        subcategory: 'Fresh Vegetables',
        sku: 'SPINACH-BABY-ORG-001',
        stockQuantity: 95,
        weight: '200g',
        manufacturer: 'Green Leaf Organics',
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=600&fit=crop',
        tags: ['organic', 'baby spinach', 'iron rich', 'pre-washed', 'vitamin rich'],
        inStock: true,
        isActive: true,
        minAge: 6,
        maxAge: 100,
        ageCategory: 'All Ages'
      },
      {
        name: 'Raw Honey 500g Jar',
        brand: 'Pure Harvest Apiaries',
        description: 'Pure, unprocessed raw honey from local wildflower meadows',
        detailedDescription: 'Authentic raw honey harvested from local wildflower meadows. Unfiltered and unpasteurized to preserve natural enzymes, antioxidants, and nutrients. Perfect natural sweetener.',
        price: 89.99,
        category: 'Groceries',
        subcategory: 'Pantry Essentials',
        sku: 'HONEY-RAW-500G-001',
        stockQuantity: 60,
        weight: '500g',
        manufacturer: 'Pure Harvest Apiaries',
        imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop',
        tags: ['raw honey', 'unprocessed', 'natural enzymes', 'antioxidants', 'wildflower'],
        inStock: true,
        isActive: true,
        minAge: 12,
        maxAge: 100,
        ageCategory: 'Teen'
      },

      // EDUCATION (5 products)
      {
        name: 'Educational Puzzle Set 500 Pieces - Country Life',
        brand: 'Learning World Puzzles',
        description: 'Beautiful 500-piece puzzle featuring vibrant country life scenes',
        detailedDescription: 'Stunning educational puzzle showcasing colorful country life with sunflowers, birds, and rural landscapes. Develops problem-solving skills, patience, and concentration. Perfect for family bonding.',
        price: 159.99,
        category: 'Education',
        subcategory: 'Puzzles & Brain Games',
        sku: 'PUZZLE-COUNTRY-500-001',
        stockQuantity: 45,
        weight: '600g',
        manufacturer: 'Learning World Puzzles',
        imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
        tags: ['puzzle', '500 pieces', 'educational', 'cognitive development', 'family fun'],
        inStock: true,
        isActive: true,
        minAge: 8,
        maxAge: 99,
        ageCategory: 'Child'
      },
      {
        name: 'Children\'s Educational Tablet 10 Inch',
        brand: 'KidsLearn Pro',
        description: 'Kid-friendly learning tablet with 100+ educational apps and parental controls',
        detailedDescription: 'Advanced educational tablet designed specifically for children aged 3-12. Features 100+ pre-loaded learning apps, interactive games, and comprehensive parental controls. Durable design with protective case.',
        price: 899.99,
        category: 'Education',
        subcategory: 'Educational Electronics',
        sku: 'TABLET-KIDS-10IN-001',
        stockQuantity: 25,
        weight: '450g',
        manufacturer: 'KidsLearn Technologies',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop',
        tags: ['tablet', 'educational apps', 'parental controls', 'child-safe', 'interactive'],
        inStock: true,
        isActive: true,
        minAge: 3,
        maxAge: 12,
        ageCategory: 'Child'
      },
      {
        name: 'STEM Science Experiment Kit',
        brand: 'Young Scientists',
        description: 'Complete science kit with 50+ hands-on experiments for curious minds',
        detailedDescription: 'Comprehensive STEM education kit featuring 50+ safe, hands-on science experiments. Includes lab equipment, chemicals, and detailed instruction manual. Perfect for budding scientists aged 8+.',
        price: 349.99,
        category: 'Education',
        subcategory: 'STEM Learning',
        sku: 'STEM-SCI-KIT-50-001',
        stockQuantity: 35,
        weight: '1200g',
        manufacturer: 'Young Scientists Education',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
        tags: ['STEM', 'science kit', '50 experiments', 'hands-on learning', 'lab equipment'],
        inStock: true,
        isActive: true,
        minAge: 8,
        maxAge: 16,
        ageCategory: 'Child'
      },
      {
        name: 'Interactive World Map Poster',
        brand: 'Geography Adventures',
        description: 'Large interactive world map with QR codes linking to country information',
        detailedDescription: 'Educational world map poster featuring QR codes for each country that link to interactive online content. Includes country facts, cultures, and geography lessons. Perfect for classrooms or home learning.',
        price: 129.99,
        category: 'Education',
        subcategory: 'Geography & Maps',
        sku: 'MAP-WORLD-QR-001',
        stockQuantity: 70,
        weight: '200g',
        manufacturer: 'Geography Adventures',
        imageUrl: 'https://images.unsplash.com/photo-1527176930608-09cb256ab504?w=800&h=600&fit=crop',
        tags: ['world map', 'interactive', 'QR codes', 'geography', 'educational poster'],
        inStock: true,
        isActive: true,
        minAge: 6,
        maxAge: 18,
        ageCategory: 'Child'
      },
      {
        name: 'Learn Programming Kids Coding Kit',
        brand: 'CodeKids Academy',
        description: 'Beginner-friendly coding kit teaching programming basics through fun activities',
        detailedDescription: 'Complete coding education kit designed for children to learn programming fundamentals. Includes visual programming cards, coding games, and access to kid-friendly coding platform. No screen time required initially.',
        price: 199.99,
        category: 'Education',
        subcategory: 'Programming & Tech',
        sku: 'CODE-KIT-BEGINNER-001',
        stockQuantity: 40,
        weight: '800g',
        manufacturer: 'CodeKids Academy',
        imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop',
        tags: ['coding', 'programming', 'kids', 'visual learning', 'STEM education'],
        inStock: true,
        isActive: true,
        minAge: 7,
        maxAge: 14,
        ageCategory: 'Child'
      },

      // HEALTHCARE (5 products)
      {
        name: 'Children\'s Daily Multivitamin Gummies',
        brand: 'Healthy Kids Plus',
        description: 'Delicious fruit-flavored vitamin gummies with 12 essential nutrients',
        detailedDescription: 'Fun, chewable vitamin gummies packed with 12 essential nutrients including Vitamins A, C, D3, E, and B-complex vitamins. Natural mixed fruit flavors with no artificial colors or high fructose corn syrup.',
        price: 129.99,
        category: 'Healthcare',
        subcategory: 'Children\'s Vitamins',
        sku: 'VIT-GUMMY-KIDS-001',
        stockQuantity: 80,
        weight: '250g',
        manufacturer: 'Healthy Kids Nutrition',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
        tags: ['vitamins', 'children', 'gummies', '12 nutrients', 'natural flavors'],
        inStock: true,
        isActive: true,
        minAge: 2,
        maxAge: 12,
        ageCategory: 'Child'
      },
      {
        name: 'Family First Aid Emergency Kit - Complete',
        brand: 'MediSafe Pro',
        description: 'Comprehensive 150-piece first aid kit for home, office, and travel',
        detailedDescription: 'Professional-grade first aid kit containing 150+ essential medical supplies including bandages, gauze, antiseptics, digital thermometer, scissors, tweezers, and comprehensive emergency guide.',
        price: 299.99,
        category: 'Healthcare',
        subcategory: 'First Aid & Safety',
        sku: 'FIRSTAID-COMP-150-001',
        stockQuantity: 40,
        weight: '800g',
        manufacturer: 'MediSafe Medical',
        imageUrl: 'https://images.unsplash.com/photo-1603398938992-c3de7ffdef52?w=800&h=600&fit=crop',
        tags: ['first aid', '150 pieces', 'emergency kit', 'family safety', 'comprehensive'],
        inStock: true,
        isActive: true,
        minAge: 0,
        maxAge: 100,
        ageCategory: 'All Ages'
      },
      {
        name: 'Digital Infrared Thermometer',
        brand: 'HealthCheck Pro',
        description: 'Non-contact digital thermometer with instant accurate readings',
        detailedDescription: 'Advanced infrared thermometer providing instant, accurate temperature readings without contact. Features fever alarm, memory storage for 50 readings, and suitable for all ages. Medical grade accuracy.',
        price: 189.99,
        category: 'Healthcare',
        subcategory: 'Medical Devices',
        sku: 'THERMO-IR-DIGITAL-001',
        stockQuantity: 60,
        weight: '150g',
        manufacturer: 'HealthCheck Technologies',
        imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop',
        tags: ['thermometer', 'infrared', 'non-contact', 'instant reading', 'fever alarm'],
        inStock: true,
        isActive: true,
        minAge: 0,
        maxAge: 100,
        ageCategory: 'All Ages'
      },
      {
        name: 'Immune Support Vitamin C Tablets',
        brand: 'Wellness Boost',
        description: 'High-potency Vitamin C tablets for immune system support',
        detailedDescription: 'High-quality Vitamin C supplement with 1000mg per tablet. Enhanced with rose hips and bioflavonoids for better absorption. Supports immune system health and acts as a powerful antioxidant.',
        price: 79.99,
        category: 'Healthcare',
        subcategory: 'Adult Vitamins',
        sku: 'VIT-C-1000MG-001',
        stockQuantity: 100,
        weight: '200g',
        manufacturer: 'Wellness Boost Nutrition',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
        tags: ['vitamin C', '1000mg', 'immune support', 'antioxidant', 'rose hips'],
        inStock: true,
        isActive: true,
        minAge: 18,
        maxAge: 100,
        ageCategory: 'Adult'
      },
      {
        name: 'Natural Hand Sanitizer Gel 500ml',
        brand: 'Pure Clean',
        description: 'Alcohol-based hand sanitizer with moisturizing aloe vera',
        detailedDescription: '70% alcohol-based hand sanitizer gel enriched with aloe vera and vitamin E. Kills 99.9% of germs while keeping hands soft and moisturized. Pleasant natural fragrance, non-sticky formula.',
        price: 45.99,
        category: 'Healthcare',
        subcategory: 'Personal Hygiene',
        sku: 'SANITIZER-ALOE-500-001',
        stockQuantity: 150,
        weight: '500ml',
        manufacturer: 'Pure Clean Products',
        imageUrl: 'https://images.unsplash.com/photo-1584744982493-114c4a9c3e62?w=800&h=600&fit=crop',
        tags: ['hand sanitizer', '70% alcohol', 'aloe vera', 'moisturizing', '99.9% effective'],
        inStock: true,
        isActive: true,
        minAge: 3,
        maxAge: 100,
        ageCategory: 'All Ages'
      },

      // ENTERTAINMENT (5 products)
      {
        name: 'Premium Family Board Game Collection',
        brand: 'Game Night Masters',
        description: 'Ultimate collection of 3 classic board games for family entertainment',
        detailedDescription: 'Premium board game set including Monopoly (property trading), Scrabble (word building), and Snakes & Ladders (classic race). High-quality components and storage box included.',
        price: 399.99,
        category: 'Entertainment',
        subcategory: 'Board Games',
        sku: 'BOARDGAME-FAMILY-3SET-001',
        stockQuantity: 30,
        weight: '1200g',
        manufacturer: 'Game Night Masters',
        imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
        tags: ['board games', 'monopoly', 'scrabble', 'snakes ladders', 'family entertainment'],
        inStock: true,
        isActive: true,
        minAge: 6,
        maxAge: 99,
        ageCategory: 'All Ages'
      },
      {
        name: 'Wireless Bluetooth Noise-Cancelling Headphones',
        brand: 'SoundWave Pro',
        description: 'Premium wireless headphones with active noise cancellation',
        detailedDescription: 'High-quality Bluetooth 5.0 headphones with active noise cancellation, superior sound quality, and 30-hour battery life. Comfortable over-ear design with built-in microphone for calls.',
        price: 749.99,
        category: 'Entertainment',
        subcategory: 'Audio Equipment',
        sku: 'HEADPHONES-BT-NC-001',
        stockQuantity: 45,
        weight: '300g',
        manufacturer: 'SoundWave Technologies',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
        tags: ['headphones', 'bluetooth', 'noise cancelling', '30-hour battery', 'premium'],
        inStock: true,
        isActive: true,
        minAge: 12,
        maxAge: 99,
        ageCategory: 'Teen'
      },
      {
        name: 'Portable Bluetooth Speaker Waterproof',
        brand: 'Bass Boost Audio',
        description: 'Waterproof portable speaker with 360-degree surround sound',
        detailedDescription: 'Rugged waterproof Bluetooth speaker with 360-degree surround sound, 20-hour battery life, and IPX7 water resistance. Perfect for outdoor adventures, pool parties, or home use.',
        price: 299.99,
        category: 'Entertainment',
        subcategory: 'Audio Equipment', 
        sku: 'SPEAKER-BT-WATER-001',
        stockQuantity: 55,
        weight: '600g',
        manufacturer: 'Bass Boost Audio',
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop',
        tags: ['bluetooth speaker', 'waterproof', '360 sound', 'IPX7', '20-hour battery'],
        inStock: true,
        isActive: true,
        minAge: 8,
        maxAge: 99,
        ageCategory: 'Child'
      },
      {
        name: 'Strategy Card Game Collection',
        brand: 'Mind Games Studio',
        description: 'Collection of 5 strategic card games for mental stimulation',
        detailedDescription: 'Premium collection of 5 strategic card games designed to enhance critical thinking and decision-making skills. Includes classic and modern strategy games suitable for 2-6 players.',
        price: 149.99,
        category: 'Entertainment',
        subcategory: 'Card Games',
        sku: 'CARDGAME-STRATEGY-5SET-001',
        stockQuantity: 65,
        weight: '400g',
        manufacturer: 'Mind Games Studio',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        tags: ['card games', 'strategy', '5 games', 'critical thinking', 'mental stimulation'],
        inStock: true,
        isActive: true,
        minAge: 10,
        maxAge: 99,
        ageCategory: 'Child'
      },
      {
        name: 'Wireless Gaming Controller for Mobile',
        brand: 'GameMaster Pro',
        description: 'Professional wireless gaming controller compatible with smartphones and tablets',
        detailedDescription: 'High-performance wireless gaming controller with precision controls, customizable buttons, and 40-hour battery life. Compatible with iOS, Android, and PC. Perfect for mobile gaming enthusiasts.',
        price: 199.99,
        category: 'Entertainment',
        subcategory: 'Gaming Accessories',
        sku: 'CONTROLLER-MOBILE-WIRELESS-001',
        stockQuantity: 50,
        weight: '250g',
        manufacturer: 'GameMaster Technologies',
        imageUrl: 'https://images.unsplash.com/photo-1592840062661-c80f5b6b7c48?w=800&h=600&fit=crop',
        tags: ['gaming controller', 'wireless', 'mobile gaming', '40-hour battery', 'customizable'],
        inStock: true,
        isActive: true,
        minAge: 12,
        maxAge: 99,
        ageCategory: 'Teen'
      },

      // PREGNANCY (5 products)
      {
        name: 'Prenatal Complete Vitamin Complex with DHA',
        brand: 'MomCare Essential',
        description: 'Comprehensive prenatal vitamin with 25+ essential nutrients',
        detailedDescription: 'Complete prenatal vitamin supplement containing 25+ essential nutrients including 800mcg folic acid, iron, calcium, DHA omega-3, vitamins D3, B6, B12. Supports healthy pregnancy and fetal development.',
        price: 249.99,
        category: 'Pregnancy',
        subcategory: 'Prenatal Vitamins',
        sku: 'PRENATAL-COMP-DHA-001',
        stockQuantity: 60,
        weight: '150g',
        manufacturer: 'MomCare Health',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
        tags: ['prenatal vitamins', 'DHA', 'folic acid', '25+ nutrients', 'pregnancy support'],
        inStock: true,
        isActive: true,
        minAge: 18,
        maxAge: 50,
        ageCategory: 'Adult',
        requiresAgeVerification: true
      },
      {
        name: 'Full Body Maternity Support Pillow',
        brand: 'ComfortMom Pro',
        description: 'Ergonomic C-shaped maternity pillow for pregnancy and nursing comfort',
        detailedDescription: 'Premium C-shaped maternity pillow providing optimal support for back, belly, hips, and legs. Made with hypoallergenic memory foam and breathable cotton cover. Machine washable.',
        price: 599.99,
        category: 'Pregnancy',
        subcategory: 'Maternity Comfort',
        sku: 'MAT-PILLOW-C-SHAPE-001',
        stockQuantity: 30,
        weight: '1500g',
        manufacturer: 'ComfortMom Products',
        imageUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&h=600&fit=crop',
        tags: ['maternity pillow', 'C-shaped', 'memory foam', 'pregnancy support', 'nursing'],
        inStock: true,
        isActive: true,
        minAge: 18,
        maxAge: 50,
        ageCategory: 'Adult'
      },
      {
        name: 'Organic Stretch Mark Prevention Cream',
        brand: 'Natural Mama Skincare',
        description: 'Natural stretch mark prevention cream with cocoa butter and vitamin E',
        detailedDescription: 'Premium organic cream specially formulated to prevent and reduce stretch marks during pregnancy. Contains cocoa butter, shea butter, vitamin E, and natural oils. Safe for pregnancy and breastfeeding.',
        price: 89.99,
        category: 'Pregnancy',
        subcategory: 'Skincare & Beauty',
        sku: 'CREAM-STRETCH-ORG-001',
        stockQuantity: 75,
        weight: '200ml',
        manufacturer: 'Natural Mama Skincare',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=600&fit=crop',
        tags: ['stretch marks', 'organic', 'cocoa butter', 'vitamin E', 'pregnancy safe'],
        inStock: true,
        isActive: true,
        minAge: 18,
        maxAge: 50,
        ageCategory: 'Adult'
      },
      {
        name: 'Maternity Support Belt - Adjustable',
        brand: 'BellySupport Pro',
        description: 'Adjustable maternity belt for back and belly support during pregnancy',
        detailedDescription: 'Comfortable adjustable maternity support belt designed to relieve back pain and provide belly support. Made with breathable, stretchy fabric. Suitable for all stages of pregnancy.',
        price: 149.99,
        category: 'Pregnancy',
        subcategory: 'Maternity Support',
        sku: 'BELT-MAT-ADJUST-001',
        stockQuantity: 50,
        weight: '300g',
        manufacturer: 'BellySupport Technologies',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop',
        tags: ['maternity belt', 'back support', 'adjustable', 'breathable', 'pregnancy comfort'],
        inStock: true,
        isActive: true,
        minAge: 18,
        maxAge: 50,
        ageCategory: 'Adult'
      },
      {
        name: 'Pregnancy Journal & Memory Book',
        brand: 'Cherished Moments',
        description: 'Beautiful pregnancy journal to document your journey to motherhood',
        detailedDescription: 'Elegant hardcover pregnancy journal with guided prompts, photo spaces, and milestone tracking. Document appointments, cravings, growth, and special moments throughout pregnancy.',
        price: 79.99,
        category: 'Pregnancy',
        subcategory: 'Memory & Keepsakes',
        sku: 'JOURNAL-PREGNANCY-001',
        stockQuantity: 40,
        weight: '400g',
        manufacturer: 'Cherished Moments Publishing',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop',
        tags: ['pregnancy journal', 'memory book', 'milestone tracking', 'hardcover', 'keepsake'],
        inStock: true,
        isActive: true,
        minAge: 18,
        maxAge: 50,
        ageCategory: 'Adult'
      },

      // OTHER (5 products)
      {
        name: 'Eco-Friendly Bamboo Dinnerware Set',
        brand: 'Green Living Co.',
        description: 'Sustainable bamboo dinnerware set for 4 people',
        detailedDescription: 'Beautiful 16-piece bamboo dinnerware set including plates, bowls, cups, and utensils for 4 people. 100% natural bamboo, biodegradable, and dishwasher safe. Perfect for eco-conscious families.',
        price: 189.99,
        category: 'Other',
        subcategory: 'Kitchenware',
        sku: 'DINNERWARE-BAMBOO-16PC-001',
        stockQuantity: 35,
        weight: '1200g',
        manufacturer: 'Green Living Co.',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        tags: ['bamboo', 'eco-friendly', '16 pieces', 'sustainable', 'dishwasher safe'],
        inStock: true,
        isActive: true,
        minAge: 3,
        maxAge: 100,
        ageCategory: 'All Ages'
      },
      {
        name: 'Wireless Phone Charger Pad',
        brand: 'PowerTech Solutions',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices',
        detailedDescription: 'Universal wireless charging pad with fast charging technology. Compatible with all Qi-enabled smartphones and devices. Features LED indicator, overcharge protection, and sleek modern design.',
        price: 99.99,
        category: 'Other',
        subcategory: 'Electronics',
        sku: 'CHARGER-WIRELESS-QI-001',
        stockQuantity: 80,
        weight: '200g',
        manufacturer: 'PowerTech Solutions',
        imageUrl: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=800&h=600&fit=crop',
        tags: ['wireless charging', 'Qi compatible', 'fast charging', 'LED indicator', 'modern design'],
        inStock: true,
        isActive: true,
        minAge: 12,
        maxAge: 100,
        ageCategory: 'Teen'
      },
      {
        name: 'Aromatherapy Essential Oil Diffuser',
        brand: 'Zen Wellness',
        description: 'Ultrasonic essential oil diffuser with 7 LED colors and timer',
        detailedDescription: 'Premium ultrasonic aromatherapy diffuser with 300ml capacity, 7 changing LED colors, and multiple timer settings. Whisper-quiet operation and auto-shutoff for safety. Includes starter oil set.',
        price: 159.99,
        category: 'Other',
        subcategory: 'Home & Wellness',
        sku: 'DIFFUSER-AROMA-300ML-001',
        stockQuantity: 45,
        weight: '500g',
        manufacturer: 'Zen Wellness Products',
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop',
        tags: ['aromatherapy', 'ultrasonic', '7 LED colors', 'timer', 'whisper quiet'],
        inStock: true,
        isActive: true,
        minAge: 16,
        maxAge: 100,
        ageCategory: 'Teen'
      },
      {
        name: 'Reusable Stainless Steel Water Bottle',
        brand: 'HydroLife Pro',
        description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours',
        detailedDescription: 'Premium double-wall vacuum insulated water bottle that keeps beverages cold for 24 hours or hot for 12 hours. Made from food-grade stainless steel, BPA-free, and leak-proof design.',
        price: 69.99,
        category: 'Other',
        subcategory: 'Drinkware',
        sku: 'BOTTLE-SS-INSULATED-001',
        stockQuantity: 100,
        weight: '400g',
        manufacturer: 'HydroLife Products',
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=600&fit=crop',
        tags: ['stainless steel', 'insulated', '24-hour cold', 'BPA-free', 'leak-proof'],
        inStock: true,
        isActive: true,
        minAge: 5,
        maxAge: 100,
        ageCategory: 'All Ages'
      },
      {
        name: 'Bluetooth Smart Watch with Fitness Tracking',
        brand: 'FitTrack Pro',
        description: 'Advanced smartwatch with health monitoring and fitness tracking',
        detailedDescription: 'Feature-rich smartwatch with heart rate monitoring, sleep tracking, step counter, and 30+ sport modes. 7-day battery life, water-resistant design, and smartphone connectivity.',
        price: 449.99,
        category: 'Other',
        subcategory: 'Wearable Technology',
        sku: 'SMARTWATCH-FITNESS-001',
        stockQuantity: 30,
        weight: '100g',
        manufacturer: 'FitTrack Technologies',
        imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop',
        tags: ['smartwatch', 'fitness tracking', 'heart rate', '30+ sports', '7-day battery'],
        inStock: true,
        isActive: true,
        minAge: 16,
        maxAge: 100,
        ageCategory: 'Teen'
      }
    ];

    console.log('🌱 Seeding new products (5 per category)...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const productData of productsToSeed) {
      try {
        const product = await Product.create(productData);
        console.log(`✅ Added: ${product.name} (${product.category})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding ${productData.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 SEEDING RESULTS:');
    console.log('===================');
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);

    // Show final counts by category
    const finalProducts = await Product.findAll({
      attributes: ['category', [Product.sequelize.fn('COUNT', '*'), 'count']],
      where: { isActive: true },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    console.log('\n📋 Final Products by Category:');
    finalProducts.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.dataValues.count} products`);
    });

    const totalCount = await Product.count({ where: { isActive: true } });
    console.log(`\n📦 Total active products: ${totalCount}`);

  } catch (error) {
    console.error('❌ Operation failed:', error);
  }
}

// Run the operation
if (require.main === module) {
  clearAndSeedProducts()
    .then(() => {
      console.log('\n🏁 Product cleanup and seeding completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Operation failed:', error);
      process.exit(1);
    });
}

module.exports = { clearAndSeedProducts };