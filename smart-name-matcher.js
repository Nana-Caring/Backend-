require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./models');
const { Product } = db;

// Your 30 Cloudinary images with their exact names
const cloudinaryImages = [
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
    'Soccer_Ball_Official_Size_5_kaqled',
    'Science_Experiment_Kit_for_Kids_jx2sty',
    'Building_Blocks_Set_-_100_Pieces_mktssy',
    'Organic_Baby_Food_Puree_-_Mixed_Vegetables_rjesxy',
    'Calcium_Rich_Milk_1L_lnrfvx',
    'Baker_s_Choice_otod2d',
    'Mathematical_Learning_Blocks_pjtoqx',
    'LEGO_Basic_Building_Set_200_Pieces_unumrw'
];

function normalizeString(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')  // Replace non-alphanumeric with spaces
        .replace(/\s+/g, ' ')          // Replace multiple spaces with single space
        .trim();
}

function calculateSimilarity(str1, str2) {
    const normalized1 = normalizeString(str1);
    const normalized2 = normalizeString(str2);
    
    const words1 = normalized1.split(' ').filter(word => word.length > 2);
    const words2 = normalized2.split(' ').filter(word => word.length > 2);
    
    let matchingWords = 0;
    let totalWords = Math.max(words1.length, words2.length);
    
    words1.forEach(word1 => {
        words2.forEach(word2 => {
            // Exact match
            if (word1 === word2) {
                matchingWords += 1;
            }
            // Partial match (one contains the other)
            else if (word1.includes(word2) || word2.includes(word1)) {
                matchingWords += 0.7;
            }
            // Very similar (edit distance)
            else if (Math.abs(word1.length - word2.length) <= 1) {
                let diff = 0;
                for (let i = 0; i < Math.min(word1.length, word2.length); i++) {
                    if (word1[i] !== word2[i]) diff++;
                }
                if (diff <= 1) matchingWords += 0.5;
            }
        });
    });
    
    return matchingWords / totalWords;
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

async function smartMatchByName() {
    try {
        console.log('🎯 SMART MATCHING BY ACTUAL IMAGE NAMES');
        console.log('=======================================');
        console.log('This will match your Cloudinary images to products by their actual names\n');
        
        // Get all products
        const allProducts = await Product.findAll({
            attributes: ['id', 'name', 'sku', 'brand', 'category']
        });
        
        console.log(`📦 Found ${allProducts.length} products in database`);
        console.log(`📸 Found ${cloudinaryImages.length} Cloudinary images\n`);
        
        const matches = [];
        let updated = 0;
        
        // For each Cloudinary image, find the best matching product
        for (const imageId of cloudinaryImages) {
            console.log(`🔍 Matching image: ${imageId}`);
            
            // Extract readable name from image ID
            const imageName = imageId
                .split('_')
                .slice(0, -1) // Remove the last part (hash)
                .join(' ')
                .replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space before capitals
            
            console.log(`   📝 Extracted name: "${imageName}"`);
            
            let bestMatch = null;
            let bestScore = 0;
            
            // Find best matching product
            for (const product of allProducts) {
                const score = calculateSimilarity(imageName, product.name);
                
                if (score > bestScore && score > 0.3) { // Minimum 30% similarity
                    bestScore = score;
                    bestMatch = product;
                }
            }
            
            if (bestMatch) {
                console.log(`   ✅ Best match: "${bestMatch.name}" (${Math.round(bestScore * 100)}% similarity)`);
                console.log(`   📊 SKU: ${bestMatch.sku} | Category: ${bestMatch.category}`);
                
                // Update the product with this image
                const urls = generateOptimizedUrls(imageId);
                
                await Product.update({
                    image: urls.main,
                    images: JSON.stringify([
                        urls.main,
                        urls.thumbnail,
                        urls.mobile,
                        urls.large
                    ])
                }, {
                    where: { id: bestMatch.id }
                });
                
                matches.push({
                    image: imageId,
                    product: bestMatch.name,
                    sku: bestMatch.sku,
                    score: bestScore
                });
                
                updated++;
                console.log(`   🖼️ Updated with optimized URLs`);
            } else {
                console.log(`   ❌ No good match found (similarity too low)`);
            }
            
            console.log(''); // Empty line for readability
        }
        
        // Show final results
        console.log('============================================================');
        console.log('📊 SMART NAME-BASED MATCHING RESULTS');
        console.log('============================================================');
        console.log(`📸 Cloudinary Images: ${cloudinaryImages.length}`);
        console.log(`✅ Products Updated: ${updated}`);
        console.log(`📈 Success Rate: ${Math.round((updated / cloudinaryImages.length) * 100)}%`);
        
        console.log('\n🎯 SUCCESSFUL MATCHES:');
        console.log('======================');
        matches
            .sort((a, b) => b.score - a.score)
            .forEach((match, index) => {
                console.log(`${index + 1}. ${match.product}`);
                console.log(`   Image: ${match.image}`);
                console.log(`   SKU: ${match.sku}`);
                console.log(`   Match: ${Math.round(match.score * 100)}%\n`);
            });
        
        if (updated < cloudinaryImages.length) {
            console.log('💡 UNMATCHED IMAGES:');
            console.log('====================');
            const matchedImages = new Set(matches.map(m => m.image));
            const unmatched = cloudinaryImages.filter(img => !matchedImages.has(img));
            
            unmatched.forEach((img, index) => {
                const imageName = img
                    .split('_')
                    .slice(0, -1)
                    .join(' ')
                    .replace(/([a-z])([A-Z])/g, '$1 $2');
                console.log(`${index + 1}. ${img}`);
                console.log(`   Readable: "${imageName}"`);
                console.log(`   💭 Consider: Creating a product for this or check name similarity\n`);
            });
        }
        
        console.log('🌟 SMART MATCHING COMPLETE!');
        console.log('============================');
        console.log('• ⚡ Images matched by actual product names');
        console.log('• 📱 All matched products now optimized');
        console.log('• 🎯 High-confidence matches only');
        console.log('• 🔄 Ready for blazing-fast image delivery!');
        
        console.log('\n🎉 Visit your app to see the perfectly matched images!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during smart name matching:', error);
        process.exit(1);
    }
}

smartMatchByName();