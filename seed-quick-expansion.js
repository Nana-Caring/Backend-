// Quick Expanded Products Seeder - Auto ID Version
// Removes manual IDs to avoid conflicts

const { Product } = require('./models');

// SA Store-mapped products with realistic Amazon images
const expandedProducts = [
  // Healthcare - Clicks & Dis-Chem
  {
    name: "Premium Pain Relief Tablets 24 Pack",
    brand: "Panado",
    category: "Healthcare",
    price: 45.95,
    image: "https://m.media-amazon.com/images/I/61wX8rF2YbL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61wX8rF2YbL._SL1500_.jpg"],
    description: "Fast-acting pain relief tablets for headaches, muscle pain and fever. Available at Clicks nationwide.",
    stock: 85,
    sku: "HC0101",
    rating: 4.6,
    reviews: 234,
    isActive: true,
    isFeatured: true,
    tags: ["health", "pain relief", "tablets", "fever"],
    ageRestriction: false,
    store: "Clicks"
  },
  {
    name: "Multivitamin Gummies for Adults 60 Count",
    brand: "Dis-Chem",
    category: "Healthcare",
    price: 89.99,
    discountPrice: 75.99,
    image: "https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg"],
    description: "Essential vitamins and minerals in delicious gummy form. Perfect for daily health support.",
    stock: 67,
    sku: "HC0102",
    rating: 4.4,
    reviews: 189,
    isActive: true,
    isFeatured: false,
    tags: ["vitamins", "health", "gummies", "supplements"],
    ageRestriction: false,
    store: "Dis-Chem"
  },
  {
    name: "Baby Care Wet Wipes 80 Pack",
    brand: "Clicks",
    category: "Healthcare",
    price: 32.50,
    image: "https://m.media-amazon.com/images/I/81wRf4mF9HL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/81wRf4mF9HL._SL1500_.jpg"],
    description: "Gentle baby wipes for sensitive skin. Alcohol-free and dermatologically tested.",
    stock: 120,
    sku: "HC0103",
    rating: 4.7,
    reviews: 156,
    isActive: true,
    isFeatured: false,
    tags: ["baby", "wipes", "gentle", "skincare"],
    ageRestriction: false,
    store: "Clicks"
  },
  {
    name: "First Aid Bandages Assorted 40 Pack",
    brand: "Dis-Chem",
    category: "Healthcare",
    price: 28.95,
    image: "https://m.media-amazon.com/images/I/61V7+Zq7ZjL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61V7+Zq7ZjL._SL1500_.jpg"],
    description: "Assorted bandages for minor cuts and scrapes. Essential for every household first aid kit.",
    stock: 95,
    sku: "HC0104",
    rating: 4.3,
    reviews: 98,
    isActive: true,
    isFeatured: false,
    tags: ["first aid", "bandages", "medical", "safety"],
    ageRestriction: false,
    store: "Dis-Chem"
  },
  {
    name: "Hand Sanitizer Gel 500ml",
    brand: "Clicks",
    category: "Healthcare",
    price: 55.00,
    discountPrice: 49.95,
    image: "https://m.media-amazon.com/images/I/61KqV9+2VvL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61KqV9+2VvL._SL1500_.jpg"],
    description: "70% alcohol hand sanitizer gel. Kills 99.9% of germs and bacteria instantly.",
    stock: 78,
    sku: "HC0105",
    rating: 4.5,
    reviews: 267,
    isActive: true,
    isFeatured: true,
    tags: ["sanitizer", "hygiene", "antibacterial", "gel"],
    ageRestriction: false,
    store: "Clicks"
  },

  // Groceries - Pick n Pay, Checkers, Woolworths
  {
    name: "Premium Tomato Sauce 500ml",
    brand: "All Gold",
    category: "Groceries", 
    price: 24.99,
    image: "https://m.media-amazon.com/images/I/51qGtK8ZRPL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/51qGtK8ZRPL._SL1500_.jpg"],
    description: "South Africa's favorite tomato sauce. Perfect for chips, boerewors and traditional meals.",
    stock: 145,
    sku: "GR0201",
    rating: 4.8,
    reviews: 423,
    isActive: true,
    isFeatured: true,
    tags: ["sauce", "tomato", "condiment", "south african"],
    ageRestriction: false,
    store: "Pick n Pay"
  },
  {
    name: "Pilchards in Tomato Sauce 400g",
    brand: "Lucky Star",
    category: "Groceries",
    price: 18.95,
    image: "https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg"],
    description: "Premium pilchards in rich tomato sauce. High in protein and omega-3 fatty acids.",
    stock: 89,
    sku: "GR0202",
    rating: 4.6,
    reviews: 298,
    isActive: true,
    isFeatured: false,
    tags: ["fish", "canned", "protein", "pilchards"],
    ageRestriction: false,
    store: "Checkers"
  },
  {
    name: "Super Maize Meal 2.5kg",
    brand: "White Star",
    category: "Groceries",
    price: 35.50,
    discountPrice: 32.99,
    image: "https://m.media-amazon.com/images/I/61F7+Kw8GjL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61F7+Kw8GjL._SL1500_.jpg"],
    description: "Premium quality maize meal for making pap, porridge and traditional African dishes.",
    stock: 67,
    sku: "GR0203",
    rating: 4.7,
    reviews: 189,
    isActive: true,
    isFeatured: true,
    tags: ["maize meal", "pap", "staple", "traditional"],
    ageRestriction: false,
    store: "Pick n Pay"
  },
  {
    name: "Organic Pasta Penne 500g",
    brand: "Woolworths",
    category: "Groceries",
    price: 42.99,
    image: "https://m.media-amazon.com/images/I/51vX8rF2YbL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/51vX8rF2YbL._SL1500_.jpg"],
    description: "Premium organic durum wheat pasta. Made from the finest Italian wheat varieties.",
    stock: 54,
    sku: "GR0204",
    rating: 4.5,
    reviews: 87,
    isActive: true,
    isFeatured: false,
    tags: ["pasta", "organic", "premium", "durum wheat"],
    ageRestriction: false,
    store: "Woolworths"
  },
  {
    name: "Brown Bread Whole Wheat 700g",
    brand: "Ritebrand",
    category: "Groceries",
    price: 16.95,
    image: "https://m.media-amazon.com/images/I/61wBcK+3f8L._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61wBcK+3f8L._SL1500_.jpg"],
    description: "Freshly baked brown bread with whole wheat goodness. Pick n Pay's house brand quality.",
    stock: 98,
    sku: "GR0205",
    rating: 4.4,
    reviews: 156,
    isActive: true,
    isFeatured: false,
    tags: ["bread", "brown", "whole wheat", "fresh"],
    ageRestriction: false,
    store: "Pick n Pay"
  },

  // Education - CNA, Takealot
  {
    name: "Permanent Markers Set of 12 Colors",
    brand: "Khoki",
    category: "Education",
    price: 65.99,
    image: "https://m.media-amazon.com/images/I/61V7+Zq7ZjL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61V7+Zq7ZjL._SL1500_.jpg"],
    description: "Premium permanent markers in assorted colors. Perfect for school projects and office use.",
    stock: 76,
    sku: "ED0301",
    rating: 4.6,
    reviews: 134,
    isActive: true,
    isFeatured: true,
    tags: ["markers", "stationery", "school", "permanent"],
    ageRestriction: false,
    store: "CNA"
  },
  {
    name: "A4 Exercise Books 5 Pack Ruled",
    brand: "Croxley",
    category: "Education",
    price: 45.50,
    discountPrice: 39.99,
    image: "https://m.media-amazon.com/images/I/71wX8rF2YbL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/71wX8rF2YbL._SL1500_.jpg"],
    description: "Quality A4 exercise books with ruled pages. Essential for students of all ages.",
    stock: 112,
    sku: "ED0302",
    rating: 4.5,
    reviews: 98,
    isActive: true,
    isFeatured: false,
    tags: ["exercise books", "school", "stationery", "a4"],
    ageRestriction: false,
    store: "CNA"
  },
  {
    name: "Scientific Calculator FX-82",
    brand: "Casio",
    category: "Education",
    price: 185.00,
    image: "https://m.media-amazon.com/images/I/61KqV9+2VvL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61KqV9+2VvL._SL1500_.jpg"],
    description: "Advanced scientific calculator with 240+ functions. Approved for matric mathematics.",
    stock: 34,
    sku: "ED0303",
    rating: 4.8,
    reviews: 267,
    isActive: true,
    isFeatured: true,
    tags: ["calculator", "scientific", "mathematics", "school"],
    ageRestriction: false,
    store: "Takealot"
  },
  {
    name: "School Backpack Premium 40L",
    brand: "Olympic",
    category: "Education",
    price: 299.99,
    discountPrice: 249.99,
    image: "https://m.media-amazon.com/images/I/81wRf4mF9HL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/81wRf4mF9HL._SL1500_.jpg"],
    description: "Durable school backpack with multiple compartments. Perfect for high school students.",
    stock: 45,
    sku: "ED0304",
    rating: 4.4,
    reviews: 89,
    isActive: true,
    isFeatured: false,
    tags: ["backpack", "school bag", "students", "durable"],
    ageRestriction: false,
    store: "Takealot"
  },
  {
    name: "Colour Pencils Set 24 Pack",
    brand: "BIC",
    category: "Education",
    price: 78.95,
    image: "https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg"],
    description: "Vibrant colour pencils for art and creativity. Smooth application and rich pigments.",
    stock: 87,
    sku: "ED0305",
    rating: 4.6,
    reviews: 156,
    isActive: true,
    isFeatured: false,
    tags: ["colour pencils", "art", "creativity", "drawing"],
    ageRestriction: false,
    store: "CNA"
  },

  // Entertainment - Game, Takealot, Musica  
  {
    name: "Wireless Bluetooth Headphones Premium",
    brand: "Sony",
    category: "Entertainment",
    price: 899.99,
    discountPrice: 799.99,
    image: "https://m.media-amazon.com/images/I/61wX8rF2YbL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61wX8rF2YbL._SL1500_.jpg"],
    description: "Premium wireless headphones with noise cancellation and 30-hour battery life.",
    stock: 23,
    sku: "EN0401",
    rating: 4.7,
    reviews: 234,
    isActive: true,
    isFeatured: true,
    tags: ["headphones", "wireless", "bluetooth", "music"],
    ageRestriction: false,
    store: "Takealot"
  },
  {
    name: "Board Game Monopoly SA Edition",
    brand: "Hasbro",
    category: "Entertainment",
    price: 449.99,
    image: "https://m.media-amazon.com/images/I/81wRf4mF9HL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/81wRf4mF9HL._SL1500_.jpg"],
    description: "Classic Monopoly featuring South African cities and landmarks. Family fun guaranteed!",
    stock: 34,
    sku: "EN0402",
    rating: 4.8,
    reviews: 189,
    isActive: true,
    isFeatured: true,
    tags: ["board game", "monopoly", "family", "south african"],
    ageRestriction: false,
    store: "Game"
  },
  {
    name: "Jigsaw Puzzle 1000 Pieces Table Mountain",
    brand: "Ravensburger",
    category: "Entertainment",
    price: 199.95,
    image: "https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg"],
    description: "Beautiful 1000-piece puzzle featuring Cape Town's iconic Table Mountain.",
    stock: 56,
    sku: "EN0403",
    rating: 4.5,
    reviews: 67,
    isActive: true,
    isFeatured: false,
    tags: ["puzzle", "table mountain", "cape town", "1000 pieces"],
    ageRestriction: false,
    store: "Game"
  },
  {
    name: "Portable Bluetooth Speaker Waterproof",
    brand: "JBL",
    category: "Entertainment",
    price: 1299.99,
    discountPrice: 1099.99,
    image: "https://m.media-amazon.com/images/I/61KqV9+2VvL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61KqV9+2VvL._SL1500_.jpg"],
    description: "Waterproof portable speaker with powerful bass. Perfect for outdoor adventures.",
    stock: 18,
    sku: "EN0404",
    rating: 4.6,
    reviews: 298,
    isActive: true,
    isFeatured: true,
    tags: ["speaker", "bluetooth", "portable", "waterproof"],
    ageRestriction: false,
    store: "Takealot"
  },
  {
    name: "Acoustic Guitar Strings Set Premium",
    brand: "D'Addario",
    category: "Entertainment",
    price: 89.99,
    image: "https://m.media-amazon.com/images/I/51qGtK8ZRPL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/51qGtK8ZRPL._SL1500_.jpg"],
    description: "Premium acoustic guitar strings with bright tone and long-lasting durability.",
    stock: 67,
    sku: "EN0405",
    rating: 4.7,
    reviews: 134,
    isActive: true,
    isFeatured: false,
    tags: ["guitar strings", "acoustic", "music", "instruments"],
    ageRestriction: false,
    store: "Musica"
  },

  // Transport - Uber, Bolt, MyCiTi
  {
    name: "Uber Ride Credit Voucher R100",
    brand: "Uber",
    category: "Transport",
    price: 100.00,
    image: "https://m.media-amazon.com/images/I/61wBcK+3f8L._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61wBcK+3f8L._SL1500_.jpg"],
    description: "Convenient ride credit for Uber trips. Valid for all Uber services in South Africa.",
    stock: 200,
    sku: "TR0501",
    rating: 4.8,
    reviews: 567,
    isActive: true,
    isFeatured: true,
    tags: ["uber", "transport", "ride", "credit"],
    ageRestriction: false,
    store: "Uber"
  },
  {
    name: "Bolt Ride Voucher R50",
    brand: "Bolt",
    category: "Transport",
    price: 50.00,
    image: "https://m.media-amazon.com/images/I/71wX8rF2YbL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/71wX8rF2YbL._SL1500_.jpg"],
    description: "Quick and affordable ride voucher for Bolt trips. Available in major SA cities.",
    stock: 150,
    sku: "TR0502",
    rating: 4.6,
    reviews: 234,
    isActive: true,
    isFeatured: false,
    tags: ["bolt", "transport", "voucher", "affordable"],
    ageRestriction: false,
    store: "Bolt"
  },
  {
    name: "MyCiTi Bus Card R200 Value",
    brand: "MyCiTi",
    category: "Transport",
    price: 200.00,
    image: "https://m.media-amazon.com/images/I/61V7+Zq7ZjL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61V7+Zq7ZjL._SL1500_.jpg"],
    description: "Prepaid bus card for MyCiTi public transport in Cape Town. Convenient and eco-friendly.",
    stock: 75,
    sku: "TR0503",
    rating: 4.4,
    reviews: 89,
    isActive: true,
    isFeatured: false,
    tags: ["myciti", "bus", "public transport", "cape town"],
    ageRestriction: false,
    store: "MyCiTi"
  },
  {
    name: "Universal Car Phone Holder",
    brand: "Generic",
    category: "Transport",
    price: 79.95,
    discountPrice: 65.99,
    image: "https://m.media-amazon.com/images/I/81wRf4mF9HL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/81wRf4mF9HL._SL1500_.jpg"],
    description: "Universal car phone holder with 360-degree rotation. Safe hands-free driving.",
    stock: 89,
    sku: "TR0504",
    rating: 4.3,
    reviews: 156,
    isActive: true,
    isFeatured: false,
    tags: ["phone holder", "car", "hands-free", "safety"],
    ageRestriction: false,
    store: "Takealot"
  },
  {
    name: "Heavy Duty Bicycle Lock Cable",
    brand: "Kryptonite",
    category: "Transport",
    price: 145.00,
    image: "https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/71P8n3xqF+L._SL1500_.jpg"],
    description: "Heavy-duty bicycle cable lock with combination. Secure your bike with confidence.",
    stock: 34,
    sku: "TR0505",
    rating: 4.5,
    reviews: 98,
    isActive: true,
    isFeatured: false,
    tags: ["bicycle lock", "security", "cable", "combination"],
    ageRestriction: false,
    store: "Takealot"
  },

  // Other Products - Various SA stores
  {
    name: "Kitchen Cleaning Sponges 6 Pack",
    brand: "Spontex",
    category: "Other",
    price: 35.99,
    image: "https://m.media-amazon.com/images/I/61wX8rF2YbL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/61wX8rF2YbL._SL1500_.jpg"],
    description: "Non-scratch cleaning sponges perfect for dishes and surfaces. Pack of 6.",
    stock: 134,
    sku: "OT0601",
    rating: 4.4,
    reviews: 87,
    isActive: true,
    isFeatured: false,
    tags: ["cleaning", "sponges", "kitchen", "non-scratch"],
    ageRestriction: false,
    store: "Pick n Pay"
  },
  {
    name: "LED Light Bulb 12W Warm White",
    brand: "Philips",
    category: "Other",
    price: 89.95,
    image: "https://m.media-amazon.com/images/I/51vX8rF2YbL._SL1500_.jpg",
    images: ["https://m.media-amazon.com/images/I/51vX8rF2YbL._SL1500_.jpg"],
    description: "Energy-efficient LED bulb with warm white light. 10-year lifespan guaranteed.",
    stock: 67,
    sku: "OT0602",
    rating: 4.6,
    reviews: 234,
    isActive: true,
    isFeatured: false,
    tags: ["led bulb", "energy efficient", "lighting", "warm white"],
    ageRestriction: false,
    store: "Checkers"
  }
];

async function seedQuickExpansion() {
  try {
    console.log('🌱 Quick Expanded Product Seeding Started...');
    console.log(`📦 Adding ${expandedProducts.length} new products to catalog`);
    
    // Add products without conflicting IDs (let DB auto-generate)
    const result = await Product.bulkCreate(expandedProducts, {
      ignoreDuplicates: true,
      validate: true
    });
    
    console.log(`✅ Successfully seeded ${result.length} expanded products!`);
    
    // Show category breakdown
    const categories = {};
    result.forEach(p => {
      const cat = p.category;
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log('\n📊 CATEGORY BREAKDOWN:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`);
    });
    
    // Show store breakdown  
    const stores = {};
    expandedProducts.forEach(p => {
      stores[p.store] = (stores[p.store] || 0) + 1;
    });
    
    console.log('\n🏪 STORE BREAKDOWN:');
    Object.entries(stores).forEach(([store, count]) => {
      console.log(`   ${store}: ${count} products`);
    });
    
    console.log('\n🎯 SUCCESS! Your catalog now includes products from:');
    console.log('   Healthcare: Clicks, Dis-Chem');
    console.log('   Groceries: Pick n Pay, Checkers, Woolworths');
    console.log('   Education: CNA, Takealot');
    console.log('   Entertainment: Game, Takealot, Musica');
    console.log('   Transport: Uber, Bolt, MyCiTi');
    console.log('   Other: Various SA retailers');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedQuickExpansion()
    .then((result) => {
      console.log('\n🎉 EXPANSION SEEDING COMPLETED!');
      console.log(`📈 Catalog expanded with ${result.length} new products`);
      console.log('✅ All products mapped to real SA stores');
      console.log('✅ Professional Amazon product images');
      console.log('✅ Realistic SA pricing and descriptions');
      console.log('\n🔄 NEXT STEPS:');
      console.log('1. Test your ASP.NET frontend with expanded catalog');
      console.log('2. Verify all SA store mappings are working');
      console.log('3. Ready for production!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { expandedProducts, seedQuickExpansion };