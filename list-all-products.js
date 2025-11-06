require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./models');
const { Product } = db;

async function listAllCurrentProducts() {
    try {
        console.log('📦 CURRENT PRODUCT INVENTORY');
        console.log('============================');
        
        // Get total count
        const totalProducts = await Product.count();
        console.log(`📊 Total Products: ${totalProducts}\n`);

        if (totalProducts === 0) {
            console.log('❌ No products found in database');
            process.exit(0);
        }

        // Get all products
        const products = await Product.findAll({
            attributes: ['id', 'name', 'sku', 'category', 'brand', 'price', 'image'],
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        // Group by category
        const groupedProducts = {};
        products.forEach(product => {
            if (!groupedProducts[product.category]) {
                groupedProducts[product.category] = [];
            }
            groupedProducts[product.category].push(product);
        });

        // Display products by category
        let totalWithCloudinary = 0;
        Object.keys(groupedProducts).forEach(category => {
            console.log(`\n🏷️ ${category.toUpperCase()} (${groupedProducts[category].length} products):`);
            console.log('─'.repeat(60));
            
            groupedProducts[category].forEach((product, index) => {
                const hasCloudinary = product.image && product.image.includes('res.cloudinary.com');
                if (hasCloudinary) totalWithCloudinary++;
                
                const imageStatus = hasCloudinary ? '☁️ Cloudinary' : (product.image ? '📷 Other' : '❌ No Image');
                
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   SKU: ${product.sku}`);
                console.log(`   Brand: ${product.brand || 'N/A'}`);
                console.log(`   Price: R${product.price}`);
                console.log(`   Image: ${imageStatus}`);
                
                if (product.image) {
                    const displayUrl = product.image.length > 70 ? 
                        product.image.substring(0, 67) + '...' : 
                        product.image;
                    console.log(`   URL: ${displayUrl}`);
                }
                console.log('');
            });
        });

        // Summary
        console.log('\n📊 SUMMARY STATISTICS:');
        console.log('======================');
        console.log(`Total Products: ${totalProducts}`);
        console.log(`With Cloudinary URLs: ${totalWithCloudinary}`);
        console.log(`Without Cloudinary URLs: ${totalProducts - totalWithCloudinary}`);
        
        console.log('\n📋 CATEGORY BREAKDOWN:');
        console.log('======================');
        Object.keys(groupedProducts).forEach(category => {
            const categoryProducts = groupedProducts[category];
            const withCloudinary = categoryProducts.filter(p => 
                p.image && p.image.includes('res.cloudinary.com')
            ).length;
            console.log(`${category}: ${categoryProducts.length} total (${withCloudinary} with Cloudinary)`);
        });

        if (totalWithCloudinary === totalProducts) {
            console.log('\n🎉 Perfect! All products have optimized Cloudinary images!');
        } else {
            console.log(`\n💡 ${totalProducts - totalWithCloudinary} products still need Cloudinary images.`);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error listing products:', error);
        process.exit(1);
    }
}

listAllCurrentProducts();