# Custom Name API Documentation

## Overview
The Custom Name feature allows funders to assign personalized display names to their dependents while maintaining official records in the database. This provides flexibility in how dependents are displayed in the UI while preserving legal/official information.

## Key Features
- 🎯 **Freedom of Naming**: Funders can name dependents anything they want
- 🔒 **Official Records Preserved**: Legal names and ID numbers remain unchanged
- 💰 **Same Account Numbers**: Financial accounts use the same numbering system
- 🏷️ **Display Flexibility**: UI shows custom names, database stores both

---

## API Endpoints

### 1. Register Dependent with Custom Name

**Endpoint:** `POST /api/auth/register-dependent`

**Authentication:** Required (Bearer Token)

**Authorization:** Must be `caregiver` or `funder` role

#### Request Body

```json
{
  "firstName": "Sarah",
  "middleName": "Jane",
  "surname": "Williams",
  "email": "sarah.williams@example.com",
  "password": "securePassword123",
  "Idnumber": "9912155678901",
  "relation": "daughter",
  "customName": "My Little Princess",
  "notes": "Optional notes about the dependent"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `firstName` | String | ✅ Yes | Not empty, trimmed | Official first name |
| `middleName` | String | ❌ No | Optional, trimmed | Official middle name |
| `surname` | String | ✅ Yes | Not empty, trimmed | Official surname |
| `email` | String | ✅ Yes | Valid email format | Login email address |
| `password` | String | ✅ Yes | Min 6 characters | Login password |
| `Idnumber` | String | ✅ Yes | Exactly 13 numeric digits | South African ID number |
| `relation` | String | ✅ Yes | Not empty, trimmed | Relationship to funder/caregiver |
| `customName` | String | ✅ Yes | 1-100 characters, trimmed | **Custom display name** |
| `notes` | String | ❌ No | Max 500 characters | Optional notes |

#### Success Response (201 Created)

```json
{
  "message": "Dependent registered successfully",
  "dependent": {
    "id": 45,
    "firstName": "Sarah",
    "middleName": "Jane",
    "surname": "Williams",
    "email": "sarah.williams@example.com",
    "role": "dependent",
    "Idnumber": "9912155678901",
    "relation": "daughter",
    "customName": "My Little Princess",
    "displayName": "My Little Princess",
    "isInfant": false,
    "isUnborn": false,
    "isPregnant": false,
    "dateOfBirth": null,
    "parentCaregiverId": 23,
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
    "createdAt": "2025-11-07T10:30:00.000Z",
    "updatedAt": "2025-11-07T10:30:00.000Z",
    "accounts": [
      {
        "id": 89,
        "userId": 45,
        "caregiverId": 23,
        "accountType": "Main",
        "balance": 0,
        "parentAccountId": null,
        "accountNumber": "ACC789123456789"
      },
      {
        "id": 90,
        "userId": 45,
        "caregiverId": 23,
        "accountType": "Healthcare",
        "balance": 0,
        "parentAccountId": 89,
        "accountNumber": "ACC789123456790"
      },
      {
        "id": 91,
        "userId": 45,
        "caregiverId": 23,
        "accountType": "Groceries",
        "balance": 0,
        "parentAccountId": 89,
        "accountNumber": "ACC789123456791"
      },
      // ... other sub-accounts
    ],
    "funderLink": {
      "linkId": 12,
      "funderName": "John Doe",
      "mainAccountNumber": "ACC789123456789",
      "linkedAt": "2025-11-07T10:30:00.000Z"
    }
  }
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Custom display name is required",
      "path": "customName",
      "location": "body"
    }
  ]
}
```

**409 Conflict - Duplicate User**
```json
{
  "message": "Email or ID number already in use"
}
```

**403 Forbidden - Unauthorized Role**
```json
{
  "message": "Only caregivers and funders can register dependents"
}
```

---

### 2. Get Dependents (with Custom Names)

**Endpoint:** `GET /api/auth/dependents`

**Authentication:** Required (Bearer Token)

**Authorization:** Must be `caregiver` role

#### Request
```
GET /api/auth/dependents
Authorization: Bearer <jwt_token>
```

#### Success Response (200 OK)

```json
{
  "dependents": [
    {
      "id": 45,
      "firstName": "Sarah",
      "middleName": "Jane",
      "surname": "Williams",
      "email": "sarah.williams@example.com",
      "role": "dependent",
      "Idnumber": "9912155678901",
      "relation": "daughter",
      "customName": "My Little Princess",
      "displayName": "My Little Princess",
      "isInfant": false,
      "isUnborn": false,
      "isPregnant": false,
      "dateOfBirth": null,
      "parentCaregiverId": 23,
      "phoneNumber": null,
      "createdAt": "2025-11-07T10:30:00.000Z",
      "updatedAt": "2025-11-07T10:30:00.000Z",
      "accounts": [
        {
          "id": 89,
          "accountType": "Main",
          "balance": 0,
          "parentAccountId": null,
          "userId": 45
        },
        {
          "id": 90,
          "accountType": "Healthcare",
          "balance": 150.00,
          "parentAccountId": 89,
          "userId": 45
        }
        // ... other accounts
      ]
    },
    {
      "id": 46,
      "firstName": "Michael",
      "middleName": null,
      "surname": "Johnson",
      "email": "michael.j@example.com",
      "role": "dependent",
      "Idnumber": "0001015678902",
      "relation": "son",
      "customName": "Little Champion",
      "displayName": "Little Champion",
      "isInfant": true,
      "dateOfBirth": "2024-01-01T00:00:00.000Z",
      "parentCaregiverId": 23,
      "accounts": [
        // ... accounts
      ]
    }
  ]
}
```

---

## Database Schema Changes

### Users Table - Added Field

```sql
ALTER TABLE Users ADD COLUMN customName VARCHAR(100) NULL 
COMMENT 'Custom display name set by funder for their dependents';
```

### Migration Details
- **Migration File:** `20251107100044-add-custom-name-to-users.js`
- **Status:** ✅ Applied
- **Rollback:** Available via `down` migration

---

## Frontend Integration Guide

### 1. Registration Form
```javascript
// Add customName field to your dependent registration form
const formData = {
  firstName: 'Sarah',
  middleName: 'Jane',
  surname: 'Williams',
  email: 'sarah@example.com',
  password: 'securePass123',
  Idnumber: '9912155678901',
  relation: 'daughter',
  customName: 'My Little Princess', // 🎯 New required field
  notes: 'Optional notes'
};

// POST request
const response = await fetch('/api/auth/register-dependent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify(formData)
});
```

### 2. Display Logic
```javascript
// Use displayName for UI, keep official names for legal purposes
const DependentCard = ({ dependent }) => {
  return (
    <div className="dependent-card">
      <h3>{dependent.displayName}</h3> {/* 🎯 Shows custom name */}
      <p>Account: {dependent.accounts[0]?.accountNumber}</p>
      <p>Relation: {dependent.relation}</p>
      
      {/* Official details for admin/legal purposes */}
      <details>
        <summary>Official Details</summary>
        <p>Legal Name: {dependent.firstName} {dependent.surname}</p>
        <p>ID Number: {dependent.Idnumber}</p>
        <p>Email: {dependent.email}</p>
      </details>
    </div>
  );
};
```

### 3. Form Validation
```javascript
const validateCustomName = (customName) => {
  if (!customName || customName.trim().length === 0) {
    return 'Custom display name is required';
  }
  if (customName.length > 100) {
    return 'Custom name must be 100 characters or less';
  }
  return null;
};
```

---

## Business Logic

### 1. Name Priority
1. **Display**: Always use `customName` if available
2. **Fallback**: Use `firstName + surname` if `customName` is null
3. **Official**: Legal documents use `firstName`, `middleName`, `surname`

### 2. Account Management
- Account numbers remain tied to the **official user ID**
- Financial transactions use the **same account structure**
- Custom names are **display-only** and don't affect financial operations

### 3. Email Communications
- **Welcome emails**: Use official names (emails go to the dependent)
- **UI notifications**: Can use custom names for funder-facing messages
- **Legal documents**: Always use official names

---

## Security Considerations

### 1. Input Validation
- ✅ Custom names are sanitized and trimmed
- ✅ Length restrictions prevent abuse (1-100 characters)
- ✅ No script injection protection via validation

### 2. Data Privacy
- ✅ Official names remain in database for legal compliance
- ✅ Custom names are funder-specific display preferences
- ✅ Email communications use appropriate naming context

### 3. Authorization
- ✅ Only funders and caregivers can register dependents
- ✅ Custom names are tied to the registering user's relationship
- ✅ Account access remains tied to official user records

---

## Testing Examples

### 1. Test Valid Registration
```bash
curl -X POST http://localhost:3000/api/auth/register-dependent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Emma",
    "surname": "Smith",
    "email": "emma.smith@test.com",
    "password": "testPass123",
    "Idnumber": "1234567890123",
    "relation": "daughter",
    "customName": "My Sweet Angel"
  }'
```

### 2. Test Missing Custom Name
```bash
curl -X POST http://localhost:3000/api/auth/register-dependent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Emma",
    "surname": "Smith",
    "email": "emma.smith@test.com",
    "password": "testPass123",
    "Idnumber": "1234567890123",
    "relation": "daughter"
  }'
```
**Expected**: 400 error with validation message

### 3. Test Get Dependents
```bash
curl -X GET http://localhost:3000/api/auth/dependents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Migration Status ✅

- [x] Database migration created and applied
- [x] User model updated with customName field
- [x] Route validation updated to require customName
- [x] Controller logic updated to handle customName storage
- [x] Response format includes displayName field
- [x] getDependents endpoint updated to show custom names
- [x] Syntax validation passed

**Ready for Production** 🚀