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
    brand: 'White Star',
    price: 24.99,
    category: 'Groceries',
    subcategory: 'Grains & Cereals',
    description: 'Nutritious white maize meal for porridge and cooking',
    sku: 'WS-MAIZE-2.5KG',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Pick n Pay',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 50
  },
  {
    name: 'Lucky Star Pilchards in Tomato Sauce 400g',
    brand: 'Lucky Star',
    price: 18.99,
    category: 'Groceries',
    subcategory: 'Canned Foods',
    description: 'Protein-rich canned fish for nutritious meals',
    sku: 'LS-PILCH-400G',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Pick n Pay',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 75
  },
  {
    name: 'Fresh Milk 1L',
    brand: 'Clover',
    price: 22.99,
    category: 'Groceries',
    subcategory: 'Dairy & Eggs',
    description: 'Fresh full cream milk for the whole family',
    sku: 'CLV-MILK-1L',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Pick n Pay',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 30
  },

  // SHOPRITE - Additional Budget Items (Target: 10 total)
  {
    name: 'Ritebrand Brown Bread 700g',
    brand: 'Ritebrand',
    price: 12.99,
    category: 'Groceries',
    subcategory: 'Bakery',
    description: 'Nutritious brown bread for daily meals',
    sku: 'RB-BREAD-700G',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Shoprite',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 40
  },
  {
    name: 'No Name Rice 2kg',
    brand: 'No Name',
    price: 35.99,
    category: 'Groceries',
    subcategory: 'Grains & Cereals',
    description: 'Quality white rice for family meals',
    sku: 'NN-RICE-2KG',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Shoprite',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 60
  },
  {
    name: 'Sunlight Liquid Dishwashing 750ml',
    brand: 'Sunlight',
    price: 28.99,
    category: 'Other',
    subcategory: 'Household Cleaning',
    description: 'Effective dishwashing liquid for clean dishes',
    sku: 'SL-DISH-750ML',
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Shoprite',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 45
  },
  {
    name: 'All Gold Tomato Sauce 500ml',
    brand: 'All Gold',
    price: 19.99,
    category: 'Groceries',
    subcategory: 'Condiments',
    description: 'Popular tomato sauce for family meals',
    sku: 'AG-TOMATO-500ML',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Shoprite',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 55
  },

  // CNA - Additional School & Office Supplies (Target: 10 total)
  {
    name: 'Croxley A4 Ruled Paper 500 Sheets',
    brand: 'Croxley',
    price: 45.99,
    category: 'Education',
    subcategory: 'Notebooks & Paper',
    description: 'Quality A4 ruled paper for school projects',
    sku: 'CX-PAPER-A4-500',
    minAge: 6,
    maxAge: 18,
    ageCategory: 'Child',
    shop: 'CNA',
    shopCategory: 'Stationery Store',
    inStock: true,
    stockQuantity: 25
  },
  {
    name: 'Staedtler Math Set with Compass',
    brand: 'Staedtler',
    price: 89.99,
    category: 'Education',
    subcategory: 'School Supplies',
    description: 'Complete math set for geometry and calculations',
    sku: 'ST-MATH-SET',
    minAge: 10,
    maxAge: 18,
    ageCategory: 'Teen',
    shop: 'CNA',
    shopCategory: 'Stationery Store',
    inStock: true,
    stockQuantity: 15
  },
  {
    name: 'Elephant Eraser Pack of 5',
    brand: 'Elephant',
    price: 15.99,
    category: 'Education',
    subcategory: 'School Supplies',
    description: 'Quality erasers for mistake correction',
    sku: 'EL-ERASER-5PACK',
    minAge: 5,
    maxAge: 18,
    ageCategory: 'Child',
    shop: 'CNA',
    shopCategory: 'Stationery Store',
    inStock: true,
    stockQuantity: 40
  },
  {
    name: 'Khoki Permanent Markers Set of 4',
    brand: 'Khoki',
    price: 32.99,
    category: 'Education',
    subcategory: 'School Supplies',
    description: 'Permanent markers for projects and presentations',
    sku: 'KH-MARKER-4SET',
    minAge: 8,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'CNA',
    shopCategory: 'Stationery Store',
    inStock: true,
    stockQuantity: 30
  },

  // CLICKS - Additional Healthcare Items (Target: 10 total)
  {
    name: 'Disprin Headache & Pain Relief 20 Tablets',
    brand: 'Disprin',
    price: 24.99,
    category: 'Healthcare',
    subcategory: 'Pain Relief',
    description: 'Effective pain relief for headaches and minor pain',
    sku: 'DS-PAIN-20TAB',
    minAge: 12,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Clicks',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 35
  },
  {
    name: 'Clicks Vitamin C 500mg 30 Tablets',
    brand: 'Clicks',
    price: 39.99,
    category: 'Healthcare',
    subcategory: 'Vitamins',
    description: 'Vitamin C supplement for immune support',
    sku: 'CL-VITC-30TAB',
    minAge: 4,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Clicks',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 50
  },
  {
    name: 'Purity Baby Wipes 80 Pack',
    brand: 'Purity',
    price: 28.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Gentle baby wipes for cleaning and care',
    sku: 'PU-WIPES-80PACK',
    minAge: 0,
    maxAge: 3,
    ageCategory: 'Toddler',
    shop: 'Clicks',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 60
  },
  {
    name: 'Colgate Total Toothpaste 100ml',
    brand: 'Colgate',
    price: 35.99,
    category: 'Healthcare',
    subcategory: 'Oral Care',
    description: 'Complete oral care protection toothpaste',
    sku: 'CG-TOTAL-100ML',
    minAge: 6,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'Clicks',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 45
  },
  {
    name: 'Gentle Magic Skin Lightening Cream 50ml',
    brand: 'Gentle Magic',
    price: 45.99,
    category: 'Healthcare',
    subcategory: 'Skin Care',
    description: 'Gentle skin care cream for even skin tone',
    sku: 'GM-CREAM-50ML',
    minAge: 16,
    maxAge: 100,
    ageCategory: 'Adult',
    shop: 'Clicks',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 25
  },
  {
    name: 'Clicks Thermometer Digital',
    brand: 'Clicks',
    price: 65.99,
    category: 'Healthcare',
    subcategory: 'First Aid',
    description: 'Digital thermometer for accurate temperature reading',
    sku: 'CL-THERMO-DIG',
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Clicks',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 20
  },

  // DIS-CHEM - Additional Pharmacy Items (Target: 10 total)
  {
    name: 'Grandpa Headache Powder 24 Sachets',
    brand: 'Grandpa',
    price: 32.99,
    category: 'Healthcare',
    subcategory: 'Pain Relief',
    description: 'Fast-acting headache relief powder',
    sku: 'GP-POWDER-24SAC',
    minAge: 12,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 40
  },
  {
    name: 'Bepanthen Nappy Care Ointment 30g',
    brand: 'Bepanthen',
    price: 48.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Protective ointment for diaper rash prevention',
    sku: 'BP-NAPPY-30G',
    minAge: 0,
    maxAge: 3,
    ageCategory: 'Toddler',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 30
  },
  {
    name: 'Lennon Cough Syrup 100ml',
    brand: 'Lennon',
    price: 38.99,
    category: 'Healthcare',
    subcategory: 'Cold & Flu',
    description: 'Natural cough syrup for chest congestion relief',
    sku: 'LE-COUGH-100ML',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 35
  },
  {
    name: 'Multivitamin Syrup for Children 200ml',
    brand: 'Dis-Chem',
    price: 42.99,
    category: 'Healthcare',
    subcategory: 'Vitamins',
    description: 'Essential vitamins for growing children',
    sku: 'DC-MULTI-200ML',
    minAge: 1,
    maxAge: 12,
    ageCategory: 'Child',
    shop: 'Dis-Chem',
    shopCategory: 'Pharmacy',
    inStock: true,
    stockQuantity: 25
  },

  // CHECKERS - Additional Premium Grocery Items (Target: 10 total)
  {
    name: 'Checkers Sixty60 Delivery Voucher R25',
    brand: 'Checkers',
    price: 25.00,
    category: 'Other',
    subcategory: 'Services',
    description: 'Delivery fee voucher for Checkers Sixty60 service',
    sku: 'CH-DELIVERY-25',
    minAge: 18,
    maxAge: 100,
    ageCategory: 'Adult',
    shop: 'Checkers',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 100
  },
  {
    name: 'Checkers Housebrand Pasta 500g',
    brand: 'Checkers',
    price: 16.99,
    category: 'Groceries',
    subcategory: 'Grains & Cereals',
    description: 'Quality pasta for family meals',
    sku: 'CH-PASTA-500G',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Checkers',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 40
  },
  {
    name: 'Premium Beef Mince 500g',
    brand: 'Checkers',
    price: 89.99,
    category: 'Groceries',
    subcategory: 'Meat & Fish',
    description: 'Fresh lean beef mince for protein-rich meals',
    sku: 'CH-BEEF-500G',
    minAge: 2,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Checkers',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 15
  },

  // BABY CITY - Additional Baby Products (Target: 10 total)
  {
    name: 'Huggies Little Swimmers Size 4 (11 Pack)',
    brand: 'Huggies',
    price: 89.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Swimming diapers for pool and beach fun',
    sku: 'HG-SWIM-S4-11',
    minAge: 0,
    maxAge: 3,
    ageCategory: 'Toddler',
    shop: 'Baby City',
    shopCategory: 'Baby Store',
    inStock: true,
    stockQuantity: 20
  },
  {
    name: 'Tommee Tippee Baby Bottle 260ml',
    brand: 'Tommee Tippee',
    price: 125.99,
    category: 'Healthcare',
    subcategory: 'Baby Care',
    description: 'Anti-colic baby bottle for comfortable feeding',
    sku: 'TT-BOTTLE-260ML',
    minAge: 0,
    maxAge: 2,
    ageCategory: 'Toddler',
    shop: 'Baby City',
    shopCategory: 'Baby Store',
    inStock: true,
    stockQuantity: 15
  },

  // WOOLWORTHS - Additional Premium Items (Target: 10 total)
  {
    name: 'Woolworths Organic Baby Food Pouches 6-Pack',
    brand: 'Woolworths',
    price: 89.99,
    category: 'Groceries',
    subcategory: 'Baby Food',
    description: 'Organic baby food pouches for healthy nutrition',
    sku: 'WW-BABY-6PACK',
    minAge: 6,
    maxAge: 24,
    ageCategory: 'Toddler',
    shop: 'Woolworths',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 25
  },
  {
    name: 'Good Hope Vanilla Yogurt 1L',
    brand: 'Good Hope',
    price: 28.99,
    category: 'Groceries',
    subcategory: 'Dairy & Eggs',
    description: 'Creamy vanilla yogurt for the whole family',
    sku: 'GH-YOGURT-1L',
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages',
    shop: 'Woolworths',
    shopCategory: 'Supermarket',
    inStock: true,
    stockQuantity: 30
  },

  // TAKEALOT - Additional Tech & Entertainment Items (Target: 10 total)
  {
    name: 'Takealot eVoucher R100',
    brand: 'Takealot',
    price: 100.00,
    category: 'Other',
    subcategory: 'Shopping Vouchers',
    description: 'Electronic voucher for Takealot online shopping',
    sku: 'TK-VOUCHER-100',
    minAge: 18,
    maxAge: 100,
    ageCategory: 'Adult',
    shop: 'Takealot',
    shopCategory: 'Online Store',
    inStock: true,
    stockQuantity: 50
  },
  {
    name: 'Basic Calculator Scientific',
    brand: 'Casio',
    price: 45.99,
    category: 'Education',
    subcategory: 'School Supplies',
    description: 'Scientific calculator for math and science',
    sku: 'CS-CALC-SCI',
    minAge: 10,
    maxAge: 100,
    ageCategory: 'Teen',
    shop: 'Takealot',
    shopCategory: 'Online Store',
    inStock: true,
    stockQuantity: 20
  },

  // Additional products for other shops to reach target counts
  {
    name: 'Soccer Ball Official Size 5',
    brand: 'Adidas',
    price: 89.99,
    category: 'Entertainment',
    subcategory: 'Sports Equipment',
    description: 'Official size soccer ball for matches',
    sku: 'AD-SOCCER-S5',
    minAge: 8,
    maxAge: 100,
    ageCategory: 'Child',
    shop: 'Sportsmans Warehouse',
    shopCategory: 'Sports Store',
    inStock: true,
    stockQuantity: 25
  },
  {
    name: 'LEGO Basic Building Set 200 Pieces',
    brand: 'LEGO',
    price: 199.99,
    category: 'Entertainment',
    subcategory: 'Educational Toys',
    description: 'Creative building blocks for imagination',
    sku: 'LG-BUILD-200',
    minAge: 4,
    maxAge: 12,
    ageCategory: 'Child',
    shop: 'Toy Kingdom',
    shopCategory: 'Toy Store',
    inStock: true,
    stockQuantity: 15
  }
];

async function expandProductCatalog() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');

    // Get Product model with complete definition
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
      brand: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'),
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
      sku: {
        type: Sequelize.STRING,
        allowNull: false
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
      },
      inStock: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      stockQuantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    }, {
      tableName: 'products',
      timestamps: true
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
      where: {
        shop: { [Sequelize.Op.ne]: null }
      },
      order: [['shop', 'ASC']]
    });

    const shopStats = {};
    allProducts.forEach(product => {
      if (product.shop && !shopStats[product.shop]) {
        shopStats[product.shop] = {
          count: 0,
          category: product.shopCategory,
          prices: []
        };
      }
      if (product.shop) {
        shopStats[product.shop].count++;
        shopStats[product.shop].prices.push(parseFloat(product.price));
      }
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

    // Total count
    const totalProducts = await Product.count();
    const totalShops = Object.keys(shopStats).length;
    
    console.log('\n🎉 EXPANSION COMPLETE!');
    console.log('======================================================');
    console.log(`✅ Added ${addedCount} new products`);
    console.log(`🛍️ Total products: ${totalProducts}`);
    console.log(`🏪 Total shops with products: ${totalShops}`);
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