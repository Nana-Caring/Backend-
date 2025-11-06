require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./models');
const { Product } = db;

// Available Cloudinary images
const availableCloudinaryImages = [
    'Wireless_Bluetooth_Noise-Cancelling_Headphones_odof6x',
    'Portable_Chess_Set_with_Tutorial_App_mmpapz',
    'Purity_Baby_Wipes_Sensitive_80_Pack_r4uw2c',
    'Panado_500mg_Pain_Relief_24_Tablets_zlzz5b',
    'Organic_Quinoa_Superfood_500g_ig20r6',
    'Nivea_Soft_Moisturising_Cream_200ml_nxhvsz',
    'Natural_Immune_Boost_Tea_Blend_l1nw9g',
    'Johnson_s_Baby_Shampoo_500ml_bxncnu',
    'Fresh_Organic_Red_Apples_1kg_zzey55',
    'Family_Board_Game_Collection_Set_fgdkiu',
    'Clicks_Vitamin_C_500mg_30_Tablets_qbhyy1',
    'Disprin_Original_Pain_Relief_24_Tablets_k1vbzs',
    'Complete_Family_First_Aid_Emergency_Kit_mptt9w',
    'Colgate_Total_Advanced_Toothpaste_75ml_z8fwgn',
    'Clicks_Hand_Sanitizer_500ml_edadcl',
    'Clicks_Digital_Thermometer_td8pqr',
    'Learn_to_Read_Phonics_Books_Set_vhav8g',
    'Whole_Grain_Cereal_for_Kids_nmplkk',
    'Video_Game_-_Educational_Adventure_dliigm',
    'Educational_Tablet_for_Kids_j6lrvk',
    'Dove_Original_Beauty_Bar_100g_evei3n',
    'Kids_Fruit_Snack_Bars_cbjh3g',
    'Kids_Karaoke_Machine_with_Microphone_lziyyv',
    'Interactive_Story_Book_with_Sound_o9cmqu',
    'Healthy_Kids_Lunch_Box_Snacks_Pack_uv3boq',
    'Puzzle_1000_Pieces_-_Nature_Scene_gnbd4r',
    'Toddler_Formula_Milk_Powde_t5ca2k',
    'Crayola_Crayons_24_Pack_vn2i60',
    'Coloring_Books_Set_with_Markers_ldvps3',
    'Soccer_Ball_Official_Size_5_kaqled'
];

// Function to extract image ID from Cloudinary URL
function extractImageIdFromUrl(url) {
    if (!url) return null;
    
    // Extract the image ID from various Cloudinary URL formats
    const match = url.match(/\/([^/]+)\.(?:jpg|jpeg|png|webp|gif)(?:\?|$)/i) ||
                  url.match(/\/([^/]+)$/);
    
    return match ? match[1] : null;
}

// Function to check if image URL is valid Cloudinary image
function hasValidCloudinaryImage(imageUrl) {
    if (!imageUrl) return false;
    
    // Check if it's a Cloudinary URL
    if (!imageUrl.includes('cloudinary.com')) return false;
    
    // Check if it's a placeholder
    if (imageUrl.includes('placeholder') || imageUrl.includes('default')) return false;
    
    // Extract image ID and check if it's in our available images
    const imageId = extractImageIdFromUrl(imageUrl);
    if (!imageId) return false;
    
    return availableCloudinaryImages.includes(imageId);
}

async function removeProductsWithoutValidCloudinaryImages() {
    try {
        console.log('🔍 IDENTIFYING PRODUCTS WITHOUT VALID CLOUDINARY IMAGES');
        console.log('=====================================================');

        // Test database connection
        await db.sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Get all products
        const products = await Product.findAll();
        console.log(`📦 Found ${products.length} products in database`);

        if (products.length === 0) {
            console.log('\n❌ No products found in database. Check your database connection and table name.');
            return;
        }

        console.log('\n🔍 ANALYZING EACH PRODUCT:');
        console.log('==========================');

        const productsToKeep = [];
        const productsToRemove = [];

        for (const product of products) {
            const hasValidImage = hasValidCloudinaryImage(product.image_url);
            
            console.log(`\n📦 ${product.name} (${product.sku})`);
            console.log(`   🖼️  Image URL: ${product.image_url || 'NULL'}`);
            
            if (hasValidImage) {
                console.log(`   ✅ KEEP - Has valid Cloudinary image`);
                productsToKeep.push(product);
            } else {
                console.log(`   ❌ REMOVE - No valid Cloudinary image`);
                
                // Determine why it's being removed
                if (!product.image_url) {
                    console.log(`   📝 Reason: No image URL`);
                } else if (!product.image_url.includes('cloudinary.com')) {
                    console.log(`   📝 Reason: Not a Cloudinary URL`);
                } else if (product.image_url.includes('placeholder') || product.image_url.includes('default')) {
                    console.log(`   📝 Reason: Placeholder image`);
                } else {
                    const imageId = extractImageIdFromUrl(product.image_url);
                    console.log(`   📝 Reason: Image ID "${imageId}" not in available Cloudinary images`);
                }
                
                productsToRemove.push(product);
            }
        }

        console.log('\n📊 SUMMARY:');
        console.log('============');
        console.log(`✅ Products to KEEP: ${productsToKeep.length}`);
        console.log(`❌ Products to REMOVE: ${productsToRemove.length}`);

        if (productsToRemove.length === 0) {
            console.log('\n🎉 All products already have valid Cloudinary images!');
            return;
        }

        // Show which products will be removed
        console.log('\n🗑️  PRODUCTS TO BE REMOVED:');
        console.log('===========================');
        productsToRemove.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} (${product.sku})`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Price: $${product.price}`);
        });

        // Ask for confirmation (in a real scenario, you'd want user input)
        console.log('\n⚠️  WARNING: This will permanently delete products from the database!');
        console.log('🔄 Proceeding with removal in 3 seconds... (Cancel with Ctrl+C)');
        
        // Wait 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Remove the products
        console.log('\n🗑️  REMOVING PRODUCTS...');
        console.log('========================');

        let removedCount = 0;
        for (const product of productsToRemove) {
            try {
                await product.destroy();
                console.log(`✅ Removed: ${product.name} (${product.sku})`);
                removedCount++;
            } catch (error) {
                console.log(`❌ Failed to remove ${product.name}: ${error.message}`);
            }
        }

        console.log('\n🎉 CLEANUP COMPLETE!');
        console.log('====================');
        console.log(`📊 Total products removed: ${removedCount}`);
        console.log(`📊 Remaining products: ${productsToKeep.length}`);
        console.log(`🌟 All remaining products have valid Cloudinary images!`);

    } catch (error) {
        console.error('❌ Error removing products:', error);
    } finally {
        // Close database connection
        await db.sequelize.close();
        console.log('📝 Database connection closed');
    }
}

// Run the cleanup
removeProductsWithoutValidCloudinaryImages();