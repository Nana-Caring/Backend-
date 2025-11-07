require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./models');
const { Product } = db;
const cloudinary = require('./config/cloudinary');

// Get ALL Cloudinary images first
async function getAllCloudinaryImages() {
    try {
        console.log('🔍 FETCHING ALL YOUR CLOUDINARY IMAGES...');
        
        const result = await cloudinary.api.resources({
            type: 'upload',
            max_results: 500
        });
        
        console.log(`📸 Found ${result.resources.length} images in your Cloudinary account\n`);
        
        const images = result.resources.map(resource => ({
            publicId: resource.public_id,
            url: resource.secure_url,
            format: resource.format,
            width: resource.width,
            height: resource.height,
            bytes: resource.bytes
        }));
        
        return images;
        
    } catch (error) {
        console.error('❌ Error fetching Cloudinary images:', error);
        return [];
    }
}

// Create comprehensive mapping for ALL your images
function createComprehensiveImageMapping() {
    return {
        // Your existing images from the scan
        'SCHOL-PHON-12': 'Learn_to_Read_Phonics_Books_Set_vhav8g',
        'TABLET-KIDS-LEARN-10': 'Educational_Tablet_for_Kids_j6lrvk',
        'LEAP-TAB-EDU': 'Educational_Tablet_for_Kids_j6lrvk',
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
        'JOH-SHAMP-500': 'Johnson_s_Baby_Shampoo_500ml_bxncnu',
        'APPLE-ORGANIC-RED-1KG': 'Fresh_Organic_Red_Apples_1kg_zzey55',
        'BOARDGAME-FAMILY-3SET': 'Family_Board_Game_Collection_Set_fgdkiu',
        'CL-VITC-500': 'Clicks_Vitamin_C_500mg_30_Tablets_qbhyy1',
        'DISP-ORIG-24': 'Disprin_Original_Pain_Relief_24_Tablets_k1vbzs',
        'FIRSTAID-COMPLETE-150': 'Complete_Family_First_Aid_Emergency_Kit_mptt9w',
        'COL-TOTAL-75': 'Colgate_Total_Advanced_Toothpaste_75ml_z8fwgn',
        'CL-SANIT-500': 'Clicks_Hand_Sanitizer_500ml_edadcl',
        'CL-THERM-DIG': 'Clicks_Digital_Thermometer_td8pqr',
        
        // MISSING IMAGES I need to add:
        'LEGO-BASIC-200': 'LEGO_Basic_Building_Set_200_Pieces_unumrw',
        // Soccer ball (need to find matching product or add as new product)
        'SOCCER-BALL-SIZE5': 'Soccer_Ball_Official_Size_5_kaqled',
        
        // If you have other products that match these image names, add them here
        // I'll also create a smart matching system below
    };
}

async function smartMatchAllImages() {
    try {
        console.log('🧠 SMART MATCHING ALL YOUR CLOUDINARY IMAGES');
        console.log('=============================================\n');
        
        // Get all Cloudinary images
        const cloudinaryImages = await getAllCloudinaryImages();
        const allProducts = await Product.findAll();
        
        console.log('📋 YOUR CLOUDINARY IMAGES:');
        console.log('==========================');
        cloudinaryImages.forEach((img, index) => {
            console.log(`${index + 1}. ${img.publicId}`);
            console.log(`   URL: ${img.url.substring(0, 70)}...`);
            console.log(`   Size: ${Math.round(img.bytes / 1024)}KB, ${img.width}x${img.height}\n`);
        });
        
        console.log('🔄 ATTEMPTING TO MATCH ALL IMAGES TO PRODUCTS...\n');
        
        // Start with existing mappings
        const manualMapping = createComprehensiveImageMapping();
        let matched = 0;
        let updated = 0;
        
        // First, use manual mappings
        for (const [sku, cloudinaryId] of Object.entries(manualMapping)) {
            const product = await Product.findOne({ where: { sku } });
            if (product) {
                const urls = generateOptimizedUrls(cloudinaryId);
                await product.update({
                    image: urls.main,
                    images: JSON.stringify([urls.main, urls.thumbnail, urls.mobile, urls.large])
                });
                console.log(`✅ ${sku}: ${product.name} → ${cloudinaryId}`);
                matched++;
                updated++;
            } else {
                console.log(`⚠️ ${sku}: Product not found`);
            }
        }
        
        console.log(`\n📊 Manual mappings: ${matched} products updated\n`);
        
        // Now try to smart-match remaining images
        console.log('🤖 SMART MATCHING REMAINING IMAGES...');
        console.log('=====================================');
        
        const usedImages = new Set(Object.values(manualMapping));
        const unusedImages = cloudinaryImages.filter(img => !usedImages.has(img.publicId));
        
        console.log(`🔍 Found ${unusedImages.length} unused images:`);
        unusedImages.forEach(img => {
            console.log(`   • ${img.publicId}`);
        });
        
        // Try to match by product name similarity
        let smartMatched = 0;
        for (const img of unusedImages) {
            const imgName = img.publicId.toLowerCase().replace(/_/g, ' ');
            
            // Look for products that might match this image
            const matchingProduct = allProducts.find(product => {
                const productName = product.name.toLowerCase();
                const productWords = productName.split(' ');
                const imgWords = imgName.split(' ');
                
                // Check if at least 2 words match
                const matchingWords = imgWords.filter(word => 
                    word.length > 3 && productWords.some(pWord => pWord.includes(word) || word.includes(pWord))
                );
                
                return matchingWords.length >= 2;
            });
            
            if (matchingProduct && !matchingProduct.image.includes('res.cloudinary.com')) {
                const urls = generateOptimizedUrls(img.publicId);
                await matchingProduct.update({
                    image: urls.main,
                    images: JSON.stringify([urls.main, urls.thumbnail, urls.mobile, urls.large])
                });
                console.log(`🤖 Smart Match: ${matchingProduct.name} → ${img.publicId}`);
                smartMatched++;
                updated++;
            }
        }
        
        console.log(`\n📊 Smart matches: ${smartMatched} additional products updated\n`);
        
        // Show final summary
        console.log('============================================================');
        console.log('📊 COMPLETE IMAGE MAPPING RESULTS');
        console.log('============================================================');
        console.log(`📸 Total Cloudinary Images: ${cloudinaryImages.length}`);
        console.log(`✅ Total Products Updated: ${updated}`);
        console.log(`🎯 Manual Mappings: ${matched}`);
        console.log(`🤖 Smart Matches: ${smartMatched}`);
        console.log(`📋 Unused Images: ${cloudinaryImages.length - matched - smartMatched}`);
        
        // List any remaining unused images
        const finalUsedCount = matched + smartMatched;
        if (cloudinaryImages.length > finalUsedCount) {
            console.log('\n🔍 REMAINING UNUSED IMAGES:');
            console.log('============================');
            const finalUnused = cloudinaryImages.filter(img => {
                const isInManualMapping = Object.values(manualMapping).includes(img.publicId);
                return !isInManualMapping; // This is simplified - in reality we'd track which were smart-matched too
            });
            
            finalUnused.forEach((img, index) => {
                if (index < 10) { // Show first 10
                    console.log(`${index + 1}. ${img.publicId}`);
                    console.log(`   💡 Suggestion: Create a product for this or map to existing product`);
                }
            });
        }
        
        console.log('\n🎉 ALL IMAGE MAPPING COMPLETED!');
        console.log('Visit your app to see all the improved images.');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during smart matching:', error);
        process.exit(1);
    }
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

smartMatchAllImages();