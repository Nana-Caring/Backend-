require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./models');
const { Product } = db;

// Your current Cloudinary images (from the scan)
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

function extractImageIdFromUrl(url) {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    // Extract the public ID from Cloudinary URL
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Remove query parameters and file extension
    const imageId = lastPart.split('?')[0].split('.')[0];
    
    return imageId;
}

function normalizeString(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function calculateSimilarity(productName, imageId) {
    const normalizedProduct = normalizeString(productName);
    const normalizedImage = imageId.toLowerCase().replace(/_/g, ' ');
    
    const productWords = normalizedProduct.split(' ').filter(w => w.length > 2);
    const imageWords = normalizedImage.split(' ').filter(w => w.length > 2);
    
    let matchScore = 0;
    let totalWords = Math.max(productWords.length, imageWords.length);
    
    productWords.forEach(pWord => {
        imageWords.forEach(iWord => {
            if (pWord === iWord) matchScore += 1;
            else if (pWord.includes(iWord) || iWord.includes(pWord)) matchScore += 0.7;
        });
    });
    
    return matchScore / totalWords;
}

async function checkProductImageUrls() {
    try {
        console.log('🔍 CHECKING PRODUCT IMAGE URLs');
        console.log('==============================');
        console.log('Verifying if products have correct Cloudinary image URLs\n');
        
        // Get all products
        const allProducts = await Product.findAll({
            attributes: ['id', 'name', 'sku', 'category', 'image'],
            order: [['category', 'ASC'], ['name', 'ASC']]
        });
        
        console.log(`📦 Found ${allProducts.length} products in database`);
        console.log(`📸 Available Cloudinary images: ${availableCloudinaryImages.length}\n`);
        
        let correctUrls = 0;
        let incorrectUrls = 0;
        let placeholderUrls = 0;
        let missingImages = 0;
        
        const results = {
            correct: [],
            incorrect: [],
            placeholders: [],
            missing: [],
            availableMatches: []
        };
        
        // Check each product
        for (const product of allProducts) {
            const currentImageId = extractImageIdFromUrl(product.image);
            
            console.log(`🔍 ${product.name} (${product.sku})`);
            
            if (!product.image) {
                console.log('   ❌ No image URL');
                results.missing.push(product);
                missingImages++;
            }
            else if (product.image.includes('placeholder') || product.image.includes('generic')) {
                console.log('   🔶 Using placeholder image');
                results.placeholders.push(product);
                placeholderUrls++;
                
                // Check if there's a better match available
                const bestMatch = availableCloudinaryImages.find(imgId => {
                    const similarity = calculateSimilarity(product.name, imgId);
                    return similarity > 0.5;
                });
                
                if (bestMatch) {
                    console.log(`   💡 Better match available: ${bestMatch}`);
                    results.availableMatches.push({
                        product,
                        suggestedImage: bestMatch,
                        similarity: calculateSimilarity(product.name, bestMatch)
                    });
                }
            }
            else if (currentImageId && availableCloudinaryImages.includes(currentImageId)) {
                const similarity = calculateSimilarity(product.name, currentImageId);
                if (similarity > 0.3) {
                    console.log(`   ✅ Correct image: ${currentImageId} (${Math.round(similarity * 100)}% match)`);
                    results.correct.push({product, imageId: currentImageId, similarity});
                    correctUrls++;
                } else {
                    console.log(`   🔶 Using image but low similarity: ${currentImageId} (${Math.round(similarity * 100)}% match)`);
                    results.incorrect.push({product, currentImageId, similarity});
                    incorrectUrls++;
                }
            }
            else {
                console.log(`   ❌ Using unavailable/old image: ${currentImageId || 'unknown'}`);
                results.incorrect.push({product, currentImageId, similarity: 0});
                incorrectUrls++;
                
                // Check for better matches
                const bestMatch = availableCloudinaryImages.find(imgId => {
                    const similarity = calculateSimilarity(product.name, imgId);
                    return similarity > 0.4;
                });
                
                if (bestMatch) {
                    console.log(`   💡 Better match available: ${bestMatch}`);
                    results.availableMatches.push({
                        product,
                        suggestedImage: bestMatch,
                        similarity: calculateSimilarity(product.name, bestMatch)
                    });
                }
            }
        }
        
        // Show summary
        console.log('\n============================================================');
        console.log('📊 IMAGE URL VALIDATION RESULTS');
        console.log('============================================================');
        console.log(`✅ Correct URLs: ${correctUrls}`);
        console.log(`❌ Incorrect URLs: ${incorrectUrls}`);
        console.log(`🔶 Placeholder URLs: ${placeholderUrls}`);
        console.log(`❓ Missing Images: ${missingImages}`);
        console.log(`📈 Accuracy Rate: ${Math.round((correctUrls / allProducts.length) * 100)}%`);
        
        // Show unused Cloudinary images
        const usedImages = new Set(results.correct.map(r => r.imageId));
        const unusedImages = availableCloudinaryImages.filter(img => !usedImages.has(img));
        
        console.log('\n🔍 UNUSED CLOUDINARY IMAGES:');
        console.log('=============================');
        if (unusedImages.length > 0) {
            unusedImages.forEach((img, index) => {
                console.log(`${index + 1}. ${img}`);
                
                // Suggest products that might use this image
                const suggestions = allProducts.filter(p => {
                    const similarity = calculateSimilarity(p.name, img);
                    return similarity > 0.3;
                }).sort((a, b) => {
                    return calculateSimilarity(b.name, img) - calculateSimilarity(a.name, img);
                }).slice(0, 2);
                
                if (suggestions.length > 0) {
                    console.log(`   💡 Could match: ${suggestions.map(s => s.name).join(', ')}`);
                }
            });
        } else {
            console.log('🎉 All Cloudinary images are being used!');
        }
        
        // Show available improvements
        if (results.availableMatches.length > 0) {
            console.log('\n💡 SUGGESTED IMPROVEMENTS:');
            console.log('===========================');
            results.availableMatches
                .sort((a, b) => b.similarity - a.similarity)
                .forEach((match, index) => {
                    console.log(`${index + 1}. ${match.product.name}`);
                    console.log(`   Current: ${extractImageIdFromUrl(match.product.image) || 'placeholder'}`);
                    console.log(`   Suggested: ${match.suggestedImage}`);
                    console.log(`   Match Quality: ${Math.round(match.similarity * 100)}%\n`);
                });
        }
        
        console.log('\n🎯 RECOMMENDATIONS:');
        console.log('===================');
        if (incorrectUrls > 0 || placeholderUrls > 0) {
            console.log('1. 🔄 Run smart name matcher to auto-fix matching images');
            console.log('2. 📸 Upload specific images for products without good matches');
            console.log('3. 🎨 Use exact product names when uploading to Cloudinary');
        } else {
            console.log('🎉 All product images are correctly matched!');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error checking product URLs:', error);
        process.exit(1);
    }
}

checkProductImageUrls();