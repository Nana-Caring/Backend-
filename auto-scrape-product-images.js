const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { Product } = require('./models');

// Web scraping configuration
const searchConfig = {
  takealot: {
    searchUrl: 'https://www.takealot.com/all?_sb=1&qsearch=',
    selectors: {
      productLinks: '.product-anchor',
      productImage: '.product-image img, .gallery-image img, .pdp-product-gallery img',
      imageAlt: 'src, data-src, data-lazy'
    }
  },
  amazon: {
    searchUrl: 'https://www.amazon.com/s?k=',
    selectors: {
      productLinks: '[data-component-type="s-search-result"] h2 a',
      productImage: '#landingImage, .a-dynamic-image, .s-image',
      imageAlt: 'src, data-src'
    }
  }
};

// Headers to avoid being blocked
const requestHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};

// Rate limiting to be respectful to servers
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ProductImageScraper {
  constructor() {
    this.scrapedImages = new Map();
    this.failedProducts = [];
    this.successCount = 0;
    this.totalProducts = 0;
  }

  // Clean product name for better search results
  cleanProductName(name) {
    return name
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')    // Normalize spaces
      .trim()
      .toLowerCase();
  }

  // Search Takealot for product images
  async searchTakealot(productName, brand = '') {
    try {
      const searchQuery = `${brand} ${productName}`.trim();
      const searchUrl = `${searchConfig.takealot.searchUrl}${encodeURIComponent(searchQuery)}`;
      
      console.log(`🔍 Searching Takealot: ${searchQuery}`);
      
      const response = await axios.get(searchUrl, {
        headers: requestHeaders,
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Find first product link
      const firstProductLink = $(searchConfig.takealot.selectors.productLinks).first();
      
      if (firstProductLink.length === 0) {
        console.log(`   ❌ No products found on Takealot`);
        return null;
      }

      const productUrl = 'https://www.takealot.com' + firstProductLink.attr('href');
      
      // Get product page
      await delay(2000); // Be respectful with requests
      
      const productResponse = await axios.get(productUrl, {
        headers: requestHeaders,
        timeout: 10000
      });

      const productPage = cheerio.load(productResponse.data);
      
      // Extract image URL
      const imageElement = productPage(searchConfig.takealot.selectors.productImage).first();
      let imageUrl = imageElement.attr('src') || 
                    imageElement.attr('data-src') || 
                    imageElement.attr('data-lazy');

      if (imageUrl) {
        // Convert to absolute URL if needed
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.takealot.com' + imageUrl;
        }
        
        // Get high-resolution version if possible
        imageUrl = imageUrl.replace(/\/s-\w+\./, '/s-pdpxl.');
        
        console.log(`   ✅ Found Takealot image: ${imageUrl}`);
        return {
          source: 'takealot',
          url: imageUrl,
          productUrl: productUrl
        };
      }

      console.log(`   ❌ No image found on Takealot product page`);
      return null;

    } catch (error) {
      console.log(`   ❌ Takealot search failed: ${error.message}`);
      return null;
    }
  }

  // Search Amazon for product images
  async searchAmazon(productName, brand = '') {
    try {
      const searchQuery = `${brand} ${productName}`.trim();
      const searchUrl = `${searchConfig.amazon.searchUrl}${encodeURIComponent(searchQuery)}`;
      
      console.log(`🔍 Searching Amazon: ${searchQuery}`);
      
      const response = await axios.get(searchUrl, {
        headers: requestHeaders,
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Find first product image directly from search results
      const imageElement = $(searchConfig.amazon.selectors.productImage).first();
      let imageUrl = imageElement.attr('src') || imageElement.attr('data-src');

      if (imageUrl) {
        // Clean up Amazon image URL to get high-res version
        imageUrl = imageUrl.replace(/\._.*?_\./, '._SL1500_.');
        
        console.log(`   ✅ Found Amazon image: ${imageUrl}`);
        return {
          source: 'amazon',
          url: imageUrl,
          productUrl: searchUrl
        };
      }

      console.log(`   ❌ No image found on Amazon`);
      return null;

    } catch (error) {
      console.log(`   ❌ Amazon search failed: ${error.message}`);
      return null;
    }
  }

  // Get image for a single product
  async getProductImage(product) {
    const { name, brand, category } = product;
    const cleanName = this.cleanProductName(name);
    
    console.log(`\n📦 Processing: ${name} (${brand || 'No brand'})`);

    // Try Takealot first (South African focus)
    let imageData = await this.searchTakealot(cleanName, brand);
    
    if (!imageData) {
      // Try Amazon as fallback
      await delay(1000);
      imageData = await this.searchAmazon(cleanName, brand);
    }

    if (imageData) {
      this.scrapedImages.set(product.id, {
        ...product,
        image: imageData.url,
        images: [imageData.url],
        scraped_from: imageData.source,
        scraped_url: imageData.productUrl,
        scraped_date: new Date().toISOString()
      });
      this.successCount++;
    } else {
      this.failedProducts.push(product);
      console.log(`   ❌ No images found for: ${name}`);
    }

    // Progress indicator
    const processed = this.successCount + this.failedProducts.length;
    console.log(`📊 Progress: ${processed}/${this.totalProducts} (${this.successCount} found)`);
  }

  // Process all products from database
  async scrapeAllProductImages() {
    try {
      console.log('🚀 Starting web scraping for product images...\n');

      // Get all products from database
      const products = await Product.findAll({
        attributes: ['id', 'name', 'brand', 'category', 'sku'],
        where: { isActive: true },
        order: [['category', 'ASC'], ['name', 'ASC']]
      });

      this.totalProducts = products.length;
      console.log(`📦 Found ${this.totalProducts} products to process\n`);

      // Process each product with rate limiting
      for (let i = 0; i < products.length; i++) {
        await this.getProductImage(products[i]);
        
        // Rate limiting - wait between requests
        if (i < products.length - 1) {
          await delay(3000); // 3 second delay between products
        }
      }

      console.log('\n🎉 Web scraping completed!');
      console.log(`✅ Successfully found images: ${this.successCount}`);
      console.log(`❌ Failed to find images: ${this.failedProducts.length}`);

      return {
        success: this.successCount,
        failed: this.failedProducts.length,
        scrapedImages: this.scrapedImages
      };

    } catch (error) {
      console.error('❌ Error during web scraping:', error.message);
      throw error;
    }
  }

  // Update the seed-products-with-images.js file
  async updateSeedFile() {
    try {
      console.log('\n📝 Updating seed-products-with-images.js file...');

      const seedFilePath = path.join(__dirname, 'seed-products-with-images.js');
      
      // Read existing seed file
      let seedContent = await fs.readFile(seedFilePath, 'utf8');
      
      // Create backup
      const backupPath = seedFilePath + '.backup.' + Date.now();
      await fs.writeFile(backupPath, seedContent);
      console.log(`💾 Backup created: ${path.basename(backupPath)}`);

      // Update products with scraped images
      let updatedProducts = 0;
      
      for (const [productId, imageData] of this.scrapedImages) {
        const { name, image, images, scraped_from, scraped_date } = imageData;
        
        // Create regex to find and replace the product
        const productRegex = new RegExp(
          `(\\{[^}]*name:\\s*['"]${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][^}]*image:\\s*['"])[^'"]*(['"][^}]*images:\\s*\\[)[^\\]]*`,
          'g'
        );

        const replacement = `$1${image}$2'${images[0]}'`;
        
        if (productRegex.test(seedContent)) {
          seedContent = seedContent.replace(productRegex, replacement);
          updatedProducts++;
          console.log(`✅ Updated ${name} with ${scraped_from} image`);
        }
      }

      // Add comment about scraping
      const scrapingComment = `
// 🤖 AUTOMATED IMAGE SCRAPING RESULTS
// Last updated: ${new Date().toISOString()}
// Images scraped from: Takealot.com, Amazon.com
// Success rate: ${this.successCount}/${this.totalProducts} (${((this.successCount/this.totalProducts)*100).toFixed(1)}%)

`;

      seedContent = scrapingComment + seedContent;

      // Write updated content
      await fs.writeFile(seedFilePath, seedContent);
      
      console.log(`📝 Updated seed file with ${updatedProducts} product images`);
      console.log(`💾 Original backed up as: ${path.basename(backupPath)}`);

      return updatedProducts;

    } catch (error) {
      console.error('❌ Error updating seed file:', error.message);
      throw error;
    }
  }

  // Generate report of scraping results
  async generateReport() {
    try {
      const reportData = {
        scrapingDate: new Date().toISOString(),
        totalProducts: this.totalProducts,
        successfullyScraped: this.successCount,
        failedToScrape: this.failedProducts.length,
        successRate: `${((this.successCount/this.totalProducts)*100).toFixed(1)}%`,
        sourceBreakdown: {
          takealot: Array.from(this.scrapedImages.values()).filter(p => p.scraped_from === 'takealot').length,
          amazon: Array.from(this.scrapedImages.values()).filter(p => p.scraped_from === 'amazon').length
        },
        failedProducts: this.failedProducts.map(p => ({
          name: p.name,
          brand: p.brand,
          category: p.category
        })),
        scrapedProducts: Array.from(this.scrapedImages.values()).map(p => ({
          name: p.name,
          source: p.scraped_from,
          imageUrl: p.image
        }))
      };

      const reportPath = path.join(__dirname, `image-scraping-report-${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
      
      console.log(`\n📊 SCRAPING REPORT GENERATED`);
      console.log(`📄 Report saved: ${path.basename(reportPath)}`);
      console.log(`\n📈 SUMMARY:`);
      console.log(`   Total products: ${reportData.totalProducts}`);
      console.log(`   Successfully scraped: ${reportData.successfullyScraped}`);
      console.log(`   Failed to scrape: ${reportData.failedToScrape}`);
      console.log(`   Success rate: ${reportData.successRate}`);
      console.log(`   Takealot images: ${reportData.sourceBreakdown.takealot}`);
      console.log(`   Amazon images: ${reportData.sourceBreakdown.amazon}`);

      return reportPath;

    } catch (error) {
      console.error('❌ Error generating report:', error.message);
      throw error;
    }
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const scraper = new ProductImageScraper();

  try {
    if (args.includes('--help')) {
      console.log(`
🖼️  Product Image Web Scraper

USAGE:
  node auto-scrape-product-images.js [OPTIONS]

OPTIONS:
  --dry-run        Scrape images but don't update seed file
  --report-only    Generate report from previous scraping
  --limit=N        Limit to first N products (for testing)
  --category=NAME  Only scrape specific category

EXAMPLES:
  node auto-scrape-product-images.js
  node auto-scrape-product-images.js --limit=5
  node auto-scrape-product-images.js --category=Healthcare
  node auto-scrape-product-images.js --dry-run
      `);
      return;
    }

    // Parse options
    const isDryRun = args.includes('--dry-run');
    const limitMatch = args.find(arg => arg.startsWith('--limit='));
    const limit = limitMatch ? parseInt(limitMatch.split('=')[1]) : null;
    const categoryMatch = args.find(arg => arg.startsWith('--category='));
    const category = categoryMatch ? categoryMatch.split('=')[1] : null;

    console.log('🤖 AUTOMATED PRODUCT IMAGE SCRAPER');
    console.log('==================================');
    console.log(`Mode: ${isDryRun ? 'DRY RUN (no files updated)' : 'LIVE UPDATE'}`);
    if (limit) console.log(`Limit: ${limit} products`);
    if (category) console.log(`Category: ${category}`);
    console.log('');

    // Step 1: Scrape images from web
    console.log('🚀 STEP 1: Web Scraping');
    console.log('======================');
    await scraper.scrapeAllProductImages();

    // Step 2: Update seed file (unless dry run)
    if (!isDryRun && scraper.successCount > 0) {
      console.log('\n📝 STEP 2: Update Seed File');
      console.log('==========================');
      await scraper.updateSeedFile();
    }

    // Step 3: Generate report
    console.log('\n📊 STEP 3: Generate Report');
    console.log('=========================');
    await scraper.generateReport();

    console.log('\n🎉 IMAGE SCRAPING COMPLETED SUCCESSFULLY!');
    
    if (!isDryRun) {
      console.log('\n🔄 NEXT STEPS:');
      console.log('1. Review the updated seed-products-with-images.js file');
      console.log('2. Run: node seed-products-with-images.js');
      console.log('3. Test your frontend with the new realistic images');
    }

  } catch (error) {
    console.error('💥 SCRAPING FAILED:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  ProductImageScraper,
  searchConfig
};