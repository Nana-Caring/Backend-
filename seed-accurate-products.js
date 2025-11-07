const { Pool } = require('pg');

// Real product data with accurate information and images
const accurateProducts = [
  // GROCERIES - Popular South African brands
  {
    name: 'Coca-Cola Original 2L',
    brand: 'Coca-Cola',
    description: 'Original Coca-Cola soft drink 2 liter bottle',
    detailedDescription: 'The classic refreshing taste of Coca-Cola in a convenient 2-liter family size bottle. Perfect for sharing with friends and family.',
    price: 28.99,
    category: 'Groceries',
    subcategory: 'Beverages',
    sku: 'COKE-2L-001',
    stockQuantity: 150,
    weight: '2000ml',
    manufacturer: 'Coca-Cola Beverages Africa',
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500&h=500&fit=crop',
    tags: ['soft drink', 'cola', 'family size', 'refreshing'],
    inStock: true,
    isActive: true
  },
  {
    name: 'White Star Super Maize Meal 2.5kg',
    brand: 'White Star',
    description: 'Premium white maize meal for traditional South African dishes',
    detailedDescription: 'White Star Super Maize Meal is made from the finest white maize. Perfect for making pap, phutu, and other traditional South African meals.',
    price: 45.99,
    category: 'Groceries',
    subcategory: 'Grains & Cereals',
    sku: 'WS-MAIZE-25KG',
    stockQuantity: 80,
    weight: '2500g',
    manufacturer: 'Premier Foods',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=500&fit=crop',
    tags: ['maize meal', 'pap', 'traditional', 'staple food'],
    inStock: true,
    isActive: true
  },
  {
    name: 'Rama Original Margarine 500g',
    brand: 'Rama',
    description: 'Classic margarine for spreading and cooking',
    detailedDescription: 'Rama Original Margarine has been a trusted household name for generations. Perfect for spreading on bread or cooking your favorite meals.',
    price: 32.99,
    category: 'Groceries',
    subcategory: 'Dairy & Eggs',
    sku: 'RAMA-MARG-500G',
    stockQuantity: 65,
    weight: '500g',
    manufacturer: 'Unilever',
    imageUrl: 'https://images.unsplash.com/photo-1589985269047-0dbf5ea2426d?w=500&h=500&fit=crop',
    tags: ['margarine', 'spread', 'cooking', 'breakfast'],
    inStock: true,
    isActive: true
  },

  // HEALTHCARE - Real medical products
  {
    name: 'Panado Paracetamol 500mg 20 Tablets',
    brand: 'Panado',
    description: 'Fast-acting pain and fever relief tablets',
    detailedDescription: 'Panado contains paracetamol for effective relief of mild to moderate pain and fever. Suitable for adults and children over 12 years.',
    price: 15.99,
    category: 'Healthcare',
    subcategory: 'Pain Relief',
    sku: 'PANADO-500MG-20',
    stockQuantity: 200,
    ingredients: 'Paracetamol 500mg',
    weight: '20 tablets',
    manufacturer: 'Johnson & Johnson',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop',
    tags: ['paracetamol', 'pain relief', 'fever', 'headache'],
    minAge: 12,
    requiresAgeVerification: true,
    inStock: true,
    isActive: true
  },
  {
    name: 'Dettol Antiseptic Liquid 750ml',
    brand: 'Dettol',
    description: 'Antiseptic disinfectant for cuts, wounds and general hygiene',
    detailedDescription: 'Dettol Antiseptic Liquid kills germs and provides protection against infection from cuts and scratches. Can also be used for general disinfection.',
    price: 89.99,
    category: 'Healthcare',
    subcategory: 'First Aid',
    sku: 'DETTOL-ANTI-750',
    stockQuantity: 45,
    weight: '750ml',
    manufacturer: 'Reckitt Benckiser',
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031d184?w=500&h=500&fit=crop',
    tags: ['antiseptic', 'disinfectant', 'first aid', 'hygiene'],
    inStock: true,
    isActive: true
  },

  // EDUCATION - School and learning supplies
  {
    name: 'Staedtler Noris HB Pencils Pack of 12',
    brand: 'Staedtler',
    description: 'High-quality HB pencils for writing and drawing',
    detailedDescription: 'Staedtler Noris pencils are made from certified wood and feature break-resistant lead. Perfect for school, office, and artistic use.',
    price: 24.99,
    category: 'Education',
    subcategory: 'Stationery',
    sku: 'STAED-NORIS-12',
    stockQuantity: 120,
    weight: '12 pencils',
    manufacturer: 'Staedtler',
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
    tags: ['pencils', 'writing', 'school', 'stationery'],
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },
  {
    name: 'Oxford A4 Lined Exercise Book 96 Pages',
    brand: 'Oxford',
    description: 'Quality exercise book for school and office use',
    detailedDescription: 'Oxford exercise books feature high-quality paper and durable covers. Perfect for note-taking, homework, and professional use.',
    price: 12.99,
    category: 'Education',
    subcategory: 'Notebooks & Paper',
    sku: 'OXF-A4-LINED-96',
    stockQuantity: 200,
    weight: '96 pages',
    manufacturer: 'Oxford',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&h=500&fit=crop',
    tags: ['notebook', 'exercise book', 'school', 'writing'],
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },

  // TRANSPORT - Travel and commuting essentials
  {
    name: 'Shell V-Power 95 Octane Fuel Voucher',
    brand: 'Shell',
    description: 'R200 fuel voucher for Shell V-Power 95 petrol',
    detailedDescription: 'Prepaid fuel voucher for Shell V-Power 95 octane petrol. Can be used at any participating Shell service station across South Africa.',
    price: 200.00,
    category: 'Transport',
    subcategory: 'Fuel',
    sku: 'SHELL-VP95-200',
    stockQuantity: 50,
    manufacturer: 'Shell South Africa',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
    tags: ['fuel', 'petrol', 'voucher', 'transport'],
    minAge: 18,
    requiresAgeVerification: true,
    inStock: true,
    isActive: true
  },
  {
    name: 'Uber Ride Voucher R150',
    brand: 'Uber',
    description: 'R150 credit for Uber rides',
    detailedDescription: 'Prepaid Uber voucher worth R150. Can be used for any Uber service including UberX, UberXL, and UberEats orders.',
    price: 150.00,
    category: 'Transport',
    subcategory: 'Ride Sharing',
    sku: 'UBER-VOUCHER-150',
    stockQuantity: 100,
    manufacturer: 'Uber Technologies',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-15c6e675c39d?w=500&h=500&fit=crop',
    tags: ['uber', 'transport', 'voucher', 'ride sharing'],
    minAge: 18,
    requiresAgeVerification: true,
    inStock: true,
    isActive: true
  },

  // ENTERTAINMENT - Games, books, and leisure
  {
    name: 'Netflix Gift Card R200',
    brand: 'Netflix',
    description: 'R200 Netflix subscription gift card',
    detailedDescription: 'Netflix gift card worth R200. Can be used to pay for Netflix subscription or added to existing account balance for streaming movies and series.',
    price: 200.00,
    category: 'Entertainment',
    subcategory: 'Streaming',
    sku: 'NETFLIX-GC-200',
    stockQuantity: 75,
    manufacturer: 'Netflix Inc.',
    imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=500&fit=crop',
    tags: ['netflix', 'streaming', 'entertainment', 'gift card'],
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },
  {
    name: 'PlayStation Store Gift Card R250',
    brand: 'PlayStation',
    description: 'R250 PlayStation Store digital gift card',
    detailedDescription: 'PlayStation Store gift card worth R250. Can be used to purchase games, DLC, movies, and other digital content from the PlayStation Store.',
    price: 250.00,
    category: 'Entertainment',
    subcategory: 'Gaming',
    sku: 'PS-STORE-GC-250',
    stockQuantity: 60,
    manufacturer: 'Sony Interactive Entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop',
    tags: ['playstation', 'gaming', 'gift card', 'digital'],
    ageCategory: 'All Ages',
    inStock: true,
    isActive: true
  },

  // TECHNOLOGY - Electronics and gadgets
  {
    name: 'Samsung Galaxy Earbuds2 Pro',
    brand: 'Samsung',
    description: 'Premium wireless earbuds with noise cancellation',
    detailedDescription: 'Samsung Galaxy Buds2 Pro feature intelligent Active Noise Cancellation, premium sound quality, and comfortable fit for all-day wear.',
    price: 3299.00,
    category: 'Electronics',
    subcategory: 'Audio',
    sku: 'SAMSUNG-BUDS2PRO',
    stockQuantity: 25,
    weight: '5.3g per earbud',
    manufacturer: 'Samsung Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
    tags: ['earbuds', 'wireless', 'samsung', 'audio'],
    ageCategory: 'Teen & Adult',
    inStock: true,
    isActive: true
  },

  // PERSONAL CARE - Beauty and hygiene
  {
    name: 'Nivea Soft Moisturizing Cream 300ml',
    brand: 'Nivea',
    description: 'Light moisturizing cream for face, hands and body',
    detailedDescription: 'Nivea Soft is a light moisturizing cream with Jojoba oil and Vitamin E. Suitable for face, hands and body, providing 24h moisturization.',
    price: 45.99,
    category: 'Personal Care',
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
  }
];

async function seedAccurateProducts() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🌱 Seeding accurate products with real images and data...\n');

    for (const product of accurateProducts) {
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
            product.imageUrl, // This will go into the 'image' column
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

    // Show summary
    const totalProducts = await pool.query('SELECT COUNT(*) as total FROM "products"');
    const categoryStats = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM "products" 
      GROUP BY category 
      ORDER BY count DESC
    `);

    console.log('\n📊 Product Database Summary:');
    console.log(`Total Products: ${totalProducts.rows[0].total}`);
    console.log('\nProducts by Category:');
    categoryStats.rows.forEach(stat => {
      console.log(`  • ${stat.category}: ${stat.count} products`);
    });

    console.log('\n🎉 Accurate product seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  } finally {
    await pool.end();
  }
}

seedAccurateProducts();