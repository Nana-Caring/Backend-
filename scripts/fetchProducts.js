const db = require('../models');

async function fetchProducts() {
  try {
    console.log('🔍 Fetching products from database...\n');

    // Fetch all products
    const products = await db.Product.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    if (products.length === 0) {
      console.log('❌ No products found in the database.');
      console.log('💡 Run the seed script to add sample products: node scripts/seedProducts.js\n');
    } else {
      console.log(`✅ Found ${products.length} products:\n`);
      
      // Group products by category
      const productsByCategory = {};
      
      products.forEach(product => {
        if (!productsByCategory[product.category]) {
          productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
      });

      // Display products by category
      Object.keys(productsByCategory).forEach(category => {
        console.log(`\n📦 ${category.toUpperCase()} (${productsByCategory[category].length} products)`);
        console.log('─'.repeat(80));
        
        productsByCategory[category].forEach(product => {
          console.log(`
  ID: ${product.id}
  Name: ${product.name}
  Brand: ${product.brand || 'N/A'}
  Price: ZAR ${parseFloat(product.price).toFixed(2)}
  SKU: ${product.sku || 'N/A'}
  Stock: ${product.inStock ? `${product.stockQuantity} units` : 'Out of Stock'}
  Active: ${product.isActive ? 'Yes' : 'No'}
  Rating: ${product.rating || 'N/A'} (${product.reviewCount || 0} reviews)
          `);
        });
      });

      // Display summary statistics
      console.log('\n📊 SUMMARY STATISTICS');
      console.log('─'.repeat(80));
      const totalInStock = products.filter(p => p.inStock).length;
      const totalActive = products.filter(p => p.isActive).length;
      const avgPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length;
      
      console.log(`Total Products: ${products.length}`);
      console.log(`In Stock: ${totalInStock}`);
      console.log(`Active: ${totalActive}`);
      console.log(`Average Price: ZAR ${avgPrice.toFixed(2)}`);
      console.log(`Categories: ${Object.keys(productsByCategory).length}`);
      
      console.log('\n📋 Products by Category:');
      Object.keys(productsByCategory).forEach(cat => {
        console.log(`  - ${cat}: ${productsByCategory[cat].length} products`);
      });
    }

    // Close database connection
    await db.sequelize.close();
    console.log('\n✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    process.exit(1);
  }
}

// Run the function
fetchProducts();
