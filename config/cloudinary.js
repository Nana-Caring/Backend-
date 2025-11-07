const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Always use HTTPS
});

// Test configuration function
async function testCloudinaryConnection() {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful!');
        console.log('📊 Status:', result.status);
        return true;
    } catch (error) {
        console.error('❌ Cloudinary connection failed:', error.message);
        return false;
    }
}

module.exports = {
    cloudinary,
    testCloudinaryConnection
};