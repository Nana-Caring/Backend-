const { Product } = require('./models');

/**
 * Quick Product Seeder - Add products with image URLs directly
 * 
 * Usage: 
 * 1. Add your products to the productsToAdd array below
 * 2. Run: node quick-image-seeder.js
 */

// Add your products here - just provide name, brand, price, category and image URL
const productsToAdd = [
  // Example products - replace with your own
  {
    name: 'Premium Headphones',
    brand: 'AudioTech',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    category: 'Entertainment', // Education, Healthcare, Groceries, Transport, Entertainment, Other
    subcategory: 'Audio Equipment',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop'
    ],
    ageCategory: 'All Ages', // Toddler, Child, Teen, Adult, Senior, All Ages
    stockQuantity: 50
  },
  {
    name: 'Organic Baby Food',
    brand: 'NaturalStart',
    description: 'Organic pureed vegetables for babies 6+ months',
    price: 25.99,
    category: 'Groceries',
    subcategory: 'Baby Food',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    ageCategory: 'Toddler',
    stockQuantity: 100
  }
  
  // Add more products here following the same format
  // {
  //   name: 'Your Product Name',
  //   brand: 'Brand Name', 
  //   description: 'Product description',
  //   price: 99.99,
  //   category: 'Healthcare', // Choose from: Education, Healthcare, Groceries, Transport, Entertainment, Other
  //   subcategory: 'Vitamins', // Optional
  //   imageUrl: 'https://your-image-url.com/image.jpg',
  //   additionalImages: ['url1', 'url2'], // Optional array of additional images
  //   ageCategory: 'Adult', // Choose from: Toddler, Child, Teen, Adult, Senior, All Ages
  //   stockQuantity: 75 // Optional, defaults to 50
  // }
];

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
  const nameCode = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  return `${prefix}${nameCode}${randomNum}`;
}

// Helper function to set age ranges
function getAgeRange(ageCategory) {
  switch(ageCategory) {
    case 'Toddler': return { minAge: 0, maxAge: 2 };
    case 'Child': return { minAge: 3, maxAge: 12 };
    case 'Teen': return { minAge: 13, maxAge: 17 };
    case 'Adult': return { minAge: 18, maxAge: 64 };
    case 'Senior': return { minAge: 65, maxAge: 150 };
    default: return { minAge: 0, maxAge: 150 };
  }
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

// Main seeding function
async function quickImageSeeder() {
  try {
    console.log('\n🚀 QUICK IMAGE SEEDER');
    console.log('=====================\n');

    if (productsToAdd.length === 0) {
      console.log('❌ No products to add! Please add products to the productsToAdd array.');
      console.log('📝 Edit this file and add your products with image URLs.\n');
      return;
    }

    console.log(`📦 Found ${productsToAdd.length} products to process...\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < productsToAdd.length; i++) {
      const productInput = productsToAdd[i];
      
      console.log(`\n[${i + 1}/${productsToAdd.length}] Processing: ${productInput.name}`);
      
      try {
        // Validate required fields
        if (!productInput.name || !productInput.brand || !productInput.price || !productInput.category) {
          throw new Error('Missing required fields: name, brand, price, and category are required');
        }

        // Validate image URL
        if (!productInput.imageUrl || !isValidImageUrl(productInput.imageUrl)) {
          throw new Error('Invalid or missing image URL');
        }

        // Validate additional images if provided
        const additionalImages = productInput.additionalImages || [];
        const validAdditionalImages = [];
        
        if (additionalImages.length > 0) {
          for (const imgUrl of additionalImages) {
            if (isValidImageUrl(imgUrl)) {
              validAdditionalImages.push(imgUrl);
            } else {
              console.log(`   ⚠️ Skipping invalid additional image: ${imgUrl}`);
            }
          }
        }

        // Generate SKU
        const sku = generateSKU(productInput.name, productInput.category);

        // Check if product already exists
        const existingProduct = await Product.findOne({ 
          where: { 
            name: productInput.name,
            brand: productInput.brand 
          }
        });

        if (existingProduct) {
          console.log(`   ⚠️ Product already exists: ${productInput.name} by ${productInput.brand}`);
          continue;
        }

        // Set age ranges
        const ageRange = getAgeRange(productInput.ageCategory || 'All Ages');

        // Prepare product data
        const productData = {
          name: productInput.name.trim(),
          brand: productInput.brand.trim(),
          description: productInput.description || `${productInput.name} - Premium quality product`,
          detailedDescription: productInput.detailedDescription || productInput.description,
          price: parseFloat(productInput.price),
          category: productInput.category,
          subcategory: productInput.subcategory || null,
          sku: sku,
          image: productInput.imageUrl,
          images: [productInput.imageUrl, ...validAdditionalImages],
          stockQuantity: productInput.stockQuantity || 50,
          ageCategory: productInput.ageCategory || 'All Ages',
          minAge: ageRange.minAge,
          maxAge: ageRange.maxAge,
          manufacturer: productInput.manufacturer || `${productInput.brand} Manufacturing`,
          weight: productInput.weight || null,
          tags: [
            productInput.category.toLowerCase(),
            productInput.brand.toLowerCase().replace(/\s+/g, ''),
            ...(productInput.tags || [])
          ],
          inStock: productInput.inStock !== undefined ? productInput.inStock : true,
          isActive: productInput.isActive !== undefined ? productInput.isActive : true,
          rating: productInput.rating || (Math.floor(Math.random() * 1.5) + 4), // 4.0-5.0
          reviewCount: productInput.reviewCount || Math.floor(Math.random() * 50) + 10,
          requiresAgeVerification: productInput.requiresAgeVerification || false,
          createdBy: 1
        };

        // Create the product
        const newProduct = await Product.create(productData);
        
        console.log(`   ✅ Created: ${newProduct.name} (ID: ${newProduct.id})`);
        console.log(`   📊 SKU: ${newProduct.sku} | Price: R${newProduct.price} | Stock: ${newProduct.stockQuantity}`);
        console.log(`   🖼️ Primary Image: ${newProduct.image}`);
        if (validAdditionalImages.length > 0) {
          console.log(`   📷 Additional Images: ${validAdditionalImages.length}`);
        }
        
        successCount++;

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errors.push({ product: productInput.name, error: error.message });
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 SEEDING SUMMARY');
    console.log('==================');
    console.log(`✅ Successfully created: ${successCount} products`);
    console.log(`❌ Errors encountered: ${errorCount} products`);
    
    if (errors.length > 0) {
      console.log('\n🔍 ERROR DETAILS:');
      errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.product}: ${err.error}`);
      });
    }

    if (successCount > 0) {
      console.log('\n🎉 Products have been successfully seeded to your database!');
      console.log('💡 You can now view them in your admin panel or via the API.');
    }

  } catch (error) {
    console.error('❌ Fatal error in quick seeder:', error);
  }
}

// Instructions function
function showInstructions() {
  console.log('\n📖 QUICK IMAGE SEEDER INSTRUCTIONS');
  console.log('===================================\n');
  console.log('1. 📝 Edit this file and add your products to the productsToAdd array');
  console.log('2. 🖼️ Ensure all image URLs are valid and accessible');
  console.log('3. ✅ Required fields: name, brand, price, category, imageUrl');
  console.log('4. 🎯 Optional fields: description, subcategory, additionalImages, ageCategory, stockQuantity');
  console.log('5. 🚀 Run: node quick-image-seeder.js');
  console.log('\n📂 Categories: Education, Healthcare, Groceries, Transport, Entertainment, Other');
  console.log('👶 Age Categories: Toddler, Child, Teen, Adult, Senior, All Ages\n');
  console.log('Example product format:');
  console.log(`{
  name: 'Product Name',
  brand: 'Brand Name',
  description: 'Product description',
  price: 99.99,
  category: 'Healthcare',
  subcategory: 'Vitamins',
  imageUrl: 'https://example.com/image.jpg',
  additionalImages: ['url1', 'url2'], // Optional
  ageCategory: 'Adult',
  stockQuantity: 75
}`);
}

// Run based on arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showInstructions();
  } else {
    quickImageSeeder()
      .then(() => {
        console.log('\n✨ Quick seeder completed!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Quick seeder failed:', error);
        process.exit(1);
      });
  }
}

module.exports = { quickImageSeeder, productsToAdd };