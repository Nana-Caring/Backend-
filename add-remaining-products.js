const { Pool } = require('pg');

async function addRemainingProducts() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🌱 Adding remaining accurate products...\n');

    const remainingProducts = [
      // Electronics -> Other category
      {
        name: 'Samsung Galaxy Earbuds2 Pro',
        brand: 'Samsung',
        description: 'Premium wireless earbuds with noise cancellation',
        detailedDescription: 'Samsung Galaxy Buds2 Pro feature intelligent Active Noise Cancellation, premium sound quality, and comfortable fit for all-day wear.',
        price: 3299.00,
        category: 'Other', // Changed from Electronics
        subcategory: 'Audio',
        sku: 'SAMSUNG-BUDS2PRO',
        stockQuantity: 25,
        weight: '5.3g per earbud',
        manufacturer: 'Samsung Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
        tags: ['earbuds', 'wireless', 'samsung', 'audio'],
        ageCategory: 'All Ages',
        inStock: true,
        isActive: true
      },

      // Personal Care -> Healthcare category
      {
        name: 'Nivea Soft Moisturizing Cream 300ml',
        brand: 'Nivea',
        description: 'Light moisturizing cream for face, hands and body',
        detailedDescription: 'Nivea Soft is a light moisturizing cream with Jojoba oil and Vitamin E. Suitable for face, hands and body, providing 24h moisturization.',
        price: 45.99,
        category: 'Healthcare', // Changed from Personal Care
        subcategory: 'Skin Care',
        sku: 'NIVEA-SOFT-300ML',
        stockQuantity: 85,
        ingredients: 'Aqua, Glycerin, Isopropyl Palmitate, Jojoba Oil, Vitamin E',
        weight: '300ml',
        manufacturer: 'Beiersdorf',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
        tags: ['moisturizer', 'skin care', 'nivea', 'body cream'],
        ageCategory: 'All Ages',
        inStock: true,
        isActive: true
      },

      // Additional popular South African products
      {
        name: 'Tastic Rice 2kg',
        brand: 'Tastic',
        description: 'Premium long grain white rice',
        detailedDescription: 'Tastic Rice is South Africa\'s leading rice brand, providing consistently fluffy, separate grains perfect for any meal.',
        price: 89.99,
        category: 'Groceries',
        subcategory: 'Grains & Cereals',
        sku: 'TASTIC-RICE-2KG',
        stockQuantity: 120,
        weight: '2000g',
        manufacturer: 'Tastic',
        imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&h=500&fit=crop',
        tags: ['rice', 'staple food', 'tastic', 'grain'],
        ageCategory: 'All Ages',
        inStock: true,
        isActive: true
      },

      {
        name: 'Pick n Pay School Lunch Box',
        brand: 'Pick n Pay',
        description: 'Durable plastic lunch box for school children',
        detailedDescription: 'High-quality, BPA-free plastic lunch box with multiple compartments. Perfect for school lunches and snacks.',
        price: 79.99,
        category: 'Education',
        subcategory: 'School Supplies',
        sku: 'PNP-LUNCHBOX-001',
        stockQuantity: 90,
        weight: '200g',
        manufacturer: 'Pick n Pay',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
        tags: ['lunch box', 'school', 'kids', 'food container'],
        ageCategory: 'Children',
        minAge: 3,
        maxAge: 18,
        inStock: true,
        isActive: true
      },

      {
        name: 'KFC Voucher R100',
        brand: 'KFC',
        description: 'R100 KFC meal voucher',
        detailedDescription: 'Prepaid KFC voucher worth R100. Can be used at any KFC restaurant in South Africa for meals, snacks, and beverages.',
        price: 100.00,
        category: 'Entertainment',
        subcategory: 'Food & Dining',
        sku: 'KFC-VOUCHER-100',
        stockQuantity: 200,
        manufacturer: 'KFC South Africa',
        imageUrl: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=500&h=500&fit=crop',
        tags: ['kfc', 'food', 'voucher', 'restaurant'],
        ageCategory: 'All Ages',
        inStock: true,
        isActive: true
      },

      {
        name: 'Sunlight Dishwashing Liquid 750ml',
        brand: 'Sunlight',
        description: 'Powerful dishwashing liquid for sparkling clean dishes',
        detailedDescription: 'Sunlight Dishwashing Liquid cuts through grease and grime, leaving your dishes sparkling clean with a fresh lemon scent.',
        price: 32.99,
        category: 'Other',
        subcategory: 'Household',
        sku: 'SUNLIGHT-DISH-750ML',
        stockQuantity: 75,
        weight: '750ml',
        manufacturer: 'Unilever',
        imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&h=500&fit=crop',
        tags: ['dishwashing', 'cleaning', 'sunlight', 'household'],
        ageCategory: 'Adult',
        minAge: 18,
        inStock: true,
        isActive: true
      }
    ];

    for (const product of remainingProducts) {
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
            product.minAge || null,
            product.maxAge || null,
            product.ageCategory || 'All Ages',
            product.requiresAgeVerification || false,
            product.inStock,
            product.isActive
          ]);

          console.log(`✅ Added: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
        } else {
          console.log(`ℹ️  Skipped (exists): ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${product.name}:`, error.message);
      }
    }

    // Show final summary
    const totalProducts = await pool.query('SELECT COUNT(*) as total FROM "products"');
    const categoryStats = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM "products" 
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log('\n📊 Final Product Database Summary:');
    console.log(`Total Products: ${totalProducts.rows[0].total}`);
    console.log('\nProducts by Category:');
    categoryStats.rows.forEach(stat => {
      console.log(`  • ${stat.category}: ${stat.count} products`);
    });

    // Show some sample products
    const sampleProducts = await pool.query(`
      SELECT name, price, category, brand
      FROM "products" 
      ORDER BY id 
      LIMIT 8
    `);

    console.log('\n🛍️  Sample Products:');
    sampleProducts.rows.forEach(product => {
      console.log(`  • ${product.name} - R${product.price} (${product.brand})`);
    });

    console.log('\n🎉 All accurate products with real images seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error adding remaining products:', error.message);
  } finally {
    await pool.end();
  }
}

addRemainingProducts();