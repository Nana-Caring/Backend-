# 🖼️ Automated Product Image Scraper

## Installation

```bash
# Install required dependencies
npm install axios cheerio fs-extra

# Or if you prefer yarn
yarn add axios cheerio fs-extra
```

## Quick Start

```bash
# Test with first 5 products (recommended first run)
node auto-scrape-product-images.js --limit=5 --dry-run

# Scrape all products and update seed file
node auto-scrape-product-images.js

# Scrape only healthcare products
node auto-scrape-product-images.js --category=Healthcare
```

## Features

🔍 **Intelligent Web Scraping**
- Searches Takealot.com (South African focus)  
- Falls back to Amazon.com for global products
- Extracts high-resolution product images
- Respects rate limits and server resources

🎯 **Smart Product Matching**
- Cleans product names for better search results
- Uses brand information when available
- Handles special characters and formatting

📝 **Automatic File Updates**
- Updates your `seed-products-with-images.js` file automatically
- Creates backups before making changes
- Preserves file structure and formatting

📊 **Comprehensive Reporting**
- Success/failure statistics
- Source breakdown (Takealot vs Amazon)
- Failed products list for manual review
- JSON report generation

## Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--dry-run` | Test scraping without updating files | `--dry-run` |
| `--limit=N` | Process only first N products | `--limit=10` |
| `--category=NAME` | Scrape specific category only | `--category=Healthcare` |
| `--help` | Show help information | `--help` |

## Usage Examples

### 1. Test Run (Recommended First)
```bash
# Test with 5 products, no file changes
node auto-scrape-product-images.js --limit=5 --dry-run
```

### 2. Full Production Scrape
```bash
# Scrape all products and update seed file
node auto-scrape-product-images.js
```

### 3. Category-Specific Scraping
```bash
# Only healthcare products
node auto-scrape-product-images.js --category=Healthcare

# Only groceries
node auto-scrape-product-images.js --category=Groceries
```

### 4. Limited Production Run
```bash
# Update first 20 products
node auto-scrape-product-images.js --limit=20
```

## What It Does

1. **🔍 Product Discovery**: Reads all active products from your database
2. **🌐 Web Searching**: Searches Takealot and Amazon for each product
3. **🖼️ Image Extraction**: Finds the best quality product image
4. **💾 File Updates**: Updates your seed file with real e-commerce images
5. **📊 Reporting**: Generates detailed reports of the scraping process

## Expected Output

```
🤖 AUTOMATED PRODUCT IMAGE SCRAPER
==================================
Mode: LIVE UPDATE

🚀 STEP 1: Web Scraping
======================
📦 Found 67 products to process

📦 Processing: Panado Extra (Panado)
🔍 Searching Takealot: panado panado extra
   ✅ Found Takealot image: https://media.takealot.com/covers_images/...
📊 Progress: 1/67 (1 found)

📦 Processing: Clicks Vitamin C (Clicks)
🔍 Searching Takealot: clicks clicks vitamin c
   ✅ Found Takealot image: https://media.takealot.com/covers_images/...
📊 Progress: 2/67 (2 found)

🎉 Web scraping completed!
✅ Successfully found images: 54
❌ Failed to find images: 13

📝 STEP 2: Update Seed File
==========================
💾 Backup created: seed-products-with-images.js.backup.1699123456789
✅ Updated Panado Extra with takealot image
✅ Updated Clicks Vitamin C with takealot image
📝 Updated seed file with 54 product images

📊 STEP 3: Generate Report
=========================
📄 Report saved: image-scraping-report-1699123456789.json

📈 SUMMARY:
   Total products: 67
   Successfully scraped: 54
   Failed to scrape: 13
   Success rate: 80.6%
   Takealot images: 41
   Amazon images: 13

🎉 IMAGE SCRAPING COMPLETED SUCCESSFULLY!

🔄 NEXT STEPS:
1. Review the updated seed-products-with-images.js file
2. Run: node seed-products-with-images.js
3. Test your frontend with the new realistic images
```

## File Changes

The script will modify your `seed-products-with-images.js` file:

**Before:**
```javascript
{
  name: "Panado Extra",
  image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae",
  images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae"]
}
```

**After:**
```javascript
{
  name: "Panado Extra",
  image: "https://media.takealot.com/covers_images/398badf341184b3f96c87be53e94c411/s-pdpxl.file",
  images: ["https://media.takealot.com/covers_images/398badf341184b3f96c87be53e94c411/s-pdpxl.file"]
}
```

## Safety Features

- **📋 Backups**: Creates timestamped backups before making changes
- **⏱️ Rate Limiting**: Respectful 3-second delays between requests
- **🛡️ Error Handling**: Graceful failure handling and reporting
- **🔍 Validation**: Dry run mode for testing

## Troubleshooting

### Common Issues

**No images found:**
- Product names might be too generic
- Try adding more specific search terms
- Check if the product exists on Takealot/Amazon

**Rate limiting errors:**
- Increase delay between requests
- Run smaller batches with `--limit=N`

**Network timeouts:**
- Check internet connection
- Retry failed products manually

### Manual Review

After scraping, review the generated report for:
- Failed products that need manual image updates
- Image quality and relevance
- Broken or placeholder URLs

## Integration

After successful scraping:

1. **Update Database**: Run your seed file to populate the database
2. **Test Frontend**: Verify images display correctly in your ASP.NET frontend
3. **Monitor Performance**: Check image loading times and CDN requirements

## Advanced Usage

For custom implementations, you can import and use the scraper class:

```javascript
const { ProductImageScraper } = require('./auto-scrape-product-images.js');

const scraper = new ProductImageScraper();
const results = await scraper.scrapeAllProductImages();
console.log(`Found ${results.success} images`);
```

---

**🔒 Ethical Web Scraping Notice**: This tool follows respectful scraping practices with rate limiting and proper user agents. Always respect website terms of service and robots.txt files.