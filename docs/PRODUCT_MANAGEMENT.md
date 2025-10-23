# Product Management System

This document outlines the product management system integrated with your NANA Caring backend, designed to work with dependent account categories.

## 📊 Product Categories

Products are organized by categories that match your dependent account types:

- **Healthcare** - Medicine, supplements, medical supplies
- **Education** - Books, stationery, calculators, educational materials
- **Groceries** - Food items, beverages, household essentials
- **Transport** - Bus passes, taxi vouchers, fuel cards
- **Entertainment** - Movie tickets, games, recreational activities
- **Other** - Miscellaneous products

## 🛠 API Endpoints

### Public Endpoints (No Authentication Required)

#### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `category` - Filter by category (Healthcare, Education, etc.)
- `brand` - Filter by brand name
- `inStock` - Filter by stock status (true/false)
- `search` - Search in name, brand, description, or SKU
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort direction (ASC/DESC, default: DESC)

**Example:**
```http
GET /api/products?category=Healthcare&inStock=true&page=1&limit=10
```

#### Get Products by Category
```http
GET /api/products/category/{category}
```

**Example:**
```http
GET /api/products/category/Healthcare
```

#### Get Single Product
```http
GET /api/products/{id}
```

### Admin Endpoints (Authentication Required)

#### Create Product
```http
POST /admin/products
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Pregnavit M 30 Capsules",
  "brand": "Clicks",
  "description": "Essential vitamins for pregnancy",
  "detailedDescription": "Pregnavit M 30 Capsules are formulated for women before, during and after pregnancy...",
  "price": 285.99,
  "category": "Healthcare",
  "subcategory": "Pregnancy Vitamins",
  "sku": "ID16453",
  "image": "https://example.com/image.jpg",
  "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  "stockQuantity": 50,
  "ingredients": "Folic Acid, Iron, Calcium...",
  "weight": "30 capsules",
  "manufacturer": "Clicks Pharmaceuticals",
  "tags": ["pregnancy", "vitamins", "health"]
}
```

#### Update Product
```http
PUT /admin/products/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json
```

#### Delete Product (Soft Delete)
```http
DELETE /admin/products/{id}
Authorization: Bearer {admin_token}
```

#### Get Product Statistics
```http
GET /admin/products/stats
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 25,
    "totalInStock": 20,
    "outOfStock": 5,
    "categoryStats": [
      {
        "category": "Healthcare",
        "count": 8,
        "avgPrice": 150.50,
        "totalStock": 200
      }
    ]
  }
}
```

## 🗄 Database Schema

### Product Model Fields

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| name | STRING | Product name |
| brand | STRING | Brand name |
| description | TEXT | Short description |
| detailedDescription | TEXT | Detailed description |
| price | DECIMAL(10,2) | Product price |
| category | ENUM | Product category |
| subcategory | STRING | Subcategory |
| sku | STRING | Unique product SKU |
| image | STRING | Primary image URL |
| images | JSON | Array of image URLs |
| inStock | BOOLEAN | Stock availability |
| stockQuantity | INTEGER | Stock count |
| ingredients | TEXT | Product specifications |
| weight | STRING | Product weight/size |
| manufacturer | STRING | Manufacturer name |
| tags | JSON | Search tags array |
| isActive | BOOLEAN | Active status |
| rating | DECIMAL(3,2) | Average rating (0-5) |
| reviewCount | INTEGER | Number of reviews |
| createdBy | INTEGER | Admin user ID |
| updatedBy | INTEGER | Last updated by admin ID |

## 🚀 Setup Instructions

### 1. Run Database Migration
```bash
# Create the products table
npx sequelize-cli db:migrate
```

### 2. Seed Sample Data
```bash
# Add sample products to database
node scripts/seedProducts.js
```

### 3. Test the API
```bash
# Test all endpoints
node test-products-api.js
```

## 📱 Frontend Integration

Your React frontend can now display products by category matching dependent accounts:

```javascript
// Fetch Healthcare products
const healthcareProducts = await fetch('/api/products/category/Healthcare');

// Search for products
const searchResults = await fetch('/api/products?search=vitamins&category=Healthcare');

// Get product details for your ProductDetail component
const product = await fetch(`/api/products/${productId}`);
```

## 🔧 Admin Panel Integration

The admin routes are already integrated into your existing admin system at `/admin/products/*`. Admins can:

1. **View All Products** - See all products including inactive ones
2. **Add New Products** - Create products for specific categories
3. **Edit Products** - Update product information
4. **Manage Stock** - Update stock quantities and availability
5. **View Statistics** - See product performance by category

## 🏪 Category-Account Mapping

Products are designed to work with your dependent account structure:

- **Education Account** → Education category products (books, calculators, etc.)
- **Healthcare Account** → Healthcare category products (medicine, supplements, etc.)
- **Transport Account** → Transport category products (bus passes, fuel, etc.)

This allows parents/caregivers to:
1. Fund specific account types
2. Restrict purchases to relevant categories
3. Track spending by category
4. Ensure funds are used appropriately

## 📊 Example Usage

```javascript
// Get all healthcare products for healthcare account spending
const healthcareProducts = await fetch('/api/products/category/Healthcare');

// Search for educational materials
const educationBooks = await fetch('/api/products?category=Education&search=mathematics');

// Get product details for purchase
const productDetails = await fetch('/api/products/123');
```

The system is now ready to support category-based product management that aligns with your dependent account structure!
