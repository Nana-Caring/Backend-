require('dotenv').config();
const sequelize = require('./db');
const Product = require('./models/Product');

async function focusOnClicksMVP(options = {}) {
  const { dryRun = false } = options;
  
  try {
    console.log('🏥 FOCUSING ON CLICKS PRODUCTS FOR MVP');
    console.log('=====================================');
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE CLEANUP'}`);
    
    if (dryRun) {
      console.log('📋 DRY RUN - No database changes will be made\n');
    }

    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Get all products
    const allProducts = await Product.findAll({
      attributes: ['id', 'name', 'shop_name', 'sku', 'categories']
    });
    
    console.log(`📦 Found ${allProducts.length} total products`);
    
    // Separate Clicks vs non-Clicks products
    const clicksProducts = allProducts.filter(p => 
      p.shop_name === 'Clicks' || 
      (p.sku && p.sku.includes('CL-')) ||
      (p.name && p.name.toLowerCase().includes('clicks'))
    );
    
    const nonClicksProducts = allProducts.filter(p => 
      p.shop_name !== 'Clicks' && 
      (!p.sku || !p.sku.includes('CL-')) &&
      (!p.name || !p.name.toLowerCase().includes('clicks'))
    );
    
    console.log(`🏥 Clicks products: ${clicksProducts.length}`);
    console.log(`🏪 Non-Clicks products: ${nonClicksProducts.length}\n`);
    
    // Show what we're keeping (Clicks products)
    if (clicksProducts.length > 0) {
      console.log('✅ KEEPING CLICKS PRODUCTS:');
      clicksProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.sku || 'No SKU'})`);
      });
      console.log('');
    }
    
    // Show what we're removing (non-Clicks products)
    if (nonClicksProducts.length > 0) {
      console.log('🗑️  REMOVING NON-CLICKS PRODUCTS:');
      nonClicksProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - Shop: ${product.shop_name || 'N/A'}`);
      });
      console.log('');
    }
    
    let removedCount = 0;
    
    if (!dryRun && nonClicksProducts.length > 0) {
      console.log('🧹 Starting cleanup...\n');
      
      for (const product of nonClicksProducts) {
        try {
          await Product.destroy({
            where: { id: product.id }
          });
          console.log(`   ✅ Removed: ${product.name}`);
          removedCount++;
        } catch (error) {
          console.error(`   ❌ Failed to remove ${product.name}:`, error.message);
        }
      }
    }
    
    // Final summary
    console.log('\n📊 CLICKS MVP FOCUS SUMMARY');
    console.log('===========================');
    console.log(`🏥 Clicks products kept: ${clicksProducts.length}`);
    console.log(`🗑️  Non-Clicks products ${dryRun ? 'would be' : ''} removed: ${dryRun ? nonClicksProducts.length : removedCount}`);
    
    if (!dryRun) {
      // Verify final count
      const finalCount = await Product.count();
      console.log(`📦 Final product count: ${finalCount}`);
      
      console.log('\n🎉 CLICKS MVP FOCUS COMPLETE!');
      console.log('🏥 Your platform now focuses exclusively on Clicks products');
      console.log('🚀 Perfect for MVP launch with clear brand focus!');
      
      // Show categories we now have
      const remainingProducts = await Product.findAll({
        attributes: ['categories', 'subcategory'],
        group: ['categories', 'subcategory']
      });
      
      if (remainingProducts.length > 0) {
        console.log('\n📂 AVAILABLE CATEGORIES:');
        remainingProducts.forEach(p => {
          console.log(`   • ${p.categories}${p.subcategory ? ` > ${p.subcategory}` : ''}`);
        });
      }
    } else {
      console.log('\n📋 DRY RUN COMPLETE - No changes made');
      console.log('🏥 Run without --dry-run to execute the cleanup');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error focusing on Clicks MVP:', error.message);
    process.exit(1);
  }
}

// Command line interface
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

focusOnClicksMVP({ dryRun });