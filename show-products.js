const { Product } = require('./models');

async function showExistingProducts() {
    try {
        console.log('📦 FETCHING EXISTING PRODUCTS...\n');
        
        const products = await Product.findAll({
            attributes: ['id', 'name', 'brand', 'sku', 'image'],
            order: [['name', 'ASC']],
            limit: 20
        });

        if (products.length === 0) {
            console.log('❌ No products found in database!');
            return;
        }

        console.log(`Found ${products.length} products:\n`);

        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   SKU: ${product.sku}`);
            console.log(`   Brand: ${product.brand}`);
            console.log(`   Current Image: ${product.image ? product.image.substring(0, 70) + '...' : 'None'}`);
            console.log('');
        });

        // Get total count
        const totalCount = await Product.count();
        console.log(`📊 Total products in database: ${totalCount}`);
        
        if (totalCount > 20) {
            console.log(`📋 Showing first 20 products. ${totalCount - 20} more available.`);
        }

    } catch (error) {
        console.error('❌ Error fetching products:', error.message);
    }
}

showExistingProducts();