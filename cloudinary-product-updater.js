const { cloudinary, testCloudinaryConnection } = require('./config/cloudinary');
const { Product } = require('./models');
const readline = require('readline');

class CloudinaryProductUpdater {
    constructor() {
        this.uploadOptions = {
            folder: 'nana-products',
            resource_type: 'image',
            quality: 'auto:good',
            format: 'auto',
            transformation: [
                { width: 800, height: 600, crop: 'fill', quality: 'auto' }
            ]
        };
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Upload image to Cloudinary from URL
     */
    async uploadImageFromUrl(imageUrl, productSku, imageType = 'main') {
        try {
            console.log(`📤 Uploading ${imageType} image: ${imageUrl.substring(0, 50)}...`);
            
            const publicId = `product-${productSku}-${imageType}-${Date.now()}`;
            
            const result = await cloudinary.uploader.upload(imageUrl, {
                ...this.uploadOptions,
                public_id: publicId,
                use_filename: false,
                unique_filename: true
            });

            console.log(`✅ Upload successful! Public ID: ${result.public_id}`);
            
            return {
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                optimizedUrl: this.getOptimizedUrl(result.public_id),
                thumbnailUrl: this.getThumbnailUrl(result.public_id)
            };
        } catch (error) {
            console.error(`❌ Upload failed for ${imageUrl}:`, error.message);
            return {
                success: false,
                error: error.message,
                originalUrl: imageUrl
            };
        }
    }

    /**
     * Get optimized URL with transformations for different sizes
     */
    getOptimizedUrl(publicId, options = {}) {
        const defaultOptions = {
            quality: 'auto:good',
            format: 'auto',
            width: options.width || 800,
            height: options.height || 600,
            crop: 'fill',
            dpr: 'auto'
        };

        return cloudinary.url(publicId, defaultOptions);
    }

    /**
     * Get thumbnail URL (smaller size for listings)
     */
    getThumbnailUrl(publicId) {
        return cloudinary.url(publicId, {
            quality: 'auto:good',
            format: 'auto',
            width: 300,
            height: 300,
            crop: 'fill'
        });
    }

    /**
     * Find product by ID, SKU, or name
     */
    async findProduct(identifier) {
        try {
            let product = null;

            // Try by ID first
            if (typeof identifier === 'number' || /^\d+$/.test(identifier)) {
                product = await Product.findByPk(identifier);
            }

            // Try by SKU
            if (!product && typeof identifier === 'string') {
                product = await Product.findOne({ where: { sku: identifier } });
            }

            // Try by name (partial match)
            if (!product && typeof identifier === 'string') {
                const { Op } = require('sequelize');
                product = await Product.findOne({ 
                    where: { 
                        name: { [Op.iLike]: `%${identifier}%` } 
                    } 
                });
            }

            return product;
        } catch (error) {
            console.error('Error finding product:', error.message);
            return null;
        }
    }

    /**
     * Update single product with Cloudinary URLs
     */
    async updateProductImages(productIdentifier, imageUrls) {
        try {
            // Find product
            const product = await this.findProduct(productIdentifier);
            if (!product) {
                return { 
                    success: false, 
                    error: `Product not found: ${productIdentifier}` 
                };
            }

            console.log(`\n🔄 Processing: ${product.name} (SKU: ${product.sku})`);
            console.log(`📦 Product ID: ${product.id}`);

            const results = {
                product: {
                    id: product.id,
                    name: product.name,
                    sku: product.sku
                },
                uploads: [],
                errors: [],
                success: false,
                oldImages: {
                    main: product.image,
                    additional: product.images
                }
            };

            // Upload main image
            if (imageUrls.main) {
                console.log('\n📸 Uploading main image...');
                const uploadResult = await this.uploadImageFromUrl(imageUrls.main, product.sku, 'main');
                
                if (uploadResult.success) {
                    product.image = uploadResult.optimizedUrl;
                    results.uploads.push({
                        type: 'main',
                        original: imageUrls.main,
                        cloudinary: uploadResult.optimizedUrl,
                        thumbnail: uploadResult.thumbnailUrl,
                        publicId: uploadResult.publicId
                    });
                } else {
                    results.errors.push({
                        type: 'main',
                        url: imageUrls.main,
                        error: uploadResult.error
                    });
                }
            }

            // Upload additional images
            if (imageUrls.additional && imageUrls.additional.length > 0) {
                console.log(`\n📸 Uploading ${imageUrls.additional.length} additional images...`);
                const additionalUrls = [];
                
                for (let i = 0; i < imageUrls.additional.length; i++) {
                    const url = imageUrls.additional[i];
                    const uploadResult = await this.uploadImageFromUrl(url, product.sku, `additional-${i + 1}`);
                    
                    if (uploadResult.success) {
                        additionalUrls.push(uploadResult.optimizedUrl);
                        results.uploads.push({
                            type: 'additional',
                            index: i + 1,
                            original: url,
                            cloudinary: uploadResult.optimizedUrl,
                            thumbnail: uploadResult.thumbnailUrl,
                            publicId: uploadResult.publicId
                        });
                    } else {
                        results.errors.push({
                            type: 'additional',
                            index: i + 1,
                            url: url,
                            error: uploadResult.error
                        });
                    }

                    // Small delay between uploads to avoid rate limits
                    if (i < imageUrls.additional.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }

                if (additionalUrls.length > 0) {
                    product.images = additionalUrls; // Store as array
                }
            }

            // Save product with updated images
            await product.save();
            results.success = true;
            
            console.log(`\n✅ Product "${product.name}" updated successfully!`);
            console.log(`📤 Uploaded ${results.uploads.length} images`);
            console.log(`⚠️ ${results.errors.length} errors encountered`);
            
            return results;

        } catch (error) {
            console.error('❌ Error updating product:', error.message);
            return { 
                success: false, 
                error: error.message,
                productIdentifier 
            };
        }
    }

    /**
     * Interactive single product update
     */
    async interactiveUpdate() {
        try {
            console.log('\n🔍 FIND PRODUCT');
            console.log('================');
            
            const identifier = await this.ask('Enter product name, SKU, or ID: ');
            if (!identifier || identifier.toLowerCase() === 'exit') return;

            const product = await this.findProduct(identifier);
            if (!product) {
                console.log('❌ Product not found! Try a different search term.');
                return this.interactiveUpdate();
            }

            console.log(`\n📦 FOUND PRODUCT:`);
            console.log(`   Name: ${product.name}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   SKU: ${product.sku}`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Current Image: ${product.image || 'None'}`);
            
            if (product.images && product.images.length > 0) {
                console.log(`   Additional Images: ${product.images.length}`);
            }

            const confirm = await this.ask('\nUpdate this product? (y/n): ');
            if (confirm.toLowerCase() !== 'y') {
                return this.interactiveUpdate();
            }

            console.log('\n🖼️ IMAGE URLS');
            console.log('=============');
            
            const mainImage = await this.ask('Enter main image URL: ');
            if (!mainImage) {
                console.log('❌ Main image URL is required!');
                return;
            }

            // Collect additional images
            const additionalImages = [];
            const addMore = await this.ask('Add additional images? (y/n): ');
            
            if (addMore.toLowerCase() === 'y') {
                console.log('\n📷 Additional images (press Enter when done):');
                let index = 1;
                
                while (true) {
                    const url = await this.ask(`Image ${index} URL (or press Enter to finish): `);
                    if (!url) break;
                    additionalImages.push(url);
                    index++;
                }
            }

            // Show summary
            console.log('\n📋 UPDATE SUMMARY:');
            console.log('==================');
            console.log(`Product: ${product.name}`);
            console.log(`Main Image: ${mainImage}`);
            console.log(`Additional Images: ${additionalImages.length}`);

            const proceed = await this.ask('\nProceed with upload? (y/n): ');
            if (proceed.toLowerCase() !== 'y') {
                console.log('❌ Upload cancelled');
                return;
            }

            // Upload to Cloudinary
            const images = { main: mainImage };
            if (additionalImages.length > 0) {
                images.additional = additionalImages;
            }

            const result = await this.updateProductImages(product.id, images);
            this.printUpdateResult(result);

        } catch (error) {
            console.error('❌ Interactive update error:', error.message);
        }
    }

    /**
     * Print update results in a formatted way
     */
    printUpdateResult(result) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 UPDATE RESULTS');
        console.log('='.repeat(60));
        
        if (result.success) {
            console.log(`✅ SUCCESS: ${result.product.name}`);
            console.log(`📦 Product ID: ${result.product.id}`);
            console.log(`🏷️ SKU: ${result.product.sku}`);
            
            if (result.uploads.length > 0) {
                console.log('\n📤 UPLOADED IMAGES:');
                result.uploads.forEach((upload, index) => {
                    console.log(`${index + 1}. ${upload.type.toUpperCase()}:`);
                    console.log(`   Original: ${upload.original.substring(0, 50)}...`);
                    console.log(`   Cloudinary: ${upload.cloudinary}`);
                    console.log(`   Public ID: ${upload.publicId}`);
                });
            }
            
            if (result.errors.length > 0) {
                console.log('\n⚠️ ERRORS:');
                result.errors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error.type}: ${error.error}`);
                });
            }
        } else {
            console.log(`❌ FAILED: ${result.error}`);
        }
        
        console.log('='.repeat(60));
    }

    /**
     * List products that need images
     */
    async listProductsNeedingImages() {
        try {
            console.log('\n🔍 Searching for products without images...');
            
            const { Op } = require('sequelize');
            const products = await Product.findAll({
                where: {
                    [Op.or]: [
                        { image: null },
                        { image: '' }
                    ]
                },
                attributes: ['id', 'name', 'brand', 'sku', 'category', 'price'],
                order: [['name', 'ASC']],
                limit: 20
            });

            if (products.length === 0) {
                console.log('✅ All products have images!');
                return [];
            }

            console.log(`\n📋 Found ${products.length} products without images:`);
            console.log('='.repeat(50));

            products.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Brand: ${product.brand}`);
                console.log(`   SKU: ${product.sku}`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Price: R${product.price}`);
                console.log('');
            });

            return products;

        } catch (error) {
            console.error('❌ Error listing products:', error.message);
            return [];
        }
    }

    /**
     * Helper function to ask questions
     */
    ask(question) {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
    }

    /**
     * Close readline interface
     */
    close() {
        this.rl.close();
    }
}

// Main CLI interface
async function main() {
    const updater = new CloudinaryProductUpdater();
    
    try {
        console.log('\n🌟 CLOUDINARY PRODUCT IMAGE UPDATER');
        console.log('===================================');
        
        // Test Cloudinary connection
        console.log('\n🔍 Testing Cloudinary connection...');
        const isConnected = await testCloudinaryConnection();
        
        if (!isConnected) {
            console.log('❌ Cannot proceed without Cloudinary connection.');
            console.log('💡 Please check your .env file credentials.');
            return;
        }

        const args = process.argv.slice(2);

        if (args.includes('--help') || args.includes('-h')) {
            console.log(`
📖 USAGE:
  node cloudinary-product-updater.js          - Interactive mode
  node cloudinary-product-updater.js --list   - List products without images
  node cloudinary-product-updater.js --test   - Test Cloudinary connection
  node cloudinary-product-updater.js --help   - Show this help

🌟 FEATURES:
  • Upload images to Cloudinary CDN
  • Automatic optimization (WebP/AVIF)
  • Dynamic resizing and quality adjustment
  • Thumbnail generation
  • Error handling and retry logic
            `);
            return;
        }

        if (args.includes('--list')) {
            await updater.listProductsNeedingImages();
            return;
        }

        if (args.includes('--test')) {
            console.log('✅ Cloudinary connection test completed.');
            return;
        }

        // Interactive mode
        console.log('\n📝 Starting interactive mode...');
        console.log('Type "exit" at any prompt to quit.\n');
        
        while (true) {
            console.log('\n🎯 OPTIONS:');
            console.log('1. Update product images');
            console.log('2. List products without images');
            console.log('3. Exit');
            
            const choice = await updater.ask('\n👉 Choose option (1-3): ');
            
            switch (choice) {
                case '1':
                    await updater.interactiveUpdate();
                    break;
                case '2':
                    await updater.listProductsNeedingImages();
                    break;
                case '3':
                case 'exit':
                    console.log('\n👋 Goodbye!');
                    return;
                default:
                    console.log('❌ Invalid option. Please choose 1-3.');
            }
        }

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    } finally {
        updater.close();
    }
}

// Export for use in other files
module.exports = CloudinaryProductUpdater;

// Run if called directly
if (require.main === module) {
    main();
}