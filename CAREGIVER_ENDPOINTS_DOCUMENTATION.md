# 👩‍⚕️ Complete Caregiver Endpoints for Fetching Dependents

## 🔐 Authentication Required
All caregiver endpoints require:
- **Authentication**: Bearer token in Authorization header
- **Role**: User must have `caregiver` role
- **Status**: User must be active (not blocked/suspended)

---

## 📋 All Available Endpoints

### 1. **Get All Dependents (Primary Endpoint)**
```http
GET /api/caregiver/dependents
```

**Description**: Get all dependents assigned to this caregiver with pagination, search, and filtering

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, email, or ID number
- `status` (optional): Filter by status - 'active', 'blocked', 'suspended', 'pending', 'all' (default: 'active')
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): 'ASC' or 'DESC' (default: 'DESC')

**Example Request**:
```bash
GET /api/caregiver/dependents?page=1&limit=5&search=John&status=active
Authorization: Bearer your_token_here
```

**Response**:
```json
{
  "success": true,
  "message": "Dependents retrieved successfully",
  "data": {
    "dependents": [
      {
        "id": 123,
        "firstName": "John",
        "middleName": "David",
        "surname": "Smith",
        "fullName": "John David Smith",
        "email": "john.smith@example.com",
        "idNumber": "9001015678901",
        "phoneNumber": "+27123456789",
        "relation": "Son",
        "status": "active",
        "isBlocked": false,
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-15T10:30:00Z",
        "account": {
          "id": "uuid-account-id",
          "accountNumber": "1234567890",
          "accountType": "Main",
          "balance": 150.75,
          "currency": "ZAR",
          "status": "active",
          "createdAt": "2025-01-15T10:30:00Z",
          "lastTransactionDate": "2025-01-15T14:20:00Z",
          "recentTransactions": [
            {
              "id": "uuid-transaction-id",
              "amount": 50.00,
              "type": "Credit",
              "description": "Monthly allowance",
              "createdAt": "2025-01-15T14:20:00Z"
            }
          ]
        },
        "totalTransactions": 5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalDependents": 12,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 5
    }
  }
}
```

---

### 2. **Get Specific Dependent Details**
```http
GET /api/caregiver/dependents/:dependentId
```

**Description**: Get detailed information about a specific dependent including full profile, account details, and transaction history

**URL Parameters**:
- `dependentId`: The ID of the dependent

**Example Request**:
```bash
GET /api/caregiver/dependents/123
Authorization: Bearer your_token_here
```

**Response**:
```json
{
  "success": true,
  "message": "Dependent details retrieved successfully",
  "data": {
    "id": 123,
    "firstName": "John",
    "middleName": "David",
    "surname": "Smith",
    "fullName": "John David Smith",
    "email": "john.smith@example.com",
    "idNumber": "9001015678901",
    "phoneNumber": "+27123456789",
    "relation": "Son",
    "status": "active",
    "isBlocked": false,
    "blockReason": null,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "postalAddress": {
      "line1": "123 Main Street",
      "line2": "Apt 4B",
      "city": "Cape Town",
      "province": "Western Cape",
      "postalCode": "8001"
    },
    "physicalAddress": {
      "line1": "123 Main Street",
      "line2": "Apt 4B", 
      "city": "Cape Town",
      "province": "Western Cape",
      "postalCode": "8001"
    },
    "account": {
      "id": "uuid-account-id",
      "accountNumber": "1234567890",
      "accountType": "Main",
      "balance": 150.75,
      "currency": "ZAR",
      "status": "active",
      "createdAt": "2025-01-15T10:30:00Z",
      "lastTransactionDate": "2025-01-15T14:20:00Z",
      "statistics": {
        "totalTransactions": 25,
        "totalCredits": 1500.00,
        "totalDebits": 1349.25,
        "netBalance": 150.75
      },
      "recentTransactions": [
        {
          "id": "uuid-transaction-id",
          "amount": 50.00,
          "type": "Credit",
          "description": "Monthly allowance",
          "createdAt": "2025-01-15T14:20:00Z"
        }
      ],
      "caregiver": {
        "id": 456,
        "firstName": "Jane",
        "middleName": "Mary",
        "surname": "Doe",
        "email": "jane.doe@example.com"
      }
    }
  }
}
```

---

### 3. **Get Dependent Accounts (Alternative)**
```http
GET /api/accounts/caregiver/dependent/:dependentId
```

**Description**: Get account information for a specific dependent (from account controller)

**URL Parameters**:
- `dependentId`: The ID of the dependent

**Example Request**:
```bash
GET /api/accounts/caregiver/dependent/123
Authorization: Bearer your_token_here
```

**Response**:
```json
{
  "message": "Dependent accounts retrieved successfully",
  "dependent": {
    "id": 123,
    "firstName": "John",
    "surname": "Smith",
    "email": "john.smith@example.com",
    "role": "dependent"
  },
  "totalBalance": "150.75",
  "currency": "ZAR",
  "accountsCount": 1,
  "accounts": [
    {
      "id": "uuid-account-id",
      "accountNumber": "1234567890",
      "accountType": "Main",
      "balance": "150.75",
      "currency": "ZAR",
      "status": "active",
      "creationDate": "2025-01-15",
      "lastTransactionDate": "2025-01-15T14:20:00Z"
    }
  ]
}
```

---

### 4. **Get All Dependents' Accounts**
```http
GET /api/accounts/caregiver/all-dependents
```

**Description**: Get accounts for all dependents assigned to this caregiver

**Example Request**:
```bash
GET /api/accounts/caregiver/all-dependents
Authorization: Bearer your_token_here
```

**Response**:
```json
{
  "message": "All dependent accounts retrieved successfully",
  "caregiver": {
    "id": 456,
    "firstName": "Jane",
    "surname": "Doe",
    "email": "jane.doe@example.com"
  },
  "grandTotalBalance": "450.25",
  "currency": "ZAR",
  "dependentsCount": 3,
  "dependents": [
    {
      "id": 123,
      "firstName": "John",
      "surname": "Smith",
      "email": "john.smith@example.com",
      "totalBalance": "150.75",
      "accountsCount": 1,
      "accounts": [
        {
          "id": "uuid-account-id",
          "accountNumber": "1234567890",
          "accountType": "Main",
          "balance": "150.75",
          "currency": "ZAR",
          "status": "active",
          "creationDate": "2025-01-15",
          "lastTransactionDate": "2025-01-15T14:20:00Z"
        }
      ]
    }
  ]
}
```

---

### 5. **Get Caregiver Statistics**
```http
GET /api/caregiver/stats
```

**Description**: Get dashboard statistics for the caregiver including dependent counts and totals

**Example Request**:
```bash
GET /api/caregiver/stats
Authorization: Bearer your_token_here
```

**Response**:
```json
{
  "success": true,
  "message": "Caregiver statistics retrieved successfully",
  "data": {
    "totalDependents": 5,
    "dependentsByStatus": {
      "active": 4,
      "blocked": 0,
      "suspended": 1,
      "pending": 0
    },
    "totalAccountBalance": 1250.75,
    "recentTransactionsCount": 15,
    "currency": "ZAR"
  }
}
```

---

### 6. **Get Recent Activity**
```http
GET /api/caregiver/activity
```

**Description**: Get recent transaction activity across all dependents

**Query Parameters**:
- `limit` (optional): Number of transactions to return (default: 20)
- `days` (optional): Number of days to look back (default: 7)

**Example Request**:
```bash
GET /api/caregiver/activity?limit=10&days=30
Authorization: Bearer your_token_here
```

**Response**:
```json
{
  "success": true,
  "message": "Recent activity retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "uuid-transaction-id",
        "amount": 50.00,
        "type": "Credit",
        "description": "Monthly allowance",
        "reference": "TXN123456",
        "timestamp": "2025-01-15T14:20:00Z",
        "createdAt": "2025-01-15T14:20:00Z",
        "dependent": {
          "id": 123,
          "name": "John David Smith",
          "accountNumber": "1234567890"
        }
      }
    ],
    "period": "Last 30 days",
    "totalTransactions": 10
  }
}
```

---

## 🔧 Common Usage Patterns

### 1. **Dashboard Overview**
```javascript
// Get caregiver statistics for dashboard
const statsResponse = await fetch('/api/caregiver/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get recent activity for dashboard
const activityResponse = await fetch('/api/caregiver/activity?limit=5', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 2. **Dependent Management**
```javascript
// Get all dependents with pagination
const dependentsResponse = await fetch('/api/caregiver/dependents?page=1&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Search for specific dependent
const searchResponse = await fetch('/api/caregiver/dependents?search=John&status=active', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 3. **Individual Dependent Details**
```javascript
// Get full dependent profile and account details
const dependentResponse = await fetch(`/api/caregiver/dependents/${dependentId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get just account information
const accountResponse = await fetch(`/api/accounts/caregiver/dependent/${dependentId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## ⚠️ Important Notes

### Access Control
- Caregivers can only access dependents assigned to them through the `caregiverId` field in accounts
- All endpoints validate caregiver role and active status
- Dependent access is filtered by the caregiver's ID automatically

### Data Relationships
- Dependents are linked to caregivers through the `Account.caregiverId` field
- Each dependent should have at least one account with the caregiver's ID
- Sub-accounts (Education, Healthcare, etc.) inherit the same caregiver relationship

### Error Handling
- **403 Forbidden**: User is not a caregiver or doesn't have access
- **404 Not Found**: Dependent not found or not assigned to this caregiver
- **401 Unauthorized**: Invalid or missing authentication token
- **500 Server Error**: Database or server issues

### Performance Tips
- Use pagination for large lists of dependents
- Use the search feature to find specific dependents quickly
- The stats endpoint is optimized for dashboard displays
- Recent activity is limited and paginated for performance

---

## 🎯 Recommended Usage

1. **Use `/api/caregiver/dependents`** as your primary endpoint for listing dependents
2. **Use `/api/caregiver/dependents/:id`** for detailed dependent information
3. **Use `/api/caregiver/stats`** for dashboard overview data
4. **Use `/api/caregiver/activity`** for recent transaction monitoring
5. **Use account endpoints** only when you need just account-specific data

All endpoints are production-ready and include comprehensive error handling, validation, and security checks.
