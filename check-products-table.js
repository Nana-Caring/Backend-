const { Product } = require('./models');

async function checkProductsTable() {
  try {
    console.log('🔍 Checking if Products table exists...');
    
    // Try to query the table
    const count = await Product.count();
    console.log(`✅ Products table exists with ${count} products`);
    
    // Check if new image fields exist
    const product = await Product.findOne();
    if (product) {
      const hasNewFields = product.hasOwnProperty('mainImage') && product.hasOwnProperty('thumbnailImages');
      console.log(`📷 Image fields exist: ${hasNewFields}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking Products table:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('📝 Creating Products table manually...');
      
      try {
        // Force sync the Product model (creates table if not exists)
        await Product.sync({ force: false, alter: true });
        console.log('✅ Products table created successfully!');
        
        // Check again
        const count = await Product.count();
        console.log(`📊 Products table now has ${count} products`);
      } catch (syncError) {
        console.error('❌ Failed to create Products table:', syncError.message);
      }
    }
  }
}

checkProductsTable()
  .then(() => {
    console.log('🎉 Products table check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Products table check failed:', error);
    process.exit(1);
  });
