const axios = require('axios');

/**
 * Helper script to convert OneDrive share URLs to direct image URLs
 * 
 * OneDrive Share URL: https://1drv.ms/f/c/c29be3c60d57f1f4/EjDuo-jcn5xDhzBngn6yQocBM1Rq8TY7WU7WXLtUKczT-A?e=zGSjUS
 * 
 * This script helps you format the URLs correctly for direct image access.
 */

// Your OneDrive folder details (extracted from the share URL)
const ONEDRIVE_DETAILS = {
  cid: 'c29be3c60d57f1f4', // From your share URL
  folderId: 'EjDuo-jcn5xDhzBngn6yQocBM1Rq8TY7WU7WXLtUKczT-A', // From your share URL
  shareKey: 'zGSjUS' // From your share URL (after ?e=)
};

// Sample image file names (you'll need to replace these with actual file names from your folder)
const SAMPLE_IMAGE_FILES = [
  'product1.jpg',
  'product2.jpg', 
  'product3.jpg',
  'product4.jpg',
  'product5.jpg',
  'puzzle.jpg', // For the puzzle image you attached
  'tablet.jpg',
  'vitamins.jpg',
  'firstaid.jpg',
  'boardgames.jpg',
  'headphones.jpg',
  'prenatal.jpg',
  'pillow.jpg'
];

/**
 * Generate direct OneDrive image URLs
 */
function generateOneDriveImageURLs() {
  console.log('🖼️  OneDrive Direct Image URL Generator');
  console.log('=====================================\n');
  
  console.log('📁 Your OneDrive folder:');
  console.log(`   https://1drv.ms/f/c/${ONEDRIVE_DETAILS.cid}/${ONEDRIVE_DETAILS.folderId}?e=${ONEDRIVE_DETAILS.shareKey}\n`);
  
  console.log('📋 Instructions to get your actual image URLs:');
  console.log('1. Open your OneDrive folder in a web browser');
  console.log('2. Click on each image file');
  console.log('3. Click the "Share" button');
  console.log('4. Click "Copy link" to get a direct link');
  console.log('5. Use the format below to create direct image URLs\n');
  
  console.log('🔗 Direct URL Format Examples:');
  console.log('Method 1 - OneDrive Embed (recommended):');
  SAMPLE_IMAGE_FILES.forEach((filename, index) => {
    // This is a template - actual file IDs will be different
    const sampleFileId = `${ONEDRIVE_DETAILS.folderId.replace('EjDuo-jcn5xDhzBngn6yQocBM1Rq8TY7WU7WXLtUKczT-A', `FILE_ID_${index + 1}`)}`;
    const embedUrl = `https://onedrive.live.com/embed?resid=${ONEDRIVE_DETAILS.cid.toUpperCase()}%21${sampleFileId}&authkey=!${ONEDRIVE_DETAILS.shareKey}&width=800&height=600`;
    console.log(`   ${filename}: ${embedUrl}`);
  });
  
  console.log('\nMethod 2 - OneDrive Download:');
  SAMPLE_IMAGE_FILES.forEach((filename, index) => {
    const sampleFileId = `FILE_ID_${index + 1}`;
    const downloadUrl = `https://onedrive.live.com/download?resid=${ONEDRIVE_DETAILS.cid.toUpperCase()}%21${sampleFileId}&authkey=!${ONEDRIVE_DETAILS.shareKey}`;
    console.log(`   ${filename}: ${downloadUrl}`);
  });
  
  console.log('\n⚠️  IMPORTANT NOTES:');
  console.log('- Replace FILE_ID_X with actual file IDs from OneDrive');
  console.log('- Each file has a unique ID that OneDrive generates');
  console.log('- Right-click on each image → "Embed" to get the exact URL');
  console.log('- Test each URL in a browser to ensure it displays the image');
  
  console.log('\n📝 Ready-to-use image array for your script:');
  console.log('const imageUrls = [');
  SAMPLE_IMAGE_FILES.forEach((filename, index) => {
    console.log(`  "https://onedrive.live.com/embed?resid=${ONEDRIVE_DETAILS.cid.toUpperCase()}%21FILE_ID_${index + 1}&authkey=!${ONEDRIVE_DETAILS.shareKey}&width=800&height=600", // ${filename}`);
  });
  console.log('];');
}

/**
 * Test if a OneDrive URL is accessible
 */
async function testOneDriveURL(url) {
  try {
    console.log(`🧪 Testing URL: ${url}`);
    const response = await axios.head(url, { timeout: 10000 });
    
    if (response.status === 200) {
      console.log('✅ URL is accessible');
      console.log(`   Content-Type: ${response.headers['content-type'] || 'Unknown'}`);
      console.log(`   Content-Length: ${response.headers['content-length'] || 'Unknown'}`);
      return true;
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ URL test failed: ${error.message}`);
    return false;
  }
}

/**
 * Updated product list with proper OneDrive URLs
 * You'll need to replace these URLs with your actual OneDrive image URLs
 */
function getUpdatedProductsWithRealURLs() {
  return [
    {
      name: 'Educational Puzzle Set 500 Pieces',
      imageUrl: 'https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21YOUR_PUZZLE_FILE_ID&authkey=!zGSjUS&width=800&height=600',
      description: 'Beautiful 500-piece puzzle matching your uploaded image'
    },
    {
      name: 'Fresh Organic Apples',
      imageUrl: 'https://onedrive.live.com/embed?resid=C29BE3C60D57F1F4%21YOUR_APPLE_FILE_ID&authkey=!zGSjUS&width=800&height=600',
      description: 'Fresh produce with your custom image'
    }
    // Add more products matching your uploaded images
  ];
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
      generateOneDriveImageURLs();
      break;
      
    case 'test':
      const testUrl = process.argv[3];
      if (testUrl) {
        testOneDriveURL(testUrl);
      } else {
        console.log('Usage: node onedrive-helper.js test <url>');
      }
      break;
      
    default:
      console.log('📱 OneDrive Image Helper');
      console.log('========================');
      console.log('');
      console.log('Usage:');
      console.log('  node onedrive-helper.js generate  - Generate URL templates');
      console.log('  node onedrive-helper.js test <url> - Test a OneDrive URL');
      console.log('');
      console.log('Examples:');
      console.log('  node onedrive-helper.js generate');
      console.log('  node onedrive-helper.js test "https://onedrive.live.com/embed?resid=..."');
      console.log('');
      generateOneDriveImageURLs();
  }
}

module.exports = {
  generateOneDriveImageURLs,
  testOneDriveURL,
  getUpdatedProductsWithRealURLs,
  ONEDRIVE_DETAILS,
  SAMPLE_IMAGE_FILES
};