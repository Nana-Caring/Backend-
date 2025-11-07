# 🏛️ NANA Portal API Documentation

## Overview
The Portal API allows administrators to log in as users to view their portal interface. This enables admins to see exactly what users see in their accounts, helping with support and troubleshooting.

## 🔄 Authentication Flow

### Step 1: Admin Authentication
First, the administrator must authenticate with their admin credentials to get administrative privileges.

### Step 2: Portal Access
The admin then uses user credentials to obtain portal access, allowing them to see the user's interface.

---

## 📋 API Endpoints

### 1. Admin Login
**Endpoint:** `POST /api/auth/admin-login`

**Purpose:** Authenticate administrator and obtain admin token

**Request:**
```http
POST https://nanacaring-backend.onrender.com/api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@nanacaring.com",
  "password": "nanacaring2025"
}
```

**Response (Success - 200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 0,
    "firstName": "Admin",
    "middleName": "",
    "surname": "",
    "email": "admin@nanacaring.com",
    "role": "admin"
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 2. Get Users List
**Endpoint:** `GET /admin/users`

**Purpose:** Retrieve list of all users in the system

**Request:**
```http
GET https://nanacaring-backend.onrender.com/admin/users
Authorization: Bearer {admin_token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 13,
        "firstName": "Emma",
        "middleName": null,
        "surname": "Johnson",
        "email": "dependent@demo.com",
        "role": "dependent",
        "status": "active",
        "isBlocked": false,
        "blockedAt": null,
        "blockedBy": null,
        "blockReason": null,
        "suspendedAt": null,
        "suspendedUntil": null,
        "suspendedBy": null,
        "suspensionReason": null,
        "createdAt": "2025-10-23T18:39:41.389Z",
        "updatedAt": "2025-11-04T06:18:30.197Z",
        "Accounts": [
          {
            "id": "8e11fb16-8dfe-4b56-826d-c91393a79666",
            "accountNumber": "3962948402",
            "accountType": "Baby Care",
            "balance": 97.6,
            "status": "active"
          }
        ]
      }
    ],
    "total": 17,
    "page": 1,
    "pageCount": 1,
    "limit": 25
  }
}
```

---

### 3. Portal Login (Admin as User)
**Endpoint:** `POST /api/portal/admin-login`

**Purpose:** Allow admin to log in as a specific user to access their portal view

**Request:**
```http
POST https://nanacaring-backend.onrender.com/api/portal/admin-login
Content-Type: application/json

{
  "username": "dependent@demo.com",
  "password": "Emma123!"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJhZG1pbiIsInBvcnRhbCI6dHJ1ZSwib3JpZ2luYWxVc2VySWQiOjEzLCJpYXQiOjE3NjIzMDMzNDQsImV4cCI6MTc2MjMxMDU0NH0.obDZuSbdNLxbBKQ8Pnq3H3qabggNoNcYsP16LIjVkYA",
  "user": {
    "id": 13,
    "firstName": "Emma",
    "surname": "Johnson",
    "email": "dependent@demo.com",
    "role": "dependent",
    "status": "active"
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid credentials"
}
```

**Response (Error - 404):**
```json
{
  "message": "User not found"
}
```

---

### 4. Get Portal User Details
**Endpoint:** `GET /api/portal/me`

**Purpose:** Get detailed information about the current portal user

**Request:**
```http
GET https://nanacaring-backend.onrender.com/api/portal/me
Authorization: Bearer {portal_token}
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": 13,
    "firstName": "Emma",
    "middleName": null,
    "surname": "Johnson",
    "email": "dependent@demo.com",
    "role": "dependent",
    "status": "active",
    "phoneNumber": null,
    "postalAddressLine1": null,
    "postalAddressLine2": null,
    "postalCity": null,
    "postalProvince": null,
    "postalCode": null,
    "homeAddressLine1": null,
    "homeAddressLine2": null,
    "homeCity": null,
    "homeProvince": null,
    "homeCode": null,
    "createdAt": "2025-10-23T18:39:41.389Z",
    "updatedAt": "2025-11-04T06:18:30.197Z",
    "Dependents": [],
    "Accounts": [
      {
        "id": "8e11fb16-8dfe-4b56-826d-c91393a79666",
        "accountNumber": "3962948402",
        "accountType": "Baby Care",
        "balance": 97.6,
        "currency": "ZAR",
        "status": "active"
      },
      {
        "id": "c20d227b-5240-471b-b80e-177c38b63580",
        "accountNumber": "1942095861",
        "accountType": "Healthcare",
        "balance": 587.98,
        "currency": "ZAR",
        "status": "active"
      }
    ]
  },
  "recentTransactions": [
    {
      "id": "trans_001",
      "accountId": "8e11fb16-8dfe-4b56-826d-c91393a79666",
      "amount": -25.99,
      "type": "purchase",
      "description": "Baby formula purchase",
      "reference": "REF123456",
      "createdAt": "2025-11-04T10:30:00.000Z",
      "account": {
        "accountNumber": "3962948402",
        "accountType": "Baby Care"
      }
    }
  ]
}
```

---

### 5. Get Portal User Accounts
**Endpoint:** `GET /api/portal/me/accounts`

**Purpose:** Get all accounts belonging to the portal user

**Request:**
```http
GET https://nanacaring-backend.onrender.com/api/portal/me/accounts
Authorization: Bearer {portal_token}
```

**Response (Success - 200):**
```json
{
  "accounts": [
    {
      "id": "8e11fb16-8dfe-4b56-826d-c91393a79666",
      "accountNumber": "3962948402",
      "accountType": "Baby Care",
      "balance": 97.6,
      "currency": "ZAR",
      "status": "active",
      "createdAt": "2025-10-23T18:39:41.389Z",
      "updatedAt": "2025-11-04T06:18:30.197Z",
      "parentAccountId": null
    }
  ]
}
```

---

### 6. Get Portal User Transactions
**Endpoint:** `GET /api/portal/me/transactions`

**Purpose:** Get transaction history for the portal user

**Request:**
```http
GET https://nanacaring-backend.onrender.com/api/portal/me/transactions?page=1&limit=10&accountId=123
Authorization: Bearer {portal_token}
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of transactions per page (default: 10, max: 100)
- `accountId` (optional): Filter by specific account ID
- `type` (optional): Filter by transaction type (purchase, transfer, deposit, etc.)
- `startDate` (optional): Filter transactions from this date (ISO format)
- `endDate` (optional): Filter transactions until this date (ISO format)

**Response (Success - 200):**
```json
{
  "transactions": [
    {
      "id": "trans_001",
      "accountId": "8e11fb16-8dfe-4b56-826d-c91393a79666",
      "amount": -25.99,
      "type": "purchase",
      "description": "Baby formula purchase",
      "reference": "REF123456",
      "metadata": {
        "merchant": "Baby Store",
        "category": "Healthcare"
      },
      "createdAt": "2025-11-04T10:30:00.000Z",
      "updatedAt": "2025-11-04T10:30:00.000Z",
      "account": {
        "accountNumber": "3962948402",
        "accountType": "Baby Care"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## 🔐 Security & Authentication

### JWT Token Structure
Portal tokens contain the following payload:
```json
{
  "id": 13,                    // User ID being impersonated
  "role": "admin",             // Admin role for permissions
  "portal": true,              // Portal access flag
  "originalUserId": 13,        // Original user ID
  "iat": 1762303344,          // Issued at timestamp
  "exp": 1762310544           // Expiration timestamp (2 hours)
}
```

### Security Features
1. **Token Expiration**: Portal tokens expire after 2 hours
2. **Role Validation**: Tokens contain admin role for proper permissions
3. **Portal Flag**: Special flag identifies portal access vs regular login
4. **User Validation**: System verifies user exists and credentials are valid

---

## 🛡️ Error Handling

### Common Error Responses

**401 Unauthorized - No Token:**
```json
{
  "message": "No token, authorization denied"
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "message": "Invalid token format"
}
```

**404 Not Found:**
```json
{
  "message": "User not found"
}
```

**500 Server Error:**
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## 📝 Usage Examples

### Complete Portal Access Flow

```javascript
// 1. Admin Login
const adminResponse = await fetch('/api/auth/admin-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@nanacaring.com',
    password: 'nanacaring2025'
  })
});
const { accessToken } = await adminResponse.json();

// 2. Get Users List
const usersResponse = await fetch('/admin/users', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const { data: { users } } = await usersResponse.json();

// 3. Portal Login as User
const portalResponse = await fetch('/api/portal/admin-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'dependent@demo.com',
    password: 'Emma123!'
  })
});
const { token: portalToken } = await portalResponse.json();

// 4. Access Portal Endpoints
const userDetailsResponse = await fetch('/api/portal/me', {
  headers: { 'Authorization': `Bearer ${portalToken}` }
});
const userDetails = await userDetailsResponse.json();
```

---

## 🎯 Known User Credentials

### Demo Users
| User Type | Email | Password | Role |
|-----------|-------|----------|------|
| Emma Johnson | dependent@demo.com | Emma123! | dependent |
| John Smith | funder@demo.com | Demo123!@# | funder |
| Sarah Williams | caregiver@demo.com | Demo123!@# | caregiver |

### Admin User
| Email | Password | Role |
|-------|----------|------|
| admin@nanacaring.com | nanacaring2025 | admin |

---

## 🔧 Testing

### Test Script Usage
Run the comprehensive portal test suite:
```bash
node test-portal-corrected.js
```

### Expected Test Results
- ✅ Admin Login: SUCCESS
- ✅ Get Users: SUCCESS  
- ✅ Portal User Login: SUCCESS
- ✅ Security Tests: PASSED
- **Success Rate: 100%**

---

## 📊 API Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | Success | Request completed successfully |
| 401 | Unauthorized | Invalid credentials or token |
| 404 | Not Found | User or resource not found |
| 500 | Server Error | Internal server error |

---

## 💡 Best Practices

1. **Always validate admin privileges** before allowing portal access
2. **Use short-lived tokens** (2 hours) for security
3. **Log portal access activities** for audit trails
4. **Validate user existence** before issuing portal tokens
5. **Implement proper error handling** for all endpoints

---

*Last Updated: November 5, 2025*