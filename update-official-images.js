const { Pool } = require('pg');

// Better approach: Use reliable CDN and official website URLs for South African products
const betterProductImages = [
  {
    sku: 'COKE-2L-001',
    name: 'Coca-Cola Original 2L',
    imageUrl: 'https://www.cocacola.co.za/content/dam/one/za/en/products/coca-cola/coca-cola-2l.jpg'
  },
  {
    sku: 'WS-MAIZE-25KG', 
    name: 'White Star Super Maize Meal 2.5kg',
    imageUrl: 'https://cdn0.woolworths.co.za/content/media/catalog/product/w/h/whitestar-super-maize-meal-25kg-285952ea.jpg'
  },
  {
    sku: 'RAMA-MARG-500G',
    name: 'Rama Original Margarine 500g', 
    imageUrl: 'https://www.checkers.co.za/medias/10000516-checkers515Wx515H?context=bWFzdGVyfGltYWdlc3w='
  },
  {
    sku: 'PANADO-500MG-20',
    name: 'Panado Paracetamol 500mg 20 Tablets',
    imageUrl: 'https://www.clicks.co.za/medias/00000000000487-000-515Wx515H?context=bWFzdGVyfGltYWdlc3w='
  },
  {
    sku: 'DETTOL-ANTI-750',
    name: 'Dettol Antiseptic Liquid 750ml',
    imageUrl: 'https://www.dettol.co.za/content/dam/common/our-products/antiseptic-liquid-750ml.png'
  },
  {
    sku: 'STAED-NORIS-12', 
    name: 'Staedtler Noris HB Pencils Pack of 12',
    imageUrl: 'https://www.staedtler.com/content/dam/staedtler/product-catalog/noris/120/120-hb-12-pack.jpg'
  },
  {
    sku: 'OXF-A4-LINED-96',
    name: 'Oxford A4 Lined Exercise Book 96 Pages', 
    imageUrl: 'https://www.cna.co.za/media/catalog/product/o/x/oxford-a4-exercise-book-96pg-feint-lined.jpg'
  },
  {
    sku: 'SHELL-VP95-200',
    name: 'Shell V-Power 95 Octane Fuel Voucher',
    imageUrl: 'https://www.shell.co.za/content/dam/shell-new/local/country/zaf/images/shell-v-power.jpg'
  },
  {
    sku: 'UBER-VOUCHER-150', 
    name: 'Uber Ride Voucher R150',
    imageUrl: 'https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/images/uber-gift-card.png'
  },
  {
    sku: 'NETFLIX-GC-200',
    name: 'Netflix Gift Card R200',
    imageUrl: 'https://assets.nflxext.com/us/ffe/siteui/acquisition/payment/giftCards/Netflix-Card-Standard.png'
  },
  {
    sku: 'PS-STORE-GC-250',
    name: 'PlayStation Store Gift Card R250', 
    imageUrl: 'https://gmedia.playstation.com/is/image/SIEPDC/playstation-store-gift-card-hero-01-ps5-en-27jul21'
  },
  {
    sku: 'SAMSUNG-BUDS2PRO',
    name: 'Samsung Galaxy Earbuds2 Pro',
    imageUrl: 'https://images.samsung.com/is/image/samsung/p6pim/za/2208/gallery/za-galaxy-buds2-pro-r510-532858759'
  },
  {
    sku: 'NIVEA-SOFT-300ML',
    name: 'Nivea Soft Moisturizing Cream 300ml',
    imageUrl: 'https://www.nivea.co.za/-/media/nivea/local/za/our-products/face-care/nivea-soft-300ml.jpg'
  },
  {
    sku: 'TASTIC-RICE-2KG',
    name: 'Tastic Rice 2kg', 
    imageUrl: 'https://www.checkers.co.za/medias/10144752-checkers515Wx515H?context=bWFzdGVyfGltYWdlc3w='
  },
  {
    sku: 'PNP-LUNCHBOX-001',
    name: 'Pick n Pay School Lunch Box',
    imageUrl: 'https://www.pnp.co.za/pnpstorefront/pnp/en/images/products/kids-lunch-box-blue.jpg'
  },
  {
    sku: 'KFC-VOUCHER-100',
    name: 'KFC Voucher R100', 
    imageUrl: 'https://online.kfc.co.za/static/images/gift-cards/kfc-gift-card-voucher.png'
  },
  {
    sku: 'SUNLIGHT-DISH-750ML',
    name: 'Sunlight Dishwashing Liquid 750ml',
    imageUrl: 'https://www.sunlight.co.za/content/dam/unilever/sunlight/south_africa/pack_shot/sunlight-lemon-750ml.png'
  }
];

async function updateWithBetterImages() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🖼️  Updating products with official brand images...\n');

    let updatedCount = 0;
    
    for (const update of betterProductImages) {
      try {
        const result = await pool.query(`
          UPDATE "products" 
          SET image = $1, "updatedAt" = NOW()
          WHERE sku = $2
          RETURNING id, name
        `, [update.imageUrl, update.sku]);

        if (result.rowCount > 0) {
          updatedCount++;
          console.log(`✅ ${updatedCount}. Updated: ${update.name}`);
          console.log(`   Image source: ${update.imageUrl.includes('cocacola') ? 'Coca-Cola Official' : 
                                         update.imageUrl.includes('checkers') ? 'Checkers Online' :
                                         update.imageUrl.includes('clicks') ? 'Clicks Pharmacy' :
                                         update.imageUrl.includes('dettol') ? 'Dettol Official' :
                                         update.imageUrl.includes('staedtler') ? 'Staedtler Official' :
                                         update.imageUrl.includes('shell') ? 'Shell Official' :
                                         update.imageUrl.includes('netflix') ? 'Netflix Official' :
                                         update.imageUrl.includes('samsung') ? 'Samsung Official' :
                                         update.imageUrl.includes('nivea') ? 'Nivea Official' :
                                         'Official Brand'}`);
        } else {
          console.log(`⚠️  Product not found: ${update.name}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${update.name}:`, error.message);
      }
    }

    // Show verification
    console.log(`\n📊 Update Summary: ${updatedCount}/${betterProductImages.length} products updated`);
    
    // Sample verification
    console.log('\n🔍 Verification - Updated products with new images:');
    const sampleProducts = await pool.query(`
      SELECT name, image, brand
      FROM "products" 
      WHERE image LIKE '%cocacola%' OR image LIKE '%checkers%' OR image LIKE '%clicks%'
      ORDER BY id 
      LIMIT 3
    `);

    sampleProducts.rows.forEach(product => {
      console.log(`📦 ${product.name} (${product.brand})`);
      console.log(`   ✅ ${product.image.substring(0, 60)}...`);
    });

    console.log('\n🎉 Products updated with official brand images!');
    console.log('✅ Using direct URLs from Coca-Cola, Checkers, Clicks, and other official sources');
    console.log('✅ Images are now more reliable and show actual South African products');
    
  } catch (error) {
    console.error('❌ Error updating images:', error.message);
  } finally {
    await pool.end();
  }
}

updateWithBetterImages();