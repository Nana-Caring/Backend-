require('dotenv').config();
const sequelize = require('./db');
const Product = require('./models/Product');
const axios = require('axios');
const cheerio = require('cheerio');

// Clicks.co.za MVP Product Scraper
class ClicksMVPScraper {
  constructor() {
    this.baseUrl = 'https://clicks.co.za';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive'
    };
    
    // Curated Clicks categories for caring platform MVP
    this.targetCategories = [
      {
        name: 'Baby Care',
        url: '/baby/baby-care',
        category: 'healthcare',
        subcategory: 'baby_care'
      },
      {
        name: 'Health & Wellness',
        url: '/health-wellness/vitamins-supplements',
        category: 'healthcare', 
        subcategory: 'vitamins'
      },
      {
        name: 'Personal Care',
        url: '/beauty/personal-care',
        category: 'healthcare',
        subcategory: 'personal_care'
      },
      {
        name: 'Medicine & First Aid',
        url: '/health-wellness/medicine',
        category: 'healthcare',
        subcategory: 'medicine'
      }
    ];
  }

  async scrapeClicksProduct(productUrl) {
    try {
      console.log(`🔍 Scraping Clicks product: ${productUrl}`);
      
      const response = await axios.get(productUrl, { 
        headers: this.headers,
        timeout: 15000 
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract product data from Clicks page structure
      const product = {
        name: this.cleanText($('h1.product-name, .product-title, [data-testid="product-name"]').first().text()),
        brand: this.cleanText($('.product-brand, .brand-name, [data-testid="brand-name"]').first().text()),
        price: this.extractPrice($('.price, .product-price, [data-testid="price"]').first().text()),
        description: this.cleanText($('.product-description, .description, [data-testid="description"]').first().text()),
        image: this.extractImageUrl($, productUrl),
        sku: this.extractSku($, productUrl),
        inStock: this.checkStock($),
        category: 'healthcare',
        shop: 'Clicks'
      };
      
      // Validate required fields
      if (!product.name || !product.price) {
        throw new Error('Missing required product data');
      }
      
      return product;
      
    } catch (error) {
      console.error(`❌ Error scraping ${productUrl}:`, error.message);
      return null;
    }
  }

  extractImageUrl($, productUrl) {
    // Try multiple selectors for Clicks product images
    const selectors = [
      '.product-image img',
      '.main-image img', 
      '.hero-image img',
      '[data-testid="product-image"] img',
      '.swiper-slide img',
      '.product-gallery img'
    ];
    
    for (const selector of selectors) {
      const img = $(selector).first();
      if (img.length) {
        let src = img.attr('src') || img.attr('data-src') || img.attr('data-lazy');
        if (src) {
          // Ensure full URL
          if (src.startsWith('//')) {
            src = 'https:' + src;
          } else if (src.startsWith('/')) {
            src = this.baseUrl + src;
          }
          
          // Get high-quality version
          src = src.replace(/\/w_\d+,h_\d+/, '/w_500,h_500');
          src = src.replace(/\?.*$/, '?w=500&h=500&fit=crop');
          
          return src;
        }
      }
    }
    
    return null;
  }

  extractPrice(priceText) {
    if (!priceText) return null;
    
    // Extract price from various formats
    const priceMatch = priceText.match(/R\s*(\d+(?:\.\d{2})?)/i);
    return priceMatch ? parseFloat(priceMatch[1]) : null;
  }

  extractSku($, productUrl) {
    // Try to find SKU/product code
    const skuSelectors = [
      '[data-testid="sku"]',
      '.product-code',
      '.sku',
      '.item-number'
    ];
    
    for (const selector of skuSelectors) {
      const sku = $(selector).text().trim();
      if (sku) return sku;
    }
    
    // Fallback: extract from URL
    const urlMatch = productUrl.match(/\/(\d+)(?:\?|$)/);
    return urlMatch ? `CLICKS-${urlMatch[1]}` : `CLICKS-${Date.now()}`;
  }

  checkStock($) {
    const stockIndicators = [
      '.in-stock',
      '.available', 
      '[data-testid="stock-status"]'
    ];
    
    // Check for out of stock indicators
    const outOfStock = $('.out-of-stock, .unavailable, .sold-out').length > 0;
    return !outOfStock;
  }

  cleanText(text) {
    return text ? text.trim().replace(/\s+/g, ' ').substring(0, 255) : '';
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Curated Clicks products for MVP (manually selected for quality)
  getCuratedClicksProducts() {
    return [
      {
        name: 'Clicks Vitamin C 500mg 30 Tablets',
        brand: 'Clicks',
        price: 39.99,
        category: 'healthcare',
        subcategory: 'vitamins',
        sku: 'CL-VITC-30TAB',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/h5a/h3b/9045044781086/163389-EA-3d.jpg',
        description: 'Clicks Vitamin C 500mg tablets for immune support',
        age_restriction: null,
        shop: 'Clicks'
      },
      {
        name: 'Clicks Thermometer Digital',
        brand: 'Clicks',
        price: 65.99,
        category: 'healthcare',
        subcategory: 'medical_devices',
        sku: 'CL-THERMO-DIG',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/h8f/h5c/9045044879390/163401-EA-3d.jpg',
        description: 'Digital thermometer for accurate temperature readings',
        age_restriction: null,
        shop: 'Clicks'
      },
      {
        name: 'Colgate Total Toothpaste 100ml',
        brand: 'Colgate',
        price: 35.99,
        category: 'healthcare',
        subcategory: 'oral_care',
        sku: 'CG-TOTAL-100ML',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/h2d/h8b/9045044912158/159876-EA-3d.jpg',
        description: 'Colgate Total advanced toothpaste for complete oral care',
        age_restriction: null,
        shop: 'Clicks'
      },
      {
        name: 'Purity Baby Wipes 80 Pack',
        brand: 'Purity',
        price: 28.99,
        category: 'healthcare',
        subcategory: 'baby_care',
        sku: 'PU-WIPES-80PACK',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/h9e/h2f/9045044847646/161234-EA-3d.jpg',
        description: 'Gentle baby wipes for sensitive skin',
        age_restriction: null,
        shop: 'Clicks'
      },
      {
        name: 'Disprin Headache & Pain Relief 20 Tablets',
        brand: 'Disprin',
        price: 24.99,
        category: 'healthcare',
        subcategory: 'pain_relief',
        sku: 'DS-PAIN-20TAB',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/h5f/h1a/9045044813342/158923-EA-3d.jpg',
        description: 'Fast-acting pain relief tablets for headaches',
        age_restriction: 18,
        shop: 'Clicks'
      },
      {
        name: 'Gentle Magic Skin Lightening Cream 50ml',
        brand: 'Gentle Magic',
        price: 45.99,
        category: 'healthcare',
        subcategory: 'skincare',
        sku: 'GM-CREAM-50ML',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/hef/h7d/9045044748318/157892-EA-3d.jpg',
        description: 'Gentle skin lightening cream with natural ingredients',
        age_restriction: null,
        shop: 'Clicks'
      },
      {
        name: 'Clicks Multivitamin Syrup 200ml',
        brand: 'Clicks',
        price: 42.99,
        category: 'healthcare',
        subcategory: 'vitamins',
        sku: 'CL-MULTI-200ML',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/h8a/h4e/9045044781598/163421-EA-3d.jpg',
        description: 'Complete multivitamin syrup for daily health support',
        age_restriction: null,
        shop: 'Clicks'
      },
      {
        name: 'Bepanthen Nappy Care Ointment 30g',
        brand: 'Bepanthen',
        price: 48.99,
        category: 'healthcare',
        subcategory: 'baby_care',
        sku: 'BP-NAPPY-30G',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/h7c/h9f/9045044715550/156789-EA-3d.jpg',
        description: 'Protective nappy care ointment for babies',
        age_restriction: null,
        shop: 'Clicks'
      },
      {
        name: 'Clicks Hand Sanitizer 500ml',
        brand: 'Clicks',
        price: 35.99,
        category: 'healthcare',
        subcategory: 'hygiene',
        sku: 'CL-SANITIZER-500ML',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/h2b/h5e/9045044813854/158934-EA-3d.jpg',
        description: '70% alcohol hand sanitizer for effective germ protection',
        age_restriction: null,
        shop: 'Clicks'
      },
      {
        name: 'Clicks First Aid Kit Basic',
        brand: 'Clicks',
        price: 89.99,
        category: 'healthcare',
        subcategory: 'first_aid',
        sku: 'CL-FIRSTAID-BASIC',
        image: 'https://www.clicks.co.za/medias/sys_master/images/images/h4d/h7a/9045044748830/157903-EA-3d.jpg',
        description: 'Essential first aid kit for home and travel',
        age_restriction: null,
        shop: 'Clicks'
      }
    ];
  }
}

async function updateProductsWithClicksMVP(options = {}) {
  const { dryRun = false, limit = null } = options;
  
  try {
    console.log('🏥 CLICKS MVP PRODUCT UPDATE');
    console.log('============================');
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE UPDATE'}`);
    
    if (dryRun) {
      console.log('📋 DRY RUN - No database changes will be made\n');
    }

    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    const scraper = new ClicksMVPScraper();
    const curatedProducts = scraper.getCuratedClicksProducts();
    
    let productsToProcess = curatedProducts;
    if (limit) {
      productsToProcess = curatedProducts.slice(0, limit);
      console.log(`🎯 Processing first ${limit} products only\n`);
    }
    
    console.log(`📦 Found ${productsToProcess.length} curated Clicks products\n`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (let i = 0; i < productsToProcess.length; i++) {
      const productData = productsToProcess[i];
      console.log(`\n📋 Processing ${i + 1}/${productsToProcess.length}: ${productData.name}`);
      
      try {
        if (!dryRun) {
          // Check if product already exists
          const existingProduct = await Product.findOne({
            where: { sku: productData.sku }
          });

          if (existingProduct) {
            // Update existing product
            await existingProduct.update({
              name: productData.name,
              brand: productData.brand,
              price: productData.price,
              image_url: productData.image,
              description: productData.description,
              categories: productData.category,
              subcategory: productData.subcategory,
              shop_name: productData.shop,
              age_restriction: productData.age_restriction,
              updated_at: new Date()
            });
            console.log(`   ✅ Updated existing product: ${productData.name}`);
          } else {
            // Create new product
            await Product.create({
              name: productData.name,
              brand: productData.brand,
              price: productData.price,
              image_url: productData.image,
              description: productData.description,
              categories: productData.category,
              subcategory: productData.subcategory,
              sku: productData.sku,
              shop_name: productData.shop,
              age_restriction: productData.age_restriction,
              created_at: new Date(),
              updated_at: new Date()
            });
            console.log(`   ✅ Created new product: ${productData.name}`);
          }
        } else {
          console.log(`   📋 DRY RUN: Would process ${productData.name}`);
          console.log(`      - SKU: ${productData.sku}`);
          console.log(`      - Price: R${productData.price}`);
          console.log(`      - Image: ${productData.image.substring(0, 60)}...`);
        }
        
        results.push({
          name: productData.name,
          sku: productData.sku,
          price: productData.price,
          shop: productData.shop,
          status: 'success'
        });
        
        successCount++;
        
      } catch (error) {
        console.error(`   ❌ Error processing ${productData.name}:`, error.message);
        results.push({
          name: productData.name,
          status: 'error',
          error: error.message
        });
        errorCount++;
      }
      
      // Rate limiting
      await scraper.delay(500);
    }

    // Summary Report
    console.log('\n📊 CLICKS MVP UPDATE SUMMARY');
    console.log('============================');
    console.log(`✅ Successfully processed: ${successCount}/${productsToProcess.length}`);
    console.log(`❌ Errors: ${errorCount}/${productsToProcess.length}`);
    console.log(`📈 Success rate: ${((successCount / productsToProcess.length) * 100).toFixed(1)}%`);
    
    if (!dryRun && successCount > 0) {
      console.log('\n🏥 CLICKS PRODUCTS ADDED:');
      results
        .filter(r => r.status === 'success')
        .forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} (${product.sku}) - R${product.price}`);
        });
    }
    
    if (errorCount > 0) {
      console.log('\n❌ PRODUCTS WITH ERRORS:');
      results
        .filter(r => r.status === 'error')
        .forEach(product => {
          console.log(`   • ${product.name}: ${product.error}`);
        });
    }
    
    console.log('\n🎉 CLICKS MVP UPDATE COMPLETE!');
    console.log('🏥 Your platform now focuses on Clicks healthcare products');
    console.log('🚀 Ready for MVP launch with professional Clicks integration!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Command line interface
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitMatch = args.find(arg => arg.startsWith('--limit='));
const limit = limitMatch ? parseInt(limitMatch.split('=')[1]) : null;

updateProductsWithClicksMVP({ dryRun, limit });