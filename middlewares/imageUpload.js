const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const createUploadDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Generate unique filename
const generateFileName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `product_${timestamp}_${randomString}${ext}`;
};

// Configure multer for memory storage (we'll process with sharp)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
    }
  }
});

// Process and save image
const processAndSaveImage = async (buffer, filename, sizes = {}) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
  await createUploadDir(uploadsDir);

  const results = {};
  
  // Default sizes for product images
  const imageSizes = {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 },
    ...sizes
  };

  // Process each size
  for (const [sizeKey, dimensions] of Object.entries(imageSizes)) {
    const sizedFilename = `${sizeKey}_${filename}`;
    const filepath = path.join(uploadsDir, sizedFilename);
    
    await sharp(buffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);
    
    results[sizeKey] = {
      filename: sizedFilename,
      path: filepath,
      url: `/uploads/products/${sizedFilename}`,
      width: dimensions.width,
      height: dimensions.height
    };
  }

  return results;
};

// Delete image files
const deleteImageFiles = async (imageData) => {
  if (!imageData) return;

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
  
  try {
    if (typeof imageData === 'string') {
      // Single image path
      const filepath = path.join(uploadsDir, path.basename(imageData));
      await fs.unlink(filepath);
    } else if (typeof imageData === 'object') {
      // Multiple sizes object
      for (const sizeData of Object.values(imageData)) {
        if (sizeData.filename) {
          const filepath = path.join(uploadsDir, sizeData.filename);
          try {
            await fs.unlink(filepath);
          } catch (err) {
            console.warn(`Failed to delete file: ${filepath}`, err.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error deleting image files:', error);
  }
};

// Middleware to handle single image upload
const uploadSingle = upload.single('image');

// Middleware to handle multiple image uploads
const uploadMultiple = upload.array('images', 5);

// Middleware to handle mixed form data with images
const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'thumbnails', maxCount: 4 }
]);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  processAndSaveImage,
  deleteImageFiles,
  generateFileName
};
