# 📚 Dependent API Endpoints Documentation

## 🌟 Overview
This document provides comprehensive request and response examples for all API endpoints available to dependents in the Nana Caring platform.

## 🔐 Authentication
All endpoints require authentication via Bearer token in the Authorization header.

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 🔑 Authentication & Registration

### Register Dependent
**Endpoint:** `POST /api/auth/register-dependent`  
**Role Required:** Caregiver (to register a dependent)  
**Description:** Register a new dependent user

**Request:**
```http
POST /api/auth/register-dependent
Content-Type: application/json
Authorization: Bearer <caregiver_jwt_token>

{
  "firstName": "Emma",
  "lastName": "Johnson",
  "surname": "Johnson",
  "email": "emma.johnson@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+27823456789",
  "Idnumber": "9012155800089",
  "relation": "child",
  "dateOfBirth": "2010-05-15",
  "homeAddressLine1": "123 Oak Avenue",
  "homeCity": "Cape Town",
  "homeProvince": "Western Cape",
  "homeCode": "8001",
  "postalAddressLine1": "PO Box 123",
  "postalCity": "Cape Town",
  "postalProvince": "Western Cape",
  "postalCode": "8001"
}
```

**Response (201 - Success):**
```json
{
  "success": true,
  "message": "Dependent registered successfully",
  "user": {
    "id": 15,
    "firstName": "Emma",
    "lastName": "Johnson",
    "surname": "Johnson",
    "email": "emma.johnson@example.com",
    "role": "dependent",
    "status": "active",
    "caregiverId": 5
  }
}
```

**Response (400 - Validation Error):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "Idnumber",
      "message": "Valid 13-digit numeric ID number required"
    }
  ]
}
```

### Login
**Endpoint:** `POST /api/auth/login`  
**Role Required:** Any  
**Description:** Authenticate dependent user

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "emma.johnson@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 15,
    "firstName": "Emma",
    "lastName": "Johnson",
    "email": "emma.johnson@example.com",
    "role": "dependent",
    "status": "active"
  }
}
```

**Response (401 - Invalid Credentials):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 💰 Account Management

### Get Dependent's Own Accounts
**Endpoint:** `GET /api/accounts/dependent/my-accounts`  
**Role Required:** Dependent  
**Description:** Retrieve all accounts belonging to the authenticated dependent

**Request:**
```http
GET /api/accounts/dependent/my-accounts
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "message": "Your accounts retrieved successfully",
  "totalBalance": "8750.00",
  "currency": "ZAR",
  "accountsCount": 9,
  "mainAccountsCount": 1,
  "subAccountsCount": 8,
  "accounts": {
    "main": [
      {
        "id": 1,
        "accountNumber": "ACC001",
        "accountName": "Emma's Main Account (🚨 Emergency Fund)",
        "accountType": "Main",
        "balance": "1500.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-20T10:30:00.000Z",
        "parentAccountId": null,
        "isMainAccount": true,
        "isSubAccount": false,
        "emergencyFund": true,
        "description": "Emergency savings (20% of all deposits automatically allocated here)"
      }
    ],
    "sub": [
      {
        "id": 2,
        "accountNumber": "ACC002",
        "accountName": "Healthcare Fund",
        "accountType": "Healthcare",
        "balance": "1600.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-18T14:15:00.000Z",
        "parentAccountId": 1,
        "isMainAccount": false,
        "isSubAccount": true,
        "allocationPercentage": 20,
        "category": "Medical expenses, prescriptions, health insurance"
      },
      {
        "id": 3,
        "accountNumber": "ACC003",
        "accountName": "Groceries Fund",
        "accountType": "Groceries", 
        "balance": "1280.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-19T16:45:00.000Z",
        "parentAccountId": 1,
        "isMainAccount": false,
        "isSubAccount": true,
        "allocationPercentage": 16,
        "category": "Food, household essentials, groceries"
      },
      {
        "id": 4,
        "accountNumber": "ACC004",
        "accountName": "Education Fund",
        "accountType": "Education",
        "balance": "1280.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-17T11:20:00.000Z",
        "parentAccountId": 1,
        "isMainAccount": false,
        "isSubAccount": true,
        "allocationPercentage": 16,
        "category": "School fees, books, educational materials"
      },
      {
        "id": 5,
        "accountNumber": "ACC005",
        "accountName": "Transport Fund",
        "accountType": "Transport",
        "balance": "640.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-18T09:30:00.000Z",
        "parentAccountId": 1,
        "isMainAccount": false,
        "isSubAccount": true,
        "allocationPercentage": 8,
        "category": "Transport, travel, commute expenses"
      },
      {
        "id": 6,
        "accountNumber": "ACC006",
        "accountName": "Pregnancy Fund",
        "accountType": "Pregnancy",
        "balance": "640.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-16T15:45:00.000Z",
        "parentAccountId": 1,
        "isMainAccount": false,
        "isSubAccount": true,
        "allocationPercentage": 8,
        "category": "Pregnancy-related expenses, prenatal care"
      },
      {
        "id": 7,
        "accountNumber": "ACC007",
        "accountName": "Entertainment Fund",
        "accountType": "Entertainment",
        "balance": "320.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-19T20:10:00.000Z",
        "parentAccountId": 1,
        "isMainAccount": false,
        "isSubAccount": true,
        "allocationPercentage": 4,
        "category": "Recreation, entertainment, leisure activities"
      },
      {
        "id": 8,
        "accountNumber": "ACC008",
        "accountName": "Clothing Fund",
        "accountType": "Clothing",
        "balance": "320.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-17T13:25:00.000Z",
        "parentAccountId": 1,
        "isMainAccount": false,
        "isSubAccount": true,
        "allocationPercentage": 4,
        "category": "Clothing, personal items, fashion"
      },
      {
        "id": 9,
        "accountNumber": "ACC009",
        "accountName": "Baby Care Fund",
        "accountType": "Baby Care",
        "balance": "320.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-18T08:15:00.000Z",
        "parentAccountId": 1,
        "isMainAccount": false,
        "isSubAccount": true,
        "allocationPercentage": 4,
        "category": "Baby products, childcare necessities"
      }
    ]
  },
  "smartDistribution": {
    "enabled": true,
    "emergencyFundPercentage": 20,
    "categoryDistributionPercentage": 80,
    "totalCategories": 8,
    "description": "Funds are automatically distributed: 20% to Emergency Fund (Main account), 80% across 8 category accounts"
  },
  "summary": {
    "totalMainAccounts": 1,
    "totalSubAccounts": 8,
    "totalBalance": "8750.00",
    "currency": "ZAR",
    "accountTypes": ["Main", "Healthcare", "Groceries", "Education", "Transport", "Pregnancy", "Entertainment", "Clothing", "Baby Care"],
    "activeAccounts": 9,
    "inactiveAccounts": 0,
    "emergencyFundBalance": "1500.00",
    "categoryFundsTotal": "7250.00"
  }
}
```

**Response (403 - Access Denied):**
```json
{
  "message": "Access denied. This endpoint is only for dependents."
}
```

### Get Account Balance
**Endpoint:** `GET /api/accounts/balance/:accountId`  
**Role Required:** Dependent  
**Description:** Get balance for a specific account (own accounts only)

**Request:**
```http
GET /api/accounts/balance/1
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Account balance retrieved successfully",
  "account": {
    "id": 1,
    "accountNumber": "ACC001",
    "accountName": "Emma's Main Account",
    "accountType": "Main",
    "balance": "1500.00",
    "currency": "ZAR",
    "status": "active",
    "lastUpdated": "2024-01-20T10:30:00.000Z"
  }
}
```

**Response (404 - Account Not Found):**
```json
{
  "success": false,
  "message": "Account not found or access denied"
}
```

### Get Account Balance by Number
**Endpoint:** `GET /api/accounts/balance/number/:accountNumber`  
**Role Required:** Dependent  
**Description:** Get balance using account number

**Request:**
```http
GET /api/accounts/balance/number/ACC001
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Account balance retrieved successfully",
  "account": {
    "id": 1,
    "accountNumber": "ACC001",
    "balance": "1500.00",
    "currency": "ZAR",
    "accountType": "Main"
  }
}
```

### Get Accounts by Type
**Endpoint:** `GET /api/accounts/type/:accountType`  
**Role Required:** Dependent  
**Description:** Get all accounts of a specific type

**Available Account Types:**
- `Main` - Emergency Fund (20% allocation)
- `Healthcare` - Medical expenses (20% allocation)
- `Groceries` - Food & essentials (16% allocation) 
- `Education` - Learning & development (16% allocation)
- `Transport` - Mobility & travel (8% allocation)
- `Pregnancy` - Pregnancy-related expenses (8% allocation)
- `Entertainment` - Recreation & leisure (4% allocation)
- `Clothing` - Clothing & personal items (4% allocation)
- `Baby Care` - Baby products & childcare (4% allocation)

**Request:**
```http
GET /api/accounts/type/Healthcare
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Healthcare accounts retrieved successfully",
  "accounts": [
    {
      "id": 2,
      "accountNumber": "ACC002",
      "accountName": "Healthcare Fund",
      "accountType": "Healthcare",
      "balance": "1600.00",
      "currency": "ZAR",
      "status": "active",
      "allocationPercentage": 20,
      "category": "Medical expenses, prescriptions, health insurance",
      "priority": "Highest"
    }
  ],
  "totalAccounts": 1,
  "totalBalance": "1600.00",
  "allocationInfo": {
    "percentage": 20,
    "description": "20% of all incoming transfers are automatically allocated to this account",
    "priority": "Highest - Medical needs are prioritized for dependent care"
  }
}
```

---

## � Emergency Fund & Smart Distribution System

### How the Emergency Fund Works
The **Main account** serves as the **Emergency Fund** for dependents. When funders send money to a dependent's Main account, the system automatically:

1. **Keeps 20% in Main account** - This becomes the emergency fund for unexpected expenses
2. **Distributes 80% across 8 category accounts** - For planned, category-specific spending

### 8-Category Automatic Distribution
When funds arrive in the Main account, they are automatically distributed as follows:

| Category | Percentage | Purpose | Priority |
|----------|------------|---------|----------|
| **Healthcare** | 20% | Medical expenses, prescriptions, health insurance | Highest |
| **Groceries** | 16% | Food, household essentials | High |
| **Education** | 16% | School fees, books, educational materials | High |
| **Transport** | 8% | Travel, commute, mobility expenses | Medium |
| **Pregnancy** | 8% | Pregnancy-related expenses, prenatal care | Medium |
| **Entertainment** | 4% | Recreation, leisure activities | Low |
| **Clothing** | 4% | Clothing, personal items | Low |
| **Baby Care** | 4% | Baby products, childcare necessities | Low |
| **Emergency Fund** | 20% | Unexpected expenses, emergencies | Critical |

### Key Benefits
- **🛡️ Financial Safety Net**: 20% always available for emergencies
- **📊 Smart Budgeting**: Automatic allocation based on necessity priorities
- **🎯 Purpose-Driven Spending**: Each category has a specific purpose
- **💡 Financial Education**: Teaches responsible money management
- **⚡ Automated**: No manual distribution needed

### Emergency Fund Access
- Emergency funds (Main account balance) can be used for any urgent, unexpected expenses
- Dependents can see their emergency fund balance highlighted in the account overview
- Emergency fund transactions are clearly marked and tracked separately

---

## �👤 User Profile Management

### Get Current User Profile
**Endpoint:** `GET /api/users/me`  
**Role Required:** Dependent  
**Description:** Get authenticated user's profile information

**Request:**
```http
GET /api/users/me
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "user": {
    "id": 15,
    "firstName": "Emma",
    "lastName": "Johnson",
    "surname": "Johnson",
    "email": "emma.johnson@example.com",
    "role": "dependent",
    "status": "active",
    "phoneNumber": "+27823456789",
    "dateOfBirth": "2010-05-15",
    "relation": "child",
    "homeAddressLine1": "123 Oak Avenue",
    "homeCity": "Cape Town",
    "homeProvince": "Western Cape",
    "homeCode": "8001",
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

### Update Profile
**Endpoint:** `PUT /api/users/profile`  
**Role Required:** Dependent  
**Description:** Update user profile information

**Request:**
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "phoneNumber": "+27823456790",
  "homeAddressLine1": "456 Pine Street",
  "homeCity": "Durban",
  "homeProvince": "KwaZulu-Natal",
  "homeCode": "4001"
}
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 15,
    "firstName": "Emma",
    "lastName": "Johnson",
    "phoneNumber": "+27823456790",
    "homeAddressLine1": "456 Pine Street",
    "homeCity": "Durban",
    "homeProvince": "KwaZulu-Natal",
    "homeCode": "4001",
    "updatedAt": "2024-01-20T16:45:00.000Z"
  }
}
```

---

## 🛍️ Shopping & Products

### Get Age-Appropriate Products
**Endpoint:** `GET /api/products/dependent/:dependentId`  
**Role Required:** Dependent  
**Description:** Get products suitable for dependent's age

**Request:**
```http
GET /api/products/dependent/15
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Age-appropriate products retrieved successfully",
  "products": [
    {
      "id": 1,
      "name": "Educational Tablet",
      "description": "Kid-friendly tablet for learning",
      "price": "2999.99",
      "currency": "ZAR",
      "category": "Electronics",
      "ageRange": "8-16",
      "imageUrl": "/uploads/products/tablet.jpg",
      "inStock": true,
      "stockQuantity": 15
    },
    {
      "id": 2,
      "name": "Science Experiment Kit",
      "description": "Safe chemistry set for kids",
      "price": "499.99",
      "currency": "ZAR",
      "category": "Educational",
      "ageRange": "10-14",
      "imageUrl": "/uploads/products/science-kit.jpg",
      "inStock": true,
      "stockQuantity": 8
    }
  ],
  "totalProducts": 2,
  "filters": {
    "ageRange": "10-16",
    "categories": ["Electronics", "Educational", "Books", "Toys"]
  }
}
```

### Validate Product Access
**Endpoint:** `GET /api/products/dependent/:dependentId/validate/:productId`  
**Role Required:** Dependent  
**Description:** Check if dependent can access a specific product

**Request:**
```http
GET /api/products/dependent/15/validate/1
Authorization: Bearer <jwt_token>
```

**Response (200 - Allowed):**
```json
{
  "success": true,
  "message": "Product access allowed",
  "product": {
    "id": 1,
    "name": "Educational Tablet",
    "ageRange": "8-16",
    "category": "Electronics"
  },
  "dependentAge": 14,
  "accessAllowed": true
}
```

**Response (403 - Not Allowed):**
```json
{
  "success": false,
  "message": "Product not suitable for dependent's age",
  "product": {
    "id": 5,
    "name": "Adult Product",
    "ageRange": "18+"
  },
  "dependentAge": 14,
  "accessAllowed": false
}
```

---

## 🛒 Shopping Cart Management

### Add Product to Cart
**Endpoint:** `POST /api/cart/add`  
**Role Required:** Dependent  
**Description:** Add a product to the shopping cart

**Request:**
```http
POST /api/cart/add
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

**Response (201 - Success):**
```json
{
  "success": true,
  "message": "Product added to cart successfully",
  "cartItem": {
    "id": 1,
    "productId": 1,
    "quantity": 2,
    "unitPrice": "2999.99",
    "totalPrice": "5999.98",
    "product": {
      "id": 1,
      "name": "Educational Tablet",
      "imageUrl": "/uploads/products/tablet.jpg",
      "inStock": true
    },
    "addedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

**Response (400 - Invalid Product):**
```json
{
  "success": false,
  "message": "Product not found or not available for your age group",
  "errors": [
    {
      "field": "productId",
      "message": "Invalid product ID or age restriction"
    }
  ]
}
```

### Get Cart Items
**Endpoint:** `GET /api/cart`  
**Role Required:** Dependent  
**Description:** Retrieve all items in the shopping cart

**Request:**
```http
GET /api/cart
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "cart": {
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "unitPrice": "2999.99",
        "totalPrice": "5999.98",
        "product": {
          "id": 1,
          "name": "Educational Tablet",
          "imageUrl": "/uploads/products/tablet.jpg",
          "inStock": true,
          "stockQuantity": 15
        },
        "addedAt": "2024-01-20T10:30:00.000Z"
      },
      {
        "id": 2,
        "productId": 2,
        "quantity": 1,
        "unitPrice": "499.99",
        "totalPrice": "499.99",
        "product": {
          "id": 2,
          "name": "Science Experiment Kit",
          "imageUrl": "/uploads/products/science-kit.jpg",
          "inStock": true,
          "stockQuantity": 8
        },
        "addedAt": "2024-01-20T11:15:00.000Z"
      }
    ],
    "summary": {
      "totalItems": 2,
      "totalQuantity": 3,
      "subtotal": "6499.97",
      "currency": "ZAR"
    }
  }
}
```

### Update Cart Item Quantity
**Endpoint:** `PUT /api/cart/:id`  
**Role Required:** Dependent  
**Description:** Update quantity of a cart item

**Request:**
```http
PUT /api/cart/1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "quantity": 3
}
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "cartItem": {
    "id": 1,
    "productId": 1,
    "quantity": 3,
    "unitPrice": "2999.99",
    "totalPrice": "8999.97",
    "updatedAt": "2024-01-20T12:00:00.000Z"
  }
}
```

### Remove Item from Cart
**Endpoint:** `DELETE /api/cart/:id`  
**Role Required:** Dependent  
**Description:** Remove a specific item from cart

**Request:**
```http
DELETE /api/cart/1
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

### Clear Entire Cart
**Endpoint:** `DELETE /api/cart`  
**Role Required:** Dependent  
**Description:** Remove all items from cart

**Request:**
```http
DELETE /api/cart
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

### Save Item for Later
**Endpoint:** `POST /api/cart/:id/save-for-later`  
**Role Required:** Dependent  
**Description:** Move cart item to saved items

**Request:**
```http
POST /api/cart/1/save-for-later
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Item saved for later",
  "savedItem": {
    "id": 1,
    "productId": 1,
    "quantity": 2,
    "savedAt": "2024-01-20T13:30:00.000Z"
  }
}
```

### Get Saved Items
**Endpoint:** `GET /api/cart/saved`  
**Role Required:** Dependent  
**Description:** Retrieve all saved items

**Request:**
```http
GET /api/cart/saved
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Saved items retrieved successfully",
  "savedItems": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "Educational Tablet",
        "price": "2999.99",
        "imageUrl": "/uploads/products/tablet.jpg",
        "inStock": true
      },
      "savedAt": "2024-01-20T13:30:00.000Z"
    }
  ],
  "totalSavedItems": 1
}
```

---

## 📦 Order Management

### Create Order
**Endpoint:** `POST /api/orders`  
**Role Required:** Dependent  
**Description:** Create a new order from cart items

**Request:**
```http
POST /api/orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "accountId": 1,
  "shippingAddress": {
    "addressLine1": "123 Oak Avenue",
    "city": "Cape Town",
    "province": "Western Cape",
    "postalCode": "8001"
  },
  "notes": "Please deliver after 3 PM"
}
```

**Response (201 - Success):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-2024-001",
    "status": "pending",
    "totalAmount": "6499.97",
    "currency": "ZAR",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productName": "Educational Tablet",
        "quantity": 2,
        "unitPrice": "2999.99",
        "totalPrice": "5999.98"
      },
      {
        "id": 2,
        "productId": 2,
        "productName": "Science Experiment Kit",
        "quantity": 1,
        "unitPrice": "499.99",
        "totalPrice": "499.99"
      }
    ],
    "shippingAddress": {
      "addressLine1": "123 Oak Avenue",
      "city": "Cape Town",
      "province": "Western Cape",
      "postalCode": "8001"
    },
    "createdAt": "2024-01-20T14:00:00.000Z"
  }
}
```

### Get Order History
**Endpoint:** `GET /api/orders`  
**Role Required:** Dependent  
**Description:** Get all orders for the dependent

**Request:**
```http
GET /api/orders?page=1&limit=10&status=completed
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "orders": [
    {
      "id": 1,
      "orderNumber": "ORD-2024-001",
      "status": "completed",
      "totalAmount": "6499.97",
      "currency": "ZAR",
      "itemsCount": 2,
      "orderDate": "2024-01-20T14:00:00.000Z",
      "deliveredDate": "2024-01-22T10:30:00.000Z"
    },
    {
      "id": 2,
      "orderNumber": "ORD-2024-002",
      "status": "shipped",
      "totalAmount": "299.99",
      "currency": "ZAR",
      "itemsCount": 1,
      "orderDate": "2024-01-18T09:15:00.000Z",
      "estimatedDelivery": "2024-01-21T17:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalOrders": 2,
    "limit": 10
  }
}
```

---

## 💳 Transaction Management

### Get Transaction History
**Endpoint:** `GET /api/transactions`  
**Role Required:** Dependent  
**Description:** Get transaction history with filters

**Request:**
```http
GET /api/transactions?page=1&limit=10&type=debit&category=groceries&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "transactions": [
    {
      "id": 1,
      "type": "debit",
      "amount": "150.00",
      "currency": "ZAR",
      "category": "groceries",
      "description": "Woolworths - Weekly shopping",
      "accountId": 3,
      "accountNumber": "ACC003",
      "accountType": "Groceries",
      "balance": "1130.00",
      "transactionDate": "2024-01-20T14:30:00.000Z",
      "reference": "TXN-2024-001",
      "status": "completed"
    },
    {
      "id": 2,
      "type": "credit",
      "amount": "1000.00",
      "currency": "ZAR",
      "category": "transfer",
      "description": "Transfer from funder",
      "accountId": 1,
      "accountNumber": "ACC001",
      "accountType": "Main",
      "balance": "1200.00",
      "transactionDate": "2024-01-15T09:00:00.000Z",
      "reference": "TRF-2024-002-IN",
      "status": "completed",
      "autoDistribution": true
    },
    {
      "id": 3,
      "type": "credit",
      "amount": "200.00",
      "currency": "ZAR",
      "category": "auto-allocation",
      "description": "Emergency fund allocation (20%) - TRF-2024-002",
      "accountId": 1,
      "accountNumber": "ACC001",
      "accountType": "Main",
      "balance": "1200.00",
      "transactionDate": "2024-01-15T09:01:00.000Z",
      "reference": "TRF-2024-002-EMERGENCY",
      "status": "completed",
      "distributionType": "emergency_fund"
    },
    {
      "id": 4,
      "type": "credit",
      "amount": "160.00",
      "currency": "ZAR",
      "category": "auto-allocation",
      "description": "Auto-allocation from transfer (20%) - TRF-2024-002",
      "accountId": 2,
      "accountNumber": "ACC002",
      "accountType": "Healthcare",
      "balance": "1760.00",
      "transactionDate": "2024-01-15T09:01:00.000Z",
      "reference": "TRF-2024-002-DIST-HEALTHCARE",
      "status": "completed",
      "distributionType": "category_allocation"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalTransactions": 25,
    "limit": 10
  },
  "summary": {
    "totalCredits": "1500.00",
    "totalDebits": "800.00",
    "netAmount": "700.00",
    "transactionCount": 25
  }
}
```

### Get Transaction Summary
**Endpoint:** `GET /api/transactions/summary`  
**Role Required:** Dependent  
**Description:** Get transaction summary for a period

**Request:**
```http
GET /api/transactions/summary?period=30
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Transaction summary retrieved successfully",
  "summary": {
    "period": "Last 30 days",
    "startDate": "2023-12-21",
    "endDate": "2024-01-20",
    "totalTransactions": 15,
    "totalCredits": "2000.00",
    "totalDebits": "1200.00",
    "netAmount": "800.00",
    "currency": "ZAR",
    "categories": {
      "groceries": {
        "count": 5,
        "amount": "600.00"
      },
      "education": {
        "count": 2,
        "amount": "400.00"
      },
      "entertainment": {
        "count": 3,
        "amount": "200.00"
      }
    },
    "monthlyTrend": [
      {
        "month": "2023-12",
        "credits": "1000.00",
        "debits": "400.00"
      },
      {
        "month": "2024-01",
        "credits": "1000.00",
        "debits": "800.00"
      }
    ]
  }
}
```

### Get Transaction Details
**Endpoint:** `GET /api/transactions/:id`  
**Role Required:** Dependent  
**Description:** Get detailed information about a specific transaction

**Request:**
```http
GET /api/transactions/1
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Transaction details retrieved successfully",
  "transaction": {
    "id": 1,
    "type": "debit",
    "amount": "150.00",
    "currency": "ZAR",
    "category": "groceries",
    "description": "Woolworths - Weekly shopping",
    "accountId": 1,
    "accountNumber": "ACC001",
    "accountName": "Emma's Main Account",
    "previousBalance": "1500.00",
    "newBalance": "1350.00",
    "transactionDate": "2024-01-20T14:30:00.000Z",
    "reference": "TXN-2024-001",
    "status": "completed",
    "merchant": {
      "name": "Woolworths",
      "category": "Retail",
      "location": "V&A Waterfront, Cape Town"
    },
    "relatedOrder": {
      "id": 5,
      "orderNumber": "ORD-2024-005"
    }
  }
}
```

---

## 🔄 Transfer Management

### Make Transfer
**Endpoint:** `POST /api/transfers`  
**Role Required:** Dependent  
**Description:** Make a transfer between accounts (if allowed)

**Request:**
```http
POST /api/transfers
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": "100.00",
  "description": "Transfer to education fund",
  "purpose": "savings"
}
```

**Response (201 - Success):**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "transfer": {
    "id": 1,
    "reference": "TRF-2024-001",
    "fromAccountId": 1,
    "toAccountId": 2,
    "amount": "100.00",
    "currency": "ZAR",
    "description": "Transfer to education fund",
    "status": "completed",
    "transferDate": "2024-01-20T15:30:00.000Z",
    "fromAccount": {
      "accountNumber": "ACC001",
      "accountName": "Emma's Main Account",
      "newBalance": "1400.00"
    },
    "toAccount": {
      "accountNumber": "ACC002",
      "accountName": "Education Fund",
      "newBalance": "850.00"
    }
  }
}
```

**Response (400 - Insufficient Funds):**
```json
{
  "success": false,
  "message": "Insufficient funds for transfer",
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "availableBalance": "50.00",
    "requestedAmount": "100.00"
  }
}
```

### Get Transfer History
**Endpoint:** `GET /api/transfers/history`  
**Role Required:** Dependent  
**Description:** Get transfer history

**Request:**
```http
GET /api/transfers/history?page=1&limit=10
Authorization: Bearer <jwt_token>
```

**Response (200 - Success):**
```json
{
  "success": true,
  "message": "Transfer history retrieved successfully",
  "transfers": [
    {
      "id": 1,
      "reference": "TRF-2024-001",
      "type": "internal",
      "amount": "100.00",
      "currency": "ZAR",
      "description": "Transfer to education fund",
      "status": "completed",
      "transferDate": "2024-01-20T15:30:00.000Z",
      "fromAccount": "ACC001",
      "toAccount": "ACC002"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalTransfers": 1,
    "limit": 10
  }
}
```

---

## 🚫 Error Responses

### Common Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

### HTTP Status Codes
- **200** - Success
- **201** - Created successfully
- **400** - Bad request / Validation error
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Resource not found
- **429** - Too many requests (rate limit exceeded)
- **500** - Internal server error

### Authentication Errors
```json
// 401 - Missing Token
{
  "success": false,
  "message": "Access denied. Token required."
}

// 401 - Invalid Token
{
  "success": false,
  "message": "Invalid token."
}

// 403 - Wrong Role
{
  "success": false,
  "message": "Access denied. This endpoint is only for dependents."
}

// 403 - Account Status
{
  "success": false,
  "message": "Account suspended. Please contact support."
}
```

---

## 🏦 Dependent Account Structure

### Total Account Count: **9 Accounts**

Each dependent automatically receives **9 accounts** upon registration:

#### 1. Main Account (Emergency Fund)
- **Purpose**: Emergency savings and unexpected expenses
- **Allocation**: Receives 20% of all incoming transfers
- **Usage**: Available for urgent, unplanned expenses
- **Identification**: `accountType: "Main"`, `isMainAccount: true`

#### 8. Category Sub-Accounts
All sub-accounts have `parentAccountId` pointing to the Main account and `isSubAccount: true`:

1. **Healthcare Account** (20% allocation)
   - Medical expenses, prescriptions, health insurance
   - Highest priority category

2. **Groceries Account** (16% allocation)
   - Food, household essentials, groceries
   - Essential survival needs

3. **Education Account** (16% allocation)
   - School fees, books, educational materials
   - Future development and learning

4. **Transport Account** (8% allocation)
   - Travel, commute, mobility expenses
   - Daily access and movement needs

5. **Pregnancy Account** (8% allocation)
   - Pregnancy-related expenses, prenatal care
   - Specialized care category

6. **Entertainment Account** (4% allocation)
   - Recreation, leisure activities
   - Quality of life and enjoyment

7. **Clothing Account** (4% allocation)
   - Clothing, personal items, fashion
   - Personal appearance and necessities

8. **Baby Care Account** (4% allocation)
   - Baby products, childcare necessities
   - Child-specific care needs

### Key Insights
- **Total Sub-Accounts**: 8 category accounts
- **Automatic Creation**: All accounts created during dependent registration
- **Smart Distribution**: Funds automatically allocated based on priority and necessity
- **Comprehensive Coverage**: Covers all major expense categories for dependent care
- **Emergency Safety Net**: 20% always reserved for unexpected expenses

---

## 📋 Notes

1. **Rate Limiting:** Some endpoints may have rate limiting in place
2. **Age Restrictions:** Product and shopping endpoints enforce age-based access
3. **Account Access:** Dependents can only access their own accounts and data
4. **Caregiver Oversight:** Some actions may require caregiver approval
5. **Currency:** All monetary values are in South African Rand (ZAR)
6. **Timestamps:** All timestamps are in ISO 8601 format (UTC)
7. **Account Structure:** Each dependent has exactly 9 accounts (1 Main + 8 Category accounts)
8. **Auto-Distribution:** 80% of transfers automatically distributed, 20% kept as emergency fund

---

## 🔗 Related Documentation
- [Authentication Guide](./AUTHENTICATION_GUIDE.md)
- [Caregiver API Endpoints](./CAREGIVER_API_ENDPOINTS.md)
- [Error Handling Guide](./ERROR_HANDLING_GUIDE.md)
- [API Rate Limiting](./RATE_LIMITING_GUIDE.md)

---

## 📱 **Frontend Integration**

### **React Component for Dependent Accounts**

A complete React component for displaying dependent accounts with emergency fund highlighting is available in:
**[`frontend/DependentMyAccounts.jsx`](../frontend/DependentMyAccounts.jsx)**

### **Key Features:**

#### **🔗 API Integration**
- Uses endpoint: `/api/accounts/dependent/my-accounts`
- Proper Bearer token authentication
- Handles response structure with `accounts.main` and `accounts.sub`
- Supports all 9 account types (1 Main + 8 Category accounts)

#### **🚨 Emergency Fund Display**
- Identifies Main account as Emergency Fund (20% allocation)
- Visual 🚨 indicators and emergency badges
- Special styling with red borders and warning colors
- Clear "Emergency Fund" labels and descriptions
- Balance highlighting for quick emergency access

#### **📊 Smart Distribution Visualization**
- Shows allocation percentages for each category account
- Priority-based color coding (Healthcare=Red, Education=Blue, etc.)
- Category descriptions and usage guidelines
- Distribution summary with total allocation breakdown

#### **✅ Enhanced Features**
- **Emergency fund prioritized** at top of account list
- **8 category accounts** organized by priority (Healthcare → Baby Care)
- **Allocation percentages** displayed for each account type
- **Purpose descriptions** for each category account
- **Balance visualization** with category-specific icons
- **Auto-distribution indicators** showing smart allocation
- **Proper error handling** with retry functionality
- **Loading states** and user feedback
- **Account selection** with visual feedback
- **Responsive design** for mobile and desktop

### **Usage Example:**

```jsx
import DependentMyAccounts from './frontend/DependentMyAccounts';

function App() {
  return (
    <div className="App">
      <DependentMyAccounts />
    </div>
  );
}
```

### **Integration Notes:**

1. **Authentication**: Requires valid JWT token in localStorage
2. **Styling**: Uses styled-components for styling
3. **Icons**: Uses Material-UI icons (@mui/icons-material)
4. **Assets**: Requires card background image at `../../assets/card.jpg`

### **Quick Setup:**

1. Install dependencies:
```bash
npm install styled-components @mui/icons-material
```

2. Add the component to your project
3. Ensure authentication token is stored in localStorage
4. Import and use in your React app