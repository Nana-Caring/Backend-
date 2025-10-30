const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

console.log('🧹 REMOVING PRODUCTS WITHOUT SHOP INFORMATION\n');
console.log('🎯 Keeping only products with proper shop data');
console.log('🛍️ This will clean up the catalog for better organization\n');
console.log('======================================================================');

async function cleanupProductsWithoutShopInfo() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');

    // Define Product model
    const Product = sequelize.define('Product', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'),
        allowNull: false
      },
      shop: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shopCategory: {
        type: Sequelize.STRING,
        allowNull: true
      }
    }, {
      tableName: 'products',
      timestamps: true
    });

    // First, let's see what we have
    console.log('\n📊 CURRENT PRODUCT STATISTICS:');
    console.log('================================================');
    
    const totalProducts = await Product.count();
    const productsWithShop = await Product.count({
      where: {
        shop: { [Sequelize.Op.ne]: null }
      }
    });
    const productsWithoutShop = await Product.count({
      where: {
        shop: { [Sequelize.Op.is]: null }
      }
    });

    console.log(`📦 Total products: ${totalProducts}`);
    console.log(`🏪 Products with shop info: ${productsWithShop}`);
    console.log(`❌ Products without shop info: ${productsWithoutShop}`);

    // Show some examples of products without shop info
    console.log('\n📋 PRODUCTS WITHOUT SHOP INFORMATION (Sample):');
    console.log('====================================================');
    
    const sampleProductsWithoutShop = await Product.findAll({
      where: {
        shop: { [Sequelize.Op.is]: null }
      },
      limit: 10,
      attributes: ['name', 'brand', 'category', 'price']
    });

    sampleProductsWithoutShop.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Brand: ${product.brand} | Category: ${product.category} | Price: R${product.price}`);
    });

    if (productsWithoutShop > 10) {
      console.log(`   ... and ${productsWithoutShop - 10} more products`);
    }

    // Show products with shop info
    console.log('\n🏪 PRODUCTS WITH SHOP INFORMATION:');
    console.log('==================================================');
    
    const productsWithShopInfo = await Product.findAll({
      where: {
        shop: { [Sequelize.Op.ne]: null }
      },
      attributes: ['name', 'shop', 'shopCategory', 'price'],
      order: [['shop', 'ASC']]
    });

    const shopGroups = {};
    productsWithShopInfo.forEach(product => {
      if (!shopGroups[product.shop]) {
        shopGroups[product.shop] = [];
      }
      shopGroups[product.shop].push(product);
    });

    for (const [shopName, products] of Object.entries(shopGroups)) {
      console.log(`\n🏪 ${shopName} (${products[0].shopCategory}):`);
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - R${product.price}`);
      });
    }

    // Confirm deletion
    console.log('\n⚠️  DELETION CONFIRMATION:');
    console.log('==========================================');
    console.log(`❌ About to DELETE ${productsWithoutShop} products without shop information`);
    console.log(`✅ Will KEEP ${productsWithShop} products with proper shop data`);
    console.log('\nProceeding with cleanup...\n');

    // Delete products without shop information
    const deleteResult = await Product.destroy({
      where: {
        shop: { [Sequelize.Op.is]: null }
      }
    });

    console.log(`✅ Successfully deleted ${deleteResult} products without shop information`);

    // Show final statistics
    console.log('\n📊 FINAL PRODUCT STATISTICS:');
    console.log('=======================================');
    
    const finalTotal = await Product.count();
    const finalWithShop = await Product.count({
      where: {
        shop: { [Sequelize.Op.ne]: null }
      }
    });

    console.log(`📦 Total products remaining: ${finalTotal}`);
    console.log(`🏪 All products now have shop information: ${finalWithShop === finalTotal ? '✅ Yes' : '❌ No'}`);

    // Show shop distribution
    console.log('\n🏪 FINAL SHOP DISTRIBUTION:');
    console.log('=====================================');

    const finalShopStats = {};
    const allRemainingProducts = await Product.findAll({
      attributes: ['shop', 'shopCategory', 'price'],
      order: [['shop', 'ASC']]
    });

    allRemainingProducts.forEach(product => {
      if (!finalShopStats[product.shop]) {
        finalShopStats[product.shop] = {
          count: 0,
          category: product.shopCategory,
          prices: []
        };
      }
      finalShopStats[product.shop].count++;
      finalShopStats[product.shop].prices.push(parseFloat(product.price));
    });

    let shopIndex = 1;
    for (const [shopName, stats] of Object.entries(finalShopStats)) {
      const avgPrice = stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length;
      const minPrice = Math.min(...stats.prices);
      const maxPrice = Math.max(...stats.prices);
      
      console.log(`${shopIndex}. 🏪 **${shopName}** (${stats.category})`);
      console.log(`   📦 ${stats.count} products | 💰 R${minPrice.toFixed(2)}-R${maxPrice.toFixed(2)} (Avg: R${avgPrice.toFixed(2)})`);
      shopIndex++;
    }

    console.log('\n🎉 CLEANUP COMPLETE!');
    console.log('======================================');
    console.log(`✅ Removed ${deleteResult} products without shop data`);
    console.log(`🛍️ Catalog now has ${finalTotal} products with complete shop information`);
    console.log(`🏪 Products available across ${Object.keys(finalShopStats).length} different retailers`);
    console.log('✅ Clean, organized catalog ready for SASSA families!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the cleanup
cleanupProductsWithoutShopInfo();