require('dotenv').config();
const { Product } = require('./models');

async function verifyCurrentProducts() {
  try {
    console.log('📊 PRODUCT VERIFICATION REPORT');
    console.log('==============================\n');

    // Get all products
    const allProducts = await Product.findAll({
      attributes: ['id', 'name', 'brand', 'category', 'subcategory', 'price', 'sku', 'stockQuantity', 'isActive'],
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    console.log(`📦 Total Products in Database: ${allProducts.length}\n`);

    // Group by category
    const byCategory = {};
    allProducts.forEach(product => {
      if (!byCategory[product.category]) {
        byCategory[product.category] = [];
      }
      byCategory[product.category].push(product);
    });

    // Display by category
    Object.keys(byCategory).sort().forEach(category => {
      const products = byCategory[category];
      console.log(`🏷️  ${category.toUpperCase()} (${products.length} products)`);
      console.log('─'.repeat(50));
      
      products.forEach((product, index) => {
        const status = product.isActive ? '✅' : '❌';
        const stock = product.stockQuantity > 0 ? `📦 ${product.stockQuantity}` : '🚫 Out';
        console.log(`${index + 1}. ${status} ${product.name}`);
        console.log(`   Brand: ${product.brand} | Price: R${product.price}`);
        console.log(`   SKU: ${product.sku} | Stock: ${stock}`);
        if (product.subcategory) {
          console.log(`   Subcategory: ${product.subcategory}`);
        }
        console.log('');
      });
    });

    // Summary statistics
    console.log('📈 SUMMARY STATISTICS');
    console.log('====================');
    
    const activeProducts = allProducts.filter(p => p.isActive);
    const inactiveProducts = allProducts.filter(p => !p.isActive);
    const inStockProducts = allProducts.filter(p => p.stockQuantity > 0);
    const outOfStockProducts = allProducts.filter(p => p.stockQuantity === 0);
    
    console.log(`✅ Active Products: ${activeProducts.length}`);
    console.log(`❌ Inactive Products: ${inactiveProducts.length}`);
    console.log(`📦 In Stock: ${inStockProducts.length}`);
    console.log(`🚫 Out of Stock: ${outOfStockProducts.length}`);

    // Category distribution
    console.log('\n📋 Products by Category:');
    Object.keys(byCategory).sort().forEach(category => {
      console.log(`   ${category}: ${byCategory[category].length} products`);
    });

    // Price analysis
    const prices = allProducts.map(p => parseFloat(p.price)).filter(p => !isNaN(p));
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      console.log('\n💰 Price Analysis:');
      console.log(`   Lowest Price: R${minPrice.toFixed(2)}`);
      console.log(`   Highest Price: R${maxPrice.toFixed(2)}`);
      console.log(`   Average Price: R${avgPrice.toFixed(2)}`);
    }

    // Check for duplicate SKUs
    const skus = allProducts.map(p => p.sku);
    const duplicateSKUs = skus.filter((sku, index) => skus.indexOf(sku) !== index);
    if (duplicateSKUs.length > 0) {
      console.log('\n⚠️  DUPLICATE SKUs FOUND:');
      duplicateSKUs.forEach(sku => console.log(`   ${sku}`));
    } else {
      console.log('\n✅ No duplicate SKUs found');
    }

    // Check for missing required fields
    console.log('\n🔍 DATA QUALITY CHECK:');
    const missingName = allProducts.filter(p => !p.name || p.name.trim() === '');
    const missingBrand = allProducts.filter(p => !p.brand || p.brand.trim() === '');
    const missingPrice = allProducts.filter(p => !p.price || isNaN(parseFloat(p.price)));
    const missingSKU = allProducts.filter(p => !p.sku || p.sku.trim() === '');

    console.log(`   Missing Name: ${missingName.length} products`);
    console.log(`   Missing Brand: ${missingBrand.length} products`);
    console.log(`   Missing/Invalid Price: ${missingPrice.length} products`);
    console.log(`   Missing SKU: ${missingSKU.length} products`);

    if (missingName.length > 0 || missingBrand.length > 0 || missingPrice.length > 0 || missingSKU.length > 0) {
      console.log('\n❌ Data quality issues found! Consider cleaning up these products.');
    } else {
      console.log('\n✅ All products have required fields');
    }

    // Show recent products (last 10)
    const recentProducts = allProducts.slice(-10);
    console.log('\n🆕 RECENTLY ADDED PRODUCTS (Last 10):');
    console.log('=====================================');
    recentProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.category})`);
      console.log(`   SKU: ${product.sku} | Price: R${product.price}`);
    });

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run verification
if (require.main === module) {
  verifyCurrentProducts()
    .then(() => {
      console.log('\n🏁 Product verification completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyCurrentProducts };