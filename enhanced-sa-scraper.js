const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Enhanced South African focused scraper
class EnhancedSAScraper {
  constructor() {
    this.scrapedImages = new Map();
    this.failedProducts = [];
    this.successCount = 0;
    this.sourceStats = { takealot: 0, clicks: 0, pnp: 0, amazon: 0, shopify: 0 };
  }

  // Enhanced headers to avoid detection
  getHeaders() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'
    ];
    
    return {
      'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,af;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Cache-Control': 'max-age=0'
    };
  }

  // Enhanced product name cleaning for South African context
  cleanProductName(name, brand = '') {
    // Remove common SA retail suffixes/prefixes
    let cleaned = name
      .replace(/\b(pack|ml|mg|kg|g|pieces?|pcs?|x\d+|size|medium|large|small)\b/gi, '')
      .replace(/\d+\s?(ml|mg|kg|g|l|pack|pcs?|pieces?)/gi, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // For South African brands, prioritize local terms
    const saTerms = {
      'All Gold': 'tomato sauce',
      'Lucky Star': 'pilchards fish',
      'White Star': 'maize meal pap',
      'Ritebrand': 'bread loaf',
      'Dis-Chem': 'multivitamin syrup',
      'Khoki': 'permanent markers stationery',
      'Tommee Tippee': 'baby bottle feeding',
      'Woolworths': 'organic baby food'
    };

    if (brand && saTerms[brand]) {
      cleaned = `${brand} ${saTerms[brand]}`;
    }

    return cleaned.toLowerCase();
  }

  // Enhanced Takealot search with multiple strategies
  async searchTakealotEnhanced(productName, brand = '') {
    const searchStrategies = [
      `${brand} ${productName}`.trim(),
      productName,
      `${brand}`.trim(),
      this.cleanProductName(productName, brand)
    ].filter(s => s.length > 2);

    for (const searchTerm of searchStrategies) {
      try {
        console.log(`   🔍 Takealot strategy: "${searchTerm}"`);
        
        const searchUrl = `https://www.takealot.com/all?_sb=1&qsearch=${encodeURIComponent(searchTerm)}`;
        const response = await axios.get(searchUrl, {
          headers: this.getHeaders(),
          timeout: 15000,
          maxRedirects: 5
        });

        const $ = cheerio.load(response.data);
        
        // Multiple selectors for product links
        const productSelectors = [
          '.product-anchor',
          'a[href*="/p/"]',
          '.product-item a',
          '[data-ref="product-anchor"]'
        ];

        let productUrl = null;
        for (const selector of productSelectors) {
          const firstProduct = $(selector).first();
          if (firstProduct.length > 0) {
            productUrl = firstProduct.attr('href');
            if (productUrl) {
              if (!productUrl.startsWith('http')) {
                productUrl = 'https://www.takealot.com' + productUrl;
              }
              break;
            }
          }
        }

        if (!productUrl) continue;

        console.log(`   📄 Found product page: ${productUrl}`);
        await this.delay(2000);

        // Get product page with enhanced selectors
        const productResponse = await axios.get(productUrl, {
          headers: this.getHeaders(),
          timeout: 15000
        });

        const productPage = cheerio.load(productResponse.data);
        
        // Enhanced image selectors for Takealot
        const imageSelectors = [
          '.pdp-product-gallery img',
          '.gallery-image img',
          '.product-hero-image img',
          '.pdp-product-image img',
          '[data-ref="pdp-product-image"] img',
          '.product-image img',
          'img[src*="covers_images"]',
          'img[data-src*="covers_images"]'
        ];

        let imageUrl = null;
        for (const selector of imageSelectors) {
          const img = productPage(selector).first();
          if (img.length > 0) {
            imageUrl = img.attr('src') || img.attr('data-src') || img.attr('data-lazy');
            if (imageUrl) break;
          }
        }

        if (imageUrl) {
          // Clean and enhance image URL
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else if (imageUrl.startsWith('/')) {
            imageUrl = 'https://www.takealot.com' + imageUrl;
          }
          
          // Get highest quality version
          imageUrl = imageUrl
            .replace(/\/s-\w+\./, '/s-pdpxl.')
            .replace(/\/w\d+\./, '/s-pdpxl.')
            .replace(/\?.*$/, ''); // Remove query parameters

          console.log(`   ✅ Takealot success: ${imageUrl}`);
          this.sourceStats.takealot++;
          return {
            source: 'takealot',
            url: imageUrl,
            productUrl: productUrl,
            searchTerm: searchTerm
          };
        }

      } catch (error) {
        console.log(`   ⚠️ Takealot strategy "${searchTerm}" failed: ${error.message}`);
        continue;
      }
    }

    console.log(`   ❌ All Takealot strategies failed`);
    return null;
  }

  // Search Clicks online store
  async searchClicks(productName, brand = '') {
    try {
      const searchTerm = `${brand} ${productName}`.trim();
      console.log(`   🔍 Searching Clicks: "${searchTerm}"`);
      
      // Clicks uses a different search URL structure
      const searchUrl = `https://clicks.co.za/search?q=${encodeURIComponent(searchTerm)}`;
      
      const response = await axios.get(searchUrl, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Clicks specific selectors
      const productLink = $('.product-item a, .product-tile a').first();
      
      if (productLink.length === 0) {
        console.log(`   ❌ No products found on Clicks`);
        return null;
      }

      let productUrl = productLink.attr('href');
      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = 'https://clicks.co.za' + productUrl;
      }

      await this.delay(2000);

      const productResponse = await axios.get(productUrl, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const productPage = cheerio.load(productResponse.data);
      
      // Clicks image selectors
      const imageSelectors = [
        '.product-image img',
        '.pdp-image img',
        '.main-product-image img',
        'img[src*="clicks.co.za"]'
      ];

      let imageUrl = null;
      for (const selector of imageSelectors) {
        const img = productPage(selector).first();
        if (img.length > 0) {
          imageUrl = img.attr('src') || img.attr('data-src');
          if (imageUrl) break;
        }
      }

      if (imageUrl) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://clicks.co.za' + imageUrl;
        }

        console.log(`   ✅ Clicks success: ${imageUrl}`);
        this.sourceStats.clicks++;
        return {
          source: 'clicks',
          url: imageUrl,
          productUrl: productUrl
        };
      }

      return null;

    } catch (error) {
      console.log(`   ❌ Clicks search failed: ${error.message}`);
      return null;
    }
  }

  // Search Pick n Pay online
  async searchPicknPay(productName, brand = '') {
    try {
      const searchTerm = `${brand} ${productName}`.trim();
      console.log(`   🔍 Searching Pick n Pay: "${searchTerm}"`);
      
      const searchUrl = `https://www.pnp.co.za/search?q=${encodeURIComponent(searchTerm)}`;
      
      const response = await axios.get(searchUrl, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      const productLink = $('.product-card a, .product-tile a').first();
      
      if (productLink.length === 0) {
        return null;
      }

      let productUrl = productLink.attr('href');
      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = 'https://www.pnp.co.za' + productUrl;
      }

      await this.delay(2000);

      const productResponse = await axios.get(productUrl, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const productPage = cheerio.load(productResponse.data);
      
      const imageSelectors = [
        '.product-image img',
        '.pdp-image img',
        'img[src*="pnp.co.za"]'
      ];

      let imageUrl = null;
      for (const selector of imageSelectors) {
        const img = productPage(selector).first();
        if (img.length > 0) {
          imageUrl = img.attr('src') || img.attr('data-src');
          if (imageUrl) break;
        }
      }

      if (imageUrl) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.pnp.co.za' + imageUrl;
        }

        console.log(`   ✅ Pick n Pay success: ${imageUrl}`);
        this.sourceStats.pnp++;
        return {
          source: 'pnp',
          url: imageUrl,
          productUrl: productUrl
        };
      }

      return null;

    } catch (error) {
      console.log(`   ❌ Pick n Pay search failed: ${error.message}`);
      return null;
    }
  }

  // Enhanced Amazon search
  async searchAmazonEnhanced(productName, brand = '') {
    try {
      const searchTerm = `${brand} ${productName}`.trim();
      console.log(`   🔍 Amazon enhanced: "${searchTerm}"`);
      
      const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&ref=nb_sb_noss`;
      
      const response = await axios.get(searchUrl, {
        headers: this.getHeaders(),
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      
      // Enhanced Amazon image selectors
      const imageSelectors = [
        '.s-image',
        '.a-dynamic-image',
        'img[data-src]',
        '.s-product-image img'
      ];

      let imageUrl = null;
      for (const selector of imageSelectors) {
        const img = $(selector).first();
        if (img.length > 0) {
          imageUrl = img.attr('src') || img.attr('data-src');
          if (imageUrl && imageUrl.includes('amazon')) {
            break;
          }
        }
      }

      if (imageUrl) {
        // Get high-res Amazon image
        imageUrl = imageUrl
          .replace(/\._.*?_\./, '._SL1500_.')
          .replace(/\._AC_.*?_\./, '._SL1500_.');

        console.log(`   ✅ Amazon enhanced success: ${imageUrl}`);
        this.sourceStats.amazon++;
        return {
          source: 'amazon',
          url: imageUrl,
          productUrl: searchUrl
        };
      }

      return null;

    } catch (error) {
      console.log(`   ❌ Amazon enhanced failed: ${error.message}`);
      return null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced scraping with SA retailer priority
  async scrapeProductImage(product) {
    const { name, brand, category } = product;
    console.log(`\n📦 Enhanced scraping: ${name} (${brand || 'No brand'}) - ${category}`);

    // Priority order: SA retailers first, then international
    const scrapers = [
      () => this.searchTakealotEnhanced(name, brand),
      () => this.searchClicks(name, brand),
      () => this.searchPicknPay(name, brand),
      () => this.searchAmazonEnhanced(name, brand)
    ];

    for (let i = 0; i < scrapers.length; i++) {
      try {
        const result = await scrapers[i]();
        if (result) {
          this.scrapedImages.set(name, {
            ...product,
            image: result.url,
            images: [result.url],
            scraped_from: result.source,
            scraped_url: result.productUrl,
            scraped_date: new Date().toISOString(),
            search_term: result.searchTerm || `${brand} ${name}`.trim()
          });
          this.successCount++;
          return result;
        }
      } catch (error) {
        console.log(`   ⚠️ Scraper ${i + 1} error: ${error.message}`);
      }
      
      // Delay between different scrapers
      if (i < scrapers.length - 1) {
        await this.delay(1500);
      }
    }

    // If all scrapers failed
    this.failedProducts.push(product);
    console.log(`   ❌ All scrapers failed for: ${name}`);
    return null;
  }

  // Process specific failed products
  async processFailedProducts(failedList) {
    console.log('\n🔄 PROCESSING PREVIOUSLY FAILED PRODUCTS');
    console.log('=======================================');
    
    this.totalProducts = failedList.length;
    
    for (let i = 0; i < failedList.length; i++) {
      const product = failedList[i];
      await this.scrapeProductImage(product);
      
      // Progress indicator
      const processed = i + 1;
      console.log(`📊 Progress: ${processed}/${this.totalProducts} (${this.successCount} recovered)`);
      
      // Rate limiting between products
      if (i < failedList.length - 1) {
        await this.delay(3000);
      }
    }

    console.log('\n🎉 Failed products processing completed!');
    console.log(`✅ Recovered: ${this.successCount}/${this.totalProducts}`);
    console.log(`📊 Source breakdown:`);
    console.log(`   Takealot: ${this.sourceStats.takealot}`);
    console.log(`   Clicks: ${this.sourceStats.clicks}`);
    console.log(`   Pick n Pay: ${this.sourceStats.pnp}`);
    console.log(`   Amazon: ${this.sourceStats.amazon}`);

    return {
      recovered: this.successCount,
      stillFailed: this.failedProducts.length,
      sourceStats: this.sourceStats
    };
  }
}

// Main execution for failed products
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
🔧 Enhanced SA Scraper - Failed Products Recovery

USAGE:
  node enhanced-sa-scraper.js [--report=FILENAME]

OPTIONS:
  --report=FILE    Process failed products from specific report
  --test          Test with sample failed products

EXAMPLES:
  node enhanced-sa-scraper.js --report=image-scraping-report-1762210965968.json
  node enhanced-sa-scraper.js --test
    `);
    return;
  }

  const scraper = new EnhancedSAScraper();

  try {
    let failedProducts = [];

    if (args.find(arg => arg.startsWith('--report='))) {
      // Load failed products from specific report
      const reportFile = args.find(arg => arg.startsWith('--report=')).split('=')[1];
      const reportPath = path.join(__dirname, reportFile);
      const reportData = JSON.parse(await fs.readFile(reportPath, 'utf8'));
      failedProducts = reportData.failedProducts;
      console.log(`📄 Loaded ${failedProducts.length} failed products from ${reportFile}`);
    
    } else if (args.includes('--test')) {
      // Test with sample failed products
      failedProducts = [
        { name: "All Gold Tomato Sauce 500ml", brand: "All Gold", category: "Groceries" },
        { name: "Lucky Star Pilchards in Tomato Sauce 400g", brand: "Lucky Star", category: "Groceries" }
      ];
      console.log(`🧪 Testing with ${failedProducts.length} sample products`);
    
    } else {
      // Load from most recent report
      const reportFiles = await fs.readdir(__dirname);
      const latestReport = reportFiles
        .filter(f => f.startsWith('image-scraping-report-') && f.endsWith('.json'))
        .sort()
        .pop();
      
      if (latestReport) {
        const reportData = JSON.parse(await fs.readFile(path.join(__dirname, latestReport), 'utf8'));
        failedProducts = reportData.failedProducts;
        console.log(`📄 Auto-loaded ${failedProducts.length} failed products from ${latestReport}`);
      } else {
        console.log('❌ No scraping reports found. Run the main scraper first.');
        return;
      }
    }

    if (failedProducts.length === 0) {
      console.log('🎉 No failed products to process!');
      return;
    }

    // Process the failed products
    const results = await scraper.processFailedProducts(failedProducts);
    
    // Generate recovery report
    const recoveryReport = {
      date: new Date().toISOString(),
      originalFailed: failedProducts.length,
      recovered: results.recovered,
      stillFailed: results.stillFailed,
      sourceBreakdown: results.sourceStats,
      recoveredProducts: Array.from(scraper.scrapedImages.values()),
      stillFailingProducts: scraper.failedProducts
    };

    const recoveryReportPath = path.join(__dirname, `recovery-report-${Date.now()}.json`);
    await fs.writeFile(recoveryReportPath, JSON.stringify(recoveryReport, null, 2));
    
    console.log(`\n📊 RECOVERY REPORT SAVED: ${path.basename(recoveryReportPath)}`);

  } catch (error) {
    console.error('💥 Enhanced scraper failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { EnhancedSAScraper };