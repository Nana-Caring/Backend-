const { Product } = require('../models');

const sampleProducts = [
  {
    name: 'Pregnavit M 30 Capsules',
    brand: 'Clicks',
    description: 'Essential vitamins for pregnancy',
    detailedDescription: 'Pregnavit M 30 Capsules are formulated for women before, during and after pregnancy. It contains folic acid and a range of essential vitamins and minerals to improve energy, maintain healthy cells, and promote strong bones and teeth.',
    price: 285.99,
    category: 'Healthcare',
    subcategory: 'Pregnancy Vitamins',
    sku: 'ID16453',
    image: 'https://example.com/pregnavit.jpg',
    images: ['https://example.com/pregnavit1.jpg', 'https://example.com/pregnavit2.jpg'],
    inStock: true,
    stockQuantity: 50,
    ingredients: 'Folic Acid, Iron, Calcium, Vitamin D, Vitamin B12, Zinc',
    weight: '30 capsules',
    manufacturer: 'Clicks Pharmaceuticals',
    tags: ['pregnancy', 'vitamins', 'health', 'supplements'],
    rating: 4.5,
    reviewCount: 23
  },
  {
    name: 'Basic Mathematics Textbook Grade 10',
    brand: 'Oxford University Press',
    description: 'Comprehensive mathematics textbook for Grade 10 students',
    detailedDescription: 'This comprehensive textbook covers all Grade 10 mathematics topics according to the national curriculum. Includes exercises, examples, and exam preparation materials.',
    price: 450.00,
    category: 'Education',
    subcategory: 'Textbooks',
    sku: 'EDU10001',
    image: 'https://example.com/math-textbook.jpg',
    images: ['https://example.com/math-book1.jpg'],
    inStock: true,
    stockQuantity: 25,
    weight: '500g',
    manufacturer: 'Oxford University Press',
    tags: ['education', 'mathematics', 'grade10', 'textbook'],
    rating: 4.2,
    reviewCount: 15
  },
  {
    name: 'Fresh Whole Milk 2L',
    brand: 'Clover',
    description: 'Fresh full cream milk',
    detailedDescription: 'Premium quality fresh whole milk from grass-fed cows. Rich in calcium, protein, and essential nutrients for healthy bones and muscles.',
    price: 32.99,
    category: 'Groceries',
    subcategory: 'Dairy Products',
    sku: 'GRO2001',
    image: 'https://example.com/milk.jpg',
    images: [],
    inStock: true,
    stockQuantity: 100,
    ingredients: 'Fresh Whole Milk (3.5% fat)',
    weight: '2 Liters',
    manufacturer: 'Clover SA',
    tags: ['dairy', 'milk', 'fresh', 'calcium'],
    rating: 4.7,
    reviewCount: 45
  },
  {
    name: 'Bus Monthly Pass - Student',
    brand: 'City Transport',
    description: 'Monthly bus pass for students',
    detailedDescription: 'Unlimited travel on city buses for one full month. Valid for students with valid student ID. Covers all city routes during operating hours.',
    price: 150.00,
    category: 'Transport',
    subcategory: 'Public Transport',
    sku: 'TRP3001',
    image: 'https://example.com/bus-pass.jpg',
    images: [],
    inStock: true,
    stockQuantity: 200,
    manufacturer: 'City Transport Authority',
    tags: ['transport', 'bus', 'student', 'monthly'],
    rating: 4.0,
    reviewCount: 8
  },
  {
    name: 'Movie Theatre Tickets (2 Pack)',
    brand: 'Ster Kinekor',
    description: 'Two movie tickets for any standard screening',
    detailedDescription: 'Enjoy the latest movies with this 2-pack of cinema tickets. Valid for any standard 2D screening at participating Ster Kinekor cinemas. Excludes 3D, IMAX, and special events.',
    price: 220.00,
    category: 'Entertainment',
    subcategory: 'Cinema',
    sku: 'ENT4001',
    image: 'https://example.com/movie-tickets.jpg',
    images: [],
    inStock: true,
    stockQuantity: 75,
    manufacturer: 'Ster Kinekor',
    tags: ['entertainment', 'movies', 'cinema', 'tickets'],
    rating: 4.6,
    reviewCount: 32
  },
  {
    name: 'Panadol Extra 24 Tablets',
    brand: 'GSK',
    description: 'Pain relief tablets with caffeine',
    detailedDescription: 'Panadol Extra provides effective relief from headaches, migraines, backache, rheumatic and muscle pain, toothache, and period pain. Contains paracetamol and caffeine.',
    price: 68.99,
    category: 'Healthcare',
    subcategory: 'Pain Relief',
    sku: 'HLT5001',
    image: 'https://example.com/panadol.jpg',
    images: ['https://example.com/panadol1.jpg'],
    inStock: true,
    stockQuantity: 80,
    ingredients: 'Paracetamol 500mg, Caffeine 65mg per tablet',
    weight: '24 tablets',
    manufacturer: 'GlaxoSmithKline',
    tags: ['healthcare', 'pain relief', 'headache', 'tablets'],
    rating: 4.4,
    reviewCount: 67
  },
  {
    name: 'Scientific Calculator',
    brand: 'Casio',
    description: 'Advanced scientific calculator for students',
    detailedDescription: 'Casio FX-82MS scientific calculator with 240 functions including trigonometry, statistics, and algebra. Perfect for high school and university mathematics.',
    price: 180.00,
    category: 'Education',
    subcategory: 'Calculators',
    sku: 'EDU6001',
    image: 'https://example.com/calculator.jpg',
    images: [],
    inStock: true,
    stockQuantity: 40,
    weight: '150g',
    manufacturer: 'Casio',
    tags: ['education', 'calculator', 'mathematics', 'scientific'],
    rating: 4.8,
    reviewCount: 28
  }
];

const seedProducts = async () => {
  try {
    console.log('🌱 Starting product seeding...');
    
    // Clear existing products (optional)
    await Product.destroy({ where: {}, truncate: true });
    console.log('🗑️ Cleared existing products');
    
    // Insert sample products
    const createdProducts = await Product.bulkCreate(sampleProducts, {
      returning: true
    });
    
    console.log(`✅ Successfully seeded ${createdProducts.length} products:`);
    
    createdProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.category}) - R${product.price}`);
    });
    
    console.log('🎉 Product seeding completed!');
    
  } catch (error) {
    console.error('❌ Product seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  const { sequelize } = require('../models');
  
  sequelize.authenticate()
    .then(seedProducts)
    .then(() => {
      console.log('✨ Database seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProducts, sampleProducts };
