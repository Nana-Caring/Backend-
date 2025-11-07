const CloudinaryProductUpdater = require('./cloudinary-product-updater');
const { Product } = require('./models');

/**
 * Update ALL Products with Real Cloudinary Images
 * 
 * This script will:
 * 1. Fetch all products from database
 * 2. Generate appropriate image URLs based on product type
 * 3. Upload images to Cloudinary
 * 4. Update all products with optimized Cloudinary URLs
 */

class UpdateAllProductImages {
    constructor() {
        this.updater = new CloudinaryProductUpdater();
        this.imageMap = this.createImageMap();
        this.results = {
            total: 0,
            successful: 0,
            failed: 0,
            errors: []
        };
    }

    /**
     * Create mapping of product categories/types to appropriate images
     */
    createImageMap() {
        return {
            // Healthcare Products
            healthcare: {
                vitamins: [
                    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop'
                ],
                medicine: [
                    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1559757175-0c30e357eb84?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop'
                ],
                skincare: [
                    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1620916297397-fd81e7350518?w=800&h=600&fit=crop'
                ],
                firstaid: [
                    'https://images.unsplash.com/photo-1603398938425-bcb8e2a42a1b?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop'
                ],
                pregnancy: [
                    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop'
                ]
            },
            
            // Education Products
            education: {
                books: [
                    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop'
                ],
                stationery: [
                    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1517525829407-b2c6e78997af?w=800&h=600&fit=crop'
                ],
                tablets: [
                    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop'
                ]
            },
            
            // Groceries
            groceries: {
                bread: [
                    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800&h=600&fit=crop'
                ],
                milk: [
                    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=600&fit=crop'
                ],
                snacks: [
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&h=600&fit=crop'
                ],
                cereals: [
                    'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop'
                ],
                fruits: [
                    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=600&fit=crop'
                ]
            },
            
            // Entertainment & Toys
            entertainment: {
                games: [
                    'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
                ],
                toys: [
                    'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=600&fit=crop'
                ],
                puzzles: [
                    'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
                ]
            },
            
            // Personal Care & Other
            other: {
                toothpaste: [
                    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop'
                ],
                soap: [
                    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
                ],
                sanitizer: [
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1603398938425-bcb8e2a42a1b?w=800&h=600&fit=crop'
                ]
            }
        };
    }

    /**
     * Get appropriate image URL based on product name and category
     */
    getImageForProduct(product) {
        const name = product.name.toLowerCase();
        const brand = product.brand.toLowerCase();
        
        // Healthcare products
        if (name.includes('vitamin') || name.includes('folic') || name.includes('calcium')) {
            return this.getRandomImage(this.imageMap.healthcare.vitamins);
        }
        if (name.includes('tablet') && (name.includes('pain') || name.includes('disprin'))) {
            return this.getRandomImage(this.imageMap.healthcare.medicine);
        }
        if (name.includes('oil') || name.includes('ointment') || name.includes('beauty bar') || name.includes('toothpaste')) {
            return this.getRandomImage(this.imageMap.healthcare.skincare);
        }
        if (name.includes('first aid') || name.includes('thermometer') || name.includes('sanitizer')) {
            return this.getRandomImage(this.imageMap.healthcare.firstaid);
        }
        if (name.includes('pregnancy') || name.includes('nappy')) {
            return this.getRandomImage(this.imageMap.healthcare.pregnancy);
        }
        
        // Education products
        if (name.includes('tablet') && (name.includes('learning') || name.includes('educational'))) {
            return this.getRandomImage(this.imageMap.education.tablets);
        }
        if (name.includes('crayon') || name.includes('coloring') || name.includes('marker')) {
            return this.getRandomImage(this.imageMap.education.stationery);
        }
        if (name.includes('book') || name.includes('reading')) {
            return this.getRandomImage(this.imageMap.education.books);
        }
        
        // Groceries
        if (name.includes('bread') || name.includes('loaf')) {
            return this.getRandomImage(this.imageMap.groceries.bread);
        }
        if (name.includes('milk')) {
            return this.getRandomImage(this.imageMap.groceries.milk);
        }
        if (name.includes('cereal')) {
            return this.getRandomImage(this.imageMap.groceries.cereals);
        }
        if (name.includes('snack') || name.includes('biscuit')) {
            return this.getRandomImage(this.imageMap.groceries.snacks);
        }
        
        // Entertainment
        if (name.includes('game') || name.includes('board')) {
            return this.getRandomImage(this.imageMap.entertainment.games);
        }
        if (name.includes('building') || name.includes('blocks') || name.includes('lego')) {
            return this.getRandomImage(this.imageMap.entertainment.toys);
        }
        if (name.includes('puzzle')) {
            return this.getRandomImage(this.imageMap.entertainment.puzzles);
        }
        
        // Personal care
        if (name.includes('toothpaste')) {
            return this.getRandomImage(this.imageMap.other.toothpaste);
        }
        if (name.includes('soap') || name.includes('beauty bar')) {
            return this.getRandomImage(this.imageMap.other.soap);
        }
        if (name.includes('sanitizer')) {
            return this.getRandomImage(this.imageMap.other.sanitizer);
        }
        
        // Default fallback based on category
        if (product.category === 'Healthcare') {
            return this.getRandomImage(this.imageMap.healthcare.vitamins);
        }
        if (product.category === 'Education') {
            return this.getRandomImage(this.imageMap.education.books);
        }
        if (product.category === 'Groceries') {
            return this.getRandomImage(this.imageMap.groceries.snacks);
        }
        if (product.category === 'Entertainment') {
            return this.getRandomImage(this.imageMap.entertainment.games);
        }
        
        // Ultimate fallback
        return this.getRandomImage(this.imageMap.healthcare.vitamins);
    }

    /**
     * Get random image from array
     */
    getRandomImage(imageArray) {
        return imageArray[Math.floor(Math.random() * imageArray.length)];
    }

    /**
     * Update all products
     */
    async updateAllProducts() {
        try {
            console.log('\n🚀 UPDATING ALL PRODUCTS WITH CLOUDINARY IMAGES');
            console.log('='.repeat(55));
            
            // Fetch all products
            console.log('\n📦 Fetching all products from database...');
            const products = await Product.findAll({
                attributes: ['id', 'name', 'brand', 'sku', 'category', 'image'],
                order: [['name', 'ASC']]
            });

            this.results.total = products.length;
            console.log(`✅ Found ${products.length} products to update\n`);

            if (products.length === 0) {
                console.log('❌ No products found in database!');
                return;
            }

            // Process each product
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                
                console.log(`[${i + 1}/${products.length}] Processing: ${product.name}`);
                console.log(`   SKU: ${product.sku} | Category: ${product.category}`);

                try {
                    // Get appropriate image for this product
                    const imageUrl = this.getImageForProduct(product);
                    
                    // Generate additional images (2-3 per product)
                    const additionalImages = [];
                    const categoryImages = this.getCategoryImages(product.category);
                    
                    // Add 1-2 additional images
                    for (let j = 0; j < Math.floor(Math.random() * 2) + 1; j++) {
                        const additionalImage = this.getRandomImage(categoryImages);
                        if (additionalImage !== imageUrl && !additionalImages.includes(additionalImage)) {
                            additionalImages.push(additionalImage);
                        }
                    }

                    const images = {
                        main: imageUrl,
                        additional: additionalImages
                    };

                    console.log(`   📸 Main: ${imageUrl.substring(0, 50)}...`);
                    console.log(`   📷 Additional: ${additionalImages.length} images`);

                    // Update product with Cloudinary
                    const result = await this.updater.updateProductImages(product.id, images);

                    if (result.success) {
                        console.log(`   ✅ SUCCESS: Uploaded ${result.uploads.length} images`);
                        this.results.successful++;
                    } else {
                        console.log(`   ❌ FAILED: ${result.error}`);
                        this.results.failed++;
                        this.results.errors.push({
                            product: product.name,
                            sku: product.sku,
                            error: result.error
                        });
                    }

                } catch (error) {
                    console.log(`   ❌ ERROR: ${error.message}`);
                    this.results.failed++;
                    this.results.errors.push({
                        product: product.name,
                        sku: product.sku,
                        error: error.message
                    });
                }

                // Progress indicator
                const percentage = ((i + 1) / products.length * 100).toFixed(1);
                console.log(`   📊 Progress: ${percentage}%`);
                
                // Small delay to avoid rate limits
                if (i < products.length - 1) {
                    console.log('   ⏱️ Waiting 2 seconds...\n');
                    await this.delay(2000);
                } else {
                    console.log('');
                }
            }

            this.printFinalResults();

        } catch (error) {
            console.error('❌ Fatal error updating all products:', error.message);
        }
    }

    /**
     * Get category-appropriate images
     */
    getCategoryImages(category) {
        switch (category) {
            case 'Healthcare':
                return [
                    ...this.imageMap.healthcare.vitamins,
                    ...this.imageMap.healthcare.medicine,
                    ...this.imageMap.healthcare.skincare
                ];
            case 'Education':
                return [
                    ...this.imageMap.education.books,
                    ...this.imageMap.education.stationery,
                    ...this.imageMap.education.tablets
                ];
            case 'Groceries':
                return [
                    ...this.imageMap.groceries.bread,
                    ...this.imageMap.groceries.milk,
                    ...this.imageMap.groceries.snacks,
                    ...this.imageMap.groceries.cereals
                ];
            case 'Entertainment':
                return [
                    ...this.imageMap.entertainment.games,
                    ...this.imageMap.entertainment.toys,
                    ...this.imageMap.entertainment.puzzles
                ];
            default:
                return [
                    ...this.imageMap.other.toothpaste,
                    ...this.imageMap.other.soap,
                    ...this.imageMap.other.sanitizer
                ];
        }
    }

    /**
     * Print final results
     */
    printFinalResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 FINAL UPDATE RESULTS');
        console.log('='.repeat(60));
        
        console.log(`📦 Total Products: ${this.results.total}`);
        console.log(`✅ Successfully Updated: ${this.results.successful}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        
        const successRate = this.results.total > 0 
            ? ((this.results.successful / this.results.total) * 100).toFixed(1)
            : 0;
        console.log(`📈 Success Rate: ${successRate}%`);

        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORS ENCOUNTERED:');
            console.log('─'.repeat(30));
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.product} (${error.sku})`);
                console.log(`   Error: ${error.error}`);
                console.log('');
            });
        }

        console.log('='.repeat(60));
        
        if (this.results.successful > 0) {
            console.log('🎉 BATCH UPDATE COMPLETED SUCCESSFULLY!');
            console.log('');
            console.log('✨ Benefits of your new Cloudinary images:');
            console.log('  • 📱 Automatically optimized for all devices');
            console.log('  • 🌐 Served through global CDN for fast loading');
            console.log('  • 🔄 Auto-converts to WebP/AVIF for smaller files');
            console.log('  • 📐 Dynamic resizing based on user\'s screen');
            console.log('  • ⚡ 2-3x faster loading times');
            console.log('');
            console.log('💡 Your products now have professional, optimized images!');
        } else {
            console.log('😔 No products were successfully updated.');
            console.log('💡 Please check the errors above and try again.');
        }
        
        console.log('='.repeat(60));
    }

    /**
     * Utility delay function
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Main execution
async function main() {
    const updater = new UpdateAllProductImages();
    
    try {
        console.log('\n🌟 CLOUDINARY BULK PRODUCT UPDATER');
        console.log('==================================');
        console.log('This will update ALL products in your database with optimized Cloudinary images.');
        console.log('Each product will get appropriate images based on its category and name.');
        
        const args = process.argv.slice(2);
        
        if (args.includes('--help') || args.includes('-h')) {
            console.log(`
📖 USAGE:
  node update-all-products.js          - Update all products
  node update-all-products.js --help   - Show this help

🎯 WHAT THIS DOES:
  • Fetches all products from your database
  • Analyzes each product's name and category
  • Selects appropriate high-quality images from Unsplash
  • Uploads images to your Cloudinary account
  • Updates products with optimized Cloudinary URLs
  • Adds 1-3 additional images per product

⚡ FEATURES:
  • Smart image matching based on product type
  • Automatic optimization (WebP/AVIF conversion)
  • Global CDN delivery
  • Thumbnail generation
  • Error handling and progress tracking
            `);
            return;
        }

        // Confirmation prompt
        console.log('\n⚠️ WARNING: This will update ALL products in your database!');
        console.log('📝 Make sure you have a backup of your database.');
        console.log('🚀 Proceeding in 10 seconds... Press Ctrl+C to cancel.\n');
        
        // Countdown
        for (let i = 10; i > 0; i--) {
            process.stdout.write(`\r⏱️ Starting in ${i} seconds...`);
            await updater.delay(1000);
        }
        console.log('\n\n🚀 Starting bulk update...\n');

        await updater.updateAllProducts();

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = UpdateAllProductImages;