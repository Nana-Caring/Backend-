const { cloudinary } = require('./config/cloudinary');

async function listCloudinaryImages() {
    try {
        console.log('🔍 Testing Cloudinary connection...');
        
        // Test basic connection first
        const pingResult = await cloudinary.api.ping();
        console.log('✅ Cloudinary connected:', pingResult.status);
        
        console.log('\n📸 Fetching your uploaded images...');
        
        // Try different search approaches
        const searches = [
            // Search in root folder
            cloudinary.search.expression('*').sort_by([['created_at', 'desc']]).max_results(30),
            // Search by resource type
            cloudinary.api.resources({ resource_type: 'image', max_results: 30 }),
        ];

        let allImages = [];

        // Try the search API
        try {
            const searchResult = await searches[0].execute();
            if (searchResult.resources && searchResult.resources.length > 0) {
                allImages = searchResult.resources;
                console.log(`✅ Found ${allImages.length} images via search API`);
            }
        } catch (searchError) {
            console.log('⚠️ Search API failed, trying resources API...');
            
            // Try the resources API
            try {
                const resourceResult = await searches[1];
                if (resourceResult.resources && resourceResult.resources.length > 0) {
                    allImages = resourceResult.resources;
                    console.log(`✅ Found ${allImages.length} images via resources API`);
                }
            } catch (resourceError) {
                console.log('❌ Resources API also failed:', resourceError.message);
            }
        }

        if (allImages.length === 0) {
            console.log('\n🤔 No images found in your Cloudinary account.');
            console.log('💡 You may need to upload some images first.');
            console.log('\n📋 Your Cloudinary details:');
            console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
            console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY?.substring(0, 8)}...`);
            return;
        }

        console.log('\n📸 YOUR CLOUDINARY IMAGES:');
        console.log('='.repeat(60));
        
        allImages.forEach((image, index) => {
            console.log(`${index + 1}. ${image.public_id}`);
            console.log(`   URL: ${image.secure_url}`);
            console.log(`   Size: ${Math.round(image.bytes / 1024)}KB`);
            console.log(`   Format: ${image.format}`);
            console.log(`   Dimensions: ${image.width}x${image.height}`);
            
            if (image.folder) {
                console.log(`   Folder: ${image.folder}`);
            }
            
            console.log(`   Created: ${new Date(image.created_at).toLocaleDateString()}`);
            console.log('');
        });

        console.log(`📊 Total: ${allImages.length} images in your Cloudinary account`);
        
        // Show optimized URL examples
        if (allImages.length > 0) {
            const firstImage = allImages[0];
            console.log('\n💡 OPTIMIZATION EXAMPLES:');
            console.log('='.repeat(40));
            console.log(`Original: ${firstImage.secure_url}`);
            console.log(`Optimized: ${cloudinary.url(firstImage.public_id, { 
                quality: 'auto', 
                format: 'auto', 
                width: 800, 
                height: 600, 
                crop: 'fill' 
            })}`);
            console.log(`Thumbnail: ${cloudinary.url(firstImage.public_id, { 
                quality: 'auto', 
                format: 'auto', 
                width: 200, 
                height: 200, 
                crop: 'fill' 
            })}`);
        }

    } catch (error) {
        console.error('❌ Error accessing Cloudinary:', error.message);
        
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('1. Check your .env file has correct Cloudinary credentials');
        console.log('2. Verify your API key has proper permissions');
        console.log('3. Make sure you have uploaded some images to Cloudinary');
        console.log('\n📋 Current credentials:');
        console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || 'Not set'}`);
        console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 8) + '...' : 'Not set'}`);
        console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'}`);
    }
}

// Also provide direct URLs for manual upload
function showUploadInfo() {
    console.log('\n📤 CLOUDINARY UPLOAD OPTIONS:');
    console.log('=============================');
    console.log(`1. Web Interface: https://console.cloudinary.com/console/c_${process.env.CLOUDINARY_CLOUD_NAME}/media_library`);
    console.log('2. Upload widget: Use Cloudinary upload widget in your app');
    console.log('3. API Upload: Use the cloudinary-product-updater.js script');
    console.log('4. Drag & Drop: Upload directly to Cloudinary console');
}

listCloudinaryImages().then(() => {
    showUploadInfo();
    console.log('\n✨ Check complete!');
}).catch(console.error);