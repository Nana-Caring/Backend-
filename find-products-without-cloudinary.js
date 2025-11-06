require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./models');
const { Product } = db;

async function findProductsWithoutCloudinary() {
    try {
        console.log('🔍 FINDING PRODUCTS WITHOUT CLOUDINARY URLS');
        console.log('============================================');
        
        // Find products without Cloudinary images
        const productsWithoutCloudinary = await Product.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { image: null },
                    { image: '' },
                    {
                        image: {
                            [Sequelize.Op.notLike]: '%res.cloudinary.com%'
                        }
                    }
                ]
            },
            attributes: ['id', 'name', 'sku', 'category', 'brand', 'price', 'image'],
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        console.log(`📊 Found ${productsWithoutCloudinary.length} products without Cloudinary URLs\n`);

        if (productsWithoutCloudinary.length === 0) {
            console.log('🎉 All products already have Cloudinary URLs!');
            process.exit(0);
        }

        // Group by category
        const groupedProducts = {};
        productsWithoutCloudinary.forEach(product => {
            if (!groupedProducts[product.category]) {
                groupedProducts[product.category] = [];
            }
            groupedProducts[product.category].push(product);
        });

        // Display products by category
        Object.keys(groupedProducts).forEach(category => {
            console.log(`\n🏷️ ${category.toUpperCase()} (${groupedProducts[category].length} products):`);
            console.log('─'.repeat(50));
            
            groupedProducts[category].forEach((product, index) => {
                const imageStatus = product.image ? '📷 (has image)' : '❌ (no image)';
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   SKU: ${product.sku}`);
                console.log(`   Brand: ${product.brand || 'N/A'}`);
                console.log(`   Price: R${product.price}`);
                console.log(`   Status: ${imageStatus}`);
                if (product.image && !product.image.includes('res.cloudinary.com')) {
                    console.log(`   Current URL: ${product.image.substring(0, 60)}...`);
                }
                console.log('');
            });
        });

        // Summary statistics
        console.log('\n📊 SUMMARY BY CATEGORY:');
        console.log('========================');
        Object.keys(groupedProducts).forEach(category => {
            console.log(`${category}: ${groupedProducts[category].length} products`);
        });

        console.log(`\n💡 Total products needing Cloudinary upload: ${productsWithoutCloudinary.length}`);
        console.log('🚀 Ready to help you upload images for these products!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error finding products:', error);
        process.exit(1);
    }
}

findProductsWithoutCloudinary();