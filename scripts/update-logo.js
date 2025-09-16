// Script to help update the NANA logo
// Since OneDrive links need to be converted to direct download links

const fs = require('fs');
const https = require('https');
const path = require('path');

// Instructions for manual logo update
console.log('📋 LOGO UPDATE INSTRUCTIONS');
console.log('==============================');
console.log('');
console.log('Your OneDrive link needs to be converted to a direct download link:');
console.log('Original: https://1drv.ms/i/c/c29be3c60d57f1f4/EfD7nbBoEYlJjPJk76jlPQMBx5EjtrCSb1bERLUsKbQcKQ?e=Gc3ThQ');
console.log('');
console.log('📝 Steps to get the direct link:');
console.log('1. Open your OneDrive link in a web browser');
console.log('2. Right-click on the image and select "Copy image address" or "Copy image URL"');
console.log('3. That will give you the direct image URL');
console.log('');
console.log('📂 Current logo location: /assets/logo.jpg');
console.log('');
console.log('🔧 To update the logo:');
console.log('1. Download the image from your OneDrive link');
console.log('2. Replace the file at: c:\\Users\\princ\\Documents\\TOBUN\\NANA Project\\Backend-\\assets\\logo.jpg');
console.log('3. Or run this script with the direct image URL as an argument');
console.log('');
console.log('📧 Email templates have been updated to use:');
console.log('   https://nanacaring-backend.onrender.com/assets/logo.jpg');
console.log('');

// Function to download image from URL
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Downloading image from: ${url}`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filename);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ Logo saved as: ${filename}`);
          resolve();
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filename, () => {}); // Delete the file on error
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download image. Status: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Check if URL was provided as argument
const imageUrl = process.argv[2];
if (imageUrl) {
  const logoPath = path.join(__dirname, '..', 'assets', 'logo.jpg');
  
  downloadImage(imageUrl, logoPath)
    .then(() => {
      console.log('🎉 Logo updated successfully!');
      console.log('📧 Email templates will now use the new logo.');
    })
    .catch((error) => {
      console.error('❌ Error updating logo:', error.message);
      console.log('💡 Please manually download and replace the logo file.');
    });
} else {
  console.log('💡 To auto-download, run: node scripts/update-logo.js <direct-image-url>');
}
