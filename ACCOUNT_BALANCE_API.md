# Account Balance API Documentation

## Overview
This API provides comprehensive access to account balances and account management functionality for users, caregivers, and administrators.

## Base URL
```
/api/accounts
```

## Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## User Account Balance Endpoints

### 1. Get All User Accounts
```http
GET /api/accounts/my-accounts
```

**Description:** Retrieve all accounts belonging to the authenticated user.

**Response:**
```json
{
  "message": "User accounts retrieved successfully",
  "totalBalance": "1250.50",
  "currency": "ZAR",
  "accountsCount": 8,
  "accounts": {
    "main": [
      {
        "id": 1,
        "accountNumber": "1234567890",
        "accountType": "Main",
        "balance": "1250.50",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2025-07-01",
        "lastTransactionDate": "2025-07-01T10:30:00.000Z",
        "parentAccountId": null
      }
    ],
    "sub": [
      {
        "id": 2,
        "accountNumber": "1234567891",
        "accountType": "Education",
        "balance": "500.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2025-07-01",
        "lastTransactionDate": "2025-07-01T09:00:00.000Z",
        "parentAccountId": 1
      },
      {
        "id": 3,
        "accountNumber": "1234567892",
        "accountType": "Healthcare",
        "balance": "300.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2025-07-01",
        "lastTransactionDate": null,
        "parentAccountId": 1
      }
    ]
  },
  "allAccounts": [
    // All accounts in a flat array
  ]
}
```

### 2. Get Specific Account Balance
```http
GET /api/accounts/balance/:accountId
```

**Parameters:**
- `accountId` (path) - The account ID

**Response:**
```json
{
  "message": "Account balance retrieved successfully",
  "account": {
    "id": 1,
    "accountNumber": "1234567890",
    "accountType": "Main",
    "balance": "1250.50",
    "currency": "ZAR",
    "status": "active",
    "lastTransactionDate": "2025-07-01T10:30:00.000Z"
  }
}
```

### 3. Get Account Balance by Account Number
```http
GET /api/accounts/balance/number/:accountNumber
```

**Parameters:**
- `accountNumber` (path) - The account number

**Response:**
```json
{
  "message": "Account balance retrieved successfully",
  "account": {
    "id": 1,
    "accountNumber": "1234567890",
    "accountType": "Main",
    "balance": "1250.50",
    "currency": "ZAR",
    "status": "active",
    "lastTransactionDate": "2025-07-01T10:30:00.000Z"
  }
}
```

### 4. Get Accounts by Type
```http
GET /api/accounts/type/:accountType
```

**Parameters:**
- `accountType` (path) - Account type (Main, Education, Healthcare, Clothing, Entertainment, Baby Care, Pregnancy, Savings)

**Response:**
```json
{
  "message": "Education accounts retrieved successfully",
  "accountType": "Education",
  "totalBalance": "500.00",
  "currency": "ZAR",
  "accountsCount": 1,
  "accounts": [
    {
      "id": 2,
      "accountNumber": "1234567891",
      "accountType": "Education",
      "balance": "500.00",
      "currency": "ZAR",
      "status": "active",
      "creationDate": "2025-07-01",
      "lastTransactionDate": "2025-07-01T09:00:00.000Z"
    }
  ]
}
```

### 5. Get Account Summary with Recent Transactions
```http
GET /api/accounts/summary/:accountId
```

**Parameters:**
- `accountId` (path) - The account ID

**Response:**
```json
{
  "message": "Account summary retrieved successfully",
  "account": {
    "id": 1,
    "accountNumber": "1234567890",
    "accountType": "Main",
    "balance": "1250.50",
    "currency": "ZAR",
    "status": "active",
    "transactions": [
      {
        "id": 101,
        "amount": "100.00",
        "type": "Credit",
        "createdAt": "2025-07-01T10:30:00.000Z",
        "timestamp": "2025-07-01T10:30:00.000Z"
      },
      {
        "id": 100,
        "amount": "50.00",
        "type": "Debit",
        "createdAt": "2025-07-01T09:15:00.000Z",
        "timestamp": "2025-07-01T09:15:00.000Z"
      }
    ]
  }
}
```

## Caregiver Endpoints

### 6. Get Dependent Accounts (Caregiver Only)
```http
GET /api/accounts/dependent/:dependentId
```

**Parameters:**
- `dependentId` (path) - The dependent's user ID

**Authorization:** Requires caregiver role

**Response:**
```json
{
  "message": "Dependent accounts retrieved successfully",
  "dependent": {
    "id": 5,
    "firstName": "Jane",
    "surname": "Child",
    "email": "jane.child@example.com",
    "role": "dependent"
  },
  "totalBalance": "750.00",
  "currency": "ZAR",
  "accountsCount": 7,
  "accounts": [
    {
      "id": 10,
      "accountNumber": "9876543210",
      "accountType": "Main",
      "balance": "750.00",
      "currency": "ZAR",
      "status": "active",
      "creationDate": "2025-07-01",
      "lastTransactionDate": "2025-07-01T08:00:00.000Z"
    }
  ]
}
```

## Admin Endpoints

### 7. Get All Accounts (Admin Only)
```http
GET /api/accounts/admin/all?page=1&limit=20&accountType=Main&status=active
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Records per page (default: 20)
- `accountType` (optional) - Filter by account type
- `status` (optional) - Filter by account status

**Authorization:** Requires admin role

**Response:**
```json
{
  "message": "All accounts retrieved successfully",
  "totalBalance": "50000.00",
  "currency": "ZAR",
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 100,
    "recordsPerPage": 20
  },
  "accounts": [
    {
      "id": 1,
      "accountNumber": "1234567890",
      "accountType": "Main",
      "balance": "1250.50",
      "currency": "ZAR",
      "status": "active",
      "user": {
        "id": 1,
        "firstName": "John",
        "surname": "Doe",
        "email": "john@example.com",
        "role": "funder"
      }
    }
  ]
}
```

### 8. Get Account Statistics (Admin Only)
```http
GET /api/accounts/admin/stats
```

**Authorization:** Requires admin role

**Response:**
```json
{
  "message": "Account statistics retrieved successfully",
  "stats": {
    "totalAccounts": 156,
    "activeAccounts": 150,
    "totalBalance": "75000.00",
    "currency": "ZAR",
    "accountsByType": [
      {
        "type": "Main",
        "count": 25,
        "totalBalance": "30000.00"
      },
      {
        "type": "Education",
        "count": 20,
        "totalBalance": "15000.00"
      },
      {
        "type": "Healthcare",
        "count": 20,
        "totalBalance": "10000.00"
      }
    ],
    "accountsByStatus": [
      {
        "status": "active",
        "count": 150,
        "totalBalance": "75000.00"
      },
      {
        "status": "inactive",
        "count": 6,
        "totalBalance": "0.00"
      }
    ]
  }
}
```

## Account Types Available

- **Main** - Primary account for users
- **Education** - For education-related expenses
- **Healthcare** - For medical expenses
- **Clothing** - For clothing purchases
- **Entertainment** - For entertainment expenses
- **Baby Care** - For baby-related expenses
- **Pregnancy** - For pregnancy-related expenses
- **Savings** - For savings

## Account Status Types

- **active** - Account is active and can be used
- **inactive** - Account is inactive
- **frozen** - Account is frozen (no transactions allowed)

## Error Responses

### 404 - Account Not Found
```json
{
  "message": "Account not found or access denied"
}
```

### 403 - Access Denied
```json
{
  "message": "Access denied. Caregiver role required."
}
```

### 500 - Server Error
```json
{
  "message": "Server error",
  "error": "Error details here"
}
```

## Usage Examples

### JavaScript/Frontend Integration
```javascript
// Get user's accounts
const getUserAccounts = async () => {
  const response = await fetch('/api/accounts/my-accounts', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Get specific account balance
const getAccountBalance = async (accountId) => {
  const response = await fetch(`/api/accounts/balance/${accountId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Get accounts by type
const getEducationAccounts = async () => {
  const response = await fetch('/api/accounts/type/Education', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Admin: Get all accounts
const getAllAccounts = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/accounts/admin/all?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

## Security Features

1. **User Isolation**: Users can only access their own accounts
2. **Role-based Access**: Caregivers can access dependent accounts, admins can access all
3. **Status Checking**: Blocked users cannot access balance information
4. **Input Validation**: All parameters are validated
5. **Error Handling**: Comprehensive error responses

The Account Balance API is now fully implemented and ready for use! 💰
