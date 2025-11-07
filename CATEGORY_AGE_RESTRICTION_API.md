# Category and Age-Restriction API Endpoints

## Overview
This API provides endpoints to show all categories to everyone while restricting products based on age for dependents.

## Base URL
```
/api/products
```

## Endpoints

### 1. Get All Categories (Public)
**Shows base categories to everyone (excludes Pregnancy category)**

```
GET /api/products/categories
```

**Authentication:** None required  
**Description:** Returns base categories with product counts. The Pregnancy category is excluded and only shown to eligible users (pregnant users, infants, unborn dependents, or caregivers of such users).

**Response:**
```json
{
  "success": true,
  "message": "All categories retrieved successfully",
  "data": [
    {
      "category": "Education",
      "productCount": 0,
      "avgPrice": "0.00",
      "isAvailable": false
    },
    {
      "category": "Healthcare",
      "productCount": 5,
      "avgPrice": "46.59",
      "isAvailable": true
    },
    {
      "category": "Groceries",
      "productCount": 0,
      "avgPrice": "0.00",
      "isAvailable": false
    },
    {
      "category": "Entertainment",
      "productCount": 0,
      "avgPrice": "0.00",
      "isAvailable": false
    },
    {
      "category": "Other",
      "productCount": 6,
      "avgPrice": "44.82",
      "isAvailable": true
    },

  ],
  "totalCategories": 5,
  "availableCategories": 2,
  "note": "Pregnancy category is only visible to pregnant users, caregivers of infants, or unborn dependents"
}
```

---

### 2. Get Categories for User (Including Pregnancy if Eligible)
**Shows all categories including Pregnancy category for eligible users**

```
GET /api/products/user/{userId}/categories
```

**Authentication:** Required (Bearer token)  
**Description:** Returns all categories including Pregnancy category if the user is eligible (pregnant, infant, unborn, or caregiver of such users).

**Parameters:**
- `userId` (path): The ID of any user (dependent, caregiver, or funder)

**Pregnancy Eligibility:**
- User is pregnant (`isPregnant = true`)
- User is infant (`isInfant = true`) 
- User is unborn (`isUnborn = true`)
- User is caregiver with pregnant/infant/unborn dependents

**Response:**
```json
{
  "success": true,
  "message": "User categories retrieved successfully",
  "data": [
    {
      "category": "Healthcare",
      "productCount": 5,
      "avgPrice": "46.59",
      "isAvailable": true,
      "isPregnancyRelated": false
    },
    {
      "category": "Pregnancy",
      "productCount": 4,
      "avgPrice": "118.99",
      "isAvailable": true,
      "isPregnancyRelated": true
    }
  ],
  "user": {
    "id": 19,
    "name": "Tebogo Mokwena",
    "role": "dependent",
    "pregnancyEligible": true,
    "eligibilityReason": "User is pregnant"
  },
  "totalCategories": 6,
  "availableCategories": 2
}
```

---

### 3. Get Age-Appropriate Categories for Dependent
**Shows categories with age-filtered product counts**

```
GET /api/products/dependent/{dependentId}/categories
```

**Authentication:** Required (Bearer token)  
**Description:** Returns all categories with age-appropriate product counts for a specific dependent.

**Parameters:**
- `dependentId` (path): The ID of the dependent user

**Response:**
```json
{
  "success": true,
  "message": "Age-appropriate categories retrieved successfully",
  "data": [
    {
      "category": "Education",
      "availableProducts": 0,
      "totalProducts": 0,
      "restrictedProducts": 0,
      "hasRestrictions": false,
      "isAccessible": false,
      "restrictionReason": null
    },
    {
      "category": "Healthcare",
      "availableProducts": 3,
      "totalProducts": 5,
      "restrictedProducts": 2,
      "hasRestrictions": true,
      "isAccessible": true,
      "restrictionReason": "2 product(s) age-restricted"
    },
    {
      "category": "Other",
      "availableProducts": 6,
      "totalProducts": 6,
      "restrictedProducts": 0,
      "hasRestrictions": false,
      "isAccessible": true,
      "restrictionReason": null,
      "isPregnancyRelated": false
    },
    {
      "category": "Pregnancy",
      "availableProducts": 4,
      "totalProducts": 4,
      "restrictedProducts": 0,
      "hasRestrictions": false,
      "isAccessible": true,
      "restrictionReason": null,
      "isPregnancyRelated": true
    }
  ],
  "dependent": {
    "id": 123,
    "name": "Emma Johnson",
    "age": 8,
    "ageCategory": "Child",
    "pregnancyEligible": false,
    "pregnancyStatus": {
      "isPregnant": false,
      "isInfant": false,
      "isUnborn": false
    }
  },
  "summary": {
    "totalCategories": 5,
    "accessibleCategories": 2,
    "categoriesWithRestrictions": 1
  }
}
```

**Note:** The Pregnancy category will only appear in the response if the dependent is eligible (pregnant, infant, or unborn).

---

### 4. Get Age-Filtered Products for Dependent
  }
}
```

---

### 3. Get Age-Appropriate Products for Dependent
**Returns products filtered by age and category**

```
GET /api/products/dependent/{dependentId}
```

**Authentication:** Required (Bearer token)  
**Description:** Returns age-appropriate products for a specific dependent, optionally filtered by category.

**Parameters:**
- `dependentId` (path): The ID of the dependent user

**Query Parameters:**
- `category` (optional): Filter by specific category
- `brand` (optional): Filter by brand
- `search` (optional): Search term for product name, brand, or description
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Products per page (default: 20)
- `sortBy` (optional): Sort field (default: 'name')
- `sortOrder` (optional): 'ASC' or 'DESC' (default: 'ASC')

**Examples:**
```
GET /api/products/dependent/123
GET /api/products/dependent/123?category=Healthcare
GET /api/products/dependent/123?category=Healthcare&search=vitamin
GET /api/products/dependent/123?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-id-1",
      "name": "Clicks Hand Sanitizer 500ml",
      "brand": "Clicks",
      "price": "29.99",
      "category": "Healthcare",
      "description": "Antibacterial hand sanitizer...",
      "sku": "CLK-HS-500",
      "inStock": true,
      "mainImage": {
        "url": "https://example.com/image.jpg",
        "filename": "sanitizer.jpg"
      }
    }
  ],
  "dependent": {
    "id": 123,
    "name": "Emma Johnson",
    "age": 8,
    "ageCategory": "Child"
  },
  "pagination": {
    "total": 13,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 4. Get Products by Category (General/Admin)
**Returns all products in a category (no age filtering)**

```
GET /api/products/category/{category}
```

**Authentication:** None required  
**Description:** Returns all products in a specific category without age filtering.

**Parameters:**
- `category` (path): Category name ('Education', 'Healthcare', 'Groceries', 'Entertainment', 'Other', 'Pregnancy')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-id-1",
      "name": "Disprin Original Pain Relief 24 Tablets",
      "brand": "Disprin",
      "price": "45.99",
      "category": "Healthcare",
      "minAge": 18,
      "maxAge": 150,
      "requiresAgeVerification": true,
      "inStock": true
    }
  ],
  "category": "Healthcare"
}
```

---

### 5. Validate Product Access for Dependent
**Check if a dependent can access a specific product**

```
GET /api/products/dependent/{dependentId}/validate/{productId}
```

**Authentication:** Required (Bearer token)  
**Description:** Validates whether a specific dependent can access a particular product based on age restrictions.

**Parameters:**
- `dependentId` (path): The ID of the dependent user
- `productId` (path): The ID of the product to validate

**Response (Accessible):**
```json
{
  "success": true,
  "canAccess": true,
  "message": "Product is accessible",
  "product": {
    "id": "product-id-1",
    "name": "Clicks Hand Sanitizer 500ml",
    "category": "Healthcare"
  },
  "dependent": {
    "id": 123,
    "name": "Emma Johnson",
    "age": 8
  }
}
```

**Response (Not Accessible):**
```json
{
  "success": true,
  "canAccess": false,
  "message": "Product requires age verification (18+)",
  "restrictions": {
    "minAge": 18,
    "maxAge": 150,
    "requiresAgeVerification": true,
    "reason": "This product requires ID verification for purchase"
  },
  "product": {
    "id": "product-id-2",
    "name": "Disprin Original Pain Relief 24 Tablets",
    "category": "Healthcare"
  },
  "dependent": {
    "id": 123,
    "name": "Emma Johnson",
    "age": 8
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid ID number - cannot determine age",
  "errorCode": "INVALID_IDNUMBER",
  "error": "ID number format is invalid"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Dependent not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch categories",
  "error": "Database connection error"
}
```

---

## Frontend Integration Flow

### Recommended Implementation:

1. **Show Base Categories** (Public view - no Pregnancy category)
   ```javascript
   GET /api/products/categories  // Returns 5 categories
   ```

2. **When User is Logged In:**
   ```javascript
   // Check if user can see Pregnancy category
   GET /api/products/user/{userId}/categories  // Returns 5-6 categories based on eligibility
   ```

3. **For Dependents with Age + Pregnancy Filtering:**
   ```javascript
   // Get categories with age info + pregnancy eligibility
   GET /api/products/dependent/{id}/categories
   
   // Get products in selected category (age + pregnancy filtered)
   GET /api/products/dependent/{id}?category={category}
   ```

4. **For General Users:**
   ```javascript
   // Get all products in category (no filtering)
   GET /api/products/category/{category}
   ```

### Pregnancy Category Visibility Rules:
- **Public users**: Cannot see Pregnancy category
- **Pregnant users**: Can see Pregnancy category
- **Infant users**: Can see Pregnancy category  
- **Unborn users**: Can see Pregnancy category
- **Caregivers**: Can see Pregnancy category if they have pregnant/infant/unborn dependents
- **Regular users**: Cannot see Pregnancy category

---

## Authentication Headers

For authenticated endpoints, include:
```
Authorization: Bearer {your-jwt-token}
Content-Type: application/json
```

---

## Age Categories

The system recognizes these age categories:
- **Toddler**: 0-2 years
- **Child**: 3-12 years  
- **Teen**: 13-17 years
- **Adult**: 18-64 years
- **Senior**: 65+ years

---

## Product Age Restrictions

Products can have:
- `minAge`: Minimum age requirement
- `maxAge`: Maximum age limit
- `requiresAgeVerification`: Requires ID verification (typically 18+)

Age is calculated from South African 13-digit ID numbers.