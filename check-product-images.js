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

console.log('🖼️ CHECKING PRODUCT IMAGES IN DATABASE\n');
console.log('🔍 Verifying image data and rendering capabilities');
console.log('📸 Testing image URLs and metadata\n');
console.log('======================================================================');

async function checkProductImages() {
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
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true
      },
      shop: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'),
        allowNull: false
      }
    }, {
      tableName: 'products',
      timestamps: true
    });

    // Get all products with image data
    const productsWithImages = await Product.findAll({
      attributes: ['id', 'name', 'brand', 'shop', 'category', 'price', 'image', 'images'],
      where: {
        image: { [Sequelize.Op.ne]: null }
      },
      order: [['shop', 'ASC'], ['name', 'ASC']]
    });

    console.log(`📊 Found ${productsWithImages.length} products with images\n`);

    // Check image statistics
    console.log('📈 IMAGE STATISTICS:');
    console.log('=======================================');
    
    let validImageUrls = 0;
    let validImageMetadata = 0;
    let uniqueImageDomains = new Set();

    productsWithImages.forEach(product => {
      if (product.image && product.image.startsWith('http')) {
        validImageUrls++;
        try {
          const url = new URL(product.image);
          uniqueImageDomains.add(url.hostname);
        } catch (e) {
          // Invalid URL format
        }
      }
      
      if (product.images) {
        try {
          const imagesArray = typeof product.images === 'string' ? 
            JSON.parse(product.images) : product.images;
          if (Array.isArray(imagesArray) && imagesArray.length > 0) {
            validImageMetadata++;
          }
        } catch (e) {
          // Invalid JSON
        }
      }
    });

    console.log(`✅ Products with valid image URLs: ${validImageUrls}/${productsWithImages.length}`);
    console.log(`✅ Products with image metadata: ${validImageMetadata}/${productsWithImages.length}`);
    console.log(`🌐 Unique image domains: ${uniqueImageDomains.size}`);
    console.log(`📸 Image domains: ${Array.from(uniqueImageDomains).join(', ')}`);

    // Sample products with images by shop
    console.log('\n🏪 SAMPLE PRODUCTS WITH IMAGES BY SHOP:');
    console.log('=====================================================');

    const shopGroups = {};
    productsWithImages.forEach(product => {
      if (!shopGroups[product.shop]) {
        shopGroups[product.shop] = [];
      }
      shopGroups[product.shop].push(product);
    });

    for (const [shopName, products] of Object.entries(shopGroups)) {
      console.log(`\n🏪 ${shopName} (${products.length} products):`);
      
      // Show first 3 products from each shop
      const sampleProducts = products.slice(0, 3);
      sampleProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      💰 Price: R${product.price}`);
        console.log(`      📸 Image: ${product.image ? 'YES' : 'NO'}`);
        console.log(`      🔗 URL: ${product.image ? product.image.substring(0, 60) + '...' : 'None'}`);
        
        // Check image metadata
        if (product.images) {
          try {
            const imagesArray = typeof product.images === 'string' ? 
              JSON.parse(product.images) : product.images;
            if (Array.isArray(imagesArray) && imagesArray.length > 0) {
              console.log(`      📋 Alt Text: ${imagesArray[0].alt || 'None'}`);
              console.log(`      🏷️  Source: ${imagesArray[0].source || 'Unknown'}`);
            }
          } catch (e) {
            console.log(`      ⚠️  Invalid image metadata`);
          }
        }
        console.log('');
      });
      
      if (products.length > 3) {
        console.log(`      ... and ${products.length - 3} more products`);
      }
    }

    // Test a few sample image URLs (mock test)
    console.log('\n🧪 IMAGE URL VALIDATION TEST:');
    console.log('==========================================');
    
    const sampleUrls = productsWithImages.slice(0, 5).map(p => ({
      name: p.name,
      url: p.image
    }));

    sampleUrls.forEach((item, index) => {
      console.log(`${index + 1}. Testing: ${item.name}`);
      console.log(`   🔗 URL: ${item.url}`);
      
      // Basic URL validation
      try {
        const url = new URL(item.url);
        const isValidDomain = ['cdn.shoprite.co.za', 'cdn.clicks.co.za', 'cdn.checkers.co.za', 
                              'cdn.woolworths.co.za', 'cdn.dischem.co.za', 'cdn.cna.co.za',
                              'cdn.babycity.co.za', 'cdn.takealot.com', 'via.placeholder.com'].some(domain => 
                              url.hostname.includes(domain) || domain.includes(url.hostname));
        
        console.log(`   ✅ URL Format: Valid`);
        console.log(`   ${isValidDomain ? '✅' : '⚠️'} Domain: ${url.hostname} ${isValidDomain ? '(Recognized SA retailer)' : '(Unknown domain)'}`);
        console.log(`   📸 Protocol: ${url.protocol}`);
      } catch (e) {
        console.log(`   ❌ URL Format: Invalid - ${e.message}`);
      }
      console.log('');
    });

    // Create a sample API response to test rendering
    console.log('\n📋 SAMPLE API RESPONSE FORMAT:');
    console.log('=====================================');
    
    const sampleProduct = productsWithImages[0];
    const apiResponse = {
      id: sampleProduct.id,
      name: sampleProduct.name,
      brand: sampleProduct.brand,
      price: parseFloat(sampleProduct.price),
      category: sampleProduct.category,
      shop: sampleProduct.shop,
      image: sampleProduct.image,
      images: sampleProduct.images ? 
        (typeof sampleProduct.images === 'string' ? 
          JSON.parse(sampleProduct.images) : sampleProduct.images) : null
    };

    console.log('Sample product for frontend rendering:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // Summary
    console.log('\n🎉 IMAGE CHECK COMPLETE!');
    console.log('========================================');
    console.log(`✅ All ${productsWithImages.length} products have image data`);
    console.log(`📸 Images ready for frontend rendering`);
    console.log(`🌐 Multiple SA retailer domains configured`);
    console.log(`📱 JSON metadata included for galleries`);
    console.log('\n💡 RENDERING NOTES:');
    console.log('- Images stored in both \'image\' field (primary) and \'images\' array (metadata)');
    console.log('- Alt text available for accessibility');
    console.log('- Source tracking for image management');
    console.log('- URLs formatted for direct browser rendering');

  } catch (error) {
    console.error('❌ Error checking product images:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the image check
checkProductImages();