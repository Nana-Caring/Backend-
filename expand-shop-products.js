const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

console.log('🛍️ EXPANDING PRODUCT CATALOG WITH MORE SHOP ITEMS\n');
console.log('🎯 Adding ~10 products per major shop for better selection');
console.log('💰 Maintaining budget-friendly prices for SASSA families\n');
console.log('======================================================================');

const additionalProducts = [
  // PICK N PAY - Additional Grocery & Essential Items (Target: 10 total)
  {
    name: 'White Star Super Maize Meal 2.5kg',
    price: 24.99,
    category: 'Groceries',
    subcategory: 'Grains & Cereals',
    description: 'Nutritious white maize meal for porridge and cooking',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Pick n Pay',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Lucky Star Pilchards in Tomato Sauce 400g',
    price: 18.99,
    category: 'Groceries',
    subcategory: 'Canned Foods',
    description: 'Protein-rich canned fish for nutritious meals',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Pick n Pay',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Fresh Milk 1L',
    price: 22.99,
    category: 'Groceries',
    subcategory: 'Dairy & Eggs',
    description: 'Fresh full cream milk for the whole family',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Pick n Pay',
    shopCategory: 'Supermarket'
  },

  // SHOPRITE - Additional Budget Items (Target: 10 total)
  {
    name: 'Ritebrand Brown Bread 700g',
    price: 12.99,
    category: 'Groceries',
    subcategory: 'Bakery',
    description: 'Nutritious brown bread for daily meals',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Shoprite',
    shopCategory: 'Supermarket'
  },
  {
    name: 'No Name Rice 2kg',
    price: 35.99,
    category: 'Groceries',
    subcategory: 'Grains & Cereals',
    description: 'Quality white rice for family meals',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Shoprite',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Sunlight Liquid Dishwashing 750ml',
    price: 28.99,
    category: 'Basic Needs',
    subcategory: 'Household Cleaning',
    description: 'Effective dishwashing liquid for clean dishes',
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Shoprite',
    shopCategory: 'Supermarket'
  },
  {
    name: 'All Gold Tomato Sauce 500ml',
    price: 19.99,
    category: 'Groceries',
    subcategory: 'Condiments',
    description: 'Popular tomato sauce for family meals',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Shoprite',
    shopCategory: 'Supermarket'
  },

  // CNA - Additional School & Office Supplies (Target: 10 total)
  {
    name: 'Croxley A4 Ruled Paper 500 Sheets',
    price: 45.99,
    category: 'Education',
    subcategory: 'Notebooks & Paper',
    description: 'Quality A4 ruled paper for school projects',
    minAge: 6,
    maxAge: 18,
    ageCategory: 'Child',
    shop: 'CNA',
    shopCategory: 'Stationery Store'
  },
  {
    name: 'Staedtler Math Set with Compass',
    price: 89.99,
    category: 'Education',
    subcategory: 'School Supplies',
    description: 'Complete math set for geometry and calculations',
    minAge: 10,
    maxAge: 18,
    ageCategory: 'Teen',
    shop: 'CNA',
    shopCategory: 'Stationery Store'
  },
  {
    name: 'Elephant Eraser Pack of 5',
    price: 15.99,
    category: 'Education',
    subcategory: 'School Supplies',
    description: 'Quality erasers for mistake correction',
    minAge: 5,
    maxAge: 18,
    ageCategory: 'Child',
    shop: 'CNA',
    shopCategory: 'Stationery Store'
  },
  {
    name: 'Khoki Permanent Markers Set of 4',
    price: 32.99,
    category: 'Education',
    subcategory: 'School Supplies',
    description: 'Permanent markers for projects and presentations',
    minAge: 8,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'CNA',
    shopCategory: 'Stationery Store'
  },

  // CLICKS - Additional Healthcare Items (Target: 10 total)
  {
    name: 'Disprin Headache & Pain Relief 20 Tablets',
    price: 24.99,
    category: 'Healthcare',
    subcategory: 'Pain Relief',
    description: 'Effective pain relief for headaches and minor pain',
    minAge: 12,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Clicks',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'Clicks Vitamin C 500mg 30 Tablets',
    price: 39.99,
    category: 'Healthcare',
    subcategory: 'Vitamins',
    description: 'Vitamin C supplement for immune support',
    minAge: 4,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Clicks',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'Purity Baby Wipes 80 Pack',
    price: 28.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Gentle baby wipes for cleaning and care',
    minAge: 0,
    maxAge: 3,
    ageCategory: 'Toddler',
    shop: 'Clicks',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'Colgate Total Toothpaste 100ml',
    price: 35.99,
    category: 'Healthcare',
    subcategory: 'Oral Care',
    description: 'Complete oral care protection toothpaste',
    minAge: 6,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'Clicks',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'Gentle Magic Skin Lightening Cream 50ml',
    price: 45.99,
    category: 'Healthcare',
    subcategory: 'Skin Care',
    description: 'Gentle skin care cream for even skin tone',
    minAge: 16,
    maxAge: 100,
    ageCategory: 'Adult',
    shop: 'Clicks',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'Clicks Thermometer Digital',
    price: 65.99,
    category: 'Healthcare',
    subcategory: 'First Aid',
    description: 'Digital thermometer for accurate temperature reading',
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Clicks',
    shopCategory: 'Pharmacy'
  },

  // DIS-CHEM - Additional Pharmacy Items (Target: 10 total)
  {
    name: 'Grandpa Headache Powder 24 Sachets',
    price: 32.99,
    category: 'Healthcare',
    subcategory: 'Pain Relief',
    description: 'Fast-acting headache relief powder',
    minAge: 12,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'Bepanthen Nappy Care Ointment 30g',
    price: 48.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Protective ointment for diaper rash prevention',
    minAge: 0,
    maxAge: 3,
    ageCategory: 'Toddler',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'Lennon Cough Syrup 100ml',
    price: 38.99,
    category: 'Healthcare',
    subcategory: 'Cold & Flu',
    description: 'Natural cough syrup for chest congestion relief',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'Multivitamin Syrup for Children 200ml',
    price: 42.99,
    category: 'Healthcare',
    subcategory: 'Vitamins',
    description: 'Essential vitamins for growing children',
    minAge: 1,
    maxAge: 12,
    ageCategory: 'Child',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'Savlon Antiseptic Cream 60g',
    price: 26.99,
    category: 'Healthcare',
    subcategory: 'First Aid',
    description: 'Antiseptic cream for cuts and minor wounds',
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy'
  },
  {
    name: 'E45 Moisturising Lotion 200ml',
    price: 55.99,
    category: 'Healthcare',
    subcategory: 'Skin Care',
    description: 'Gentle moisturising lotion for dry skin',
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy'
  },

  // CHECKERS - Additional Premium Grocery Items (Target: 10 total)
  {
    name: 'Checkers Sixty60 Delivery Fee Voucher',
    price: 25.00,
    category: 'Basic Needs',
    subcategory: 'Services',
    description: 'Delivery fee voucher for Checkers Sixty60 service',
    minAge: 18,
    maxAge: 100,
    ageCategory: 'Adult',
    shop: 'Checkers',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Checkers Housebrand Pasta 500g',
    price: 16.99,
    category: 'Groceries',
    subcategory: 'Grains & Cereals',
    description: 'Quality pasta for family meals',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Checkers',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Premium Beef Mince 500g',
    price: 89.99,
    category: 'Groceries',
    subcategory: 'Meat & Fish',
    description: 'Fresh lean beef mince for protein-rich meals',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Checkers',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Simba Chips Assorted 120g',
    price: 18.99,
    category: 'Groceries',
    subcategory: 'Snacks',
    description: 'Popular chips snacks for treats',
    minAge: 3,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Checkers',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Freshpak Rooibos Tea Bags 40s',
    price: 29.99,
    category: 'Groceries',
    subcategory: 'Beverages',
    description: 'South African rooibos tea for the family',
    minAge: 12,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Checkers',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Woolworths Ready Meals Voucher R50',
    price: 50.00,
    category: 'Groceries',
    subcategory: 'Prepared Foods',
    description: 'Voucher for convenient ready-to-eat meals',
    minAge: 18,
    maxAge: 100,
    ageCategory: 'Adult',
    shop: 'Checkers',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Jungle Oats Quick Oats 1kg',
    price: 42.99,
    category: 'Groceries',
    subcategory: 'Breakfast Cereals',
    description: 'Nutritious oats for healthy breakfast',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Checkers',
    shopCategory: 'Supermarket'
  },

  // BABY CITY - Additional Baby Products (Target: 10 total)
  {
    name: 'Huggies Little Swimmers Size 4 (11 Pack)',
    price: 89.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Swimming diapers for pool and beach fun',
    minAge: 0,
    maxAge: 3,
    ageCategory: 'Toddler',
    shop: 'Baby City',
    shopCategory: 'Baby Store'
  },
  {
    name: 'Tommee Tippee Baby Bottle 260ml',
    price: 125.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Anti-colic baby bottle for comfortable feeding',
    minAge: 0,
    maxAge: 2,
    ageCategory: 'Toddler',
    shop: 'Baby City',
    shopCategory: 'Baby Store'
  },
  {
    name: 'Chicco Baby Bath 500ml',
    price: 78.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Gentle baby bath wash for sensitive skin',
    minAge: 0,
    maxAge: 3,
    ageCategory: 'Toddler',
    shop: 'Baby City',
    shopCategory: 'Baby Store'
  },
  {
    name: 'Baby Soft Wet Wipes Sensitive 160 Pack',
    price: 45.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Extra gentle wet wipes for sensitive baby skin',
    minAge: 0,
    maxAge: 3,
    ageCategory: 'Toddler',
    shop: 'Baby City',
    shopCategory: 'Baby Store'
  },
  {
    name: 'Purity Baby Cereal Mixed Fruit 200g',
    price: 38.99,
    category: 'Groceries',
    subcategory: 'Baby Food',
    description: 'Nutritious baby cereal with mixed fruit flavors',
    minAge: 6,
    maxAge: 24,
    ageCategory: 'Toddler',
    shop: 'Baby City',
    shopCategory: 'Baby Store'
  },
  {
    name: 'MAM Pacifier 0-6 Months',
    price: 65.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Orthodontic pacifier for newborns and infants',
    minAge: 0,
    maxAge: 1,
    ageCategory: 'Toddler',
    shop: 'Baby City',
    shopCategory: 'Baby Store'
  },
  {
    name: 'Fisher-Price Baby Rattle Toy',
    price: 89.99,
    category: 'Entertainment',
    subcategory: 'Educational Toys',
    description: 'Colorful rattle toy for sensory development',
    minAge: 0,
    maxAge: 2,
    ageCategory: 'Toddler',
    shop: 'Baby City',
    shopCategory: 'Baby Store'
  },

  // WOOLWORTHS - Additional Premium Items (Target: 10 total)
  {
    name: 'Woolworths Organic Baby Food Pouches 6-Pack',
    price: 89.99,
    category: 'Groceries',
    subcategory: 'Baby Food',
    description: 'Organic baby food pouches for healthy nutrition',
    minAge: 6,
    maxAge: 24,
    ageCategory: 'Toddler',
    shop: 'Woolworths',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Good Hope Vanilla Yogurt 1L',
    price: 28.99,
    category: 'Groceries',
    subcategory: 'Dairy & Eggs',
    description: 'Creamy vanilla yogurt for the whole family',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Woolworths',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Woolworths School Lunch Wraps 6-Pack',
    price: 45.99,
    category: 'Groceries',
    subcategory: 'Prepared Foods',
    description: 'Convenient healthy lunch wraps for school',
    minAge: 5,
    maxAge: 18,
    ageCategory: 'Child',
    shop: 'Woolworths',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Free Range Eggs 18-Pack',
    price: 65.99,
    category: 'Groceries',
    subcategory: 'Dairy & Eggs',
    description: 'Premium free-range eggs for protein',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Woolworths',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Woolworths Fruit Juice Blend 1L',
    price: 32.99,
    category: 'Groceries',
    subcategory: 'Beverages',
    description: 'Natural fruit juice blend without additives',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Woolworths',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Premium Chicken Breast Fillet 500g',
    price: 78.99,
    category: 'Groceries',
    subcategory: 'Meat & Fish',
    description: 'Fresh chicken breast for healthy protein',
    minAge: 6,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Woolworths',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Woolworths Smoothie Mix Frozen 500g',
    price: 49.99,
    category: 'Groceries',
    subcategory: 'Frozen Foods',
    description: 'Frozen fruit mix for healthy smoothies',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Woolworths',
    shopCategory: 'Supermarket'
  },
  {
    name: 'Artisanal Bread Loaf 500g',
    price: 22.99,
    category: 'Groceries',
    subcategory: 'Bakery',
    description: 'Fresh artisanal bread for quality meals',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Woolworths',
    shopCategory: 'Supermarket'
  },

  // TAKEALOT - Additional Tech & Entertainment Items (Target: 10 total)
  {
    name: 'Takealot eVoucher R100',
    price: 100.00,
    category: 'Basic Needs',
    subcategory: 'Shopping Vouchers',
    description: 'Electronic voucher for Takealot online shopping',
    minAge: 18,
    maxAge: 100,
    ageCategory: 'Adult',
    shop: 'Takealot',
    shopCategory: 'Online Store'
  },
  {
    name: 'Basic Calculator Scientific',
    price: 45.99,
    category: 'Education',
    subcategory: 'School Supplies',
    description: 'Scientific calculator for math and science',
    minAge: 10,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Takealot',
    shopCategory: 'Online Store'
  },
  {
    name: 'USB Flash Drive 16GB',
    price: 89.99,
    category: 'Education',
    subcategory: 'Technology',
    description: 'Portable storage for school projects and files',
    minAge: 8,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'Takealot',
    shopCategory: 'Online Store'
  },
  {
    name: 'Educational Board Game - Word Games',
    price: 129.99,
    category: 'Entertainment',
    subcategory: 'Educational Games',
    description: 'Fun word games for family learning time',
    minAge: 8,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'Takealot',
    shopCategory: 'Online Store'
  },
  {
    name: 'Bluetooth Earphones Basic',
    price: 199.99,
    category: 'Entertainment',
    subcategory: 'Technology',
    description: 'Wireless earphones for music and calls',
    minAge: 12,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Takealot',
    shopCategory: 'Online Store'
  },
  {
    name: 'Power Bank 5000mAh',
    price: 149.99,
    category: 'Basic Needs',
    subcategory: 'Technology',
    description: 'Portable charger for phones and devices',
    minAge: 12,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Takealot',
    shopCategory: 'Online Store'
  },
  {
    name: 'Basic Headphones Wired',
    price: 79.99,
    category: 'Entertainment',
    subcategory: 'Technology',
    description: 'Comfortable wired headphones for study and music',
    minAge: 6,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'Takealot',
    shopCategory: 'Online Store'
  },
  {
    name: 'Puzzle Game 1000 Pieces',
    price: 89.99,
    category: 'Entertainment',
    subcategory: 'Educational Games',
    description: 'Challenging puzzle for family entertainment',
    minAge: 10,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Takealot',
    shopCategory: 'Online Store'
  },

  // Additional shops - Add some products to reach 10 each for major retailers

  // GAME STORES - Additional Gaming Items
  {
    name: 'Steam Wallet Card R100',
    price: 100.00,
    category: 'Entertainment',
    subcategory: 'Gaming',
    description: 'Steam wallet funds for PC games',
    minAge: 13,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Game Stores',
    shopCategory: 'Electronics Store'
  },
  {
    name: 'Xbox Live Gold 3 Month Subscription',
    price: 189.99,
    category: 'Entertainment',
    subcategory: 'Gaming',
    description: 'Xbox Live subscription for online gaming',
    minAge: 13,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Game Stores',
    shopCategory: 'Electronics Store'
  },
  {
    name: 'Gaming Mouse Pad Large',
    price: 125.00,
    category: 'Entertainment',
    subcategory: 'Gaming',
    description: 'Large gaming mouse pad for better control',
    minAge: 10,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Game Stores',
    shopCategory: 'Electronics Store'
  },

  // TOY KINGDOM - Additional Toys
  {
    name: 'LEGO Basic Building Set 200 Pieces',
    price: 199.99,
    category: 'Entertainment',
    subcategory: 'Educational Toys',
    description: 'Creative building blocks for imagination',
    minAge: 4,
    maxAge: 12,
    ageCategory: 'Child',
    shop: 'Toy Kingdom',
    shopCategory: 'Toy Store'
  },
  {
    name: 'Doll House Furniture Set',
    price: 149.99,
    category: 'Entertainment',
    subcategory: 'Educational Toys',
    description: 'Miniature furniture for doll house play',
    minAge: 3,
    maxAge: 10,
    ageCategory: 'Child',
    shop: 'Toy Kingdom',
    shopCategory: 'Toy Store'
  },
  {
    name: 'Remote Control Car Basic',
    price: 179.99,
    category: 'Entertainment',
    subcategory: 'Outdoor Toys',
    description: 'Remote control car for outdoor fun',
    minAge: 6,
    maxAge: 14,
    ageCategory: 'Child',
    shop: 'Toy Kingdom',
    shopCategory: 'Toy Store'
  },

  // SPORTSMANS WAREHOUSE - Additional Sports Items
  {
    name: 'Soccer Ball Official Size 5',
    price: 89.99,
    category: 'Entertainment',
    subcategory: 'Sports Equipment',
    description: 'Official size soccer ball for matches',
    minAge: 8,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'Sportsmans Warehouse',
    shopCategory: 'Sports Store'
  },
  {
    name: 'Basketball Official Size 7',
    price: 129.99,
    category: 'Entertainment',
    subcategory: 'Sports Equipment',
    description: 'Official basketball for court games',
    minAge: 12,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Sportsmans Warehouse',
    shopCategory: 'Sports Store'
  },
  {
    name: 'Skipping Rope with Counter',
    price: 35.99,
    category: 'Entertainment',
    subcategory: 'Sports Equipment',
    description: 'Skipping rope with digital counter for fitness',
    minAge: 6,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'Sportsmans Warehouse',
    shopCategory: 'Sports Store'
  }
];

async function expandProductCatalog() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');

    // Get Product model
    const Product = sequelize.define('Product', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('Healthcare', 'Groceries', 'Education', 'Entertainment', 'Basic Needs'),
        allowNull: false
      },
      subcategory: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      minAge: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      maxAge: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      ageCategory: {
        type: Sequelize.ENUM('Toddler', 'Child', 'Teen', 'Adult', 'Senior', 'All Ages'),
        defaultValue: 'All Ages'
      },
      shop: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shopCategory: {
        type: Sequelize.STRING,
        allowNull: true
      }
    }, {
      tableName: 'products',
      timestamps: false
    });

    console.log('🛍️ Adding additional products to expand catalog...\n');

    let addedCount = 0;
    const shopCounts = {};

    for (const product of additionalProducts) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({
          where: { name: product.name }
        });

        if (existingProduct) {
          console.log(`⚠️  Product "${product.name}" already exists - skipping`);
          continue;
        }

        // Add the product
        await Product.create(product);
        
        // Track shop counts
        if (!shopCounts[product.shop]) {
          shopCounts[product.shop] = 0;
        }
        shopCounts[product.shop]++;
        
        console.log(`✅ Added "${product.name}" - R${product.price} (${product.shop})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Error adding product "${product.name}":`, error.message);
      }
    }

    // Get updated shop statistics
    console.log('\n🏪 UPDATED SHOP DISTRIBUTION:');
    console.log('==================================================');

    const allProducts = await Product.findAll({
      attributes: ['shop', 'shopCategory', 'price'],
      order: [['shop', 'ASC']]
    });

    const shopStats = {};
    allProducts.forEach(product => {
      if (!shopStats[product.shop]) {
        shopStats[product.shop] = {
          count: 0,
          category: product.shopCategory,
          prices: []
        };
      }
      shopStats[product.shop].count++;
      shopStats[product.shop].prices.push(parseFloat(product.price));
    });

    let shopIndex = 1;
    for (const [shopName, stats] of Object.entries(shopStats)) {
      const avgPrice = stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length;
      const minPrice = Math.min(...stats.prices);
      const maxPrice = Math.max(...stats.prices);
      
      console.log(`${shopIndex}. 🏪 **${shopName}** (${stats.category})`);
      console.log(`   📦 ${stats.count} products | 💰 R${minPrice.toFixed(2)}-R${maxPrice.toFixed(2)} (Avg: R${avgPrice.toFixed(2)})`);
      shopIndex++;
    }

    // Category distribution
    console.log('\n📂 UPDATED CATEGORY DISTRIBUTION:');
    console.log('========================================');

    const categoryStats = await Product.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('*')), 'count'],
        [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice'],
        [sequelize.fn('MIN', sequelize.col('price')), 'minPrice'],
        [sequelize.fn('MAX', sequelize.col('price')), 'maxPrice']
      ],
      group: ['category'],
      order: [['category', 'ASC']]
    });

    categoryStats.forEach(cat => {
      console.log(`📋 ${cat.category}: ${cat.dataValues.count} products (Avg: R${parseFloat(cat.dataValues.avgPrice).toFixed(2)})`);
    });

    // Overall statistics
    const totalProducts = await Product.count();
    const totalShops = Object.keys(shopStats).length;
    
    console.log('\n🎉 EXPANSION COMPLETE!');
    console.log('======================================================');
    console.log(`✅ Added ${addedCount} new products`);
    console.log(`🛍️ Total products: ${totalProducts}`);
    console.log(`🏪 Total shops: ${totalShops}`);
    console.log('✅ Enhanced product selection for SASSA families!');
    console.log('✅ Better variety across all major South African retailers!');

  } catch (error) {
    console.error('❌ Error expanding product catalog:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the expansion
expandProductCatalog();