# 🔐 NANA Portal API Authorization & Endpoints Documentation

## 📋 Overview
The NANA Portal API provides secure access to user data and administrative functions through JWT-based authentication with role-based authorization.

---

## 🔐 **AUTHORIZATION SYSTEM**

### **Token Types**

#### 1. **Portal Access Token** (Admin as User)
```javascript
// Generated when admin logs in as a user for portal access
{
  "originalUserId": 123,
  "portal": true,
  "iat": 1699123456,
  "exp": 1699209856
}
```

#### 2. **Regular User Token**
```javascript
{
  "id": 123,
  "email": "user@example.com",
  "role": "funder",
  "iat": 1699123456,
  "exp": 1699209856
}
```

#### 3. **Admin Token**
```javascript
{
  "id": 0,
  "role": "admin",
  "email": "admin@nanacaring.com",
  "iat": 1699123456,
  "exp": 1699209856
}
```

#### 4. **High Court Token**
```javascript
{
  "id": -1,
  "role": "highcourt", 
  "email": "court@nanacaring.com",
  "iat": 1699123456,
  "exp": 1699209856
}
```

### **Authorization Header Format**
```
Authorization: Bearer <JWT_TOKEN>
```

### **Authentication Flow**
1. **Extract token** from `Authorization` header
2. **Verify JWT** using `process.env.JWT_SECRET`
3. **Handle special cases**:
   - Portal tokens → Load original user with portal access
   - Admin tokens → Create admin user object
   - High Court tokens → Create high court user object
   - Regular tokens → Load user from database
4. **Attach user** to `req.user` for route handlers

---

## 🌐 **PORTAL API ENDPOINTS**

### **Base URL**: `/api/portal`

---

## 🔑 **AUTHENTICATION ENDPOINTS**

### **1. Portal Admin Login**
**Allows admin to login as any user for portal access**

**`POST /api/portal/admin-login`**

**Authorization:** Admin or High Court token required

#### Request Body:
```json
{
  "userId": 123
}
```

#### Success Response (200):
```json
{
  "success": true,
  "message": "Portal access granted for user John Doe",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "user": {
      "id": 123,
      "firstName": "John",
      "middleName": "James",
      "surname": "Doe",
      "email": "john.doe@example.com",
      "role": "funder",
      "status": "active",
      "portalAccess": true,
      "originalUserId": 123
    }
  }
}
```

#### Error Responses:
```json
// 404 - User not found
{
  "success": false,
  "message": "User not found"
}

// 403 - Access denied  
{
  "success": false,
  "message": "Access denied. Admin or High Court privileges required."
}
```

---

## 👤 **USER PROFILE ENDPOINTS**

### **2. Get User Details**
**Get comprehensive user profile with dependents and accounts**

**`GET /api/portal/me`**

**Authorization:** Portal token or user token required

#### Success Response (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "firstName": "John",
      "middleName": "James", 
      "surname": "Doe",
      "email": "john.doe@example.com",
      "role": "funder",
      "status": "active",
      "phoneNumber": "+27123456789",
      "postalAddressLine1": "123 Main Street",
      "postalAddressLine2": "Unit 4B",
      "postalCity": "Cape Town",
      "postalProvince": "Western Cape",
      "postalCode": "8000",
      "homeAddressLine1": "456 Oak Avenue",
      "homeAddressLine2": null,
      "homeCity": "Cape Town", 
      "homeProvince": "Western Cape",
      "homeCode": "8001",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-15T14:30:00.000Z",
      "Dependents": [
        {
          "id": 124,
          "firstName": "Emma",
          "middleName": null,
          "surname": "Doe",
          "email": "emma.doe@example.com",
          "role": "dependent",
          "status": "active",
          "accounts": [
            {
              "id": 201,
              "accountNumber": "ACC-DEP-124-EDU",
              "accountType": "Education",
              "balance": "250.00",
              "currency": "ZAR",
              "status": "active"
            }
          ]
        }
      ],
      "accounts": [
        {
          "id": 200,
          "accountNumber": "ACC-FUND-123-MAIN",
          "accountType": "Main",
          "balance": "1500.00", 
          "currency": "ZAR",
          "status": "active"
        }
      ]
    },
    "recentActivity": [
      {
        "id": 301,
        "accountId": 200,
        "amount": "100.00",
        "type": "transfer_to_dependent", 
        "description": "Monthly education allocation",
        "reference": "TXN-2025-001",
        "metadata": {
          "toAccount": "ACC-DEP-124-EDU",
          "category": "Education"
        },
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z",
        "Account": {
          "accountNumber": "ACC-FUND-123-MAIN",
          "accountType": "Main"
        }
      }
    ]
  }
}
```

#### Error Response (404):
```json
{
  "success": false,
  "message": "User not found"
}
```

### **3. Update User Profile**
**Update user profile information**

**`PUT /api/portal/me`**

**Authorization:** Portal token or user token required

#### Request Body:
```json
{
  "firstName": "John",
  "middleName": "James",
  "surname": "Doe", 
  "phoneNumber": "+27123456789",
  "postalAddressLine1": "123 New Street",
  "postalAddressLine2": "Unit 5A",
  "postalCity": "Johannesburg",
  "postalProvince": "Gauteng", 
  "postalCode": "2000",
  "homeAddressLine1": "789 New Avenue",
  "homeAddressLine2": "Apartment 12",
  "homeCity": "Johannesburg",
  "homeProvince": "Gauteng",
  "homeCode": "2001"
}
```

#### Success Response (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "firstName": "John",
    "middleName": "James",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "role": "funder",
    "status": "active",
    "phoneNumber": "+27123456789",
    "postalAddressLine1": "123 New Street",
    "postalAddressLine2": "Unit 5A", 
    "postalCity": "Johannesburg",
    "postalProvince": "Gauteng",
    "postalCode": "2000",
    "homeAddressLine1": "789 New Avenue",
    "homeAddressLine2": "Apartment 12",
    "homeCity": "Johannesburg",
    "homeProvince": "Gauteng", 
    "homeCode": "2001",
    "updatedAt": "2025-01-15T16:45:00.000Z"
  }
}
```

---

## 💰 **ACCOUNT ENDPOINTS**

### **4. Get User Accounts**
**Get all accounts belonging to the user**

**`GET /api/portal/me/accounts`**

**Authorization:** Portal token or user token required

#### Success Response (200):
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": 200,
        "accountNumber": "ACC-FUND-123-MAIN",
        "accountType": "Main", 
        "balance": "1500.00",
        "currency": "ZAR",
        "status": "active",
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-15T14:30:00.000Z",
        "User": {
          "id": 123,
          "firstName": "John",
          "surname": "Doe",
          "email": "john.doe@example.com"
        }
      },
      {
        "id": 201,
        "accountNumber": "ACC-FUND-123-SAV",
        "accountType": "Savings",
        "balance": "500.00", 
        "currency": "ZAR",
        "status": "active",
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-10T12:00:00.000Z",
        "User": {
          "id": 123,
          "firstName": "John",
          "surname": "Doe", 
          "email": "john.doe@example.com"
        }
      }
    ],
    "totalBalance": "2000.00",
    "accountCount": 2
  }
}
```

---

## 📊 **TRANSACTION ENDPOINTS**

### **5. Get User Transactions** 
**Get transactions for the user with filtering options**

**`GET /api/portal/me/transactions`**

**Authorization:** Portal token or user token required

#### Query Parameters:
```
?page=1&limit=20&startDate=2025-01-01&endDate=2025-01-31&type=transfer&accountId=200
```

#### Success Response (200):
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 301,
        "accountId": 200,
        "amount": "100.00",
        "type": "transfer_to_dependent",
        "status": "completed",
        "description": "Monthly education allocation", 
        "reference": "TXN-2025-001",
        "metadata": {
          "toAccount": "ACC-DEP-124-EDU",
          "category": "Education",
          "dependentId": 124
        },
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z",
        "Account": {
          "id": 200,
          "accountNumber": "ACC-FUND-123-MAIN",
          "accountType": "Main",
          "User": {
            "id": 123,
            "firstName": "John",
            "surname": "Doe"
          }
        }
      },
      {
        "id": 302,
        "accountId": 200, 
        "amount": "50.00",
        "type": "deposit",
        "status": "completed",
        "description": "Monthly top-up",
        "reference": "TXN-2025-002",
        "metadata": {
          "source": "bank_transfer",
          "bankReference": "BNK-789012"
        },
        "createdAt": "2025-01-14T15:30:00.000Z",
        "updatedAt": "2025-01-14T15:30:00.000Z",
        "Account": {
          "id": 200,
          "accountNumber": "ACC-FUND-123-MAIN", 
          "accountType": "Main",
          "User": {
            "id": 123,
            "firstName": "John",
            "surname": "Doe"
          }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalTransactions": 45,
      "limit": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "summary": {
      "totalAmount": "150.00",
      "transactionCount": 2,
      "dateRange": {
        "startDate": "2025-01-01",
        "endDate": "2025-01-31"
      }
    }
  }
}
```

### **6. Reset Password**
**Reset password for the current authenticated user**

**`POST /api/portal/reset-password`**

**Authorization:** Portal token or user token required

#### Request Body:
```json
{
  "newPassword": "newSecurePassword123!"
}
```

#### Success Response (200):
```json
{
  "success": true,
  "message": "Password reset successful for user: john.doe@example.com"
}
```

#### Error Responses:
```json
// 400 - Missing password
{
  "success": false,
  "message": "New password is required."
}

// 404 - User not found
{
  "success": false,
  "message": "User not found."
}
```

### **7. Reset User Password by Email** 
**Admin function to reset any user's password**

**`POST /api/portal/reset-user-password`**

**Authorization:** Portal token or admin token required

#### Request Body:
```json
{
  "email": "user@example.com",
  "newPassword": "newSecurePassword123!"
}
```

#### Success Response (200):
```json
{
  "success": true, 
  "message": "Password reset successful for user: user@example.com"
}
```

---

## 🛡️ **SECURITY FEATURES**

### **Token Validation**
- JWT format validation using regex
- Expiration checking
- Secret verification using `process.env.JWT_SECRET`
- User existence validation for regular tokens

### **Role-Based Access**
- **Portal Access**: Admin can access any user's data
- **User Access**: Users can only access their own data  
- **Admin Access**: Full system access for admin functions
- **High Court Access**: Same privileges as admin

### **Error Handling**
```json
// 401 - Unauthorized
{
  "success": false,
  "message": "No token, authorization denied"
}

// 401 - Invalid token
{
  "success": false, 
  "message": "Invalid token format"
}

// 401 - Expired token
{
  "success": false,
  "message": "Token has expired"
}

// 403 - Insufficient permissions
{
  "success": false,
  "message": "Access denied. Required roles: admin, highcourt. Your role: user"
}
```

---

## 🔧 **USAGE EXAMPLES**

### **Admin Login as User**
```javascript
// 1. Admin gets portal token
const response = await fetch('/api/portal/admin-login', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ userId: 123 })
});

const { data } = await response.json();
const portalToken = data.token;

// 2. Use portal token to access user data
const userResponse = await fetch('/api/portal/me', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + portalToken
  }
});
```

### **User Profile Update**
```javascript
const response = await fetch('/api/portal/me', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + userToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'John',
    phoneNumber: '+27123456789',
    postalAddressLine1: '123 New Street'
  })
});
```

### **Get Transactions with Filtering**
```javascript
const response = await fetch('/api/portal/me/transactions?page=1&limit=10&type=transfer&startDate=2025-01-01', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + userToken
  }
});
```

---

## 📝 **NOTES**

1. **Portal tokens** allow admin to act as any user while maintaining audit trail through `originalUserId`
2. **All endpoints** require valid JWT token in Authorization header
3. **Timestamps** are in ISO 8601 format (UTC)
4. **Amounts** are stored as decimal strings to prevent floating-point errors
5. **Account numbers** follow pattern: `ACC-{ROLE}-{USER_ID}-{TYPE}`
6. **Transaction references** are unique identifiers for tracking

---

**🔐 This API provides secure, role-based access to user data with comprehensive authentication and authorization mechanisms.**