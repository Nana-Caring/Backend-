# Portal Admin API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Portal Management](#portal-management)
3. [User Management](#user-management)
4. [Transaction Management](#transaction-management)
5. [Account Management](#account-management)
6. [Statistics](#statistics)
7. [Error Handling](#error-handling)
8. [Data Models](#data-models)

---

## Authentication

### Base URL
```
Production: https://nanacaring-backend.onrender.com
Development: http://localhost:5000
```

### Headers Required
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>"
}
```

---

## Portal Management

### 1. Admin Login as User
**Endpoint:** `POST /api/portal/admin-login`

**Description:** Authenticate as a specific user with admin privileges for portal access.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "user_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "John",
    "surname": "Doe",
    "email": "user@example.com",
    "role": "funder",
    "status": "active"
  }
}
```

### 2. Get User Details
**Endpoint:** `GET /api/portal/me`

**Description:** Get complete user profile with dependents, accounts, and recent transactions.

**Headers:** Authorization required

**Response:**
```json
{
  "user": {
    "id": 1,
    "firstName": "John",
    "middleName": "Michael",
    "surname": "Doe",
    "email": "user@example.com",
    "role": "funder",
    "status": "active",
    "phoneNumber": "+27821234567",
    "postalAddressLine1": "123 Main St",
    "postalAddressLine2": "Apt 4B",
    "postalCity": "Cape Town",
    "postalProvince": "Western Cape",
    "postalCode": "8001",
    "homeAddressLine1": "456 Home Ave",
    "homeAddressLine2": null,
    "homeCity": "Cape Town",
    "homeProvince": "Western Cape",
    "homeCode": "8002",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-08-06T12:00:00.000Z",
    "Dependents": [
      {
        "id": 2,
        "firstName": "Jane",
        "surname": "Doe",
        "email": "jane@example.com",
        "role": "dependent",
        "status": "active",
        "accounts": [...]
      }
    ],
    "accounts": [
      {
        "id": 1,
        "accountNumber": "ACC001234567",
        "accountType": "Main",
        "balance": 1500.50,
        "currency": "ZAR",
        "status": "active"
      }
    ]
  },
  "recentTransactions": [
    {
      "id": 101,
      "accountId": 1,
      "amount": 100.00,
      "type": "Credit",
      "description": "Monthly allowance",
      "reference": "TXN_123456",
      "metadata": {
        "source": "admin_manual",
        "category": "allowance"
      },
      "createdAt": "2025-08-06T10:00:00.000Z",
      "account": {
        "accountNumber": "ACC001234567",
        "accountType": "Main"
      }
    }
  ]
}
```

### 3. Update User Profile
**Endpoint:** `PUT /api/portal/me`

**Description:** Update user profile information.

**Headers:** Authorization required

**Request Body:**
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "surname": "Doe",
  "phoneNumber": "+27821234567",
  "postalAddressLine1": "123 New Address",
  "postalAddressLine2": "Suite 5A",
  "postalCity": "Johannesburg",
  "postalProvince": "Gauteng",
  "postalCode": "2001",
  "homeAddressLine1": "456 Home Street",
  "homeAddressLine2": null,
  "homeCity": "Johannesburg",
  "homeProvince": "Gauteng",
  "homeCode": "2002"
}
```

**Response:**
```json
{
  "message": "User profile updated successfully",
  "user": {
    "id": 1,
    "firstName": "John",
    "middleName": "Michael",
    "surname": "Doe",
    "email": "user@example.com",
    // ... updated fields
  }
}
```

### 4. Get User Accounts
**Endpoint:** `GET /api/portal/me/accounts`

**Description:** Get user accounts with sub-accounts and parent account information.

**Headers:** Authorization required

**Response:**
```json
{
  "accounts": [
    {
      "id": 1,
      "accountNumber": "ACC001234567",
      "accountType": "Main",
      "balance": 1500.50,
      "currency": "ZAR",
      "status": "active",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-08-06T12:00:00.000Z",
      "parentAccountId": null,
      "subAccounts": [
        {
          "id": 2,
          "accountNumber": "ACC001234568",
          "accountType": "Education",
          "balance": 300.00,
          "currency": "ZAR",
          "status": "active"
        },
        {
          "id": 3,
          "accountNumber": "ACC001234569",
          "accountType": "Healthcare",
          "balance": 200.00,
          "currency": "ZAR",
          "status": "active"
        }
      ],
      "parentAccount": null
    }
  ]
}
```

### 5. Get User Transactions
**Endpoint:** `GET /api/portal/me/transactions`

**Description:** Get user transactions with advanced filtering and pagination.

**Headers:** Authorization required

**Query Parameters:**
- `type` (string): Filter by transaction type (`Credit`, `Debit`)
- `startDate` (string): Filter from date (YYYY-MM-DD)
- `endDate` (string): Filter to date (YYYY-MM-DD)
- `minAmount` (number): Minimum transaction amount
- `maxAmount` (number): Maximum transaction amount
- `search` (string): Search in description or reference
- `sortBy` (string): Sort field (default: `createdAt`)
- `sortOrder` (string): Sort order (`ASC`, `DESC`, default: `DESC`)
- `limit` (number): Number of results per page (default: 20)
- `page` (number): Page number (default: 1)

**Example Request:**
```
GET /api/portal/me/transactions?type=Credit&startDate=2025-01-01&limit=10&page=1
```

**Response:**
```json
{
  "transactions": [
    {
      "id": 101,
      "accountId": 1,
      "amount": 100.00,
      "type": "Credit",
      "description": "Monthly allowance",
      "reference": "TXN_123456",
      "metadata": {
        "source": "admin_manual",
        "adminId": 0,
        "category": "allowance"
      },
      "createdAt": "2025-08-06T10:00:00.000Z",
      "updatedAt": "2025-08-06T10:00:00.000Z",
      "account": {
        "accountNumber": "ACC001234567",
        "accountType": "Main"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 6. Reset Password (Current User)
**Endpoint:** `POST /api/portal/reset-password`

**Description:** Reset password for the currently authenticated user.

**Headers:** Authorization required

**Request Body:**
```json
{
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful for user: user@example.com"
}
```

### 7. Reset User Password by Email
**Endpoint:** `POST /api/portal/reset-user-password`

**Description:** Reset password for any user by email (admin function).

**Headers:** Authorization required

**Request Body:**
```json
{
  "email": "user@example.com",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful."
}
```

---

## User Management

### 1. Get All Users
**Endpoint:** `GET /api/admin/users`

**Description:** Get all users in the system.

**Headers:** Authorization required (Admin only)

**Response:**
```json
[
  {
    "id": 1,
    "firstName": "John",
    "middleName": "Michael",
    "surname": "Doe",
    "email": "user@example.com",
    "role": "funder",
    "status": "active",
    "Idnumber": "1234567890123",
    "relation": null,
    "phoneNumber": "+27821234567",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-08-06T12:00:00.000Z"
  }
]
```

### 2. Delete User
**Endpoint:** `DELETE /api/admin/users/:id`

**Description:** Delete a user by ID.

**Headers:** Authorization required (Admin only)

**Path Parameters:**
- `id` (integer): User ID to delete

**Response:**
```json
{
  "message": "User deleted"
}
```

### 3. Block User
**Endpoint:** `PUT /api/admin/users/:userId/block`

**Description:** Block a user account.

**Headers:** Authorization required (Admin only)

**Path Parameters:**
- `userId` (integer): User ID to block

**Request Body:**
```json
{
  "reason": "Suspicious activity detected"
}
```

### 4. Unblock User
**Endpoint:** `PUT /api/admin/users/:userId/unblock`

**Description:** Unblock a user account.

**Headers:** Authorization required (Admin only)

### 5. Suspend User
**Endpoint:** `PUT /api/admin/users/:userId/suspend`

**Description:** Suspend a user account.

**Headers:** Authorization required (Admin only)

### 6. Get Blocked Users
**Endpoint:** `GET /api/admin/blocked-users`

**Description:** Get all blocked users.

**Headers:** Authorization required (Admin only)

---

## Transaction Management

### 1. Get All Transactions
**Endpoint:** `GET /api/admin/transactions`

**Description:** Get all transactions with advanced filtering and pagination.

**Headers:** Authorization required (Admin only)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20)
- `type` (string): Transaction type (`Credit`, `Debit`)
- `accountId` (integer): Filter by account ID
- `userId` (integer): Filter by user ID
- `startDate` (string): Start date filter (YYYY-MM-DD)
- `endDate` (string): End date filter (YYYY-MM-DD)
- `minAmount` (number): Minimum amount
- `maxAmount` (number): Maximum amount
- `search` (string): Search in description/reference
- `sortBy` (string): Sort field (default: `createdAt`)
- `sortOrder` (string): Sort order (`ASC`/`DESC`, default: `DESC`)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 101,
        "accountId": 1,
        "amount": 100.00,
        "type": "Credit",
        "description": "Manual credit by admin",
        "reference": "admin-1691234567890",
        "metadata": {
          "source": "admin_manual",
          "adminId": 0,
          "adminEmail": "admin@example.com",
          "createdAt": "2025-08-06T10:00:00.000Z"
        },
        "createdAt": "2025-08-06T10:00:00.000Z",
        "updatedAt": "2025-08-06T10:00:00.000Z",
        "account": {
          "id": 1,
          "accountNumber": "ACC001234567",
          "accountType": "Main",
          "balance": 1500.50,
          "user": {
            "id": 1,
            "firstName": "John",
            "lastName": "Doe",
            "email": "user@example.com",
            "role": "funder"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### 2. Get Transaction by ID
**Endpoint:** `GET /api/admin/transactions/:id`

**Description:** Get detailed information for a specific transaction.

**Headers:** Authorization required (Admin only)

**Path Parameters:**
- `id` (integer): Transaction ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "accountId": 1,
    "amount": 100.00,
    "type": "Credit",
    "description": "Manual credit by admin",
    "reference": "admin-1691234567890",
    "metadata": {
      "source": "admin_manual",
      "adminId": 0,
      "adminEmail": "admin@example.com",
      "createdAt": "2025-08-06T10:00:00.000Z"
    },
    "createdAt": "2025-08-06T10:00:00.000Z",
    "updatedAt": "2025-08-06T10:00:00.000Z",
    "account": {
      "id": 1,
      "accountNumber": "ACC001234567",
      "accountType": "Main",
      "balance": 1500.50,
      "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@example.com",
        "role": "funder",
        "idNumber": "1234567890123"
      }
    }
  }
}
```

### 3. Create Manual Transaction
**Endpoint:** `POST /api/admin/transactions`

**Description:** Create a manual transaction (admin only).

**Headers:** Authorization required (Admin only)

**Request Body:**
```json
{
  "accountId": 1,
  "amount": 50.00,
  "type": "Credit",
  "description": "Manual admin credit - bonus",
  "reference": "admin-bonus-123",
  "metadata": {
    "reason": "Performance bonus",
    "category": "bonus",
    "approvedBy": "Admin"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manual transaction created successfully",
  "data": {
    "id": 102,
    "accountId": 1,
    "amount": 50.00,
    "type": "Credit",
    "description": "Manual admin credit - bonus",
    "reference": "admin-bonus-123",
    "metadata": {
      "reason": "Performance bonus",
      "category": "bonus",
      "approvedBy": "Admin",
      "source": "admin_manual",
      "adminId": 0,
      "adminEmail": "admin@example.com",
      "createdAt": "2025-08-06T11:00:00.000Z"
    },
    "createdAt": "2025-08-06T11:00:00.000Z",
    "updatedAt": "2025-08-06T11:00:00.000Z",
    "account": {
      "id": 1,
      "accountNumber": "ACC001234567",
      "accountType": "Main",
      "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@example.com"
      }
    }
  }
}
```

### 4. Update Transaction
**Endpoint:** `PUT /api/admin/transactions/:id`

**Description:** Update transaction description and metadata (limited fields for safety).

**Headers:** Authorization required (Admin only)

**Path Parameters:**
- `id` (integer): Transaction ID

**Request Body:**
```json
{
  "description": "Updated description via admin panel",
  "metadata": {
    "updateReason": "Correction needed",
    "updatedVia": "admin_panel"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "id": 101,
    "accountId": 1,
    "amount": 100.00,
    "type": "Credit",
    "description": "Updated description via admin panel",
    "reference": "admin-1691234567890",
    "metadata": {
      "source": "admin_manual",
      "adminId": 0,
      "updateReason": "Correction needed",
      "updatedVia": "admin_panel",
      "lastModified": "2025-08-06T12:00:00.000Z",
      "modifiedBy": 0
    },
    "createdAt": "2025-08-06T10:00:00.000Z",
    "updatedAt": "2025-08-06T12:00:00.000Z"
  }
}
```

### 5. Reverse Transaction
**Endpoint:** `POST /api/admin/transactions/:id/reverse`

**Description:** Create a reversal transaction for the specified transaction.

**Headers:** Authorization required (Admin only)

**Path Parameters:**
- `id` (integer): Transaction ID to reverse

**Request Body:**
```json
{
  "reason": "Customer dispute - admin reversal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction reversed successfully",
  "data": {
    "originalTransaction": {
      "id": 101,
      "amount": 100.00,
      "type": "Credit",
      "metadata": {
        "isReversed": true,
        "reversalTransactionId": 103,
        "reversedBy": 0,
        "reversedAt": "2025-08-06T13:00:00.000Z",
        "reversalReason": "Customer dispute - admin reversal"
      }
    },
    "reversalTransaction": {
      "id": 103,
      "accountId": 1,
      "amount": 100.00,
      "type": "Debit",
      "description": "Reversal of transaction: Manual credit by admin",
      "reference": "reversal-101",
      "metadata": {
        "isReversal": true,
        "originalTransactionId": 101,
        "originalReference": "admin-1691234567890",
        "reason": "Customer dispute - admin reversal",
        "reversedBy": 0,
        "reversedAt": "2025-08-06T13:00:00.000Z"
      }
    }
  }
}
```

### 6. Delete Transaction
**Endpoint:** `DELETE /api/admin/transactions/:id`

**Description:** Hard delete a transaction (use with caution).

**Headers:** Authorization required (Admin only)

**Path Parameters:**
- `id` (integer): Transaction ID to delete

**Request Body:**
```json
{
  "confirmDelete": true,
  "adjustBalance": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": {
    "deletedTransaction": {
      "id": 101,
      "accountId": 1,
      "amount": 100.00,
      "type": "Credit",
      "description": "Manual credit by admin",
      "reference": "admin-1691234567890"
    },
    "balanceAdjusted": true
  }
}
```

### 7. Get Transaction Statistics
**Endpoint:** `GET /api/admin/transactions/stats`

**Description:** Get comprehensive transaction statistics.

**Headers:** Authorization required (Admin only)

**Query Parameters:**
- `startDate` (string): Start date for statistics (YYYY-MM-DD)
- `endDate` (string): End date for statistics (YYYY-MM-DD)
- `accountId` (integer): Filter by specific account
- `userId` (integer): Filter by specific user

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTransactions": 150,
      "creditTransactions": 100,
      "debitTransactions": 50,
      "totalCreditAmount": 15000.00,
      "totalDebitAmount": 5000.00,
      "netAmount": 10000.00,
      "averageTransactionAmount": "66.67"
    },
    "dailyStats": [
      {
        "date": "2025-08-01",
        "count": "5",
        "totalAmount": "500.00"
      },
      {
        "date": "2025-08-02",
        "count": "3",
        "totalAmount": "300.00"
      }
    ],
    "period": {
      "startDate": "2025-07-07",
      "endDate": "2025-08-06"
    }
  }
}
```

### 8. Bulk Operations
**Endpoint:** `POST /api/admin/transactions/bulk`

**Description:** Perform bulk operations on multiple transactions.

**Headers:** Authorization required (Admin only)

**Request Body (Bulk Delete):**
```json
{
  "operation": "delete",
  "transactionIds": [101, 102, 103],
  "data": {
    "confirmDelete": true
  }
}
```

**Request Body (Bulk Update Description):**
```json
{
  "operation": "updateDescription",
  "transactionIds": [101, 102, 103],
  "data": {
    "description": "Bulk updated by admin"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk delete completed successfully",
  "data": {
    "deletedCount": 3
  }
}
```

---

## Account Management

### 1. Get All Accounts
**Endpoint:** `GET /api/admin/accounts`

**Description:** Get all accounts in the system.

**Headers:** Authorization required (Admin only)

**Response:**
```json
[
  {
    "id": 1,
    "accountNumber": "ACC001234567",
    "accountType": "Main",
    "balance": 1500.50,
    "currency": "ZAR",
    "status": "active",
    "creationDate": "2025-01-01",
    "lastTransactionDate": "2025-08-06T10:00:00.000Z",
    "parentAccountId": null,
    "userId": 1,
    "caregiverId": null,
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-08-06T12:00:00.000Z"
  }
]
```

### 2. Delete Account
**Endpoint:** `DELETE /api/admin/accounts/:id`

**Description:** Delete an account by ID.

**Headers:** Authorization required (Admin only)

**Path Parameters:**
- `id` (integer): Account ID to delete

**Response:**
```json
{
  "message": "Account deleted"
}
```

---

## Statistics

### 1. Get System Statistics
**Endpoint:** `GET /api/admin/stats`

**Description:** Get overall system statistics.

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "users": 50,
  "accounts": 75,
  "transactions": 500
}
```

---

## Error Handling

### Error Response Format
All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **500**: Internal Server Error

### Common Error Responses

#### Authentication Errors
```json
{
  "error": "Invalid credentials"
}
```

```json
{
  "error": "Account blocked",
  "message": "Your account has been blocked. Please contact support.",
  "code": "ACCOUNT_BLOCKED",
  "details": {
    "blockedAt": "2025-08-06T10:00:00.000Z",
    "reason": "Suspicious activity"
  }
}
```

#### Validation Errors
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email address required"
    }
  ]
}
```

#### Resource Not Found
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

---

## Data Models

### User Model
```javascript
{
  id: Integer (Primary Key),
  firstName: String (Required),
  middleName: String (Optional),
  surname: String (Required),
  email: String (Required, Unique),
  password: String (Required, Hashed),
  role: Enum ['funder', 'caregiver', 'dependent'] (Required),
  Idnumber: String(13) (Required, Unique),
  relation: String (Optional),
  
  // Status fields
  isBlocked: Boolean (Default: false),
  blockedAt: Date (Optional),
  blockedBy: Integer (Optional),
  blockReason: Text (Optional),
  status: Enum ['active', 'blocked', 'suspended', 'pending'] (Default: 'active'),
  
  // Contact information
  phoneNumber: String(15) (Optional),
  
  // Postal address
  postalAddressLine1: String (Optional),
  postalAddressLine2: String (Optional),
  postalCity: String (Optional),
  postalProvince: String (Optional),
  postalCode: String(10) (Optional),
  
  // Home address
  homeAddressLine1: String (Optional),
  homeAddressLine2: String (Optional),
  homeCity: String (Optional),
  homeProvince: String (Optional),
  homeCode: String(10) (Optional),
  
  // Integration fields
  stripeCustomerId: String (Optional),
  
  // Password reset
  resetToken: String (Optional),
  resetTokenExpires: BigInt (Optional),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Account Model
```javascript
{
  id: Integer (Primary Key),
  accountNumber: String (Unique),
  accountType: String (Required),
  balance: Float (Default: 0),
  currency: String(3) (Default: 'ZAR'),
  status: Enum ['active', 'inactive', 'frozen'] (Default: 'active'),
  creationDate: Date (Default: NOW),
  lastTransactionDate: Date (Optional),
  parentAccountId: Integer (Optional, References Account.id),
  userId: Integer (References User.id),
  caregiverId: Integer (Optional, References User.id),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  id: Integer (Primary Key),
  accountId: Integer (Required, References Account.id),
  amount: Float (Required),
  type: Enum ['Credit', 'Debit'] (Required),
  description: String (Required),
  reference: String (Optional),
  metadata: JSON (Optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Common Metadata Fields
```javascript
// Admin-created transactions
{
  source: 'admin_manual',
  adminId: Integer,
  adminEmail: String,
  category: String,
  reason: String
}

// Reversed transactions
{
  isReversed: Boolean,
  reversalTransactionId: Integer,
  reversedBy: Integer,
  reversedAt: Date,
  reversalReason: String
}

// Reversal transactions
{
  isReversal: Boolean,
  originalTransactionId: Integer,
  originalReference: String,
  reason: String,
  reversedBy: Integer,
  reversedAt: Date
}
```

---

## Rate Limiting

### Default Limits
- **General API calls**: 100 requests per minute per IP
- **Authentication endpoints**: 5 requests per minute per IP
- **Bulk operations**: 10 requests per minute per user

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1691234567
```

---

## Security Notes

1. **Authentication**: All protected endpoints require a valid JWT token
2. **Authorization**: Admin endpoints require admin role verification
3. **Password Security**: All passwords are hashed using bcrypt
4. **Data Validation**: All input data is validated server-side
5. **SQL Injection Protection**: Using parameterized queries via Sequelize ORM
6. **CORS**: Configured for specific domains in production

---

## Example Usage

### JavaScript/Node.js Example
```javascript
const baseURL = 'https://nanacaring-backend.onrender.com';

// Admin login
const loginResponse = await fetch(`${baseURL}/api/portal/admin-login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// Get user details
const userResponse = await fetch(`${baseURL}/api/portal/me`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const userData = await userResponse.json();
console.log(userData);
```

### cURL Examples
```bash
# Admin login
curl -X POST https://nanacaring-backend.onrender.com/api/portal/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"password123"}'

# Get transactions with filters
curl -X GET "https://nanacaring-backend.onrender.com/api/admin/transactions?type=Credit&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Create manual transaction
curl -X POST https://nanacaring-backend.onrender.com/api/admin/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": 1,
    "amount": 50.00,
    "type": "Credit",
    "description": "Manual admin credit",
    "metadata": {"category": "bonus"}
  }'
```

---

## Support

For API support or questions:
- Email: support@nanacaring.com
- Documentation: [API Docs](https://docs.nanacaring.com)
- Status Page: [Status](https://status.nanacaring.com)

---

*Last Updated: August 6, 2025*
*API Version: 1.0*
