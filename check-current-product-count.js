require('dotenv').config();
const { Sequelize } = require('sequelize');
const Product = require('./models/Product');

async function checkProductCount() {
    try {
        console.log('🔍 CHECKING CURRENT PRODUCT COUNT');
        console.log('================================');
        
        const totalProducts = await Product.count();
        console.log(`📦 Total Products: ${totalProducts}`);
        
        // Check products with Cloudinary images
        const cloudinaryProducts = await Product.count({
            where: {
                image: {
                    [Sequelize.Op.like]: '%res.cloudinary.com%'
                }
            }
        });
        console.log(`☁️ Products with Cloudinary images: ${cloudinaryProducts}`);
        
        // Check products without images
        const noImageProducts = await Product.count({
            where: {
                [Sequelize.Op.or]: [
                    { image: null },
                    { image: '' }
                ]
            }
        });
        console.log(`❌ Products without images: ${noImageProducts}`);
        
        // Show breakdown by category
        console.log('\n📊 BREAKDOWN BY CATEGORY:');
        console.log('==========================');
        
        const categories = ['Healthcare', 'Education', 'Groceries', 'Entertainment', 'Other', 'Pregnancy'];
        
        for (const category of categories) {
            const count = await Product.count({
                where: { category }
            });
            if (count > 0) {
                console.log(`${category}: ${count} products`);
            }
        }
        
        // List all current products
        console.log('\n📋 CURRENT PRODUCT LIST:');
        console.log('=========================');
        
        const products = await Product.findAll({
            attributes: ['id', 'name', 'sku', 'category', 'image'],
            order: [['category', 'ASC'], ['name', 'ASC']]
        });
        
        let currentCategory = '';
        products.forEach(product => {
            if (product.category !== currentCategory) {
                currentCategory = product.category;
                console.log(`\n🏷️ ${currentCategory.toUpperCase()}:`);
            }
            
            const hasCloudinary = product.image && product.image.includes('res.cloudinary.com');
            const imageStatus = hasCloudinary ? '☁️' : (product.image ? '📷' : '❌');
            console.log(`   ${imageStatus} ${product.name} (${product.sku})`);
        });
        
        console.log('\n✅ Product count check completed!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error checking products:', error);
        process.exit(1);
    }
}

checkProductCount();