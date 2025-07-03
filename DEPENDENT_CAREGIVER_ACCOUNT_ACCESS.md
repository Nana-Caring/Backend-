# Dependent and Caregiver Account Access API

## Overview
This documentation covers the specialized API endpoints for dependents to access their own accounts and for caregivers to manage their dependents' accounts with proper access control and security.

## Authentication & Authorization
- All endpoints require JWT authentication via `Authorization: Bearer <token>` header
- Users must have active status (not blocked, suspended, or pending)
- Role-based access control enforced for each endpoint

## Dependent Routes

### 1. Get Dependent's Own Accounts
**Endpoint:** `GET /api/accounts/dependent/my-accounts`
**Role Required:** `dependent`
**Description:** Allows dependents to view only their own accounts

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 - Success):**
```json
{
  "message": "Your accounts retrieved successfully",
  "totalBalance": "2500.00",
  "currency": "ZAR",
  "accountsCount": 3,
  "mainAccountsCount": 1,
  "subAccountsCount": 2,
  "accounts": {
    "main": [
      {
        "id": 1,
        "accountNumber": "ACC001",
        "accountName": "John's Main Account",
        "accountType": "Main",
        "balance": "1500.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-20T10:30:00.000Z",
        "createdAt": "2024-01-15T09:00:00.000Z",
        "updatedAt": "2024-01-20T10:30:00.000Z",
        "subAccounts": [
          {
            "id": 2,
            "accountNumber": "ACC002",
            "accountName": "Education Fund",
            "accountType": "Education",
            "balance": "750.00",
            "currency": "ZAR",
            "status": "active",
            "creationDate": "2024-01-15",
            "lastTransactionDate": "2024-01-18T14:15:00.000Z"
          },
          {
            "id": 3,
            "accountNumber": "ACC003",
            "accountName": "Healthcare Fund",
            "accountType": "Healthcare",
            "balance": "250.00",
            "currency": "ZAR",
            "status": "active",
            "creationDate": "2024-01-15",
            "lastTransactionDate": null
          }
        ],
        "hasSubAccounts": true
      }
    ],
    "sub": [
      {
        "id": 2,
        "accountNumber": "ACC002",
        "accountName": "Education Fund",
        "accountType": "Education",
        "balance": "750.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-18T14:15:00.000Z",
        "parentAccountId": 1,
        "parentAccount": {
          "id": 1,
          "accountNumber": "ACC001",
          "accountName": "John's Main Account",
          "accountType": "Main",
          "balance": "1500.00",
          "status": "active"
        },
        "createdAt": "2024-01-15T09:15:00.000Z",
        "updatedAt": "2024-01-18T14:15:00.000Z"
      },
      {
        "id": 3,
        "accountNumber": "ACC003",
        "accountName": "Healthcare Fund",
        "accountType": "Healthcare",
        "balance": "250.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": null,
        "parentAccountId": 1,
        "parentAccount": {
          "id": 1,
          "accountNumber": "ACC001",
          "accountName": "John's Main Account",
          "accountType": "Main",
          "balance": "1500.00",
          "status": "active"
        },
        "createdAt": "2024-01-15T09:30:00.000Z",
        "updatedAt": "2024-01-15T09:30:00.000Z"
      }
    ]
  },
  "allAccounts": [
    {
      "id": 1,
      "accountNumber": "ACC001",
      "accountName": "John's Main Account",
      "accountType": "Main",
      "balance": "1500.00",
      "currency": "ZAR",
      "status": "active",
      "creationDate": "2024-01-15",
      "lastTransactionDate": "2024-01-20T10:30:00.000Z",
      "parentAccountId": null,
      "parentAccount": null,
      "subAccounts": [
        {
          "id": 2,
          "accountNumber": "ACC002",
          "accountName": "Education Fund",
          "accountType": "Education",
          "balance": "750.00",
          "currency": "ZAR",
          "status": "active",
          "creationDate": "2024-01-15",
          "lastTransactionDate": "2024-01-18T14:15:00.000Z"
        }
      ],
      "isMainAccount": true,
      "isSubAccount": false,
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ],
  "summary": {
    "totalMainAccounts": 1,
    "totalSubAccounts": 2,
    "totalBalance": "2500.00",
    "currency": "ZAR",
    "accountTypes": ["Main", "Education", "Healthcare"],
    "activeAccounts": 3,
    "inactiveAccounts": 0
  }
}
```

**Error Responses:**
```json
// 403 - Wrong Role
{
  "message": "Access denied. This endpoint is only for dependents."
}

// 401 - Unauthorized
{
  "message": "Access denied. Token required."
}

// 403 - Blocked/Suspended User
{
  "message": "Account suspended. Please contact support."
}
```

## Caregiver Routes

### 1. Get Specific Dependent's Accounts
**Endpoint:** `GET /api/accounts/caregiver/dependent/:dependentId`
**Role Required:** `caregiver`
**Description:** Allows caregivers to view accounts of a specific dependent they manage

**Parameters:**
- `dependentId` (URL parameter): ID of the dependent whose accounts to retrieve

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 - Success):**
```json
{
  "message": "Dependent accounts retrieved successfully",
  "dependent": {
    "id": 15,
    "firstName": "John",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "role": "dependent"
  },
  "totalBalance": "3200.50",
  "currency": "ZAR",
  "accountsCount": 4,
  "accounts": [
    {
      "id": 10,
      "accountNumber": "DEP001",
      "accountType": "Main",
      "balance": 2000.00,
      "currency": "ZAR",
      "status": "active",
      "creationDate": "2024-01-10",
      "lastTransactionDate": "2024-01-22T09:45:00.000Z",
      "user": {
        "id": 15,
        "firstName": "John",
        "surname": "Doe",
        "email": "john.doe@example.com",
        "role": "dependent"
      }
    },
    {
      "id": 11,
      "accountNumber": "DEP002",
      "accountType": "Education",
      "balance": 800.50,
      "currency": "ZAR",
      "status": "active",
      "creationDate": "2024-01-10",
      "lastTransactionDate": "2024-01-20T16:30:00.000Z",
      "user": {
        "id": 15,
        "firstName": "John",
        "surname": "Doe",
        "email": "john.doe@example.com",
        "role": "dependent"
      }
    }
  ]
}
```

**Error Responses:**
```json
// 403 - No access to dependent
{
  "message": "Access denied. You are not authorized to view this dependent's accounts."
}

// 404 - No accounts found
{
  "message": "No accounts found for this dependent"
}

// 404 - Dependent not found or not associated with caregiver
{
  "message": "Access denied. You are not authorized to view this dependent's accounts."
}
```

### 2. Get All Dependents and Their Accounts
**Endpoint:** `GET /api/accounts/caregiver/all-dependents`
**Role Required:** `caregiver`
**Description:** Allows caregivers to view all their dependents and their respective accounts

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 - Success):**
```json
{
  "message": "All dependent accounts retrieved successfully",
  "caregiver": {
    "id": 5,
    "firstName": "Jane",
    "surname": "Smith",
    "email": "jane.smith@example.com"
  },
  "grandTotalBalance": "5750.75",
  "currency": "ZAR",
  "dependentsCount": 2,
  "dependents": [
    {
      "id": 15,
      "firstName": "John",
      "surname": "Doe",
      "email": "john.doe@example.com",
      "totalBalance": "3200.50",
      "accountsCount": 4,
      "accounts": [
        {
          "id": 10,
          "accountNumber": "DEP001",
          "accountType": "Main",
          "balance": 2000.00,
          "currency": "ZAR",
          "status": "active",
          "creationDate": "2024-01-10",
          "lastTransactionDate": "2024-01-22T09:45:00.000Z"
        }
      ]
    },
    {
      "id": 18,
      "firstName": "Sarah",
      "surname": "Johnson",
      "email": "sarah.johnson@example.com",
      "totalBalance": "2550.25",
      "accountsCount": 3,
      "accounts": [
        {
          "id": 20,
          "accountNumber": "DEP010",
          "accountType": "Main",
          "balance": 1800.00,
          "currency": "ZAR",
          "status": "active",
          "creationDate": "2024-01-12",
          "lastTransactionDate": "2024-01-21T11:20:00.000Z"
        }
      ]
    }
  ]
}
```

**Error Responses:**
```json
// 403 - Wrong Role
{
  "message": "Access denied. Caregiver role required."
}

// 404 - Caregiver not found
{
  "message": "Caregiver not found"
}
```

## Security Features

### Access Control
1. **Role Verification**: Each endpoint checks user role before processing
2. **Relationship Validation**: Caregivers can only access accounts of dependents they manage
3. **Self-Access Only**: Dependents can only view their own accounts
4. **User Status Check**: All endpoints verify user is not blocked/suspended/pending

### Data Privacy
- Personal information is limited to necessary fields
- Account numbers and sensitive data are only shown to authorized users
- Transaction details require separate API calls with proper authorization

## Frontend Integration Examples

### Dependent Dashboard (React)
```javascript
// Get dependent's own accounts
const fetchMyAccounts = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/accounts/dependent/my-accounts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setAccounts(data.accounts);
      setTotalBalance(data.totalBalance);
    } else {
      throw new Error('Failed to fetch accounts');
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
    setError('Unable to load your accounts');
  }
};
```

### Caregiver Dashboard (React)
```javascript
// Get all dependents and their accounts
const fetchAllDependentsAccounts = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/accounts/caregiver/all-dependents', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setDependents(data.dependents);
      setGrandTotal(data.grandTotalBalance);
    } else {
      throw new Error('Failed to fetch dependents accounts');
    }
  } catch (error) {
    console.error('Error fetching dependents accounts:', error);
    setError('Unable to load dependents accounts');
  }
};

// Get specific dependent's accounts
const fetchDependentAccounts = async (dependentId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/accounts/caregiver/dependent/${dependentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setSelectedDependentAccounts(data.accounts);
    } else {
      throw new Error('Failed to fetch dependent accounts');
    }
  } catch (error) {
    console.error('Error fetching dependent accounts:', error);
    setError('Unable to load dependent accounts');
  }
};
```

## Testing

### Test Dependent Access
```bash
# Test as dependent user
curl -X GET "http://localhost:5000/api/accounts/dependent/my-accounts" \
  -H "Authorization: Bearer <dependent_jwt_token>" \
  -H "Content-Type: application/json"
```

### Test Caregiver Access
```bash
# Test all dependents
curl -X GET "http://localhost:5000/api/accounts/caregiver/all-dependents" \
  -H "Authorization: Bearer <caregiver_jwt_token>" \
  -H "Content-Type: application/json"

# Test specific dependent
curl -X GET "http://localhost:5000/api/accounts/caregiver/dependent/15" \
  -H "Authorization: Bearer <caregiver_jwt_token>" \
  -H "Content-Type: application/json"
```

## Related Endpoints
- See `ACCOUNT_BALANCE_API.md` for general account balance endpoints
- See `USER_BLOCKING_SYSTEM.md` for user status management
- See `admin.js` routes for administrative account management

## Notes
- All endpoints use proper error handling and return meaningful error messages
- Responses include pagination-ready data structures for large datasets
- Currency is standardized to ZAR (South African Rand)
- Dates are returned in ISO 8601 format
- Account types include: Main, Education, Healthcare, Entertainment, etc.
