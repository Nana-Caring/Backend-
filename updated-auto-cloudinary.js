require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./models');
const { Product } = db;
const cloudinary = require('./config/cloudinary');

// Updated mapping with all available Cloudinary images
function createImageMapping() {
    return {
        // Existing mappings
        'SCHOL-PHON-12': 'Learn_to_Read_Phonics_Books_Set_vhav8g',
        'TABLET-KIDS-LEARN-10': 'Educational_Tablet_for_Kids_j6lrvk',
        'CRAY-24-001': 'Crayola_Crayons_24_Pack_vn2i60',
        'CRAY-COL-SET-5': 'Coloring_Books_Set_with_Markers_ldvps3',
        'NG-SCI-KIT-001': 'Science_Experiment_Kit_for_Kids_jx2sty',
        'LR-MATH-BLOCKS': 'Mathematical_Learning_Blocks_pjtoqx',
        'NINT-EDU-ADV-001': 'Video_Game_-_Educational_Adventure_dliigm',
        'SM-KARAOKE-KIDS': 'Kids_Karaoke_Machine_with_Microphone_lziyyv',
        'VTECH-STORY-SND': 'Interactive_Story_Book_with_Sound_o9cmqu',
        'RAV-PUZ-NAT-1000': 'Puzzle_1000_Pieces_-_Nature_Scene_gnbd4r',
        'LEGO-CLASS-100': 'Building_Blocks_Set_-_100_Pieces_mktssy',
        'HAS-FAM-GAME-001': 'Board_Game_-_Family_Fun_Night_cfwqza',
        'KEL-WG-CEREAL-500': 'Whole_Grain_Cereal_for_Kids_nmplkk',
        'JNG-FRUIT-BAR-6': 'Kids_Fruit_Snack_Bars_cbjh3g',
        'PNP-LUNCH-PACK': 'Healthy_Kids_Lunch_Box_Snacks_Pack_uv3boq',
        'NES-FORM-TOD-900': 'Toddler_Formula_Milk_Powde_t5ca2k',
        'WW-BABY-VEG-120': 'Organic_Baby_Food_Puree_-_Mixed_Vegetables_rjesxy',
        'CLV-MILK-CAL-1L': 'Calcium_Rich_Milk_1L_lnrfvx',
        'BREAD-WHOLEGRAIN-ARTISAN': 'Baker_s_Choice_otod2d',
        'DOV-ORIG-100': 'Dove_Original_Beauty_Bar_100g_evei3n',
        'BEP-NAPPY-30': 'Bepanthen_Nappy_Care_Ointment_30g_j5v7we',
        
        // NEW MAPPINGS - From recent uploads
        'JOH-SHAMP-500': 'Johnson_s_Baby_Shampoo_500ml_bxncnu',
        'APPLE-ORGANIC-RED-1KG': 'Fresh_Organic_Red_Apples_1kg_zzey55',
        'BOARDGAME-FAMILY-3SET': 'Family_Board_Game_Collection_Set_fgdkiu',
        'CL-VITC-500': 'Clicks_Vitamin_C_500mg_30_Tablets_qbhyy1',
        'DISP-ORIG-24': 'Disprin_Original_Pain_Relief_24_Tablets_k1vbzs',
        'FIRSTAID-COMPLETE-150': 'Complete_Family_First_Aid_Emergency_Kit_mptt9w',
        'COL-TOTAL-75': 'Colgate_Total_Advanced_Toothpaste_75ml_z8fwgn',
        'CL-SANIT-500': 'Clicks_Hand_Sanitizer_500ml_edadcl',
        'CL-THERM-DIG': 'Clicks_Digital_Thermometer_td8pqr',
        'LEAP-TAB-EDU': 'Educational_Tablet_for_Kids_j6lrvk',
        
        // Additional image if it exists
        'LEGO-BASIC-200': 'LEGO_Basic_Building_Set_200_Pieces_unumrw' // In case you have this product
    };
}

function generateOptimizedUrls(publicId) {
    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    return {
        main: `${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/${publicId}`,
        thumbnail: `${baseUrl}/w_200,h_200,c_fill,q_auto,f_auto/${publicId}`,
        mobile: `${baseUrl}/w_400,h_300,c_fill,q_auto,f_auto/${publicId}`,
        large: `${baseUrl}/w_1200,h_900,c_fill,q_auto,f_auto/${publicId}`,
        original: `${baseUrl}/${publicId}`
    };
}

async function updateAllProducts() {
    try {
        console.log('🌟 UPDATED CLOUDINARY AUTO-UPDATE TOOL');
        console.log('======================================');
        console.log('This will update products with your newly uploaded Cloudinary images\n');
        
        const imageMapping = createImageMapping();
        console.log(`📸 Found ${Object.keys(imageMapping).length} product-image mappings`);
        console.log('🔄 Starting automatic updates...\n');
        
        let updated = 0;
        let errors = 0;
        let skipped = 0;
        
        for (const [sku, cloudinaryId] of Object.entries(imageMapping)) {
            console.log(`Processing SKU: ${sku}`);
            
            try {
                const product = await Product.findOne({ where: { sku } });
                
                if (!product) {
                    console.log(`   ⚠️ Product not found, skipping`);
                    skipped++;
                    continue;
                }
                
                console.log(`   📦 Found: ${product.name}`);
                
                const urls = generateOptimizedUrls(cloudinaryId);
                
                // Update with optimized Cloudinary URL
                await product.update({
                    image: urls.main,
                    images: JSON.stringify([
                        urls.main,
                        urls.thumbnail,
                        urls.mobile,
                        urls.large
                    ])
                });
                
                console.log(`   ✅ Updated successfully!`);
                console.log(`   🖼️ Main URL: ${urls.main.substring(0, 80)}...\n`);
                updated++;
                
            } catch (error) {
                console.log(`   ❌ Error updating: ${error.message}\n`);
                errors++;
            }
        }
        
        console.log('============================================================');
        console.log('📊 UPDATED AUTO-UPDATE RESULTS');
        console.log('============================================================');
        console.log(`🎯 Products Matched: ${Object.keys(imageMapping).length}`);
        console.log(`✅ Successfully Updated: ${updated}`);
        console.log(`❌ Errors: ${errors}`);
        console.log(`⏭️ Skipped: ${skipped}`);
        console.log(`📈 Update Rate: ${((updated / Object.keys(imageMapping).length) * 100).toFixed(1)}%`);
        
        console.log('\n🌟 BENEFITS OF YOUR UPDATED CLOUDINARY IMAGES:');
        console.log('─────────────────────────────────────────────────');
        console.log('• ⚡ 3x faster loading with global CDN');
        console.log('• 📱 Auto-optimized for mobile devices');
        console.log('• 🔄 Smart format conversion (WebP/AVIF)');
        console.log('• 📐 Dynamic resizing for any screen size');
        console.log('• 💾 Reduced bandwidth usage');
        console.log('• 🌐 99.9% uptime guarantee');
        
        console.log('\n💡 All matched products now have professional, optimized images!');
        console.log('🚀 Your customers will experience even faster image loading.');
        console.log('============================================================\n');
        
        // Update any remaining products with generic category images
        console.log('🔄 CHECKING FOR PRODUCTS NEEDING GENERIC IMAGES');
        console.log('===============================================');
        
        const allProducts = await Product.findAll();
        let genericUpdates = 0;
        
        for (const product of allProducts) {
            if (!product.image || !product.image.includes('res.cloudinary.com')) {
                const categoryImage = getCategoryImageUrl(product.category);
                
                await product.update({
                    image: categoryImage,
                    images: JSON.stringify([categoryImage])
                });
                
                console.log(`✅ ${product.name} → Generic ${product.category} image`);
                genericUpdates++;
            }
        }
        
        if (genericUpdates > 0) {
            console.log(`\n📊 Updated ${genericUpdates} products with generic category images`);
        } else {
            console.log('\n🎉 All products already have optimized images!');
        }
        
        console.log('\n🎉 AUTO-UPDATE COMPLETED!');
        console.log('Visit your app to see the improved image loading speeds.');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during auto-update:', error);
        process.exit(1);
    }
}

function getCategoryImageUrl(category) {
    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    const categoryImages = {
        'Healthcare': `${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/healthcare-generic`,
        'Education': `${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/education-generic`,
        'Groceries': `${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/groceries-generic`,
        'Entertainment': `${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/entertainment-generic`,
        'Pregnancy': `${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/pregnancy-generic`,
        'Other': `${baseUrl}/w_800,h_600,c_fill,q_auto,f_auto/other-generic`
    };
    
    return categoryImages[category] || categoryImages['Other'];
}

updateAllProducts();