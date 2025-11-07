const { Product } = require('./models');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

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

// Function to display products in a formatted way
function displayProducts(products) {
  console.log('\n📦 EXISTING PRODUCTS:');
  console.log('====================');
  
  if (products.length === 0) {
    console.log('❌ No products found in database!');
    return;
  }

  products.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name}`);
    console.log(`   Brand: ${product.brand}`);
    console.log(`   Category: ${product.category}`);
    console.log(`   SKU: ${product.sku}`);
    console.log(`   Price: R${product.price}`);
    console.log(`   Current Image: ${product.image || 'No image'}`);
    console.log(`   Stock: ${product.stockQuantity}`);
    console.log(`   Status: ${product.isActive ? 'Active' : 'Inactive'}`);
  });
}

// Main function to update product images
async function updateExistingProductImages() {
  try {
    console.log('\n🖼️ UPDATE EXISTING PRODUCT IMAGES');
    console.log('=================================\n');
    console.log('💡 This tool helps you update image URLs for existing products');
    console.log('🔍 You can search by name, brand, SKU, or browse all products');
    console.log('🚪 Type "exit" at any time to quit\n');

    while (true) {
      console.log('\n🔍 SEARCH OPTIONS:');
      console.log('1. Show all products');
      console.log('2. Search by product name');
      console.log('3. Search by brand');
      console.log('4. Search by SKU');
      console.log('5. Search by category');
      console.log('6. Show products without images');
      console.log('7. Exit');

      const choice = await askQuestion('Select an option (1-7): ');
      
      if (choice === '7' || choice.toLowerCase() === 'exit') {
        break;
      }

      let products = [];
      
      try {
        switch (choice) {
          case '1':
            // Show all products
            products = await Product.findAll({
              order: [['name', 'ASC']],
              limit: 50 // Limit to prevent overwhelming output
            });
            console.log(`\n📊 Showing ${products.length} products (limited to 50):`);
            break;

          case '2':
            // Search by name
            const searchName = await askQuestion('Enter product name (partial match): ');
            if (searchName.toLowerCase() === 'exit') continue;
            
            products = await Product.findAll({
              where: {
                name: {
                  [require('sequelize').Op.iLike]: `%${searchName}%`
                }
              },
              order: [['name', 'ASC']]
            });
            break;

          case '3':
            // Search by brand
            const searchBrand = await askQuestion('Enter brand name (partial match): ');
            if (searchBrand.toLowerCase() === 'exit') continue;
            
            products = await Product.findAll({
              where: {
                brand: {
                  [require('sequelize').Op.iLike]: `%${searchBrand}%`
                }
              },
              order: [['name', 'ASC']]
            });
            break;

          case '4':
            // Search by SKU
            const searchSku = await askQuestion('Enter SKU: ');
            if (searchSku.toLowerCase() === 'exit') continue;
            
            products = await Product.findAll({
              where: {
                sku: {
                  [require('sequelize').Op.iLike]: `%${searchSku}%`
                }
              },
              order: [['name', 'ASC']]
            });
            break;

          case '5':
            // Search by category
            console.log('\nAvailable categories:');
            console.log('1. Education');
            console.log('2. Healthcare');
            console.log('3. Groceries');
            console.log('4. Transport');
            console.log('5. Entertainment');
            console.log('6. Other');
            
            const categoryChoice = await askQuestion('Select category (1-6): ');
            if (categoryChoice.toLowerCase() === 'exit') continue;
            
            const categories = ['Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'];
            const categoryIndex = parseInt(categoryChoice) - 1;
            
            if (categoryIndex >= 0 && categoryIndex < categories.length) {
              const selectedCategory = categories[categoryIndex];
              products = await Product.findAll({
                where: { category: selectedCategory },
                order: [['name', 'ASC']]
              });
            } else {
              console.log('❌ Invalid category selection');
              continue;
            }
            break;

          case '6':
            // Show products without images
            products = await Product.findAll({
              where: {
                [require('sequelize').Op.or]: [
                  { image: null },
                  { image: '' }
                ]
              },
              order: [['name', 'ASC']],
              limit: 50
            });
            console.log(`\n📊 Products without images:`);
            break;

          default:
            console.log('❌ Invalid option. Please select 1-7.');
            continue;
        }

        // Display found products
        displayProducts(products);

        if (products.length === 0) {
          console.log('🔍 No products found. Try a different search.');
          continue;
        }

        // Ask which product to update
        console.log(`\n✏️ SELECT PRODUCT TO UPDATE:`);
        const productChoice = await askQuestion(`Enter product number (1-${products.length}) or 'back' to search again: `);
        
        if (productChoice.toLowerCase() === 'exit') break;
        if (productChoice.toLowerCase() === 'back') continue;

        const productIndex = parseInt(productChoice) - 1;
        
        if (productIndex < 0 || productIndex >= products.length) {
          console.log('❌ Invalid product number');
          continue;
        }

        const selectedProduct = products[productIndex];
        
        // Show current product details
        console.log(`\n📦 SELECTED PRODUCT: ${selectedProduct.name}`);
        console.log('==========================');
        console.log(`ID: ${selectedProduct.id}`);
        console.log(`Brand: ${selectedProduct.brand}`);
        console.log(`SKU: ${selectedProduct.sku}`);
        console.log(`Category: ${selectedProduct.category}`);
        console.log(`Current Image: ${selectedProduct.image || 'No image'}`);
        
        if (selectedProduct.images && selectedProduct.images.length > 0) {
          console.log(`Additional Images: ${selectedProduct.images.length}`);
          selectedProduct.images.forEach((img, idx) => {
            console.log(`  ${idx + 1}. ${img}`);
          });
        }

        // Get new image URL
        console.log('\n🖼️ UPDATE IMAGES:');
        const newImageUrl = await askQuestion('Enter new primary image URL: ');
        
        if (newImageUrl.toLowerCase() === 'exit') break;
        if (newImageUrl.toLowerCase() === 'skip') continue;

        // Validate new image URL
        if (!isValidImageUrl(newImageUrl)) {
          console.log('❌ Invalid image URL! Please provide a valid image URL.');
          continue;
        }

        // Ask for additional images
        const additionalImagesInput = await askQuestion('Enter additional image URLs (comma-separated, or press Enter to skip): ');
        
        let additionalImages = [];
        if (additionalImagesInput && additionalImagesInput.toLowerCase() !== 'exit') {
          const urls = additionalImagesInput.split(',').map(url => url.trim()).filter(url => url);
          
          urls.forEach(url => {
            if (isValidImageUrl(url)) {
              additionalImages.push(url);
            } else {
              console.log(`⚠️ Skipping invalid URL: ${url}`);
            }
          });
        }

        // Prepare update data
        const updateData = {
          image: newImageUrl,
          images: [newImageUrl, ...additionalImages],
          updatedAt: new Date()
        };

        // Show update summary
        console.log('\n📋 UPDATE SUMMARY:');
        console.log('==================');
        console.log(`Product: ${selectedProduct.name}`);
        console.log(`Old Image: ${selectedProduct.image || 'None'}`);
        console.log(`New Image: ${newImageUrl}`);
        if (additionalImages.length > 0) {
          console.log(`Additional Images: ${additionalImages.length}`);
        }

        // Confirm update
        const confirm = await askQuestion('\nConfirm update? (y/n): ');
        
        if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
          try {
            // Update the product
            await selectedProduct.update(updateData);
            
            console.log('✅ Product images updated successfully!');
            console.log(`🆔 Product ID: ${selectedProduct.id}`);
            console.log(`🖼️ New primary image: ${newImageUrl}`);
            
            if (additionalImages.length > 0) {
              console.log(`📷 Additional images: ${additionalImages.length}`);
            }
            
          } catch (error) {
            console.error('❌ Error updating product:', error.message);
          }
        } else {
          console.log('❌ Update cancelled');
        }

        // Ask to continue
        const continueChoice = await askQuestion('\nUpdate another product? (y/n): ');
        if (continueChoice.toLowerCase() === 'n' || continueChoice.toLowerCase() === 'no') {
          break;
        }

      } catch (error) {
        console.error('❌ Error during search:', error.message);
      }
    }

    console.log('\n🎉 Image update session completed!');
    
  } catch (error) {
    console.error('❌ Error in image updater:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Function to show current products summary
async function showProductsSummary() {
  try {
    const total = await Product.count();
    const withImages = await Product.count({ 
      where: { 
        image: { 
          [require('sequelize').Op.and]: [
            { [require('sequelize').Op.ne]: null },
            { [require('sequelize').Op.ne]: '' }
          ]
        } 
      } 
    });
    const withoutImages = total - withImages;

    console.log('\n📊 PRODUCTS SUMMARY:');
    console.log('===================');
    console.log(`Total Products: ${total}`);
    console.log(`With Images: ${withImages}`);
    console.log(`Without Images: ${withoutImages}`);

    if (withoutImages > 0) {
      console.log(`\n📋 Products missing images:`);
      const productsWithoutImages = await Product.findAll({
        where: { 
          [require('sequelize').Op.or]: [
            { image: null },
            { image: '' }
          ]
        },
        attributes: ['id', 'name', 'brand', 'sku'],
        limit: 10
      });

      productsWithoutImages.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.brand}) - SKU: ${product.sku}`);
      });

      if (withoutImages > 10) {
        console.log(`... and ${withoutImages - 10} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error getting products summary:', error);
  }
}

// Batch update function for multiple products
async function batchUpdateImages(updates) {
  console.log('\n🔄 BATCH UPDATE IMAGES');
  console.log('======================\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const update of updates) {
    try {
      const product = await Product.findOne({
        where: { 
          [require('sequelize').Op.or]: [
            { id: update.id },
            { sku: update.sku },
            { name: update.name }
          ]
        }
      });

      if (!product) {
        throw new Error(`Product not found: ${update.id || update.sku || update.name}`);
      }

      // Validate image URL
      if (!isValidImageUrl(update.imageUrl)) {
        throw new Error(`Invalid image URL: ${update.imageUrl}`);
      }

      // Prepare additional images
      const additionalImages = [];
      if (update.additionalImages && Array.isArray(update.additionalImages)) {
        update.additionalImages.forEach(url => {
          if (isValidImageUrl(url)) {
            additionalImages.push(url);
          }
        });
      }

      // Update product
      await product.update({
        image: update.imageUrl,
        images: [update.imageUrl, ...additionalImages],
        updatedAt: new Date()
      });

      console.log(`✅ Updated: ${product.name} (ID: ${product.id})`);
      successCount++;

    } catch (error) {
      console.log(`❌ Error updating ${update.id || update.sku || update.name}: ${error.message}`);
      errors.push({ update, error: error.message });
      errorCount++;
    }
  }

  console.log(`\n📊 Batch Update Results:`);
  console.log(`✅ Successful updates: ${successCount}`);
  console.log(`❌ Failed updates: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n🔍 Error Details:');
    errors.forEach((err, index) => {
      console.log(`${index + 1}. ${err.update.id || err.update.sku || err.update.name}: ${err.error}`);
    });
  }
}

// Run based on arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--summary') || args.includes('-s')) {
    showProductsSummary().then(() => process.exit(0));
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log('\n📖 PRODUCT IMAGE UPDATER HELP');
    console.log('=============================\n');
    console.log('Usage:');
    console.log('  node update-existing-images.js          - Interactive image updater');
    console.log('  node update-existing-images.js --summary - Show products summary');
    console.log('  node update-existing-images.js --help    - Show this help\n');
    console.log('Features:');
    console.log('  • Search products by name, brand, SKU, or category');
    console.log('  • Find products without images');
    console.log('  • Update primary image URL');
    console.log('  • Add multiple additional images');
    console.log('  • Validate image URLs before saving');
    console.log('  • Preview changes before confirming\n');
  } else {
    updateExistingProductImages();
  }
}

module.exports = { updateExistingProductImages, showProductsSummary, batchUpdateImages };