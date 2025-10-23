const { Product } = require('./models');

async function checkProducts() {
  try {
    const products = await Product.findAll({ 
      limit: 5,
      attributes: ['id', 'name', 'category', 'isActive']
    });
    
    console.log(`Products found: ${products.length}`);
    
    if (products.length > 0) {
      products.forEach(p => {
        console.log(`- ${p.name} (ID: ${p.id}, Category: ${p.category}, Active: ${p.isActive})`);
      });
    } else {
      console.log('No products found in database');
    }
    
    // Also check total count
    const totalCount = await Product.count();
    console.log(`Total products in database: ${totalCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking products:', error.message);
    process.exit(1);
  }
}

checkProducts();
