# Dependent and Caregiver Account Access System

This document outlines the account access control system for dependents and caregivers in the platform.

## Overview

The system implements role-based access control where:
- **Dependents** can only access their own accounts
- **Caregivers** can access their own accounts AND their assigned dependents' accounts
- **Funders** can only access their own accounts
- **Admins** have full access to all accounts

## API Endpoints

### Dependent Routes

#### 1. Get Dependent's Own Accounts
```http
GET /api/accounts/dependent/my-accounts
```

**Authentication:** Required (Bearer Token)
**Authorization:** Only for users with role "dependent"

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response Example:**
```json
{
  "message": "Your accounts retrieved successfully",
  "totalBalance": "2500.00",
  "currency": "ZAR",
  "accountsCount": 2,
  "accounts": {
    "main": [
      {
        "id": 5,
        "accountNumber": "1234567890",
        "accountType": "savings",
        "balance": "2000.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-15",
        "lastTransactionDate": "2024-01-20T10:30:00.000Z",
        "parentAccountId": null
      }
    ],
    "sub": [
      {
        "id": 6,
        "accountNumber": "1234567891",
        "accountType": "pocket-money",
        "balance": "500.00",
        "currency": "ZAR",
        "status": "active",
        "creationDate": "2024-01-16",
        "lastTransactionDate": "2024-01-22T14:20:00.000Z",
        "parentAccountId": 5
      }
    ]
  },
  "allAccounts": [
    // ... all accounts in a flat array
  ]
}
```

### Caregiver Routes

#### 1. Get Specific Dependent's Accounts
```http
GET /api/accounts/caregiver/dependent/:dependentId
```

**Authentication:** Required (Bearer Token)
**Authorization:** Only for users with role "caregiver" who have access to the specified dependent

**Parameters:**
- `dependentId` (integer): The ID of the dependent whose accounts to retrieve

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response Example:**
```json
{
  "message": "Dependent accounts retrieved successfully",
  "dependent": {
    "id": 15,
    "firstName": "John",
    "surname": "Doe",
    "email": "john.dependent@example.com",
    "role": "dependent"
  },
  "totalBalance": "1500.00",
  "currency": "ZAR",
  "accountsCount": 2,
  "accounts": [
    {
      "id": 25,
      "accountNumber": "2345678901",
      "accountType": "savings",
      "balance": "1200.00",
      "currency": "ZAR",
      "status": "active",
      "creationDate": "2024-01-10",
      "lastTransactionDate": "2024-01-25T09:15:00.000Z"
    },
    {
      "id": 26,
      "accountNumber": "2345678902",
      "accountType": "allowance",
      "balance": "300.00",
      "currency": "ZAR",
      "status": "active",
      "creationDate": "2024-01-12",
      "lastTransactionDate": "2024-01-24T16:45:00.000Z"
    }
  ]
}
```

#### 2. Get All Dependents and Their Accounts
```http
GET /api/accounts/caregiver/all-dependents
```

**Authentication:** Required (Bearer Token)
**Authorization:** Only for users with role "caregiver"

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response Example:**
```json
{
  "message": "All dependent accounts retrieved successfully",
  "caregiver": {
    "id": 8,
    "firstName": "Jane",
    "surname": "Smith",
    "email": "jane.caregiver@example.com"
  },
  "grandTotalBalance": "4500.00",
  "currency": "ZAR",
  "dependentsCount": 2,
  "dependents": [
    {
      "id": 15,
      "firstName": "John",
      "surname": "Doe",
      "email": "john.dependent@example.com",
      "totalBalance": "1500.00",
      "accountsCount": 2,
      "accounts": [
        {
          "id": 25,
          "accountNumber": "2345678901",
          "accountType": "savings",
          "balance": "1200.00",
          "currency": "ZAR",
          "status": "active",
          "creationDate": "2024-01-10",
          "lastTransactionDate": "2024-01-25T09:15:00.000Z"
        },
        {
          "id": 26,
          "accountNumber": "2345678902",
          "accountType": "allowance",
          "balance": "300.00",
          "currency": "ZAR",
          "status": "active",
          "creationDate": "2024-01-12",
          "lastTransactionDate": "2024-01-24T16:45:00.000Z"
        }
      ]
    },
    {
      "id": 18,
      "firstName": "Alice",
      "surname": "Johnson",
      "email": "alice.dependent@example.com",
      "totalBalance": "3000.00",
      "accountsCount": 1,
      "accounts": [
        {
          "id": 30,
          "accountNumber": "3456789012",
          "accountType": "education",
          "balance": "3000.00",
          "currency": "ZAR",
          "status": "active",
          "creationDate": "2024-01-05",
          "lastTransactionDate": "2024-01-23T11:30:00.000Z"
        }
      ]
    }
  ]
}
```

### Enhanced Account Balance Access

The existing account balance endpoints now support role-based access:

#### Get Account Balance by ID
```http
GET /api/accounts/balance/:accountId
```

**Role-based Access:**
- **Dependents:** Can only access their own accounts
- **Caregivers:** Can access their own accounts + their dependents' accounts
- **Funders:** Can only access their own accounts
- **Admins:** Can access any account

### Updated General User Routes

#### Get User's Own Accounts (Updated)
```http
GET /api/accounts/my-accounts
```

**Note:** This endpoint now restricts dependents and redirects them to use the dedicated dependent endpoint.

**Response for Dependents:**
```json
{
  "message": "Access denied. Dependents should use /dependent/my-accounts endpoint."
}
```

## Access Control Logic

### Dependent Access Control
1. Dependents can ONLY access their own accounts
2. Attempts to access other accounts result in 403 Forbidden
3. Dependents must use the dedicated `/dependent/my-accounts` endpoint

### Caregiver Access Control
1. Caregivers can access their own accounts
2. Caregivers can access accounts of dependents they are assigned to via the FunderDependent relationship
3. Access is verified through the User-to-User relationship in the database
4. Unauthorized access attempts result in 403 Forbidden

### Database Relationships
The system relies on the following relationships:
- `FunderDependent` table links caregivers (funders) to their dependents
- User model has `Dependents` and `Funders` associations
- Account model belongs to User

## Error Responses

### 403 Forbidden
```json
{
  "message": "Access denied. You are not authorized to view this dependent's accounts."
}
```

### 404 Not Found
```json
{
  "message": "No accounts found for this dependent"
}
```

### 500 Server Error
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

## Security Features

1. **JWT Authentication:** All endpoints require valid JWT tokens
2. **Role-based Authorization:** Endpoints check user roles before granting access
3. **Relationship Verification:** Caregivers' access to dependents is verified through database relationships
4. **Status Checking:** The `checkUserStatus` middleware ensures only active users can access endpoints
5. **Input Validation:** All parameters are validated before processing

## Usage Examples

### For Dependents
```javascript
// Get my own accounts as a dependent
const response = await fetch('/api/accounts/dependent/my-accounts', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});
```

### For Caregivers
```javascript
// Get all my dependents and their accounts
const allDependents = await fetch('/api/accounts/caregiver/all-dependents', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});

// Get specific dependent's accounts
const specificDependent = await fetch('/api/accounts/caregiver/dependent/15', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});
```

## Testing

Test the implementation with the following scenarios:

1. **Dependent accessing own accounts:** Should succeed
2. **Dependent trying to access general endpoint:** Should fail with 403
3. **Caregiver accessing assigned dependent:** Should succeed
4. **Caregiver accessing unassigned dependent:** Should fail with 403
5. **Caregiver accessing own accounts:** Should succeed
6. **Invalid authentication:** Should fail with 401
7. **Blocked/suspended users:** Should fail with 403

## Notes

- All balance amounts are returned as strings with 2 decimal places
- Dates are in ISO 8601 format
- Currency is defaulted to "ZAR" (South African Rand)
- Account types can include: savings, checking, allowance, pocket-money, education, etc.
- The system supports both main accounts and sub-accounts (linked via parentAccountId)
