# Product Image Upload API Documentation

## Overview

The NANA Caring backend now supports image upload functionality for products. Admins can upload main product images and thumbnail images that are automatically processed into multiple sizes for optimal display across different devices and use cases.

## Features

- ✅ **Main Image Upload**: Single main product image with auto-generated thumbnails
- ✅ **Thumbnail Images**: Multiple additional product images (up to 4)
- ✅ **Image Processing**: Automatic resize to multiple sizes (thumbnail, medium, large)
- ✅ **File Validation**: Type and size restrictions
- ✅ **Age Restrictions**: Products filtered by dependent age from SA ID numbers
- ✅ **Static File Serving**: Images served via `/uploads/products/` endpoint

## Image Sizes Generated

For each uploaded image, the system automatically creates:

- **Thumbnail**: 150x150px (for product lists)
- **Medium**: 400x400px (for product cards)  
- **Large**: 800x800px (for product detail pages)

## API Endpoints

### 1. Upload Main Product Image

**Endpoint:** `POST /api/products/:id/images/main`

**Authentication:** Admin required

**Content-Type:** `multipart/form-data`

**Parameters:**
- `id` (path): Product ID
- `image` (file): Image file (JPEG, PNG, WebP, max 10MB)

**Response:**
```json
{
  "success": true,
  "message": "Main image uploaded successfully",
  "data": {
    "mainImage": {
      "thumbnail": {
        "filename": "thumbnail_product_1698234567_abc12345.jpeg",
        "url": "/uploads/products/thumbnail_product_1698234567_abc12345.jpeg",
        "width": 150,
        "height": 150
      },
      "medium": {
        "filename": "medium_product_1698234567_abc12345.jpeg",
        "url": "/uploads/products/medium_product_1698234567_abc12345.jpeg",
        "width": 400,
        "height": 400
      },
      "large": {
        "filename": "large_product_1698234567_abc12345.jpeg",
        "url": "/uploads/products/large_product_1698234567_abc12345.jpeg",
        "width": 800,
        "height": 800
      }
    }
  }
}
```

### 2. Upload Thumbnail Images

**Endpoint:** `POST /api/products/:id/images/thumbnails`

**Authentication:** Admin required

**Content-Type:** `multipart/form-data`

**Parameters:**
- `id` (path): Product ID
- `images` (files): Array of image files (max 5 files, JPEG/PNG/WebP, max 10MB each)

**Response:**
```json
{
  "success": true,
  "message": "Thumbnail images uploaded successfully",
  "data": {
    "thumbnailImages": [
      {
        "thumbnail": { "filename": "...", "url": "...", "width": 150, "height": 150 },
        "medium": { "filename": "...", "url": "...", "width": 400, "height": 400 },
        "large": { "filename": "...", "url": "...", "width": 800, "height": 800 }
      }
    ],
    "totalThumbnails": 1
  }
}
```

### 3. Get Product Images

**Endpoint:** `GET /api/products/:id/images`

**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": 1,
    "productName": "Sample Product",
    "mainImage": {
      "thumbnail": { "filename": "...", "url": "...", "width": 150, "height": 150 },
      "medium": { "filename": "...", "url": "...", "width": 400, "height": 400 },
      "large": { "filename": "...", "url": "...", "width": 800, "height": 800 }
    },
    "thumbnailImages": [...]
  }
}
```

### 4. Delete Thumbnail Image

**Endpoint:** `DELETE /api/products/:id/images/thumbnails/:thumbnailIndex`

**Authentication:** Admin required

**Parameters:**
- `id` (path): Product ID
- `thumbnailIndex` (path): Index of thumbnail to delete (0-based)

**Response:**
```json
{
  "success": true,
  "message": "Thumbnail image deleted successfully",
  "data": {
    "thumbnailImages": [...],
    "totalThumbnails": 2
  }
}
```

## Age-Based Product Filtering

### Get Age-Appropriate Products for Dependent

**Endpoint:** `GET /api/products/dependent/:dependentId`

**Authentication:** Required

**Query Parameters:**
- `category` (optional): Filter by product category
- `brand` (optional): Filter by brand
- `search` (optional): Search in name, brand, description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): Sort field (default: 'name')
- `sortOrder` (optional): Sort direction - ASC/DESC (default: 'ASC')

**Response:**
```json
{
  "success": true,
  "data": [...products...],
  "dependent": {
    "id": 123,
    "name": "John Doe",
    "age": 15,
    "ageCategory": "Teen"
  },
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Validate Product Access for Dependent

**Endpoint:** `GET /api/products/dependent/:dependentId/validate/:productId`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "canAccess": true,
    "dependentAge": 15,
    "productAgeRestriction": {
      "minAge": 0,
      "maxAge": 18,
      "ageCategory": "Child/Teen",
      "requiresVerification": false
    },
    "message": "Product is available for this dependent"
  }
}
```

## File Upload Restrictions

- **File Types**: JPEG, PNG, WebP only
- **File Size**: Maximum 10MB per file
- **File Count**: Maximum 5 files per upload
- **Thumbnail Limit**: Maximum 4 thumbnail images per product

## Error Responses

### File Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB per file."
}
```

### Invalid File Type
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG and WebP images are allowed."
}
```

### Too Many Files
```json
{
  "success": false,
  "message": "Too many files. Maximum 5 files per upload."
}
```

## Frontend Integration

### HTML Form Example
```html
<form enctype="multipart/form-data">
  <input type="file" name="image" accept="image/jpeg,image/png,image/webp" />
  <button type="submit">Upload Main Image</button>
</form>

<form enctype="multipart/form-data">
  <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp" />
  <button type="submit">Upload Thumbnails</button>
</form>
```

### React/JavaScript Example
```javascript
// Upload main image
const uploadMainImage = async (productId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch(`/api/products/${productId}/images/main`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });
  
  return await response.json();
};

// Upload thumbnails
const uploadThumbnails = async (productId, imageFiles) => {
  const formData = new FormData();
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  const response = await fetch(`/api/products/${productId}/images/thumbnails`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });
  
  return await response.json();
};
```

## Database Schema

### Products Table Updates

New fields added:
- `mainImage` (JSON): Stores main image data with multiple sizes
- `thumbnailImages` (JSON): Array of thumbnail image data
- `minAge` (INTEGER): Minimum age requirement
- `maxAge` (INTEGER): Maximum age requirement
- `ageCategory` (STRING): Age category description
- `requiresAgeVerification` (BOOLEAN): Whether age verification is needed

### Image Data Structure
```json
{
  "thumbnail": {
    "filename": "thumbnail_product_123456789_abc12345.jpeg",
    "path": "/absolute/path/to/file.jpeg",
    "url": "/uploads/products/thumbnail_product_123456789_abc12345.jpeg",
    "width": 150,
    "height": 150
  },
  "medium": { ... },
  "large": { ... }
}
```

## File Storage

- **Location**: `uploads/products/` directory
- **Naming**: `{size}_{prefix}_{timestamp}_{random}.{ext}`
- **Static Serving**: Available via `/uploads/products/` URL path

## Security Considerations

- ✅ File type validation (MIME type checking)
- ✅ File size limits (10MB per file)
- ✅ Admin authentication required for uploads
- ✅ Automatic file naming prevents conflicts
- ✅ Age verification for restricted products

## Testing

Run the test script to verify functionality:
```bash
node test-image-upload.js
```

Make sure to:
1. Update `ADMIN_TOKEN` with a valid admin JWT token
2. Update `TEST_PRODUCT_ID` with an existing product ID
3. Run database migrations first

## Migration

Run the migration to add new image fields:
```bash
npx sequelize-cli db:migrate
```

## Production Considerations

- Consider using cloud storage (AWS S3, Cloudinary) for production
- Implement CDN for faster image delivery
- Add image optimization/compression
- Consider webp conversion for better performance
- Implement image caching strategies
