const { Product } = require('./models');

/**
 * Batch Image URL Updater for Existing Products
 * 
 * Usage: 
 * 1. Add your product updates to the imageUpdates array below
 * 2. Run: node batch-image-updater.js
 */

// Add your image updates here
const imageUpdates = [
  // Example updates - replace with your own
  {
    // You can identify the product by ID, SKU, or name (choose one)
    sku: 'HEALTH001', // or use: id: 123, or name: 'Product Name'
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop',
    additionalImages: [ // Optional - additional images
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop'
    ]
  },
  {
    name: 'Vitamin C 1000mg Tablets', // Find by product name
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&h=600&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop'
    ]
  }
  
  // Add more updates here following the same format:
  // {
  //   sku: 'PROD123', // or id: 456, or name: 'Product Name'
  //   imageUrl: 'https://your-image-url.com/image.jpg',
  //   additionalImages: ['url1', 'url2'] // Optional
  // }
];

// Helper function to validate image URL
function isValidImageUrl(url) {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(url) || 
           url.includes('unsplash.com') || 
           url.includes('images.') ||
           url.includes('1drv.ms') ||
           url.includes('onedrive') ||
           url.includes('amazonaws.com') ||
           url.includes('cloudinary.com');
  } catch {
    return false;
  }
}

// Main batch update function
async function batchUpdateProductImages() {
  try {
    console.log('\n🔄 BATCH IMAGE UPDATER FOR EXISTING PRODUCTS');
    console.log('============================================\n');

    if (imageUpdates.length === 0) {
      console.log('❌ No image updates specified!');
      console.log('📝 Please add updates to the imageUpdates array in this file.\n');
      showExample();
      return;
    }

    console.log(`📦 Processing ${imageUpdates.length} image updates...\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const results = [];

    for (let i = 0; i < imageUpdates.length; i++) {
      const update = imageUpdates[i];
      
      console.log(`[${i + 1}/${imageUpdates.length}] Processing update...`);
      
      try {
        // Find the product by ID, SKU, or name
        let whereClause = {};
        
        if (update.id) {
          whereClause.id = update.id;
          console.log(`   🔍 Finding product by ID: ${update.id}`);
        } else if (update.sku) {
          whereClause.sku = update.sku;
          console.log(`   🔍 Finding product by SKU: ${update.sku}`);
        } else if (update.name) {
          whereClause.name = {
            [require('sequelize').Op.iLike]: `%${update.name}%`
          };
          console.log(`   🔍 Finding product by name: ${update.name}`);
        } else {
          throw new Error('Product identifier required: provide id, sku, or name');
        }

        // Find the product
        const product = await Product.findOne({ where: whereClause });
        
        if (!product) {
          throw new Error(`Product not found: ${update.id || update.sku || update.name}`);
        }

        console.log(`   📦 Found: ${product.name} (ID: ${product.id}, SKU: ${product.sku})`);
        console.log(`   🖼️ Current image: ${product.image || 'None'}`);

        // Validate new image URL
        if (!update.imageUrl || !isValidImageUrl(update.imageUrl)) {
          throw new Error(`Invalid or missing image URL: ${update.imageUrl}`);
        }

        // Process additional images
        const additionalImages = [];
        if (update.additionalImages && Array.isArray(update.additionalImages)) {
          update.additionalImages.forEach((url, idx) => {
            if (isValidImageUrl(url)) {
              additionalImages.push(url);
            } else {
              console.log(`   ⚠️ Skipping invalid additional image ${idx + 1}: ${url}`);
            }
          });
        }

        // Prepare update data
        const updateData = {
          image: update.imageUrl,
          images: [update.imageUrl, ...additionalImages],
          updatedAt: new Date()
        };

        // Store old image for comparison
        const oldImage = product.image;

        // Update the product
        await product.update(updateData);
        
        console.log(`   ✅ Updated successfully!`);
        console.log(`   🆕 New primary image: ${update.imageUrl}`);
        
        if (additionalImages.length > 0) {
          console.log(`   📷 Additional images: ${additionalImages.length}`);
        }

        results.push({
          product: {
            id: product.id,
            name: product.name,
            sku: product.sku
          },
          oldImage,
          newImage: update.imageUrl,
          additionalImages: additionalImages.length,
          status: 'success'
        });

        successCount++;

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        
        errors.push({
          update,
          error: error.message
        });
        
        results.push({
          update,
          error: error.message,
          status: 'error'
        });

        errorCount++;
      }

      console.log(''); // Empty line for readability
    }

    // Show summary
    console.log('📊 UPDATE SUMMARY');
    console.log('=================');
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Failed updates: ${errorCount}`);
    console.log(`📋 Total processed: ${imageUpdates.length}`);

    // Show successful updates
    if (successCount > 0) {
      console.log('\n✅ SUCCESSFUL UPDATES:');
      console.log('---------------------');
      results.filter(r => r.status === 'success').forEach((result, index) => {
        console.log(`${index + 1}. ${result.product.name} (${result.product.sku})`);
        console.log(`   Old: ${result.oldImage || 'None'}`);
        console.log(`   New: ${result.newImage}`);
        if (result.additionalImages > 0) {
          console.log(`   Additional: ${result.additionalImages} images`);
        }
      });
    }

    // Show errors if any
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      console.log('----------');
      errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.update.id || err.update.sku || err.update.name}`);
        console.log(`   Error: ${err.error}`);
      });
    }

    if (successCount > 0) {
      console.log('\n🎉 Image updates completed successfully!');
      console.log('💡 You can now view the updated products in your admin panel or via the API.');
    }

  } catch (error) {
    console.error('❌ Fatal error in batch updater:', error);
  }
}

// Function to show example format
function showExample() {
  console.log('📖 EXAMPLE FORMAT:');
  console.log('==================\n');
  console.log('const imageUpdates = [');
  console.log('  {');
  console.log('    sku: "HEALTH001",  // Find by SKU');
  console.log('    imageUrl: "https://images.unsplash.com/photo-1234567890",');
  console.log('    additionalImages: ["https://url1.com", "https://url2.com"] // Optional');
  console.log('  },');
  console.log('  {');
  console.log('    id: 123,  // Or find by database ID');
  console.log('    imageUrl: "https://your-image-url.com/image.jpg"');
  console.log('  },');
  console.log('  {');
  console.log('    name: "Product Name",  // Or find by product name');
  console.log('    imageUrl: "https://another-image-url.com/image.png"');
  console.log('  }');
  console.log('];');
}

// Function to list products needing images
async function listProductsNeedingImages() {
  try {
    console.log('\n🔍 PRODUCTS WITHOUT IMAGES');
    console.log('==========================\n');

    const productsWithoutImages = await Product.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { image: null },
          { image: '' }
        ]
      },
      attributes: ['id', 'name', 'brand', 'sku', 'category', 'price'],
      order: [['name', 'ASC']],
      limit: 20
    });

    if (productsWithoutImages.length === 0) {
      console.log('✅ All products have images!');
      return;
    }

    console.log(`Found ${productsWithoutImages.length} products without images:\n`);

    productsWithoutImages.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Brand: ${product.brand}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: R${product.price}`);
      console.log('');
    });

    const total = await Product.count({
      where: {
        [require('sequelize').Op.or]: [
          { image: null },
          { image: '' }
        ]
      }
    });

    if (total > 20) {
      console.log(`... and ${total - 20} more products need images.`);
    }

    console.log('\n💡 Copy the SKUs above to update their images using this tool.');

  } catch (error) {
    console.error('❌ Error listing products:', error);
  }
}

// Run based on arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    listProductsNeedingImages().then(() => process.exit(0));
  } else if (args.includes('--example') || args.includes('-e')) {
    showExample();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log('\n📖 BATCH IMAGE UPDATER HELP');
    console.log('===========================\n');
    console.log('Usage:');
    console.log('  node batch-image-updater.js          - Run batch updates');
    console.log('  node batch-image-updater.js --list   - List products without images');
    console.log('  node batch-image-updater.js --example- Show example format');
    console.log('  node batch-image-updater.js --help   - Show this help\n');
    console.log('How to use:');
    console.log('1. Edit this file and add updates to imageUpdates array');
    console.log('2. Identify products by ID, SKU, or name');
    console.log('3. Provide primary image URL and optional additional images');
    console.log('4. Run the script to update all products at once\n');
  } else {
    batchUpdateProductImages()
      .then(() => {
        console.log('\n✨ Batch update completed!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Batch update failed:', error);
        process.exit(1);
      });
  }
}

module.exports = { batchUpdateProductImages, listProductsNeedingImages };