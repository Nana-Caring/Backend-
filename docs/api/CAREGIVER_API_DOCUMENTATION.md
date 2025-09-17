# 👩‍⚕️ Caregiver API Documentation

Complete API endpoints for caregivers to fetch and manage their assigned dependents.

## 🚀 Base URL
```
http://localhost:5000/api/caregiver
```

## 🔐 Authentication & Authorization
All endpoints require:
- **Authorization Header:** `Bearer YOUR_JWT_TOKEN`
- **Role:** User must have `caregiver` role
- **Relationship:** Caregiver must be assigned to the dependent's account

---

## 📋 API ENDPOINTS

### 1. **Get All Dependents**
Fetch all dependents assigned to the authenticated caregiver.

**Endpoint:** `GET /api/caregiver/dependents`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search by name, email, or ID number
- `status` (optional) - Filter by status: `active`, `blocked`, `suspended`, `pending`, `all` (default: active)
- `sortBy` (optional) - Sort field: `createdAt`, `firstName`, `surname` (default: createdAt)
- `sortOrder` (optional) - Sort order: `ASC` or `DESC` (default: DESC)

**Request Example:**
```bash
GET /api/caregiver/dependents?page=1&limit=5&search=john&status=active&sortBy=firstName&sortOrder=ASC
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dependents retrieved successfully",
  "data": {
    "dependents": [
      {
        "id": 123,
        "firstName": "John",
        "middleName": "William",
        "surname": "Doe",
        "fullName": "John William Doe",
        "email": "john.doe@example.com",
        "idNumber": "9001011234567",
        "phoneNumber": "+27821234567",
        "relation": "child",
        "status": "active",
        "isBlocked": false,
        "createdAt": "2025-07-10T10:00:00.000Z",
        "updatedAt": "2025-07-10T15:30:00.000Z",
        "account": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "accountNumber": "1234567890",
          "accountType": "savings",
          "balance": 1500.00,
          "currency": "ZAR",
          "status": "active",
          "createdAt": "2025-07-01T10:00:00.000Z",
          "lastTransactionDate": "2025-07-10T14:30:00.000Z",
          "recentTransactions": [
            {
              "id": "txn-uuid-001",
              "amount": 500.00,
              "type": "Credit",
              "description": "Monthly allowance",
              "createdAt": "2025-07-10T14:30:00.000Z"
            }
          ]
        },
        "totalTransactions": 1
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalDependents": 15,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 5
    }
  }
}
```

### 2. **Get Specific Dependent**
Fetch detailed information about a specific dependent by ID.

**Endpoint:** `GET /api/caregiver/dependents/:dependentId`

**Path Parameters:**
- `dependentId` (required) - The dependent's user ID

**Request Example:**
```bash
GET /api/caregiver/dependents/123
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dependent details retrieved successfully",
  "data": {
    "id": 123,
    "firstName": "John",
    "middleName": "William",
    "surname": "Doe",
    "fullName": "John William Doe",
    "email": "john.doe@example.com",
    "idNumber": "9001011234567",
    "phoneNumber": "+27821234567",
    "relation": "child",
    "status": "active",
    "isBlocked": false,
    "blockReason": null,
    "createdAt": "2025-07-10T10:00:00.000Z",
    "updatedAt": "2025-07-10T15:30:00.000Z",
    "postalAddress": {
      "line1": "123 Main Street",
      "line2": "Apartment 4B",
      "city": "Cape Town",
      "province": "Western Cape",
      "postalCode": "8001"
    },
    "physicalAddress": {
      "line1": "123 Main Street",
      "line2": "Apartment 4B", 
      "city": "Cape Town",
      "province": "Western Cape",
      "postalCode": "8001"
    },
    "account": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "accountNumber": "1234567890",
      "accountType": "savings",
      "balance": 1500.00,
      "currency": "ZAR",
      "status": "active",
      "createdAt": "2025-07-01T10:00:00.000Z",
      "lastTransactionDate": "2025-07-10T14:30:00.000Z",
      "statistics": {
        "totalTransactions": 25,
        "totalCredits": 2500.00,
        "totalDebits": 1000.00,
        "netBalance": 1500.00
      },
      "recentTransactions": [
        {
          "id": "txn-uuid-001",
          "amount": 500.00,
          "type": "Credit",
          "description": "Monthly allowance",
          "reference": "TXN123456",
          "timestamp": "2025-07-10T14:30:00.000Z",
          "createdAt": "2025-07-10T14:30:00.000Z"
        }
      ],
      "caregiver": {
        "id": 456,
        "firstName": "Jane",
        "middleName": null,
        "surname": "Smith",
        "email": "jane.smith@example.com"
      }
    }
  }
}
```

### 3. **Get Caregiver Statistics**
Get dashboard statistics for the caregiver's overview.

**Endpoint:** `GET /api/caregiver/stats`

**Request Example:**
```bash
GET /api/caregiver/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Caregiver statistics retrieved successfully",
  "data": {
    "totalDependents": 12,
    "dependentsByStatus": {
      "active": 10,
      "blocked": 1,
      "suspended": 1,
      "pending": 0
    },
    "totalAccountBalance": 18500.00,
    "recentTransactionsCount": 15,
    "currency": "ZAR"
  }
}
```

### 4. **Get Recent Activity**
Get recent transaction activity across all assigned dependents.

**Endpoint:** `GET /api/caregiver/activity`

**Query Parameters:**
- `limit` (optional) - Number of transactions to return (default: 20)
- `days` (optional) - Number of past days to include (default: 7)

**Request Example:**
```bash
GET /api/caregiver/activity?limit=10&days=14
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recent activity retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "txn-uuid-001",
        "amount": 500.00,
        "type": "Credit",
        "description": "Monthly allowance",
        "reference": "TXN123456",
        "timestamp": "2025-07-10T14:30:00.000Z",
        "createdAt": "2025-07-10T14:30:00.000Z",
        "dependent": {
          "id": 123,
          "name": "John William Doe",
          "accountNumber": "1234567890"
        }
      },
      {
        "id": "txn-uuid-002",
        "amount": 50.00,
        "type": "Debit",
        "description": "Grocery purchase",
        "reference": "TXN123457",
        "timestamp": "2025-07-09T12:15:00.000Z",
        "createdAt": "2025-07-09T12:15:00.000Z",
        "dependent": {
          "id": 124,
          "name": "Mary Jane Smith",
          "accountNumber": "1234567891"
        }
      }
    ],
    "period": "Last 14 days",
    "totalTransactions": 2
  }
}
```

---

## 🚨 Error Responses

### **403 - Forbidden (Not a Caregiver)**
```json
{
  "success": false,
  "message": "Access denied. Caregiver role required."
}
```

### **404 - Dependent Not Found**
```json
{
  "success": false,
  "message": "Dependent not found or you do not have caregiver access to this user"
}
```

### **401 - Unauthorized**
```json
{
  "success": false,
  "message": "Access denied. Token required."
}
```

### **500 - Server Error**
```json
{
  "success": false,
  "message": "Failed to retrieve dependents",
  "error": "Database connection error"
}
```

---

## 🧪 TESTING WORKFLOW

### **Step 1: Caregiver Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "caregiver@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 456,
    "role": "caregiver",
    "firstName": "Jane",
    "surname": "Smith"
  }
}
```

### **Step 2: Get All Dependents**
```bash
GET /api/caregiver/dependents
Authorization: Bearer jwt_token_here
```

### **Step 3: Get Specific Dependent**
```bash
GET /api/caregiver/dependents/123
Authorization: Bearer jwt_token_here
```

### **Step 4: Get Dashboard Stats**
```bash
GET /api/caregiver/stats
Authorization: Bearer jwt_token_here
```

### **Step 5: Get Recent Activity**
```bash
GET /api/caregiver/activity?days=7
Authorization: Bearer jwt_token_here
```

---

## 💡 USE CASES

### **📊 Caregiver Dashboard**
1. **GET /api/caregiver/stats** - Get overview statistics
2. **GET /api/caregiver/activity** - Get recent activity feed
3. **GET /api/caregiver/dependents?limit=5** - Get recent dependents

### **👥 Dependent Management**
1. **GET /api/caregiver/dependents** - List all assigned dependents
2. **GET /api/caregiver/dependents/:id** - View detailed dependent profile
3. **GET /api/caregiver/dependents?search=john** - Search for specific dependents

### **📈 Monitoring & Tracking**
1. **GET /api/caregiver/activity?days=30** - Monthly activity review
2. **GET /api/caregiver/dependents?status=blocked** - Check problematic accounts
3. **GET /api/caregiver/dependents/:id** - Deep dive into dependent's account

---

## 🔑 Key Features

### ✅ **Security & Access Control**
- **Role-based authentication** (caregiver role required)
- **Relationship verification** (caregiver must be assigned to dependent's account)
- **Secure data filtering** (only assigned dependents are accessible)

### ✅ **Data Management**
- **Comprehensive dependent profiles** with personal and account information
- **Transaction history** with recent activity tracking
- **Account statistics** and balance monitoring
- **Search and filtering** capabilities

### ✅ **Dashboard Support**
- **Real-time statistics** for caregiver dashboard
- **Activity feeds** for monitoring dependent transactions
- **Status tracking** for dependent account health
- **Pagination** for large datasets

### ✅ **Relationship Context**
- **Caregiver-dependent mapping** through account assignments
- **Full dependent profile access** including addresses and contact info
- **Transaction oversight** with detailed activity logs
- **Account balance monitoring** across all assigned dependents

---

## 🛠️ IMPLEMENTATION NOTES

### **Database Relationships**
- `Account.caregiverId` links accounts to caregivers
- `User.role = 'caregiver'` identifies caregiver users
- `User.role = 'dependent'` identifies dependent users
- Foreign key relationships ensure data integrity

### **Performance Optimizations**
- **Eager loading** of related models (Account, Transaction, User)
- **Pagination** for large result sets
- **Limited transaction history** in list views (5 recent)
- **Full transaction history** in detail views (20 recent)

### **Security Considerations**
- **Role validation** at route level
- **Relationship verification** in each endpoint
- **Token-based authentication** required
- **Data filtering** by caregiver assignment

All endpoints are production-ready and integrated with your existing authentication and database structure! 🚀
