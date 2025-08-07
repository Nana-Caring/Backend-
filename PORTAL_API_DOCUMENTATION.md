# Portal API Documentation

## Overview
The Portal API provides secure admin access to manage user accounts, view transactions, and perform administrative tasks. Admins can login as any user to access their data with elevated privileges.

---

## Base URL
```
Production: https://nanacaring-backend.onrender.com
Development: http://localhost:5000
```

## Authentication
All portal endpoints require JWT authentication. Get the token from the admin login endpoint.

### Headers Required
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>"
}
```

---

## Portal Endpoints

### 1. Admin Login as User
**Endpoint:** `POST /api/portal/admin-login`

**Description:** Authenticate as any user with admin privileges for portal access.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "user_password"
}
```

**Success Response (200):**
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

**Error Responses:**
- `404` - User not found
- `401` - Invalid credentials
- `500` - Server error

---

### 2. Get User Details
**Endpoint:** `GET /api/portal/me`

**Description:** Get complete user profile with dependents, accounts, and recent transactions.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
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
        "middleName": null,
        "surname": "Doe",
        "email": "jane@example.com",
        "role": "dependent",
        "status": "active",
        "accounts": [
          {
            "id": 3,
            "accountNumber": "ACC001234570",
            "accountType": "Main",
            "balance": 500.00,
            "currency": "ZAR",
            "status": "active"
          }
        ]
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
      "updatedAt": "2025-08-06T10:00:00.000Z",
      "account": {
        "accountNumber": "ACC001234567",
        "accountType": "Main"
      }
    }
  ]
```

---

### 3. Update User Profile
**Endpoint:** `PUT /api/portal/me`

**Description:** Update user profile information including personal details and addresses.

**Headers:** `Authorization: Bearer <token>`

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

**Success Response (200):**
```json
{
  "message": "User profile updated successfully",
  "user": {
    "id": 1,
    "firstName": "John",
    "middleName": "Michael",
    "surname": "Doe",
    "email": "user@example.com",
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
    "homeCode": "2002",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-08-06T13:00:00.000Z"
  }
}
```

---

### 4. Get User Accounts
**Endpoint:** `GET /api/portal/me/accounts`

**Description:** Get user accounts with sub-accounts and parent account information.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
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
        },
        {
          "id": 4,
          "accountNumber": "ACC001234570",
          "accountType": "Clothing",
          "balance": 150.00,
          "currency": "ZAR",
          "status": "active"
        },
        {
          "id": 5,
          "accountNumber": "ACC001234571",
          "accountType": "Entertainment",
          "balance": 100.00,
          "currency": "ZAR",
          "status": "active"
        },
        {
          "id": 6,
          "accountNumber": "ACC001234572",
          "accountType": "Baby Care",
          "balance": 75.00,
          "currency": "ZAR",
          "status": "active"
        },
        {
          "id": 7,
          "accountNumber": "ACC001234573",
          "accountType": "Pregnancy",
          "balance": 50.00,
          "currency": "ZAR",
          "status": "active"
        },
        {
          "id": 8,
          "accountNumber": "ACC001234574",
          "accountType": "Savings",
          "balance": 1000.00,
          "currency": "ZAR",
          "status": "active"
        }
      ],
      "parentAccount": null
    }
  ]
}
```

---

### 5. Get User Transactions
**Endpoint:** `GET /api/portal/me/transactions`

**Description:** Get user transactions with advanced filtering and pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `type` | string | Filter by transaction type (`Credit`, `Debit`) | - |
| `startDate` | string | Filter from date (YYYY-MM-DD) | - |
| `endDate` | string | Filter to date (YYYY-MM-DD) | - |
| `minAmount` | number | Minimum transaction amount | - |
| `maxAmount` | number | Maximum transaction amount | - |
| `search` | string | Search in description or reference | - |
| `sortBy` | string | Sort field | `createdAt` |
| `sortOrder` | string | Sort order (`ASC`, `DESC`) | `DESC` |
| `limit` | number | Number of results per page | 20 |
| `page` | number | Page number | 1 |

**Example Request:**
```
GET /api/portal/me/transactions?type=Credit&startDate=2025-01-01&limit=10&page=1&search=allowance
```

**Success Response (200):**
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
        "category": "allowance",
        "approvedBy": "Admin"
      },
      "createdAt": "2025-08-06T10:00:00.000Z",
      "updatedAt": "2025-08-06T10:00:00.000Z",
      "account": {
        "accountNumber": "ACC001234567",
        "accountType": "Main"
      }
    },
    {
      "id": 102,
      "accountId": 2,
      "amount": 50.00,
      "type": "Credit",
      "description": "Education allowance",
      "reference": "TXN_123457",
      "metadata": {
        "source": "admin_manual",
        "category": "education"
      },
      "createdAt": "2025-08-05T14:30:00.000Z",
      "updatedAt": "2025-08-05T14:30:00.000Z",
      "account": {
        "accountNumber": "ACC001234568",
        "accountType": "Education"
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

---

### 6. Reset Password (Current User)
**Endpoint:** `POST /api/portal/reset-password`

**Description:** Reset password for the currently authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successful for user: user@example.com"
}
```

**Error Responses:**
- `400` - New password is required
- `404` - User not found
- `500` - Server error

---

### 7. Reset User Password by Email
**Endpoint:** `POST /api/portal/reset-user-password`

**Description:** Reset password for any user by email (admin function).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "user@example.com",
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successful."
}
```

**Error Responses:**
- `400` - Email and new password are required
- `404` - User not found
- `500` - Server error

---

## Portal Workflow

### Typical Portal Usage Flow:

1. **Admin Login**
   ```javascript
   POST /api/portal/admin-login
   // Get JWT token for user access
   ```

2. **View User Dashboard**
   ```javascript
   GET /api/portal/me
   // Get complete user profile with dependents and accounts
   ```

3. **View Account Details**
   ```javascript
   GET /api/portal/me/accounts
   // Get detailed account information with sub-accounts
   ```

4. **View Transaction History**
   ```javascript
   GET /api/portal/me/transactions?limit=50&sortOrder=DESC
   // Get recent transactions with filtering
   ```

5. **Update User Information**
   ```javascript
   PUT /api/portal/me
   // Update user profile details
   ```

6. **Reset User Password** (if needed)
   ```javascript
   POST /api/portal/reset-password
   // Reset current user's password
   ```

---

## Error Handling

### Standard Error Response Format:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes:
- **200**: Success
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid credentials
- **404**: Not Found - User/resource not found
- **500**: Internal Server Error

### Common Error Scenarios:

#### Authentication Errors:
```json
{
  "message": "User not found"
}
```

```json
{
  "message": "Invalid credentials"
}
```

#### Validation Errors:
```json
{
  "message": "New password is required."
}
```

```json
{
  "message": "Email and new password are required."
}
```

#### Server Errors:
```json
{
  "message": "Server error",
  "error": "Database connection failed"
}
```

---

## Data Models

### User Profile Fields:
```javascript
{
  // Basic Information
  id: Integer,
  firstName: String,
  middleName: String (optional),
  surname: String,
  email: String,
  role: "funder" | "caregiver" | "dependent",
  status: "active" | "blocked" | "suspended" | "pending",
  
  // Contact Information
  phoneNumber: String (SA format: +27xxxxxxxxx),
  
  // Postal Address
  postalAddressLine1: String,
  postalAddressLine2: String (optional),
  postalCity: String,
  postalProvince: String,
  postalCode: String,
  
  // Home Address
  homeAddressLine1: String,
  homeAddressLine2: String (optional),
  homeCity: String,
  homeProvince: String,
  homeCode: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Account Types:
- **Main**: Primary account that mirrors savings balance
- **Education**: For education-related expenses
- **Healthcare**: For medical expenses
- **Clothing**: For clothing purchases
- **Entertainment**: For entertainment expenses
- **Baby Care**: For baby-related expenses
- **Pregnancy**: For pregnancy-related expenses
- **Savings**: Savings account (balance reflected in Main account)

### Transaction Types:
- **Credit**: Money added to account
- **Debit**: Money removed from account

---

## Code Examples

### JavaScript/Node.js Example:
```javascript
const baseURL = 'https://nanacaring-backend.onrender.com';

// 1. Admin login as user
async function loginToPortal(userEmail, userPassword) {
  const response = await fetch(`${baseURL}/api/portal/admin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: userEmail,
      password: userPassword
    })
  });
  
  const { token, user } = await response.json();
  return { token, user };
}

// 2. Get user details
async function getUserDetails(token) {
  const response = await fetch(`${baseURL}/api/portal/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}

// 3. Get user transactions with filtering
async function getUserTransactions(token, filters = {}) {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`${baseURL}/api/portal/me/transactions?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}

// 4. Update user profile
async function updateUserProfile(token, profileData) {
  const response = await fetch(`${baseURL}/api/portal/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  
  return await response.json();
}

// 5. Reset user password
async function resetPassword(token, newPassword) {
  const response = await fetch(`${baseURL}/api/portal/reset-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ newPassword })
  });
  
  return await response.json();
}

// Example usage:
async function portalWorkflow() {
  try {
    // Login
    const { token } = await loginToPortal('user@example.com', 'password123');
    
    // Get user details
    const userDetails = await getUserDetails(token);
    console.log('User:', userDetails.user);
    console.log('Recent transactions:', userDetails.recentTransactions);
    
    // Get filtered transactions
    const transactions = await getUserTransactions(token, {
      type: 'Credit',
      limit: 10,
      startDate: '2025-01-01'
    });
    console.log('Filtered transactions:', transactions);
    
    // Update profile
    const updateResult = await updateUserProfile(token, {
      phoneNumber: '+27821234567',
      postalCity: 'Cape Town'
    });
    console.log('Profile updated:', updateResult);
    
  } catch (error) {
    console.error('Portal error:', error);
  }
}
```

### cURL Examples:
```bash
# 1. Admin login
curl -X POST https://nanacaring-backend.onrender.com/api/portal/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'

# 2. Get user details
curl -X GET https://nanacaring-backend.onrender.com/api/portal/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 3. Get user transactions with filters
curl -X GET "https://nanacaring-backend.onrender.com/api/portal/me/transactions?type=Credit&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 4. Update user profile
curl -X PUT https://nanacaring-backend.onrender.com/api/portal/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "phoneNumber": "+27821234567",
    "postalCity": "Cape Town"
  }'

# 5. Reset password
curl -X POST https://nanacaring-backend.onrender.com/api/portal/reset-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newSecurePassword123"
  }'
```

---

## Security & Best Practices

### Authentication:
- JWT tokens expire in 2 hours for security
- Tokens include `portal: true` and admin role
- Original user ID preserved in token for audit trails

### Data Validation:
- All inputs are validated server-side
- SQL injection protection via Sequelize ORM
- Password hashing using bcrypt

### Error Handling:
- Sensitive information not exposed in error messages
- Detailed logging on server-side for debugging
- Graceful degradation for missing database fields

### Rate Limiting:
- Portal endpoints have standard rate limits
- Login endpoint has stricter limits to prevent brute force

---

## Support

For portal-specific issues:
- Check browser console for client-side errors
- Verify JWT token is included in Authorization header
- Ensure user credentials are valid in the system
- Check database connectivity for 500 errors

---

*Portal API Documentation - Version 1.0*
*Last Updated: August 6, 2025*
Authorization: Bearer <portalJWT>
```
- Returns: List of user's accounts, each with sub-accounts and parent account info

**Response Example:**
```
{
  "accounts": [
    {
      "id": 101,
      "accountNumber": "ACC123456",
      "accountType": "Main",
      "balance": "1000.00",
      "currency": "ZAR",
      "status": "active",
      "subAccounts": [ ... ],
      "parentAccount": null
    },
    {
      "id": 102,
      "accountNumber": "ACC123457",
      "accountType": "Education",
      "balance": "200.00",
      "currency": "ZAR",
      "status": "active",
      "subAccounts": [],
      "parentAccount": { ... }
    }
  ]
}
```

---


### 4. Get User Transactions (Private via Portal)
```
GET /api/portal/me/transactions?type=Credit&startDate=2025-07-01&endDate=2025-07-23&search=school&page=1&limit=10
Authorization: Bearer <portalJWT>
```
- Returns: List of user's transactions with advanced filtering and pagination
### 5. Edit User Details (Private via Portal)
```
PUT /api/portal/me
Authorization: Bearer <portalJWT>
{
  "firstName": "NewName",
  "surname": "NewSurname",
  "email": "new.email@example.com",
  ...
}
```
- Allows editing of user details, only accessible via portal login.

**Response Example:**
```
{
  "transactions": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---



## Security Notes
- All portal endpoints require authentication.
- Admin access to user portal is only possible after user approval.
- All access is logged and auditable.

---

## Example Workflow
1. User logs in to portal with email/password.
2. User views their accounts, transactions, and details.
3. Admin requests access to a user's portal.
4. User receives notification and approves access.
5. Admin receives temporary token and can view the user's portal data.

---

## Integration
- Use the same authentication and user model as your main app.
- Protect all portal endpoints with `authenticate` middleware.
- Implement approval workflow for admin access.

---

## Contact
For further integration or customization, contact the backend team.
