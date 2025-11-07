# 🏛️ Admin & High Court Operations Guide

## 📋 Overview
The NANA Caring Platform provides comprehensive administrative tools for managing the entire ecosystem. There are two privilege levels:
- **Admin**: Full system access for operational management
- **High Court**: Special legal authority with same privileges as admin

---

## 🔐 Authentication & Access

### Admin Login Endpoints
```
POST /api/auth/admin-login
POST /api/portal/admin-login  (Portal access)
```

### High Court Access
- **Email**: `highcourt@nanacaring.com`
- **Password**: `highcourt2025`
- **Role**: `highcourt` (equivalent to admin privileges)
- **Special Token**: ID -1, doesn't exist in database

---

## 👥 User Management Operations

### 1. Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `role`: Filter by role (funder, caregiver, dependent, retailer)
- `status`: Filter by status (active, blocked, suspended)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `search`: Search in names/email
- `sortBy`: Sort field (createdAt, email, etc.)
- `sortOrder`: ASC or DESC

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "firstName": "Emma",
      "surname": "Johnson",
      "email": "emma@example.com",
      "role": "caregiver",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "accounts": [...],
      "dependents": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### 2. Get User by ID
```http
GET /api/admin/users/{userId}
Authorization: Bearer <admin_token>
```

### 3. User Status Management

#### Block User
```http
PUT /api/admin/users/{userId}/block
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Violation of terms of service"
}
```

#### Unblock User
```http
PUT /api/admin/users/{userId}/unblock
Authorization: Bearer <admin_token>
```

#### Suspend User (Temporary)
```http
PUT /api/admin/users/{userId}/suspend
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Pending investigation",
  "duration": 30,  // days
  "suspendAccounts": true  // optional
}
```

#### Unsuspend User
```http
PUT /api/admin/users/{userId}/unsuspend
Authorization: Bearer <admin_token>
```

### 4. User Registration (Admin Only)

#### Register Funder
```http
POST /api/admin/users/register-funder
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "John",
  "middleName": "David",
  "surname": "Smith",
  "email": "john.smith@example.com",
  "password": "securePassword123",
  "Idnumber": "8901234567890",
  "phoneNumber": "+27123456789",
  "postalAddressLine1": "123 Main Street",
  "postalCity": "Cape Town",
  "postalProvince": "Western Cape",
  "postalCode": "8000"
}
```

#### Register Caregiver
```http
POST /api/admin/users/register-caregiver
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Sarah",
  "surname": "Williams",
  "email": "sarah.williams@example.com",
  "password": "securePassword123",
  "Idnumber": "9012345678901",
  "phoneNumber": "+27987654321"
}
```

### 5. Delete User (Permanent)
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer <admin_token>
```

### 6. User Statistics
```http
GET /api/admin/users/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "totalUsers": 1250,
  "activeUsers": 1180,
  "blockedUsers": 45,
  "suspendedUsers": 25,
  "usersByRole": {
    "funder": 350,
    "caregiver": 600,
    "dependent": 280,
    "retailer": 20
  },
  "newUsersThisMonth": 85,
  "growthRate": "12.5%"
}
```

---

## 💰 Transaction Management

### 1. Get All Transactions
```http
GET /api/admin/transactions
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `type`: credit, debit, transfer, purchase
- `accountId`: Filter by specific account
- `userId`: Filter by user (through accounts)
- `startDate`: YYYY-MM-DD format
- `endDate`: YYYY-MM-DD format
- `minAmount`: Minimum transaction amount
- `maxAmount`: Maximum transaction amount
- `search`: Search in description/reference
- `page`: Page number
- `limit`: Results per page
- `sortBy`: Field to sort by
- `sortOrder`: ASC or DESC

### 2. Get Transaction by ID
```http
GET /api/admin/transactions/{transactionId}
Authorization: Bearer <admin_token>
```

### 3. Create Manual Transaction
```http
POST /api/admin/transactions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "accountId": 123,
  "amount": 500.00,
  "type": "credit",
  "description": "Manual adjustment by admin",
  "reference": "ADJ-2024-001",
  "reason": "Account correction"
}
```

### 4. Update Transaction
```http
PUT /api/admin/transactions/{transactionId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "description": "Updated description",
  "reference": "Updated reference"
}
```

### 5. Reverse Transaction
```http
POST /api/admin/transactions/{transactionId}/reverse
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Transaction reversal requested by user"
}
```

### 6. Delete Transaction (Hard Delete)
```http
DELETE /api/admin/transactions/{transactionId}
Authorization: Bearer <admin_token>
```

### 7. Transaction Statistics
```http
GET /api/admin/transactions/stats
Authorization: Bearer <admin_token>
```

### 8. Bulk Operations
```http
POST /api/admin/transactions/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "operation": "reverse",  // or "delete"
  "transactionIds": [1, 2, 3, 4, 5],
  "reason": "Bulk reversal due to system error"
}
```

---

## 🛍️ Product Management

### 1. Get All Products (Admin View)
```http
GET /api/admin/products
Authorization: Bearer <admin_token>
```

**Includes inactive/deleted products not visible to regular users**

### 2. Get Product by ID
```http
GET /api/admin/products/{productId}
Authorization: Bearer <admin_token>
```

### 3. Create Product
```http
POST /api/admin/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Educational Tablet",
  "brand": "TechKids",
  "price": 299.99,
  "category": "Education",
  "sku": "TK-TAB-001",
  "description": "Child-friendly educational tablet",
  "image": "https://example.com/tablet.jpg",
  "stockQuantity": 50,
  "minAge": 5,
  "maxAge": 12,
  "ageCategory": "Child",
  "requiresAgeVerification": true
}
```

### 4. Update Product
```http
PUT /api/admin/products/{productId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 279.99,
  "stockQuantity": 75,
  "isActive": true
}
```

### 5. Delete Product (Soft Delete)
```http
DELETE /api/admin/products/{productId}
Authorization: Bearer <admin_token>
```

### 6. Get Products by Category
```http
GET /api/admin/products/category/{category}
Authorization: Bearer <admin_token>
```

**Categories:** Education, Healthcare, Groceries, Entertainment, Other, Pregnancy

### 7. Product Statistics
```http
GET /api/admin/products/stats
Authorization: Bearer <admin_token>
```

### 8. Age-Based Product Management

#### Get Products for Specific Dependent
```http
GET /api/admin/dependents/{dependentId}/products
Authorization: Bearer <admin_token>
```

#### Validate Product Access for Dependent
```http
GET /api/admin/dependents/{dependentId}/products/{productId}/validate
Authorization: Bearer <admin_token>
```

---

## 🏦 Account Management

### 1. Get All Accounts
```http
GET /api/admin/accounts
Authorization: Bearer <admin_token>
```

### 2. Delete Account
```http
DELETE /api/admin/accounts/{accountId}
Authorization: Bearer <admin_token>
```

---

## 🌐 Portal Operations

The portal system allows admins to login as users for support purposes.

### 1. Portal Admin Login
```http
POST /api/portal/admin-login
Content-Type: application/json

{
  "username": "admin@example.com",
  "password": "admin_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "Admin",
    "surname": "User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active"
  }
}
```

### 2. Get User Portal Details
```http
GET /api/portal/me
Authorization: Bearer <portal_token>
```

### 3. Update User Profile (via Portal)
```http
PUT /api/portal/me
Authorization: Bearer <portal_token>
Content-Type: application/json

{
  "firstName": "Updated Name",
  "phoneNumber": "+27123456789"
}
```

### 4. Get User Accounts (via Portal)
```http
GET /api/portal/me/accounts
Authorization: Bearer <portal_token>
```

### 5. Get User Transactions (via Portal)
```http
GET /api/portal/me/transactions
Authorization: Bearer <portal_token>
```

### 6. Reset User Password (Portal)
```http
POST /api/portal/reset-password
Authorization: Bearer <portal_token>
Content-Type: application/json

{
  "newPassword": "newSecurePassword123"
}
```

### 7. Reset User Password by Email (Admin)
```http
POST /api/portal/reset-user-password
Authorization: Bearer <portal_token>
Content-Type: application/json

{
  "email": "user@example.com",
  "newPassword": "newSecurePassword123"
}
```

---

## 🔧 System Maintenance

### 1. Check Expired Suspensions
```http
POST /api/admin/users/check-expired-suspensions
Authorization: Bearer <admin_token>
```

Automatically processes and lifts expired user suspensions.

---

## 🚨 Error Handling

### Common HTTP Status Codes:
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient privileges)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

### Error Response Format:
```json
{
  "message": "Error description",
  "error": "Detailed error information (if available)"
}
```

---

## 🔒 Security Features

### Access Control:
- **Admin**: Can access all admin endpoints
- **High Court**: Same privileges as admin (special legal authority)
- **Portal Tokens**: 2-hour expiration for security
- **Regular Tokens**: Standard expiration times

### Validation:
- Input validation on all endpoints
- Email format validation
- ID number format (13-digit South African ID)
- Password strength requirements
- Age verification for products

### Audit Trail:
- All admin actions are logged
- Transaction metadata includes admin details
- User status changes are tracked with reasons

---

## 📊 Monitoring & Analytics

### Key Metrics Available:
- User growth and demographics
- Transaction volumes and patterns
- Product performance and inventory
- System usage statistics
- Security events and suspensions

### Real-time Capabilities:
- Live user status monitoring
- Transaction processing
- Account balance updates
- Product inventory tracking

---

## 🚀 Production Usage

**Base URL:** `https://nanacaring-backend.onrender.com`

**Example Admin Login:**
```bash
curl -X POST https://nanacaring-backend.onrender.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "highcourt@nanacaring.com",
    "password": "highcourt2025"
  }'
```

**High Court Access:**
The High Court account has special privileges for legal oversight and can perform all administrative functions with the predefined credentials.

---

*This documentation covers the complete admin and high court operations available in the NANA Caring Platform. For technical implementation details, refer to the source code in `/routes/admin.js`, `/controllers/adminTransactionController.js`, and `/controllers/portalController.js`.*