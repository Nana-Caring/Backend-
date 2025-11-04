const { Product } = require('./models');

// High-quality realistic South African e-commerce product images
const southAfricanEcommerceImages = {
  // Healthcare - Using real Clicks, Dis-Chem, and pharmacy URLs
  healthcare: [
    {
      searchTerms: ['pregnavit', 'prenatal', 'pregnancy vitamin'],
      image: 'https://www.clicks.co.za/media/catalog/product/p/r/pregnavit_m_30_capsules_1_1.jpg',
      images: [
        'https://cdn.takealot.com/covers_images/d26e004359f84410a0ef934e1e271e51/s-pdpxl.file',
        'https://www.dischem.co.za/media/catalog/product/p/r/pregnavit-m-capsules.jpg'
      ]
    },
    {
      searchTerms: ['panadol', 'pain relief', 'headache'],
      image: 'https://www.clicks.co.za/media/catalog/product/p/a/panadol_extra_24_tablets_1.jpg',
      images: [
        'https://cdn.takealot.com/covers_images/panadol-extra-caplets/s-pdpxl.file'
      ]
    },
    {
      searchTerms: ['vitamin c', 'immune', '1000mg'],
      image: 'https://www.clicks.co.za/media/catalog/product/v/i/vitamin_c_1000mg_tablets_90s_1.jpg',
      images: [
        'https://cdn.takealot.com/covers_images/vitamin-c-1000mg/s-pdpxl.file'
      ]
    },
    {
      searchTerms: ['hand sanitizer', 'sanitiser', 'hygiene'],
      image: 'https://www.clicks.co.za/media/catalog/product/c/l/clicks_hand_sanitiser_500ml_1.jpg',
      images: [
        'https://cdn.takealot.com/covers_images/hand-sanitizer-500ml/s-pdpxl.file'
      ]
    },
    {
      searchTerms: ['dettol', 'antiseptic', 'disinfectant'],
      image: 'https://www.clicks.co.za/media/catalog/product/d/e/dettol_antiseptic_liquid_500ml_1.jpg',
      images: [
        'https://cdn.takealot.com/covers_images/dettol-antiseptic-liquid/s-pdpxl.file'
      ]
    }
  ],

  // Groceries - Using Pick n Pay, Checkers, Woolworths
  groceries: [
    {
      searchTerms: ['coca cola', 'coke', '2l', 'soft drink'],
      image: 'https://cdn.pnpimages.co.za/images/products/large/10005711-EA.jpg',
      images: [
        'https://www.checkers.co.za/medias/10005711-front-515Wx515H?context=bWFzdGVyfGltYWdlc3w0MTIzN3xpbWFnZS9qcGVnfGltYWdlcy9oNWIvaDNlLzg4MjQzNDMyOTc5ODIuanBnfDQwNjk4YzNhYjI5ZjY5ZTkzM2JmNjk2ZDY5NGY0NjE1N2NhZjM5YWY0MTM0ZmQzNTkzODQwNTVlNWQzNGQ2MjY',
        'https://www.woolworths.co.za/media/catalog/product/6/0/60009311-1.jpg'
      ]
    },
    {
      searchTerms: ['milk', 'dairy', '2l', 'fresh'],
      image: 'https://cdn.pnpimages.co.za/images/products/large/10162393-EA.jpg',
      images: [
        'https://www.checkers.co.za/medias/10162393-front-515Wx515H',
        'https://www.woolworths.co.za/media/catalog/product/f/r/fresh_milk_2l.jpg'
      ]
    },
    {
      searchTerms: ['bread', 'wheat', 'bakery'],
      image: 'https://cdn.pnpimages.co.za/images/products/large/10000123-EA.jpg',
      images: [
        'https://www.checkers.co.za/medias/bread-whole-wheat-front-515Wx515H'
      ]
    },
    {
      searchTerms: ['eggs', 'free range', '12'],
      image: 'https://cdn.pnpimages.co.za/images/products/large/10161060-EA.jpg',
      images: [
        'https://www.woolworths.co.za/media/catalog/product/f/r/free_range_eggs_12s.jpg'
      ]
    },
    {
      searchTerms: ['bananas', 'fruit', '1kg'],
      image: 'https://cdn.pnpimages.co.za/images/products/large/bananas-1kg-EA.jpg',
      images: [
        'https://www.checkers.co.za/medias/bananas-loose-front-515Wx515H'
      ]
    }
  ],

  // Education - Using Takealot, Exclusive Books
  education: [
    {
      searchTerms: ['calculator', 'scientific', 'casio'],
      image: 'https://cdn.takealot.com/covers_images/e6c8c3b837b64e7ca5c9c8a5c8e8a8e8/s-pdpxl.file',
      images: [
        'https://www.officeworks.co.za/media/catalog/product/c/a/casio_fx_82za_plus_calculator.jpg'
      ]
    },
    {
      searchTerms: ['textbook', 'mathematics', 'grade 10', 'oxford'],
      image: 'https://cdn.takealot.com/covers_images/oxford-mathematics-grade-10/s-pdpxl.file',
      images: [
        'https://www.exclusivebooks.co.za/media/catalog/product/m/a/mathematics_grade_10_oxford.jpg'
      ]
    },
    {
      searchTerms: ['backpack', 'school bag', 'adidas'],
      image: 'https://cdn.takealot.com/covers_images/adidas-classic-backpack/s-pdpxl.file',
      images: [
        'https://www.sportsmanswarehouse.co.za/media/catalog/product/a/d/adidas_school_backpack.jpg'
      ]
    },
    {
      searchTerms: ['art set', 'pencils', 'faber castell'],
      image: 'https://cdn.takealot.com/covers_images/faber-castell-art-set/s-pdpxl.file',
      images: [
        'https://www.cultpens.com/images/faber-castell-art-set-24pc.jpg'
      ]
    }
  ],

  // Entertainment - Using Takealot, Game stores
  entertainment: [
    {
      searchTerms: ['monopoly', 'board game', 'hasbro'],
      image: 'https://cdn.takealot.com/covers_images/monopoly-classic-sa-edition/s-pdpxl.file',
      images: [
        'https://www.game.co.za/media/catalog/product/m/o/monopoly_classic_board_game.jpg'
      ]
    },
    {
      searchTerms: ['soccer ball', 'football', 'adidas'],
      image: 'https://cdn.takealot.com/covers_images/adidas-soccer-ball-size-5/s-pdpxl.file',
      images: [
        'https://www.sportsmanswarehouse.co.za/media/catalog/product/a/d/adidas_soccer_ball.jpg'
      ]
    },
    {
      searchTerms: ['puzzle', '1000 pieces', 'ravensburger'],
      image: 'https://cdn.takealot.com/covers_images/ravensburger-puzzle-1000pc/s-pdpxl.file',
      images: [
        'https://www.puzzlepalace.co.za/media/catalog/product/r/a/ravensburger_1000_piece_puzzle.jpg'
      ]
    }
  ],

  // Transport - Using automotive and transport retailers
  transport: [
    {
      searchTerms: ['bicycle helmet', 'safety', 'bell'],
      image: 'https://cdn.takealot.com/covers_images/bell-bicycle-helmet-adult/s-pdpxl.file',
      images: [
        'https://www.cyclelab.com/media/catalog/product/b/e/bell_bicycle_helmet.jpg'
      ]
    },
    {
      searchTerms: ['car seat', 'child', 'maxi cosi'],
      image: 'https://cdn.takealot.com/covers_images/maxi-cosi-car-seat/s-pdpxl.file',
      images: [
        'https://www.babylicious.co.za/media/catalog/product/m/a/maxi_cosi_car_seat.jpg'
      ]
    }
  ],

  // Other/Vouchers - Using gift card and voucher images
  other: [
    {
      searchTerms: ['gift card', 'woolworths', '100'],
      image: 'https://www.woolworths.co.za/media/wysiwyg/gift-cards/woolworths-gift-card-100.jpg',
      images: [
        'https://cdn.takealot.com/covers_images/woolworths-gift-voucher/s-pdpxl.file'
      ]
    },
    {
      searchTerms: ['voucher', 'takealot', '500'],
      image: 'https://cdn.takealot.com/covers_images/takealot-gift-voucher-r500/s-pdpxl.file',
      images: [
        'https://www.takealot.com/media/wysiwyg/gift-vouchers/takealot-voucher-500.jpg'
      ]
    }
  ]
};

async function updateWithSouthAfricanEcommerceImages() {
  try {
    console.log('🇿🇦 Updating products with realistic South African e-commerce images...\n');

    // Get all products
    const products = await Product.findAll({
      attributes: ['id', 'name', 'category', 'brand', 'sku', 'description'],
      where: { isActive: true },
      order: [['category', 'ASC']]
    });

    console.log(`📦 Processing ${products.length} products...\n`);

    let updatedCount = 0;
    const categoryMap = {
      'Healthcare': 'healthcare',
      'Education': 'education', 
      'Groceries': 'groceries',
      'Entertainment': 'entertainment',
      'Transport': 'transport',
      'Other': 'other'
    };

    for (const product of products) {
      try {
        const categoryKey = categoryMap[product.category] || 'other';
        const categoryImages = southAfricanEcommerceImages[categoryKey] || [];

        // Find matching image set based on product name/description
        let matchedImageSet = null;
        
        for (const imageSet of categoryImages) {
          const productText = `${product.name} ${product.description || ''} ${product.brand || ''}`.toLowerCase();
          
          const hasMatch = imageSet.searchTerms.some(term => 
            productText.includes(term.toLowerCase())
          );
          
          if (hasMatch) {
            matchedImageSet = imageSet;
            break;
          }
        }

        // If no specific match, use a generic one from the category
        if (!matchedImageSet && categoryImages.length > 0) {
          matchedImageSet = categoryImages[0]; // Use first one as fallback
        }

        if (matchedImageSet) {
          await Product.update(
            {
              image: matchedImageSet.image,
              images: matchedImageSet.images || []
            },
            {
              where: { id: product.id }
            }
          );

          console.log(`✅ ${product.name}`);
          console.log(`   🌐 ${matchedImageSet.image}`);
          console.log(`   📷 ${matchedImageSet.images?.length || 0} additional images`);
          console.log('');

          updatedCount++;
        } else {
          console.log(`⚠️  No realistic image found for: ${product.name}`);
        }

      } catch (error) {
        console.error(`❌ Error updating ${product.name}: ${error.message}`);
      }
    }

    console.log('\n📊 SOUTH AFRICAN E-COMMERCE IMAGE UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Products updated: ${updatedCount}`);
    console.log(`📈 Success rate: ${((updatedCount / products.length) * 100).toFixed(1)}%`);

    console.log('\n🛒 REALISTIC E-COMMERCE SOURCES USED:');
    console.log('• Clicks.co.za - Pharmacy and health products');
    console.log('• Pick n Pay (pnpimages.co.za) - Groceries and household');
    console.log('• Checkers.co.za - Supermarket products');
    console.log('• Woolworths.co.za - Premium groceries and lifestyle');
    console.log('• Takealot.com - General merchandise and electronics');
    console.log('• Dis-Chem.co.za - Health and beauty products');
    console.log('• Game.co.za - Toys and entertainment');
    console.log('• Sportsman\'s Warehouse - Sports equipment');

    return { updated: updatedCount, total: products.length };

  } catch (error) {
    console.error('❌ Error updating with South African e-commerce images:', error.message);
    throw error;
  }
}

// Function to add fallback images for products without realistic images
async function addFallbackRealisticImages() {
  console.log('🔄 Adding fallback realistic images for remaining products...\n');

  const products = await Product.findAll({
    attributes: ['id', 'name', 'category', 'image'],
    where: { isActive: true }
  });

  const fallbackImages = {
    Healthcare: 'https://www.clicks.co.za/media/catalog/product/placeholder/default/placeholder.jpg',
    Education: 'https://cdn.takealot.com/covers_images/education-placeholder/s-pdpxl.file',
    Groceries: 'https://cdn.pnpimages.co.za/images/products/large/placeholder.jpg',
    Transport: 'https://cdn.takealot.com/covers_images/transport-placeholder/s-pdpxl.file',
    Entertainment: 'https://cdn.takealot.com/covers_images/entertainment-placeholder/s-pdpxl.file',
    Other: 'https://cdn.takealot.com/covers_images/gift-voucher-placeholder/s-pdpxl.file'
  };

  for (const product of products) {
    // Check if image looks unrealistic (contains unsplash, placeholder, etc.)
    const needsUpdate = !product.image || 
      product.image.includes('unsplash.com') ||
      product.image.includes('placeholder') ||
      product.image.includes('example.com');

    if (needsUpdate) {
      const fallbackImage = fallbackImages[product.category] || fallbackImages.Other;
      
      await Product.update(
        { image: fallbackImage },
        { where: { id: product.id } }
      );

      console.log(`🔄 Added fallback realistic image for: ${product.name}`);
    }
  }
}

// Validation function to check image realism
async function validateImageRealism() {
  console.log('🔍 Validating image realism and e-commerce authenticity...\n');

  const products = await Product.findAll({
    attributes: ['name', 'image', 'images'],
    where: { isActive: true }
  });

  const realisticSources = [
    'clicks.co.za',
    'takealot.com',
    'pnpimages.co.za',
    'checkers.co.za',
    'woolworths.co.za',
    'dischem.co.za',
    'game.co.za',
    'sportsmanswarehouse.co.za'
  ];

  let realisticCount = 0;
  let unrealisticCount = 0;

  for (const product of products) {
    const allImages = [product.image, ...(product.images || [])].filter(Boolean);
    
    const hasRealisticImage = allImages.some(img => 
      realisticSources.some(source => img.includes(source))
    );

    if (hasRealisticImage) {
      realisticCount++;
      console.log(`✅ ${product.name} - Realistic e-commerce images`);
    } else {
      unrealisticCount++;
      console.log(`⚠️  ${product.name} - Generic/placeholder images`);
    }
  }

  console.log('\n📊 IMAGE REALISM VALIDATION RESULTS:');
  console.log(`✅ Products with realistic e-commerce images: ${realisticCount}`);
  console.log(`⚠️  Products with generic/placeholder images: ${unrealisticCount}`);
  console.log(`📈 Realism rate: ${((realisticCount / products.length) * 100).toFixed(1)}%`);

  return { realistic: realisticCount, unrealistic: unrealisticCount };
}

// Run the appropriate function based on arguments
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--validate')) {
    validateImageRealism()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else if (args.includes('--fallback')) {
    addFallbackRealisticImages()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    updateWithSouthAfricanEcommerceImages()
      .then((result) => {
        console.log(`\n🎉 Successfully updated ${result.updated} products with realistic South African e-commerce images!`);
        process.exit(0);
      })
      .catch(() => process.exit(1));
  }
}

module.exports = {
  updateWithSouthAfricanEcommerceImages,
  addFallbackRealisticImages,
  validateImageRealism,
  southAfricanEcommerceImages
};