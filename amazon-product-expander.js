const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// South African store mapping for different product categories
const SA_STORE_MAPPING = {
  Healthcare: {
    stores: ['Clicks', 'Dis-Chem', 'Pharmacare', 'Link Pharmacy'],
    brands: ['Clicks', 'Dis-Chem', 'Panado', 'Compral', 'Betadine', 'Bepanthen', 'Allergex']
  },
  Groceries: {
    stores: ['Pick n Pay', 'Checkers', 'Woolworths', 'Spar', 'Shoprite'],
    brands: ['All Gold', 'Lucky Star', 'White Star', 'Ritebrand', 'Woolworths', 'Black Cat', 'Koo']
  },
  Education: {
    stores: ['CNA', 'Takealot', 'Incredible Connection', 'Pick n Pay'],
    brands: ['Khoki', 'Croxley', 'Olympic', 'Staedtler', 'BIC', 'Pilot']
  },
  Transport: {
    stores: ['Uber', 'Bolt', 'MyCiTi', 'Gautrain', 'Metrobus'],
    brands: ['Uber', 'Bolt', 'MyCiTi', 'Gautrain']
  },
  Entertainment: {
    stores: ['Takealot', 'Incredible Connection', 'Game', 'Musica'],
    brands: ['Samsung', 'LG', 'Sony', 'Apple', 'Huawei']
  },
  Other: {
    stores: ['Takealot', 'Pick n Pay', 'Checkers', 'Game'],
    brands: ['Generic', 'House Brand', 'No Name']
  }
};

// Amazon search categories with high-quality products
const AMAZON_CATEGORIES = {
  Healthcare: [
    'vitamin supplements',
    'baby care products',
    'first aid supplies',
    'oral care',
    'skin care',
    'pain relief',
    'cold flu medicine',
    'digestive health',
    'feminine care',
    'medical supplies'
  ],
  Groceries: [
    'canned goods',
    'breakfast cereals',
    'snacks cookies',
    'cooking oils',
    'spices seasonings',
    'pasta rice',
    'baby food',
    'beverages drinks',
    'frozen foods',
    'baking supplies'
  ],
  Education: [
    'school supplies',
    'notebooks pens',
    'calculators',
    'backpacks bags',
    'art supplies',
    'educational toys',
    'books textbooks',
    'craft supplies',
    'office supplies',
    'learning materials'
  ],
  Entertainment: [
    'toys games',
    'electronics gadgets',
    'books magazines',
    'music instruments',
    'sports equipment',
    'outdoor games',
    'puzzles',
    'board games',
    'video games',
    'hobby supplies'
  ],
  Transport: [
    'car accessories',
    'travel gear',
    'bike accessories',
    'automotive supplies',
    'travel bags',
    'navigation devices',
    'safety equipment',
    'maintenance tools'
  ],
  Other: [
    'household items',
    'cleaning supplies',
    'personal care',
    'home organization',
    'kitchen gadgets',
    'storage solutions',
    'tools hardware',
    'garden supplies'
  ]
};

class AmazonProductExpander {
  constructor() {
    this.expandedProducts = [];
    this.successCount = 0;
    this.categoryStats = {};
    this.storeStats = {};
  }

  // Enhanced headers to avoid detection
  getRandomHeaders() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
    
    return {
      'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Cache-Control': 'max-age=0'
    };
  }

  // Generate SKU based on category and index
  generateSKU(category, index) {
    const categoryCode = {
      'Healthcare': 'HC',
      'Groceries': 'GR',
      'Education': 'ED',
      'Transport': 'TR',
      'Entertainment': 'EN',
      'Other': 'OT'
    };
    
    return `${categoryCode[category] || 'OT'}${String(index).padStart(4, '0')}`;
  }

  // Assign realistic SA store and brand
  assignSAStoreAndBrand(category, productName) {
    const mapping = SA_STORE_MAPPING[category] || SA_STORE_MAPPING.Other;
    
    // Pick random store
    const store = mapping.stores[Math.floor(Math.random() * mapping.stores.length)];
    
    // Pick brand based on store or product type
    let brand;
    if (store === 'Clicks' && category === 'Healthcare') {
      brand = Math.random() > 0.5 ? 'Clicks' : mapping.brands[Math.floor(Math.random() * mapping.brands.length)];
    } else if (store === 'Pick n Pay' && category === 'Groceries') {
      brand = Math.random() > 0.3 ? 'Ritebrand' : mapping.brands[Math.floor(Math.random() * mapping.brands.length)];
    } else if (store === 'Woolworths') {
      brand = Math.random() > 0.4 ? 'Woolworths' : mapping.brands[Math.floor(Math.random() * mapping.brands.length)];
    } else {
      brand = mapping.brands[Math.floor(Math.random() * mapping.brands.length)];
    }
    
    return { store, brand };
  }

  // Generate realistic South African pricing
  generateSAPrice(category, productName) {
    const basePrices = {
      Healthcare: { min: 15, max: 350 },
      Groceries: { min: 8, max: 180 },
      Education: { min: 12, max: 250 },
      Transport: { min: 25, max: 500 },
      Entertainment: { min: 30, max: 800 },
      Other: { min: 20, max: 300 }
    };
    
    const range = basePrices[category] || basePrices.Other;
    const price = Math.floor(Math.random() * (range.max - range.min) + range.min);
    
    // Round to common SA pricing (.95, .99, .50, .00)
    const endings = [0.00, 0.50, 0.95, 0.99];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    
    return Math.floor(price) + ending;
  }

  // Clean and localize product names for SA market
  localizeProductName(name, category, brand) {
    let localized = name
      .replace(/\b(Pack of|Set of|Count of)\s*\d+/gi, '')
      .replace(/\b\d+\s*(oz|fl oz|lb|count|ct)\b/gi, '')
      .replace(/[,\-\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Add SA-appropriate sizing
    if (category === 'Groceries') {
      const sizes = ['250ml', '500ml', '1L', '200g', '400g', '500g', '1kg', '2kg'];
      if (!localized.match(/\d+\s*(ml|l|g|kg)/i)) {
        localized += ` ${sizes[Math.floor(Math.random() * sizes.length)]}`;
      }
    }
    
    if (category === 'Healthcare') {
      const sizes = ['50ml', '100ml', '200ml', '30 tablets', '60 tablets', '100ml', '250ml'];
      if (!localized.match(/\d+\s*(ml|tablets|capsules|g)/i)) {
        localized += ` ${sizes[Math.floor(Math.random() * sizes.length)]}`;
      }
    }
    
    return localized;
  }

  // Search Amazon for products in specific category
  async searchAmazonCategory(searchTerm, category, maxProducts = 10) {
    try {
      console.log(`🔍 Searching Amazon: "${searchTerm}" in ${category}`);
      
      const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&rh=n:${this.getAmazonCategoryId(category)}&ref=sr_nr_n_1`;
      
      const response = await axios.get(searchUrl, {
        headers: this.getRandomHeaders(),
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const products = [];
      
      // Enhanced product selectors
      const productSelectors = [
        '[data-component-type="s-search-result"]',
        '.s-result-item',
        '[data-asin]'
      ];

      let productElements = $();
      for (const selector of productSelectors) {
        productElements = $(selector);
        if (productElements.length > 0) break;
      }

      productElements.slice(0, maxProducts).each((index, element) => {
        try {
          const $product = $(element);
          
          // Extract product name
          const nameSelectors = [
            'h2 a span',
            '.a-size-mini span',
            '.s-size-mini span',
            'h2 span'
          ];
          
          let name = '';
          for (const selector of nameSelectors) {
            name = $product.find(selector).text().trim();
            if (name && name.length > 10) break;
          }
          
          if (!name || name.length < 10) return;
          
          // Extract image
          const imageSelectors = [
            '.s-image',
            '.a-dynamic-image',
            'img[data-src]'
          ];
          
          let imageUrl = '';
          for (const selector of imageSelectors) {
            const img = $product.find(selector).first();
            imageUrl = img.attr('src') || img.attr('data-src') || '';
            if (imageUrl && imageUrl.includes('amazon')) break;
          }
          
          if (!imageUrl) return;
          
          // Get high-res image
          imageUrl = imageUrl
            .replace(/\._.*?_\./, '._SL1500_.')
            .replace(/\._AC_.*?_\./, '._SL1500_.');
          
          // Extract rating (optional)
          const rating = $product.find('.a-icon-alt').text().match(/(\d+\.?\d*)/);
          const stars = rating ? parseFloat(rating[1]) : (4.0 + Math.random() * 1.0);
          
          // Generate SA-specific data
          const { store, brand } = this.assignSAStoreAndBrand(category, name);
          const localizedName = this.localizeProductName(name, category, brand);
          const price = this.generateSAPrice(category, localizedName);
          const sku = this.generateSKU(category, this.successCount + index + 1);
          
          const product = {
            id: this.successCount + index + 1,
            name: localizedName,
            brand: brand,
            category: category,
            price: price,
            discountPrice: Math.random() > 0.7 ? (price * 0.85).toFixed(2) : null,
            image: imageUrl,
            images: [imageUrl],
            description: `Premium ${localizedName.toLowerCase()} available at ${store}. High quality product with excellent customer reviews.`,
            stock: Math.floor(Math.random() * 100) + 20,
            sku: sku,
            rating: parseFloat(stars.toFixed(1)),
            reviews: Math.floor(Math.random() * 500) + 50,
            isActive: true,
            isFeatured: Math.random() > 0.8,
            tags: this.generateTags(category, localizedName),
            ageRestriction: category === 'Healthcare' ? Math.random() > 0.5 : false,
            store: store,
            source: 'amazon_expansion',
            scraped_date: new Date().toISOString()
          };
          
          products.push(product);
          
        } catch (error) {
          console.log(`   ⚠️ Error processing product: ${error.message}`);
        }
      });
      
      console.log(`   ✅ Found ${products.length} products for ${searchTerm}`);
      return products;
      
    } catch (error) {
      console.log(`   ❌ Amazon search failed for "${searchTerm}": ${error.message}`);
      return [];
    }
  }

  // Get Amazon category ID (simplified)
  getAmazonCategoryId(category) {
    const categoryIds = {
      Healthcare: '3760901',
      Groceries: '16310101',
      Education: '1064954',
      Entertainment: '165793011',
      Transport: '15684181',
      Other: '2619525011'
    };
    return categoryIds[category] || categoryIds.Other;
  }

  // Generate relevant tags for products
  generateTags(category, productName) {
    const baseTags = {
      Healthcare: ['health', 'wellness', 'medical', 'pharmacy', 'care'],
      Groceries: ['food', 'grocery', 'kitchen', 'cooking', 'nutrition'],
      Education: ['school', 'learning', 'study', 'education', 'supplies'],
      Entertainment: ['fun', 'leisure', 'entertainment', 'games', 'hobby'],
      Transport: ['travel', 'transport', 'automotive', 'mobility'],
      Other: ['household', 'utility', 'general', 'everyday']
    };
    
    let tags = [...(baseTags[category] || baseTags.Other)];
    
    // Add specific tags based on product name
    const name = productName.toLowerCase();
    if (name.includes('organic')) tags.push('organic');
    if (name.includes('baby')) tags.push('baby', 'infant');
    if (name.includes('vitamin')) tags.push('vitamin', 'supplement');
    if (name.includes('eco') || name.includes('green')) tags.push('eco-friendly');
    
    return tags.slice(0, 5); // Limit to 5 tags
  }

  // Delay function for rate limiting
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main expansion process
  async expandProductCatalog(options = {}) {
    const {
      productsPerCategory = 20,
      productsPerSearch = 8,
      targetCategories = Object.keys(AMAZON_CATEGORIES)
    } = options;

    console.log('🚀 AMAZON PRODUCT CATALOG EXPANSION');
    console.log('==================================');
    console.log(`Target: ${productsPerCategory} products per category`);
    console.log(`Categories: ${targetCategories.join(', ')}\n`);

    for (const category of targetCategories) {
      console.log(`\n📦 EXPANDING ${category.toUpperCase()} CATEGORY`);
      console.log('='.repeat(40));
      
      this.categoryStats[category] = 0;
      const searchTerms = AMAZON_CATEGORIES[category] || [];
      const productsNeeded = productsPerCategory;
      let productsFound = 0;
      
      for (const searchTerm of searchTerms) {
        if (productsFound >= productsNeeded) break;
        
        const products = await this.searchAmazonCategory(
          searchTerm, 
          category, 
          Math.min(productsPerSearch, productsNeeded - productsFound)
        );
        
        this.expandedProducts.push(...products);
        productsFound += products.length;
        this.categoryStats[category] += products.length;
        
        // Update store stats
        products.forEach(p => {
          this.storeStats[p.store] = (this.storeStats[p.store] || 0) + 1;
        });
        
        // Rate limiting
        await this.delay(3000);
        
        console.log(`   📊 Category progress: ${productsFound}/${productsNeeded} products`);
      }
      
      console.log(`✅ ${category} completed: ${this.categoryStats[category]} products found`);
    }
    
    this.successCount = this.expandedProducts.length;
    
    console.log('\n🎉 EXPANSION COMPLETED!');
    console.log('======================');
    console.log(`📊 Total products expanded: ${this.successCount}`);
    console.log('\n📈 Category breakdown:');
    Object.entries(this.categoryStats).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`);
    });
    
    console.log('\n🏪 Store distribution:');
    Object.entries(this.storeStats).forEach(([store, count]) => {
      console.log(`   ${store}: ${count} products`);
    });

    return {
      totalProducts: this.successCount,
      categoryStats: this.categoryStats,
      storeStats: this.storeStats,
      products: this.expandedProducts
    };
  }

  // Generate expanded seed file
  async generateExpandedSeedFile() {
    try {
      console.log('\n📝 Generating expanded seed file...');
      
      // Format products for seed file
      const formattedProducts = this.expandedProducts.map(product => {
        return `  {
    id: ${product.id},
    name: "${product.name}",
    brand: "${product.brand}",
    category: "${product.category}",
    price: ${product.price},
    discountPrice: ${product.discountPrice ? product.discountPrice : 'null'},
    image: "${product.image}",
    images: ["${product.image}"],
    description: "${product.description}",
    stock: ${product.stock},
    sku: "${product.sku}",
    rating: ${product.rating},
    reviews: ${product.reviews},
    isActive: ${product.isActive},
    isFeatured: ${product.isFeatured},
    tags: ${JSON.stringify(product.tags)},
    ageRestriction: ${product.ageRestriction},
    store: "${product.store}",
    createdAt: new Date(),
    updatedAt: new Date()
  }`;
      });

      const seedFileContent = `// 🛒 EXPANDED PRODUCT CATALOG - AUTO-GENERATED
// Generated: ${new Date().toISOString()}
// Total products: ${this.successCount}
// Source: Amazon expansion mapped to SA stores
// 
// South African Store Distribution:
${Object.entries(this.storeStats).map(([store, count]) => `//   ${store}: ${count} products`).join('\n')}

const { Product } = require('./models');

const expandedProducts = [
${formattedProducts.join(',\n\n')}
];

async function seedExpandedProducts() {
  try {
    console.log('🌱 Seeding expanded product catalog...');
    
    // Clear existing products (optional - remove this line to keep existing)
    // await Product.destroy({ where: {}, truncate: true });
    
    // Insert all expanded products
    const result = await Product.bulkCreate(expandedProducts, {
      updateOnDuplicate: ['name', 'price', 'image', 'stock', 'updatedAt']
    });
    
    console.log(\`✅ Successfully seeded \${result.length} expanded products\`);
    console.log('📊 Category breakdown:');
    
    const categories = {};
    expandedProducts.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(\`   \${cat}: \${count} products\`);
    });
    
    console.log('🏪 Store breakdown:');
    const stores = {};
    expandedProducts.forEach(p => {
      stores[p.store] = (stores[p.store] || 0) + 1;
    });
    
    Object.entries(stores).forEach(([store, count]) => {
      console.log(\`   \${store}: \${count} products\`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding expanded products:', error.message);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedExpandedProducts()
    .then(() => {
      console.log('🎉 Expanded product seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = {
  expandedProducts,
  seedExpandedProducts
};`;

      const seedFilePath = path.join(__dirname, 'seed-expanded-products.js');
      await fs.writeFile(seedFilePath, seedFileContent);
      
      console.log(`📄 Expanded seed file generated: seed-expanded-products.js`);
      console.log(`📦 Contains ${this.successCount} products across ${Object.keys(this.categoryStats).length} categories`);
      
      return seedFilePath;
      
    } catch (error) {
      console.error('❌ Error generating seed file:', error.message);
      throw error;
    }
  }

  // Generate expansion report
  async generateExpansionReport() {
    const reportData = {
      expansionDate: new Date().toISOString(),
      totalProductsExpanded: this.successCount,
      categoryBreakdown: this.categoryStats,
      storeDistribution: this.storeStats,
      averageProductsPerCategory: Math.round(this.successCount / Object.keys(this.categoryStats).length),
      topStores: Object.entries(this.storeStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([store, count]) => ({ store, count })),
      expansionSummary: {
        healthcare: this.categoryStats.Healthcare || 0,
        groceries: this.categoryStats.Groceries || 0,
        education: this.categoryStats.Education || 0,
        transport: this.categoryStats.Transport || 0,
        entertainment: this.categoryStats.Entertainment || 0,
        other: this.categoryStats.Other || 0
      }
    };

    const reportPath = path.join(__dirname, `expansion-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`📊 Expansion report saved: ${path.basename(reportPath)}`);
    return reportPath;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
🛒 Amazon Product Catalog Expander

USAGE:
  node amazon-product-expander.js [OPTIONS]

OPTIONS:
  --products=N         Products per category (default: 20)
  --categories=LIST    Specific categories (comma-separated)
  --batch-size=N       Products per search (default: 8)
  --quick             Quick expansion (10 products per category)

EXAMPLES:
  node amazon-product-expander.js
  node amazon-product-expander.js --products=30
  node amazon-product-expander.js --categories=Healthcare,Groceries
  node amazon-product-expander.js --quick
    `);
    return;
  }

  try {
    const expander = new AmazonProductExpander();
    
    // Parse options
    const productsPerCategory = args.find(arg => arg.startsWith('--products='))?.split('=')[1] || 20;
    const categoriesArg = args.find(arg => arg.startsWith('--categories='))?.split('=')[1];
    const batchSize = args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || 8;
    const isQuick = args.includes('--quick');
    
    const targetCategories = categoriesArg ? 
      categoriesArg.split(',').map(c => c.trim()) : 
      Object.keys(AMAZON_CATEGORIES);
    
    const options = {
      productsPerCategory: isQuick ? 10 : parseInt(productsPerCategory),
      productsPerSearch: parseInt(batchSize),
      targetCategories
    };
    
    console.log('🚀 Starting Amazon product expansion...');
    console.log(`📊 Configuration:`);
    console.log(`   Products per category: ${options.productsPerCategory}`);
    console.log(`   Products per search: ${options.productsPerSearch}`);
    console.log(`   Target categories: ${options.targetCategories.join(', ')}`);
    
    // Step 1: Expand product catalog
    const results = await expander.expandProductCatalog(options);
    
    // Step 2: Generate seed file
    await expander.generateExpandedSeedFile();
    
    // Step 3: Generate report
    await expander.generateExpansionReport();
    
    console.log('\n🎉 EXPANSION COMPLETED SUCCESSFULLY!');
    console.log('===================================');
    console.log(`📦 Total products expanded: ${results.totalProducts}`);
    console.log(`🏪 Mapped to ${Object.keys(results.storeStats).length} SA stores`);
    console.log('\n🔄 NEXT STEPS:');
    console.log('1. Review the generated seed-expanded-products.js file');
    console.log('2. Run: node seed-expanded-products.js');
    console.log('3. Your catalog will grow from 32 to ' + (32 + results.totalProducts) + ' products!');
    console.log('4. All products mapped to existing SA stores (Pick n Pay, Clicks, etc.)');
    
  } catch (error) {
    console.error('💥 Expansion failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { AmazonProductExpander, SA_STORE_MAPPING, AMAZON_CATEGORIES };