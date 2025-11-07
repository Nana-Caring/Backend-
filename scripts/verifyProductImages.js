const { Product } = require('../models');

const verifyProductImages = async () => {
  try {
    console.log('🔍 Verifying product images...\n');
    
    const products = await Product.findAll({
      attributes: ['sku', 'name', 'category', 'image'],
      order: [['category', 'ASC'], ['sku', 'ASC']]
    });
    
    let withUnsplash = 0;
    let withoutUnsplash = 0;
    
    const categories = {};
    
    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      
      const hasUnsplash = product.image && product.image.includes('unsplash.com');
      
      if (hasUnsplash) {
        withUnsplash++;
      } else {
        withoutUnsplash++;
      }
      
      categories[product.category].push({
        sku: product.sku,
        name: product.name,
        hasUnsplash,
        image: product.image
      });
    });
    
    console.log('📊 Summary by Category:\n');
    
    Object.keys(categories).forEach(category => {
      console.log(`\n${category} (${categories[category].length} products):`);
      categories[category].forEach(p => {
        const status = p.hasUnsplash ? '✅' : '❌';
        console.log(`  ${status} ${p.sku} - ${p.name}`);
        if (!p.hasUnsplash) {
          console.log(`     Image: ${p.image}`);
        }
      });
    });
    
    console.log(`\n\n📈 Overall Statistics:`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   ✅ With Unsplash images: ${withUnsplash}`);
    console.log(`   ❌ Without Unsplash images: ${withoutUnsplash}`);
    console.log(`   Success rate: ${((withUnsplash / products.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
};

if (require.main === module) {
  const { sequelize } = require('../models');
  
  sequelize.authenticate()
    .then(verifyProductImages)
    .then(() => {
      console.log('\n✨ Verification completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyProductImages };
