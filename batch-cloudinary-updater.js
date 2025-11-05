const CloudinaryProductUpdater = require('./cloudinary-product-updater');
const { Product } = require('./models');

/**
 * Batch Cloudinary Image Updater
 * 
 * This tool allows you to update multiple products with Cloudinary-hosted images
 * Edit the 'imageUpdates' array below with your products and image URLs
 */

// ⚠️ EDIT THIS ARRAY WITH YOUR ACTUAL PRODUCTS ⚠️
const imageUpdates = [
    // Example 1: Update by SKU
    {
        identifier: 'HEALTH001', // Product SKU
        images: {
            main: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
            additional: [
                'https://images.unsplash.com/photo-1559757175-0c30e357eb84?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop'
            ]
        }
    },
    
    // Example 2: Update by product name
    {
        identifier: 'Vitamin C 1000mg Tablets', // Product name
        images: {
            main: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&h=600&fit=crop'
        }
    },
    
    // Example 3: Update by product ID
    {
        identifier: 123, // Product database ID
        images: {
            main: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
            additional: [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'
            ]
        }
    }
    
    // Add more products here following the same format:
    // {
    //     identifier: 'PROD001', // SKU, ID, or product name
    //     images: {
    //         main: 'https://your-main-image-url.jpg',
    //         additional: [
    //             'https://additional-image-1.jpg',
    //             'https://additional-image-2.jpg'
    //         ]
    //     }
    // }
];

class BatchCloudinaryUpdater {
    constructor() {
        this.updater = new CloudinaryProductUpdater();
        this.results = {
            successful: [],
            failed: [],
            summary: {
                total: 0,
                success: 0,
                failed: 0,
                totalUploads: 0,
                totalErrors: 0
            }
        };
    }

    /**
     * Process all batch updates
     */
    async processBatchUpdates() {
        try {
            console.log('\n🚀 BATCH CLOUDINARY IMAGE UPDATER');
            console.log('='.repeat(50));

            if (imageUpdates.length === 0) {
                console.log('❌ No image updates specified!');
                console.log('📝 Please edit this file and add products to the imageUpdates array.');
                this.showExampleFormat();
                return;
            }

            // Check if using example data
            const hasExampleData = imageUpdates.some(update => 
                update.identifier === 'HEALTH001' || 
                update.identifier === 'Vitamin C 1000mg Tablets' ||
                update.identifier === 123
            );

            if (hasExampleData) {
                console.log('⚠️ WARNING: You are using example data!');
                console.log('📝 Please replace the example products with your actual products.');
                console.log('🛑 Proceeding in 5 seconds... Press Ctrl+C to cancel.\n');
                
                await this.countdown(5);
            }

            console.log(`📦 Processing ${imageUpdates.length} products...`);
            this.results.summary.total = imageUpdates.length;

            for (let i = 0; i < imageUpdates.length; i++) {
                const update = imageUpdates[i];
                
                console.log(`\n[${i + 1}/${imageUpdates.length}] Processing: ${update.identifier}`);
                console.log('─'.repeat(40));

                try {
                    const result = await this.updater.updateProductImages(update.identifier, update.images);
                    
                    if (result.success) {
                        this.results.successful.push(result);
                        this.results.summary.success++;
                        this.results.summary.totalUploads += result.uploads.length;
                        this.results.summary.totalErrors += result.errors.length;
                        
                        console.log(`✅ SUCCESS: ${result.product.name}`);
                        console.log(`📤 Uploaded: ${result.uploads.length} images`);
                        
                    } else {
                        this.results.failed.push(result);
                        this.results.summary.failed++;
                        
                        console.log(`❌ FAILED: ${result.error}`);
                    }

                } catch (error) {
                    const errorResult = {
                        identifier: update.identifier,
                        error: error.message,
                        success: false
                    };
                    
                    this.results.failed.push(errorResult);
                    this.results.summary.failed++;
                    
                    console.log(`❌ ERROR: ${error.message}`);
                }

                // Add delay between updates to avoid rate limits
                if (i < imageUpdates.length - 1) {
                    console.log('⏱️ Waiting 2 seconds...');
                    await this.delay(2000);
                }
            }

            this.printFinalResults();

        } catch (error) {
            console.error('❌ Fatal error in batch processing:', error.message);
        }
    }

    /**
     * Print comprehensive results
     */
    printFinalResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 BATCH UPDATE RESULTS');
        console.log('='.repeat(60));
        
        console.log(`📦 Total Products: ${this.results.summary.total}`);
        console.log(`✅ Successful: ${this.results.summary.success}`);
        console.log(`❌ Failed: ${this.results.summary.failed}`);
        console.log(`📤 Total Images Uploaded: ${this.results.summary.totalUploads}`);
        console.log(`⚠️ Upload Errors: ${this.results.summary.totalErrors}`);
        
        const successRate = this.results.summary.total > 0 
            ? ((this.results.summary.success / this.results.summary.total) * 100).toFixed(1)
            : 0;
        console.log(`📈 Success Rate: ${successRate}%`);

        // Show successful updates
        if (this.results.successful.length > 0) {
            console.log('\n✅ SUCCESSFUL UPDATES:');
            console.log('─'.repeat(30));
            this.results.successful.forEach((result, index) => {
                console.log(`${index + 1}. ${result.product.name} (${result.product.sku})`);
                console.log(`   📤 Images: ${result.uploads.length}`);
                console.log(`   🔗 Main: ${result.uploads.find(u => u.type === 'main')?.cloudinary || 'N/A'}`);
                
                const additionalCount = result.uploads.filter(u => u.type === 'additional').length;
                if (additionalCount > 0) {
                    console.log(`   📷 Additional: ${additionalCount} images`);
                }
                console.log('');
            });
        }

        // Show failures
        if (this.results.failed.length > 0) {
            console.log('❌ FAILED UPDATES:');
            console.log('─'.repeat(20));
            this.results.failed.forEach((result, index) => {
                console.log(`${index + 1}. ${result.identifier || result.product?.name || 'Unknown'}`);
                console.log(`   Error: ${result.error}`);
                console.log('');
            });
        }

        // Final summary
        console.log('='.repeat(60));
        if (this.results.summary.success > 0) {
            console.log('🎉 Batch update completed!');
            console.log('💡 Your products now have optimized Cloudinary images.');
            console.log('🌐 Images are served through Cloudinary\'s global CDN.');
        } else {
            console.log('😔 No products were successfully updated.');
            console.log('💡 Check the errors above and try again.');
        }
        console.log('='.repeat(60));
    }

    /**
     * Show example format for updates
     */
    showExampleFormat() {
        console.log('\n📖 EXAMPLE FORMAT:');
        console.log('='.repeat(40));
        console.log(`
const imageUpdates = [
    {
        identifier: 'HEALTH001',  // Product SKU
        images: {
            main: 'https://example.com/main-image.jpg',
            additional: [
                'https://example.com/additional-1.jpg',
                'https://example.com/additional-2.jpg'
            ]
        }
    },
    {
        identifier: 'Product Name',  // Or product name
        images: {
            main: 'https://example.com/another-image.jpg'
        }
    },
    {
        identifier: 123,  // Or database ID
        images: {
            main: 'https://example.com/third-image.jpg'
        }
    }
];
        `);
    }

    /**
     * Get products that need images for reference
     */
    async listProductsNeedingImages() {
        try {
            console.log('\n🔍 PRODUCTS THAT NEED IMAGES:');
            console.log('='.repeat(40));
            
            const { Op } = require('sequelize');
            const products = await Product.findAll({
                where: {
                    [Op.or]: [
                        { image: null },
                        { image: '' }
                    ]
                },
                attributes: ['id', 'name', 'brand', 'sku', 'category'],
                order: [['name', 'ASC']],
                limit: 15
            });

            if (products.length === 0) {
                console.log('✅ All products have images!');
                return;
            }

            console.log(`Found ${products.length} products without images:\n`);

            products.forEach((product, index) => {
                console.log(`${index + 1}. "${product.name}"`);
                console.log(`   SKU: ${product.sku}`);
                console.log(`   Brand: ${product.brand}`);
                console.log(`   Category: ${product.category}`);
                console.log('');
            });

            console.log('💡 Copy the product names or SKUs above to use in your imageUpdates array.');

        } catch (error) {
            console.error('❌ Error listing products:', error.message);
        }
    }

    /**
     * Utility functions
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async countdown(seconds) {
        for (let i = seconds; i > 0; i--) {
            process.stdout.write(`\r⏱️ Starting in ${i} seconds...`);
            await this.delay(1000);
        }
        console.log('\n');
    }
}

// Main execution function
async function main() {
    const batchUpdater = new BatchCloudinaryUpdater();
    const args = process.argv.slice(2);

    try {
        if (args.includes('--help') || args.includes('-h')) {
            console.log(`
📖 BATCH CLOUDINARY IMAGE UPDATER HELP
======================================

Usage:
  node batch-cloudinary-updater.js          - Run batch updates
  node batch-cloudinary-updater.js --list   - List products needing images
  node batch-cloudinary-updater.js --example - Show example format
  node batch-cloudinary-updater.js --help   - Show this help

How to use:
1. Edit this file and modify the 'imageUpdates' array
2. Add your products with their image URLs
3. Run the script to upload all images to Cloudinary
4. Images will be automatically optimized and served via CDN

Features:
• Uploads images to Cloudinary CDN
• Automatic optimization (WebP/AVIF conversion)
• Thumbnail generation
• Error handling and retry logic
• Progress tracking
• Comprehensive reporting
            `);
            return;
        }

        if (args.includes('--list')) {
            await batchUpdater.listProductsNeedingImages();
            return;
        }

        if (args.includes('--example')) {
            batchUpdater.showExampleFormat();
            return;
        }

        // Run batch updates
        await batchUpdater.processBatchUpdates();

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

// Export for use in other files
module.exports = { BatchCloudinaryUpdater, imageUpdates };

// Run if called directly
if (require.main === module) {
    main();
}