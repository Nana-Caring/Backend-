const { Product } = require('./models');

async function getProductNames() {
  try {
    console.log('📦 Fetching all product names from database...\n');

    // Fetch all products with basic info
    const products = await Product.findAll({
      attributes: ['id', 'name', 'brand', 'category', 'price', 'sku', 'isActive'],
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    if (products.length === 0) {
      console.log('❌ No products found in the database.');
      console.log('💡 Run a seed script to add products: node seed-products.js\n');
      return [];
    }

    console.log(`✅ Found ${products.length} products:\n`);
    
    // Group products by category for better organization
    const productsByCategory = {};
    
    products.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = [];
      }
      productsByCategory[product.category].push(product);
    });

    // Display products organized by category
    Object.keys(productsByCategory).sort().forEach(category => {
      console.log(`\n📂 ${category.toUpperCase()} PRODUCTS (${productsByCategory[category].length} items)`);
      console.log('=' .repeat(50));
      
      productsByCategory[category].forEach((product, index) => {
        const status = product.isActive ? '✅' : '❌';
        console.log(`${index + 1:2d}. ${status} ${product.name}`);
        console.log(`    Brand: ${product.brand || 'N/A'}`);
        console.log(`    Price: R${product.price}`);
        console.log(`    SKU: ${product.sku || 'N/A'}`);
        console.log(`    ID: ${product.id}`);
        console.log('');
      });
    });

    // Summary statistics
    console.log('\n📊 SUMMARY STATISTICS');
    console.log('=' .repeat(50));
    
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const inactiveProducts = totalProducts - activeProducts;
    
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Active Products: ${activeProducts}`);
    console.log(`Inactive Products: ${inactiveProducts}`);
    
    console.log('\nProducts by Category:');
    Object.keys(productsByCategory).sort().forEach(category => {
      console.log(`  • ${category}: ${productsByCategory[category].length} products`);
    });

    // Price range analysis
    const prices = products.map(p => parseFloat(p.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    console.log('\nPrice Analysis:');
    console.log(`  • Cheapest: R${minPrice.toFixed(2)}`);
    console.log(`  • Most Expensive: R${maxPrice.toFixed(2)}`);
    console.log(`  • Average Price: R${avgPrice.toFixed(2)}`);

    // Return just the names for programmatic use
    const productNames = products.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      sku: product.sku,
      isActive: product.isActive
    }));

    return productNames;

  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    throw error;
  }
}

// Function to get just the product names as a simple list
async function getSimpleProductNames() {
  try {
    const products = await Product.findAll({
      attributes: ['name', 'brand'],
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    console.log('\n📝 SIMPLE PRODUCT NAME LIST');
    console.log('=' .repeat(50));
    
    const productNames = products.map((product, index) => {
      const fullName = product.brand ? `${product.brand} ${product.name}` : product.name;
      console.log(`${index + 1}. ${fullName}`);
      return fullName;
    });

    return productNames;

  } catch (error) {
    console.error('❌ Error fetching simple product names:', error.message);
    throw error;
  }
}

// Function to search products by name
async function searchProductsByName(searchTerm) {
  try {
    const { Op } = require('sequelize');
    
    const products = await Product.findAll({
      attributes: ['id', 'name', 'brand', 'category', 'price', 'sku'],
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { brand: { [Op.iLike]: `%${searchTerm}%` } },
          { sku: { [Op.iLike]: `%${searchTerm}%` } }
        ],
        isActive: true
      },
      order: [['name', 'ASC']]
    });

    if (products.length === 0) {
      console.log(`❌ No products found matching "${searchTerm}"`);
      return [];
    }

    console.log(`\n🔍 SEARCH RESULTS for "${searchTerm}" (${products.length} found)`);
    console.log('=' .repeat(50));
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Brand: ${product.brand}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: R${product.price}`);
      console.log(`   SKU: ${product.sku}`);
      console.log('');
    });

    return products;

  } catch (error) {
    console.error('❌ Error searching products:', error.message);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === 'simple') {
    // Show just simple names
    getSimpleProductNames()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else if (args.length > 0 && args[0] === 'search') {
    // Search for products
    const searchTerm = args.slice(1).join(' ');
    if (!searchTerm) {
      console.log('Usage: node get-product-names.js search <search term>');
      process.exit(1);
    }
    searchProductsByName(searchTerm)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    // Show full details
    getProductNames()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = {
  getProductNames,
  getSimpleProductNames,
  searchProductsByName
};