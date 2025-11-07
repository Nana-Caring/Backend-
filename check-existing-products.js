const db = require('./models');
const { Product } = db;

async function checkExistingProducts() {
    try {
        await db.sequelize.authenticate();
        
        const products = await Product.findAll({
            attributes: ['name', 'sku', 'category', 'ageCategory', 'brand']
        });
        
        console.log('📦 Existing products with their enum values:');
        products.forEach(p => {
            console.log(`  ${p.name} (${p.sku})`);
            console.log(`    Category: ${p.category}`);
            console.log(`    Age Category: ${p.ageCategory}`);
            console.log(`    Brand: ${p.brand}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkExistingProducts();