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
           url.includes('onedrive');
  } catch {
    return false;
  }
}

// Helper function to generate SKU
function generateSKU(name, category) {
  const categoryPrefix = {
    'Education': 'EDU',
    'Healthcare': 'HEALTH',
    'Groceries': 'GROC', 
    'Transport': 'TRANS',
    'Entertainment': 'ENT',
    'Other': 'OTH'
  };
  
  const prefix = categoryPrefix[category] || 'PROD';
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}${randomNum}`;
}

// Main interactive seeding function
async function interactiveProductSeeder() {
  try {
    console.log('\n🌱 INTERACTIVE PRODUCT SEEDER');
    console.log('================================\n');
    console.log('💡 This tool helps you add products one by one with image URLs');
    console.log('📝 You can provide multiple image URLs separated by commas');
    console.log('🚪 Type "exit" at any time to quit\n');

    let continueSeeding = true;
    let productCount = 0;

    while (continueSeeding) {
      console.log(`\n📦 ADDING PRODUCT #${productCount + 1}`);
      console.log('----------------------------');

      // Get product name
      const name = await askQuestion('Enter product name: ');
      if (name.toLowerCase() === 'exit') break;

      if (!name.trim()) {
        console.log('❌ Product name is required!');
        continue;
      }

      // Get brand
      const brand = await askQuestion('Enter brand name: ');
      if (brand.toLowerCase() === 'exit') break;

      // Get description
      const description = await askQuestion('Enter product description: ');
      if (description.toLowerCase() === 'exit') break;

      // Get price
      let price;
      while (true) {
        const priceInput = await askQuestion('Enter price (e.g., 29.99): ');
        if (priceInput.toLowerCase() === 'exit') {
          continueSeeding = false;
          break;
        }
        
        price = parseFloat(priceInput);
        if (isNaN(price) || price < 0) {
          console.log('❌ Please enter a valid price (number > 0)');
          continue;
        }
        break;
      }
      
      if (!continueSeeding) break;

      // Get category
      console.log('\nAvailable categories:');
      console.log('1. Education');
      console.log('2. Healthcare'); 
      console.log('3. Groceries');
      console.log('4. Transport');
      console.log('5. Entertainment');
      console.log('6. Other');

      let category;
      while (true) {
        const categoryChoice = await askQuestion('Select category (1-6): ');
        if (categoryChoice.toLowerCase() === 'exit') {
          continueSeeding = false;
          break;
        }

        const categories = ['Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'];
        const categoryIndex = parseInt(categoryChoice) - 1;
        
        if (categoryIndex >= 0 && categoryIndex < categories.length) {
          category = categories[categoryIndex];
          break;
        } else {
          console.log('❌ Please enter a number between 1-6');
        }
      }
      
      if (!continueSeeding) break;

      // Get subcategory (optional)
      const subcategory = await askQuestion('Enter subcategory (optional): ');
      if (subcategory.toLowerCase() === 'exit') break;

      // Get image URLs
      let images = [];
      let primaryImage = '';
      
      console.log('\n📸 IMAGE URLS');
      console.log('You can provide multiple image URLs separated by commas');
      console.log('The first URL will be used as the primary image');
      
      while (true) {
        const imageUrls = await askQuestion('Enter image URL(s): ');
        if (imageUrls.toLowerCase() === 'exit') {
          continueSeeding = false;
          break;
        }

        if (!imageUrls.trim()) {
          console.log('❌ At least one image URL is required!');
          continue;
        }

        // Split by comma and clean URLs
        const urlList = imageUrls.split(',').map(url => url.trim()).filter(url => url);
        
        // Validate URLs
        const validUrls = [];
        const invalidUrls = [];
        
        urlList.forEach(url => {
          if (isValidImageUrl(url)) {
            validUrls.push(url);
          } else {
            invalidUrls.push(url);
          }
        });

        if (invalidUrls.length > 0) {
          console.log(`❌ Invalid image URLs: ${invalidUrls.join(', ')}`);
          console.log('Please provide valid image URLs (jpg, png, gif, etc.)');
          continue;
        }

        if (validUrls.length > 0) {
          primaryImage = validUrls[0];
          images = validUrls.length > 1 ? validUrls : [];
          console.log(`✅ Primary image: ${primaryImage}`);
          if (images.length > 1) {
            console.log(`📷 Additional images: ${images.length - 1}`);
          }
          break;
        }
      }
      
      if (!continueSeeding) break;

      // Get age category
      console.log('\nAge categories:');
      console.log('1. Toddler (0-2)');
      console.log('2. Child (3-12)');
      console.log('3. Teen (13-17)');
      console.log('4. Adult (18+)');
      console.log('5. Senior (65+)');
      console.log('6. All Ages');

      let ageCategory;
      while (true) {
        const ageChoice = await askQuestion('Select age category (1-6): ');
        if (ageChoice.toLowerCase() === 'exit') {
          continueSeeding = false;
          break;
        }

        const ageCategories = ['Toddler', 'Child', 'Teen', 'Adult', 'Senior', 'All Ages'];
        const ageIndex = parseInt(ageChoice) - 1;
        
        if (ageIndex >= 0 && ageIndex < ageCategories.length) {
          ageCategory = ageCategories[ageIndex];
          break;
        } else {
          console.log('❌ Please enter a number between 1-6');
        }
      }
      
      if (!continueSeeding) break;

      // Get stock quantity
      let stockQuantity = 50; // Default
      const stockInput = await askQuestion('Enter stock quantity (default: 50): ');
      if (stockInput.toLowerCase() === 'exit') break;
      
      if (stockInput.trim()) {
        const stock = parseInt(stockInput);
        if (!isNaN(stock) && stock >= 0) {
          stockQuantity = stock;
        }
      }

      // Generate SKU
      const sku = generateSKU(name, category);

      // Set age ranges based on category
      let minAge = 0, maxAge = 150;
      switch(ageCategory) {
        case 'Toddler': minAge = 0; maxAge = 2; break;
        case 'Child': minAge = 3; maxAge = 12; break;
        case 'Teen': minAge = 13; maxAge = 17; break;
        case 'Adult': minAge = 18; maxAge = 64; break;
        case 'Senior': minAge = 65; maxAge = 150; break;
      }

      // Create product data
      const productData = {
        name: name.trim(),
        brand: brand.trim() || 'Generic',
        description: description.trim() || 'Product description',
        price: price,
        category: category,
        subcategory: subcategory.trim() || null,
        sku: sku,
        image: primaryImage,
        images: images,
        stockQuantity: stockQuantity,
        ageCategory: ageCategory,
        minAge: minAge,
        maxAge: maxAge,
        manufacturer: `${brand.trim()} Manufacturing`,
        tags: [category.toLowerCase(), brand.toLowerCase().replace(/\s+/g, '')],
        inStock: true,
        isActive: true,
        rating: Math.floor(Math.random() * 1.5) + 4, // 4.0-5.0
        reviewCount: Math.floor(Math.random() * 50) + 10,
        createdBy: 1
      };

      // Show summary
      console.log('\n📋 PRODUCT SUMMARY:');
      console.log('===================');
      console.log(`Name: ${productData.name}`);
      console.log(`Brand: ${productData.brand}`);
      console.log(`Category: ${productData.category}`);
      console.log(`Price: R${productData.price}`);
      console.log(`SKU: ${productData.sku}`);
      console.log(`Age Category: ${productData.ageCategory}`);
      console.log(`Stock: ${productData.stockQuantity}`);
      console.log(`Primary Image: ${productData.image}`);
      if (productData.images.length > 1) {
        console.log(`Additional Images: ${productData.images.length - 1}`);
      }

      // Confirm creation
      const confirm = await askQuestion('\nCreate this product? (y/n): ');
      if (confirm.toLowerCase() === 'exit') break;

      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        try {
          // Check if SKU exists
          const existingProduct = await Product.findOne({ where: { sku: productData.sku } });
          if (existingProduct) {
            console.log(`⚠️ Product with SKU ${productData.sku} already exists!`);
            continue;
          }

          // Create the product
          const newProduct = await Product.create(productData);
          console.log(`✅ Product created successfully! ID: ${newProduct.id}`);
          productCount++;
          
        } catch (error) {
          console.error('❌ Error creating product:', error.message);
        }
      } else {
        console.log('❌ Product creation cancelled');
      }

      // Ask to continue
      const continueChoice = await askQuestion('\nAdd another product? (y/n): ');
      if (continueChoice.toLowerCase() === 'exit' || 
          continueChoice.toLowerCase() === 'n' || 
          continueChoice.toLowerCase() === 'no') {
        continueSeeding = false;
      }
    }

    console.log(`\n🎉 Session completed! Created ${productCount} products.`);
    
  } catch (error) {
    console.error('❌ Error in interactive seeder:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  interactiveProductSeeder();
}

module.exports = { interactiveProductSeeder };