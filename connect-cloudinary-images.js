const { cloudinary } = require('./config/cloudinary');
const { Product } = require('./models');

/**
 * Connect Existing Cloudinary Images to Products
 * 
 * This script helps you:
 * 1. List images already uploaded to Cloudinary
 * 2. Match them with your products
 * 3. Update product URLs with Cloudinary links
 */

class CloudinaryImageConnector {
    constructor() {
        this.cloudinaryImages = [];
        this.products = [];
        this.matches = [];
    }

    /**
     * Fetch all images from Cloudinary
     */
    async fetchCloudinaryImages() {
        try {
            console.log('🔍 Fetching images from Cloudinary...\n');
            
            // Get images from the nana-products folder
            const result = await cloudinary.search
                .expression('folder:nana-products OR folder:""') // Search in nana-products folder or root
                .sort_by([['created_at', 'desc']])
                .max_results(100)
                .execute();

            this.cloudinaryImages = result.resources;
            
            console.log(`✅ Found ${this.cloudinaryImages.length} images in Cloudinary:`);
            console.log('='.repeat(60));
            
            this.cloudinaryImages.forEach((image, index) => {
                console.log(`${index + 1}. ${image.public_id}`);
                console.log(`   URL: ${image.secure_url}`);
                console.log(`   Size: ${Math.round(image.bytes / 1024)}KB`);
                console.log(`   Format: ${image.format}`);
                console.log(`   Uploaded: ${new Date(image.created_at).toLocaleDateString()}`);
                console.log('');
            });

            return this.cloudinaryImages;

        } catch (error) {
            console.error('❌ Error fetching Cloudinary images:', error.message);
            return [];
        }
    }

    /**
     * Fetch all products from database
     */
    async fetchProducts() {
        try {
            console.log('\n📦 Fetching products from database...\n');
            
            this.products = await Product.findAll({
                attributes: ['id', 'name', 'brand', 'sku', 'category', 'image'],
                order: [['name', 'ASC']]
            });

            console.log(`✅ Found ${this.products.length} products:`);
            console.log('='.repeat(60));
            
            this.products.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   SKU: ${product.sku}`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Current Image: ${product.image ? 'Has image' : 'No image'}`);
                console.log('');
            });

            return this.products;

        } catch (error) {
            console.error('❌ Error fetching products:', error.message);
            return [];
        }
    }

    /**
     * Interactive matching process
     */
    async interactiveMatching() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (question) => {
            return new Promise(resolve => {
                rl.question(question, resolve);
            });
        };

        try {
            console.log('\n🎯 INTERACTIVE IMAGE MATCHING');
            console.log('=============================\n');
            console.log('I\'ll help you match your Cloudinary images with products.\n');

            for (const product of this.products) {
                console.log(`\n📦 Product: ${product.name}`);
                console.log(`   SKU: ${product.sku}`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Current Image: ${product.image || 'None'}\n`);

                console.log('Available Cloudinary Images:');
                this.cloudinaryImages.forEach((image, index) => {
                    console.log(`${index + 1}. ${image.public_id}`);
                    console.log(`   URL: ${image.secure_url}`);
                });

                const choice = await ask(`\nSelect image for "${product.name}" (1-${this.cloudinaryImages.length}) or press Enter to skip: `);
                
                if (choice && !isNaN(choice)) {
                    const imageIndex = parseInt(choice) - 1;
                    if (imageIndex >= 0 && imageIndex < this.cloudinaryImages.length) {
                        const selectedImage = this.cloudinaryImages[imageIndex];
                        
                        this.matches.push({
                            product: product,
                            image: selectedImage,
                            newUrl: selectedImage.secure_url
                        });

                        console.log(`✅ Matched "${product.name}" with "${selectedImage.public_id}"`);
                    }
                } else {
                    console.log('⏭️ Skipped');
                }

                const continueChoice = await ask('Continue matching? (y/n): ');
                if (continueChoice.toLowerCase() === 'n') {
                    break;
                }
            }

            rl.close();

        } catch (error) {
            console.error('❌ Error in interactive matching:', error.message);
        }
    }

    /**
     * Auto-match images based on naming patterns
     */
    autoMatchImages() {
        console.log('\n🤖 AUTO-MATCHING IMAGES');
        console.log('=======================\n');

        for (const product of this.products) {
            const productName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const productSku = product.sku.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Try to find matching image by name patterns
            const matchingImage = this.cloudinaryImages.find(image => {
                const imageName = image.public_id.toLowerCase().replace(/[^a-z0-9]/g, '');
                
                return (
                    imageName.includes(productName.substring(0, 10)) ||
                    imageName.includes(productSku) ||
                    imageName.includes(product.brand.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
                    this.isRelatedProduct(product, image)
                );
            });

            if (matchingImage) {
                this.matches.push({
                    product: product,
                    image: matchingImage,
                    newUrl: matchingImage.secure_url
                });

                console.log(`✅ Auto-matched: ${product.name} → ${matchingImage.public_id}`);
            } else {
                console.log(`⚠️ No match found for: ${product.name}`);
            }
        }

        console.log(`\n📊 Auto-matching complete: ${this.matches.length}/${this.products.length} matched`);
    }

    /**
     * Check if product and image are related
     */
    isRelatedProduct(product, image) {
        const productCategory = product.category.toLowerCase();
        const imageName = image.public_id.toLowerCase();
        const productName = product.name.toLowerCase();

        // Healthcare products
        if (productCategory === 'healthcare') {
            return imageName.includes('vitamin') || 
                   imageName.includes('medicine') || 
                   imageName.includes('health') ||
                   imageName.includes('tablet') ||
                   imageName.includes('pill');
        }

        // Education products
        if (productCategory === 'education') {
            return imageName.includes('book') ||
                   imageName.includes('education') ||
                   imageName.includes('learn') ||
                   imageName.includes('school');
        }

        // Groceries
        if (productCategory === 'groceries') {
            return imageName.includes('food') ||
                   imageName.includes('grocery') ||
                   imageName.includes('bread') ||
                   imageName.includes('milk');
        }

        // Entertainment
        if (productCategory === 'entertainment') {
            return imageName.includes('game') ||
                   imageName.includes('toy') ||
                   imageName.includes('puzzle') ||
                   imageName.includes('play');
        }

        return false;
    }

    /**
     * Apply matches to database
     */
    async applyMatches() {
        if (this.matches.length === 0) {
            console.log('❌ No matches to apply!');
            return;
        }

        console.log(`\n💾 APPLYING ${this.matches.length} MATCHES TO DATABASE`);
        console.log('='.repeat(50));

        let successCount = 0;
        let errorCount = 0;

        for (const match of this.matches) {
            try {
                await match.product.update({
                    image: match.newUrl,
                    updatedAt: new Date()
                });

                console.log(`✅ Updated: ${match.product.name}`);
                console.log(`   New URL: ${match.newUrl}`);
                successCount++;

            } catch (error) {
                console.log(`❌ Failed to update ${match.product.name}: ${error.message}`);
                errorCount++;
            }
        }

        console.log(`\n📊 RESULTS:`);
        console.log(`✅ Successfully updated: ${successCount} products`);
        console.log(`❌ Failed updates: ${errorCount} products`);
        console.log(`📈 Success rate: ${((successCount / this.matches.length) * 100).toFixed(1)}%`);
    }

    /**
     * Show summary of matches
     */
    showMatchSummary() {
        if (this.matches.length === 0) {
            console.log('❌ No matches found!');
            return;
        }

        console.log(`\n📋 MATCH SUMMARY (${this.matches.length} matches):`);
        console.log('='.repeat(60));

        this.matches.forEach((match, index) => {
            console.log(`${index + 1}. ${match.product.name}`);
            console.log(`   SKU: ${match.product.sku}`);
            console.log(`   Image: ${match.image.public_id}`);
            console.log(`   URL: ${match.newUrl}`);
            console.log('');
        });
    }

    /**
     * Generate optimized URLs for different sizes
     */
    generateOptimizedUrls(publicId) {
        const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
        
        return {
            original: `${baseUrl}/${publicId}`,
            large: `${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/${publicId}`,
            medium: `${baseUrl}/w_400,h_300,c_fill,q_auto,f_auto/${publicId}`,
            small: `${baseUrl}/w_200,h_150,c_fill,q_auto,f_auto/${publicId}`,
            thumbnail: `${baseUrl}/w_100,h_100,c_fill,q_auto,f_auto/${publicId}`
        };
    }

    /**
     * List unused Cloudinary images
     */
    showUnusedImages() {
        const usedImages = this.matches.map(match => match.image.public_id);
        const unusedImages = this.cloudinaryImages.filter(image => 
            !usedImages.includes(image.public_id)
        );

        if (unusedImages.length > 0) {
            console.log(`\n📷 UNUSED CLOUDINARY IMAGES (${unusedImages.length}):`);
            console.log('='.repeat(40));
            
            unusedImages.forEach((image, index) => {
                console.log(`${index + 1}. ${image.public_id}`);
                console.log(`   URL: ${image.secure_url}`);
            });
            
            console.log('\n💡 These images are available for manual assignment.');
        } else {
            console.log('\n✅ All Cloudinary images have been matched!');
        }
    }
}

// Main execution function
async function main() {
    const connector = new CloudinaryImageConnector();
    const args = process.argv.slice(2);

    try {
        if (args.includes('--help') || args.includes('-h')) {
            console.log(`
📖 CLOUDINARY IMAGE CONNECTOR HELP
==================================

Usage:
  node connect-cloudinary-images.js                - Interactive matching
  node connect-cloudinary-images.js --auto        - Auto-match images
  node connect-cloudinary-images.js --list        - List Cloudinary images
  node connect-cloudinary-images.js --products    - List products
  node connect-cloudinary-images.js --help        - Show this help

Commands:
  Interactive Mode: Match images manually with products
  Auto Mode: Automatically match based on naming patterns
  List Mode: View all images in your Cloudinary account
            `);
            return;
        }

        console.log('\n🌟 CLOUDINARY IMAGE CONNECTOR');
        console.log('=============================');

        // Fetch data
        await connector.fetchCloudinaryImages();
        await connector.fetchProducts();

        if (args.includes('--list')) {
            console.log('\n✅ Cloudinary images listed above.');
            return;
        }

        if (args.includes('--products')) {
            console.log('\n✅ Products listed above.');
            return;
        }

        if (args.includes('--auto')) {
            // Auto-match mode
            connector.autoMatchImages();
            connector.showMatchSummary();
            
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            const confirm = await new Promise(resolve => {
                rl.question('\n💾 Apply these matches to database? (y/n): ', resolve);
            });
            
            rl.close();
            
            if (confirm.toLowerCase() === 'y') {
                await connector.applyMatches();
            } else {
                console.log('❌ Matches not applied.');
            }
            
        } else {
            // Interactive mode (default)
            await connector.interactiveMatching();
            connector.showMatchSummary();
            
            if (connector.matches.length > 0) {
                await connector.applyMatches();
            }
        }

        connector.showUnusedImages();

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = CloudinaryImageConnector;