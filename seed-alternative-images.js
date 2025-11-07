require('dotenv').config();
const { Product } = require('./models');

/**
 * 🖼️ Alternative Image Sources for Product Seeding
 * 
 * This script demonstrates various image sources you can use instead of Unsplash
 */

// Image source configurations
const IMAGE_SOURCES = {
  // 1. PIXABAY (Free, high-quality images)
  pixabay: {
    baseUrl: 'https://cdn.pixabay.com/photo',
    examples: [
      'https://cdn.pixabay.com/photo/2017/05/26/16/16/apples-2345182_640.jpg',
      'https://cdn.pixabay.com/photo/2015/08/25/03/50/board-906279_640.jpg',
      'https://cdn.pixabay.com/photo/2017/09/07/08/54/money-2724241_640.jpg'
    ]
  },

  // 2. PEXELS (Free stock photos)
  pexels: {
    baseUrl: 'https://images.pexels.com/photos',
    examples: [
      'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?w=800&h=600',
      'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?w=800&h=600',
      'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=800&h=600'
    ]
  },

  // 3. LOREM PICSUM (Placeholder service)
  loremPicsum: {
    baseUrl: 'https://picsum.photos',
    generator: (width = 800, height = 600, id) => `https://picsum.photos/${width}/${height}?random=${id || Math.floor(Math.random() * 1000)}`
  },

  // 4. PLACEHOLDER.COM
  placeholder: {
    baseUrl: 'https://via.placeholder.com',
    generator: (width = 800, height = 600, text = 'Product') => `https://via.placeholder.com/${width}x${height}/007bff/ffffff?text=${encodeURIComponent(text)}`
  },

  // 5. YOUR ONEDRIVE (Custom images)
  onedrive: {
    baseUrl: 'https://onedrive.live.com/embed',
    generator: (fileId) => `https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21${fileId}&authkey=!zGSjUS&width=800&height=600`
  },

  // 6. LOCAL SERVER (if you host your own images)
  local: {
    baseUrl: 'http://localhost:3000/images',
    generator: (filename) => `http://localhost:3000/images/products/${filename}`
  },

  // 7. CLOUDINARY (CDN service - requires account)
  cloudinary: {
    baseUrl: 'https://res.cloudinary.com',
    generator: (cloudName, imageId) => `https://res.cloudinary.com/${cloudName}/image/upload/w_800,h_600,c_fill/${imageId}`
  },

  // 8. AMAZON S3 / AWS (if you have buckets)
  aws: {
    baseUrl: 'https://your-bucket.s3.amazonaws.com',
    generator: (bucketName, filename) => `https://${bucketName}.s3.amazonaws.com/products/${filename}`
  },

  // 9. GOOGLE DRIVE (public shared images)
  googleDrive: {
    baseUrl: 'https://drive.google.com/uc',
    generator: (fileId) => `https://drive.google.com/uc?export=view&id=${fileId}`
  },

  // 10. IMGUR (free image hosting)
  imgur: {
    baseUrl: 'https://i.imgur.com',
    generator: (imageId) => `https://i.imgur.com/${imageId}.jpg`
  }
};

// Product data with multiple image source options
const productsWithDifferentImageSources = [
  // GROCERIES
  {
    name: 'Fresh Red Apples 1kg - Premium Quality',
    brand: 'Farm Fresh Select',
    description: 'Crisp, juicy red apples perfect for healthy snacking and cooking',
    detailedDescription: 'Premium quality red apples sourced from local orchards. Rich in vitamins and fiber, these apples are perfect for the whole family.',
    price: 45.99,
    category: 'Groceries',
    subcategory: 'Fresh Fruits',
    sku: 'APPLE-RED-PREM-NEW-001',
    stockQuantity: 150,
    weight: '1000g',
    manufacturer: 'Farm Fresh Co-op',
    // Using Pixabay
    imageUrl: 'https://cdn.pixabay.com/photo/2016/07/22/09/59/apples-1534494_640.jpg',
    tags: ['fresh', 'healthy', 'vitamin C', 'local'],
    inStock: true,
    isActive: true,
    minAge: 0,
    maxAge: 100,
    ageCategory: 'All Ages'
  },
  {
    name: 'Organic Whole Wheat Bread',
    brand: 'Artisan Bakehouse',
    description: 'Freshly baked organic whole wheat bread with seeds',
    detailedDescription: 'Premium organic whole wheat bread baked fresh daily with sunflower and pumpkin seeds. No preservatives.',
    price: 35.99,
    category: 'Groceries',
    subcategory: 'Fresh Bakery',
    sku: 'BREAD-WW-ORG-NEW-001',
    stockQuantity: 80,
    weight: '700g',
    manufacturer: 'Artisan Bakehouse',
    // Using Pexels
    imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?w=800&h=600&fit=crop',
    tags: ['organic', 'whole wheat', 'fresh daily', 'no preservatives'],
    inStock: true,
    isActive: true,
    minAge: 1,
    maxAge: 100,
    ageCategory: 'All Ages'
  },

  // EDUCATION
  {
    name: 'Advanced Science Microscope Kit',
    brand: 'ScienceMax Pro',
    description: 'Professional-grade microscope with 1000x magnification for students',
    detailedDescription: 'High-quality microscope kit with LED lighting, multiple lenses, and prepared slide set. Perfect for STEM education.',
    price: 589.99,
    category: 'Education',
    subcategory: 'Science Equipment',
    sku: 'MICROSCOPE-1000X-NEW-001',
    stockQuantity: 20,
    weight: '2000g',
    manufacturer: 'ScienceMax Education',
    // Using Lorem Picsum with specific ID
    imageUrl: IMAGE_SOURCES.loremPicsum.generator(800, 600, 42),
    tags: ['microscope', '1000x magnification', 'STEM', 'educational'],
    inStock: true,
    isActive: true,
    minAge: 12,
    maxAge: 18,
    ageCategory: 'Teen'
  },
  {
    name: 'Interactive Learning Globe',
    brand: 'WorldWise Education',
    description: 'Smart globe with touch technology and country information',
    detailedDescription: 'Interactive educational globe featuring touch-sensitive countries that provide facts, capitals, and cultural information.',
    price: 299.99,
    category: 'Education',
    subcategory: 'Geography & Maps',
    sku: 'GLOBE-SMART-TOUCH-NEW-001',
    stockQuantity: 35,
    weight: '1500g',
    manufacturer: 'WorldWise Education',
    // Using Placeholder with custom text
    imageUrl: IMAGE_SOURCES.placeholder.generator(800, 600, 'Interactive Globe'),
    tags: ['interactive', 'geography', 'touch technology', 'educational'],
    inStock: true,
    isActive: true,
    minAge: 6,
    maxAge: 16,
    ageCategory: 'Child'
  },

  // HEALTHCARE
  {
    name: 'Digital Blood Pressure Monitor',
    brand: 'HealthTech Pro',
    description: 'Automatic blood pressure monitor with large display',
    detailedDescription: 'Professional-grade digital blood pressure monitor with memory storage, large LCD display, and WHO indicators.',
    price: 449.99,
    category: 'Healthcare',
    subcategory: 'Medical Devices',
    sku: 'BP-MONITOR-DIGITAL-NEW-001',
    stockQuantity: 40,
    weight: '500g',
    manufacturer: 'HealthTech Pro',
    // Using Pixabay
    imageUrl: 'https://cdn.pixabay.com/photo/2017/08/25/15/10/heart-rate-2680097_640.jpg',
    tags: ['blood pressure', 'digital', 'WHO indicators', 'memory storage'],
    inStock: true,
    isActive: true,
    minAge: 18,
    maxAge: 100,
    ageCategory: 'Adult'
  },
  {
    name: 'Organic Elderberry Immune Syrup',
    brand: 'Nature\'s Defense',
    description: 'Natural immune support syrup with elderberry and honey',
    detailedDescription: 'Organic elderberry syrup enhanced with raw honey, ginger, and vitamin C. Natural immune system support for the whole family.',
    price: 89.99,
    category: 'Healthcare',
    subcategory: 'Natural Remedies',
    sku: 'ELDERBERRY-SYP-ORG-NEW-001',
    stockQuantity: 60,
    weight: '240ml',
    manufacturer: 'Nature\'s Defense',
    // Using Pexels
    imageUrl: 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?w=800&h=600&fit=crop',
    tags: ['elderberry', 'organic', 'immune support', 'natural'],
    inStock: true,
    isActive: true,
    minAge: 12,
    maxAge: 100,
    ageCategory: 'Teen'
  },

  // ENTERTAINMENT
  {
    name: 'Premium Wireless Gaming Headset',
    brand: 'GameSound Pro',
    description: 'Professional gaming headset with 7.1 surround sound',
    detailedDescription: 'High-performance wireless gaming headset with 7.1 surround sound, noise cancellation, and 20-hour battery life.',
    price: 649.99,
    category: 'Entertainment',
    subcategory: 'Gaming Accessories',
    sku: 'HEADSET-GAME-WIRELESS-NEW-001',
    stockQuantity: 30,
    weight: '350g',
    manufacturer: 'GameSound Technologies',
    // Using Lorem Picsum
    imageUrl: IMAGE_SOURCES.loremPicsum.generator(800, 600, 123),
    tags: ['gaming', 'wireless', '7.1 surround', '20-hour battery'],
    inStock: true,
    isActive: true,
    minAge: 12,
    maxAge: 99,
    ageCategory: 'Teen'
  },

  // PREGNANCY
  {
    name: 'Prenatal Yoga DVD Collection',
    brand: 'MomFit Studios',
    description: 'Complete prenatal yoga program for all pregnancy stages',
    detailedDescription: 'Comprehensive prenatal yoga DVD collection with routines for each trimester, breathing exercises, and postnatal recovery.',
    price: 79.99,
    category: 'Pregnancy',
    subcategory: 'Fitness & Exercise',
    sku: 'YOGA-DVD-PRENATAL-NEW-001',
    stockQuantity: 45,
    weight: '200g',
    manufacturer: 'MomFit Studios',
    // Using Placeholder
    imageUrl: IMAGE_SOURCES.placeholder.generator(800, 600, 'Prenatal Yoga'),
    tags: ['prenatal yoga', 'DVD collection', 'all trimesters', 'breathing'],
    inStock: true,
    isActive: true,
    minAge: 18,
    maxAge: 50,
    ageCategory: 'Adult',
    requiresAgeVerification: false
  },

  // OTHER
  {
    name: 'Smart Air Quality Monitor',
    brand: 'AirSense Pro',
    description: 'WiFi-enabled air quality monitor with app connectivity',
    detailedDescription: 'Advanced air quality monitor tracking PM2.5, humidity, temperature, and VOCs. Connects to smartphone app for real-time monitoring.',
    price: 299.99,
    category: 'Other',
    subcategory: 'Smart Home',
    sku: 'AIR-MONITOR-SMART-NEW-001',
    stockQuantity: 25,
    weight: '300g',
    manufacturer: 'AirSense Technologies',
    // Using Pixabay
    imageUrl: 'https://cdn.pixabay.com/photo/2018/05/17/20/49/air-pollution-3409371_640.jpg',
    tags: ['air quality', 'smart home', 'WiFi', 'app connectivity'],
    inStock: true,
    isActive: true,
    minAge: 16,
    maxAge: 100,
    ageCategory: 'Teen'
  }
];

async function seedWithAlternativeImageSources() {
  try {
    console.log('🖼️  SEEDING PRODUCTS WITH ALTERNATIVE IMAGE SOURCES');
    console.log('=====================================================\n');

    console.log('📋 Available Image Sources:');
    console.log('1. ✅ Pixabay - Free high-quality photos');
    console.log('2. ✅ Pexels - Free stock photography');
    console.log('3. ✅ Lorem Picsum - Random placeholder images');
    console.log('4. ✅ Placeholder.com - Custom placeholder generator');
    console.log('5. 🔧 OneDrive - Your custom images (requires setup)');
    console.log('6. 🔧 Local Server - Self-hosted images');
    console.log('7. 💰 Cloudinary - Professional CDN (paid)');
    console.log('8. 💰 AWS S3 - Amazon cloud storage (paid)');
    console.log('9. 🔧 Google Drive - Public shared images');
    console.log('10. ✅ Imgur - Free image hosting\n');

    let successCount = 0;
    let errorCount = 0;

    for (const productData of productsWithDifferentImageSources) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({
          where: { sku: productData.sku }
        });

        if (existingProduct) {
          console.log(`⚠️  Product ${productData.sku} already exists, skipping...`);
          continue;
        }

        const product = await Product.create(productData);
        console.log(`✅ Added: ${product.name} (${product.category})`);
        console.log(`   Image Source: ${getImageSource(product.imageUrl)}`);
        console.log(`   SKU: ${product.sku} | Price: R${product.price}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error adding ${productData.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 SEEDING RESULTS:');
    console.log('==================');
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);

    // Show image source distribution
    const allProducts = await Product.findAll({
      attributes: ['imageUrl'],
      where: { isActive: true }
    });

    const sourceCounts = {};
    allProducts.forEach(product => {
      const source = getImageSource(product.imageUrl);
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    console.log('\n🖼️  Image Sources Used:');
    Object.keys(sourceCounts).forEach(source => {
      console.log(`   ${source}: ${sourceCounts[source]} products`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Helper function to identify image source
function getImageSource(imageUrl) {
  if (imageUrl.includes('unsplash.com')) return 'Unsplash';
  if (imageUrl.includes('pixabay.com')) return 'Pixabay';
  if (imageUrl.includes('pexels.com')) return 'Pexels';
  if (imageUrl.includes('picsum.photos')) return 'Lorem Picsum';
  if (imageUrl.includes('placeholder.com')) return 'Placeholder.com';
  if (imageUrl.includes('onedrive.live.com')) return 'OneDrive';
  if (imageUrl.includes('cloudinary.com')) return 'Cloudinary';
  if (imageUrl.includes('amazonaws.com')) return 'AWS S3';
  if (imageUrl.includes('drive.google.com')) return 'Google Drive';
  if (imageUrl.includes('imgur.com')) return 'Imgur';
  return 'Other/Custom';
}

// Generate image URL examples for different sources
function generateImageExamples() {
  console.log('🖼️  IMAGE SOURCE EXAMPLES');
  console.log('========================\n');

  console.log('1. PIXABAY (Free):');
  console.log('   https://cdn.pixabay.com/photo/2017/05/26/16/16/apples-2345182_640.jpg\n');

  console.log('2. PEXELS (Free):');
  console.log('   https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?w=800&h=600\n');

  console.log('3. LOREM PICSUM (Random):');
  console.log('   https://picsum.photos/800/600?random=1');
  console.log('   https://picsum.photos/800/600?random=2\n');

  console.log('4. PLACEHOLDER.COM (Custom):');
  console.log('   https://via.placeholder.com/800x600/007bff/ffffff?text=Product+Image\n');

  console.log('5. YOUR ONEDRIVE (Custom):');
  console.log('   https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21FILE_ID&authkey=!zGSjUS&width=800&height=600\n');

  console.log('💡 TIP: You can mix and match different sources for variety!');
}

// Run the operation
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'examples') {
    generateImageExamples();
  } else {
    seedWithAlternativeImageSources()
      .then(() => {
        console.log('\n🏁 Alternative image source seeding completed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
      });
  }
}

module.exports = { 
  seedWithAlternativeImageSources,
  IMAGE_SOURCES,
  productsWithDifferentImageSources,
  generateImageExamples
};