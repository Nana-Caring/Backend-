require('dotenv').config();
require('dotenv').config({ path: '.env.production' });
require('dotenv').config();

const { Pool } = require('pg');

// Database connection using pg
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

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

// Function to extract Cloudinary image ID from URL
function extractImageIdFromUrl(url) {
    if (!url) return null;
    
    // Match Cloudinary URL pattern and extract image ID
    const match = url.match(/\/([^\/]+)\.(?:jpg|jpeg|png|gif|webp|avif)$/i);
    return match ? match[1] : null;
}

// Function to check if product has valid Cloudinary image
function hasValidCloudinaryImage(imageUrl) {
    if (!imageUrl) return false;
    
    // Check if it's a Cloudinary URL
    if (!imageUrl.includes('cloudinary.com')) return false;
    
    // Extract image ID and check if it's in our available list
    const imageId = extractImageIdFromUrl(imageUrl);
    if (!imageId) return false;
    
    return availableCloudinaryImages.includes(imageId);
}

// Function to identify products without valid Cloudinary URLs
async function identifyProductsToRemove() {
    try {
        console.log('🔍 IDENTIFYING PRODUCTS WITHOUT VALID CLOUDINARY IMAGES');
        console.log('=====================================================');
        
        await pool.connect();
        console.log('✅ Database connected successfully');
        
        const result = await pool.query('SELECT * FROM "Products"');
        const products = result.rows;
        console.log(`📦 Found ${products.length} products in database`);
        
        const productsToRemove = [];
        const validProducts = [];
        
        console.log('\n🔍 ANALYZING EACH PRODUCT:');
        console.log('==========================');
        
        for (const product of products) {
            const hasValidImage = hasValidCloudinaryImage(product.ImageUrl);
            
            if (hasValidImage) {
                validProducts.push(product);
                console.log(`✅ KEEP: ${product.Name}`);
                console.log(`   SKU: ${product.Sku}`);
                console.log(`   Image: ${extractImageIdFromUrl(product.ImageUrl)}`);
            } else {
                productsToRemove.push(product);
                console.log(`❌ REMOVE: ${product.Name}`);
                console.log(`   SKU: ${product.Sku}`);
                console.log(`   Reason: ${!product.ImageUrl ? 'No image URL' : 
                    !product.ImageUrl.includes('cloudinary.com') ? 'Not Cloudinary URL' : 
                    'Image not in available list'}`);
                if (product.ImageUrl) {
                    console.log(`   Current URL: ${product.ImageUrl.substring(0, 80)}...`);
                }
            }
            console.log('');
        }
        
        console.log('\n📊 SUMMARY:');
        console.log('============');
        console.log(`✅ Products to KEEP: ${validProducts.length}`);
        console.log(`❌ Products to REMOVE: ${productsToRemove.length}`);
        
        if (productsToRemove.length > 0) {
            console.log('\n🗑️ PRODUCTS SCHEDULED FOR REMOVAL:');
            console.log('===================================');
            productsToRemove.forEach((product, index) => {
                console.log(`${index + 1}. ${product.Name} (${product.Sku})`);
            });
        }
        
        return { productsToRemove, validProducts };
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

// Function to remove products without valid Cloudinary images
async function removeInvalidProducts() {
    try {
        const { productsToRemove, validProducts } = await identifyProductsToRemove();
        
        if (productsToRemove.length === 0) {
            console.log('\n🎉 All products already have valid Cloudinary images!');
            return;
        }
        
        console.log('\n⚠️ WARNING: This will permanently delete products!');
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');
        
        // Wait 5 seconds before proceeding
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('🗑️ REMOVING PRODUCTS WITHOUT VALID CLOUDINARY IMAGES...');
        console.log('========================================================');
        
        let removedCount = 0;
        
        for (const product of productsToRemove) {
            try {
                await pool.query('DELETE FROM "Products" WHERE "Id" = $1', [product.Id]);
                console.log(`✅ Removed: ${product.Name} (${product.Sku})`);
                removedCount++;
            } catch (error) {
                console.log(`❌ Failed to remove: ${product.Name} - ${error.message}`);
            }
        }
        
        console.log('\n============================================================');
        console.log('📊 CLEANUP RESULTS');
        console.log('============================================================');
        console.log(`🗑️ Products removed: ${removedCount}`);
        console.log(`✅ Products remaining: ${validProducts.length}`);
        console.log(`📈 Database optimization: ${((removedCount / (removedCount + validProducts.length)) * 100).toFixed(1)}% reduction`);
        
        console.log('\n🎯 REMAINING PRODUCTS ALL HAVE VALID CLOUDINARY IMAGES:');
        console.log('======================================================');
        validProducts.forEach((product, index) => {
            const imageId = extractImageIdFromUrl(product.ImageUrl);
            console.log(`${index + 1}. ${product.Name}`);
            console.log(`   SKU: ${product.Sku} | Image: ${imageId}`);
        });
        
        console.log('\n🎉 Cleanup completed successfully!');
        console.log('All remaining products now have optimized Cloudinary images.');
        
    } catch (error) {
        console.error('❌ Error during removal:', error);
    } finally {
        await pool.end();
    }
}

// Run the cleanup
removeInvalidProducts();