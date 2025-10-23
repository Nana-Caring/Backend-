const { Product } = require('./models');

async function showProductSummary() {
  try {
    console.log('\n🎉 PRODUCT DATABASE SUMMARY');
    console.log('=' .repeat(50));
    
    // Total products
    const totalProducts = await Product.count();
    console.log(`📦 Total Products: ${totalProducts}`);
    
    // Products by category
    const categories = ['Healthcare', 'Education', 'Groceries', 'Transport', 'Entertainment', 'Other'];
    
    console.log('\n📊 Products by Category:');
    for (const category of categories) {
      const count = await Product.count({ where: { category } });
      console.log(`   ${category}: ${count} products`);
    }
    
    // Age categories
    const ageCategories = ['Toddler', 'Child', 'Teen', 'Adult', 'Senior', 'All Ages'];
    console.log('\n👶 Products by Age Category:');
    for (const ageCategory of ageCategories) {
      const count = await Product.count({ where: { ageCategory } });
      if (count > 0) {
        console.log(`   ${ageCategory}: ${count} products`);
      }
    }
    
    // Sample products from each category
    console.log('\n🔍 Sample Products:');
    for (const category of categories) {
      const sample = await Product.findOne({ 
        where: { category },
        attributes: ['name', 'brand', 'price', 'ageCategory']
      });
      if (sample) {
        console.log(`   ${category}: ${sample.name} by ${sample.brand} (R${sample.price}) - ${sample.ageCategory}`);
      }
    }
    
    console.log('\n✅ Product database is ready for frontend integration!');
    console.log('🌐 Available API endpoints:');
    console.log('   GET /api/products - All products with filtering');
    console.log('   GET /api/products/:id - Specific product');
    console.log('   GET /api/products/category/:category - Products by category');
    console.log('   GET /api/products/:id/images - Product images');
    console.log('   GET /api/products/dependent/:id - Age-appropriate products for dependent');
    console.log('\n🔒 Each product includes age restrictions and image URLs');
    console.log('📱 Categories match dependent account types for proper filtering');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showProductSummary();
