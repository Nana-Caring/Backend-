# 🔍 Complete Guide: All Caregiver Endpoints to Fetch Dependents

## 🎯 Quick Reference - All Available Endpoints

### **Primary Caregiver Routes** (`/api/caregiver/`)
| Endpoint | Method | Purpose | Key Features |
|----------|--------|---------|--------------|
| `/dependents` | GET | Get all assigned dependents | Pagination, search, filtering, sorting |
| `/dependents/:id` | GET | Get specific dependent details | Full profile, account details, transaction history |
| `/stats` | GET | Get caregiver dashboard statistics | Summary counts, balances, activity |
| `/activity` | GET | Get recent activity across all dependents | Recent transactions from all dependents |

### **Account Management Routes** (`/api/accounts/caregiver/`)
| Endpoint | Method | Purpose | Key Features |
|----------|--------|---------|--------------|
| `/dependent/:dependentId` | GET | Get specific dependent's accounts | Account details for one dependent |
| `/all-dependents` | GET | Get all dependents' accounts | Account-focused view of all dependents |

### **User Management Routes** (`/api/users/`)
| Endpoint | Method | Purpose | Key Features |
|----------|--------|---------|--------------|
| `/dependents` | GET | Get dependents (general) | Basic user information |

### **Transfer/Beneficiary Routes** (`/api/transfer/`)
| Endpoint | Method | Purpose | Key Features |
|----------|--------|---------|--------------|
| `/beneficiaries` | GET | Get beneficiaries list | For transfer purposes |

---

## 📋 Detailed Endpoint Documentation

### 1. **Main Caregiver Dependents Endpoint** ⭐ **RECOMMENDED**
```http
GET /api/caregiver/dependents
```

**🔑 Authentication**: Bearer token + caregiver role required

**📊 Query Parameters**:
- `page` (default: 1) - Page number for pagination
- `limit` (default: 10) - Items per page (max: 100)
- `search` - Search by name, email, or ID number
- `status` - Filter by: 'active', 'blocked', 'suspended', 'pending', 'all' (default: 'active')
- `sortBy` (default: 'createdAt') - Sort field
- `sortOrder` (default: 'DESC') - 'ASC' or 'DESC'

**💡 What You Get**:
- Complete dependent profiles
- Account information and balances
- Recent transactions (last 5 per dependent)
- Pagination metadata
- Search and filter capabilities

**🎯 Use Cases**:
- Main caregiver dashboard
- Dependent management interface
- Searching for specific dependents
- Monitoring account statuses

**Example Request**:
```bash
GET /api/caregiver/dependents?page=1&limit=10&search=John&status=active&sortBy=firstName&sortOrder=ASC
Authorization: Bearer your_caregiver_token
```

**Sample Response**:
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
      "limit": 10
    }
  }
}
```

---

### 2. **Specific Dependent Details** 🔍
```http
GET /api/caregiver/dependents/:dependentId
```

**🔑 Authentication**: Bearer token + caregiver role required

**💡 What You Get**:
- Complete dependent profile including addresses
- Full account details and statistics
- Last 20 transactions
- Account analytics (total credits, debits, net balance)
- Caregiver information

**🎯 Use Cases**:
- Viewing detailed dependent profile
- Account analysis and reporting
- Transaction history review
- Compliance and auditing

**Example Request**:
```bash
GET /api/caregiver/dependents/123
Authorization: Bearer your_caregiver_token
```

**Sample Response**:
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
        "totalCredits": 1200.00,
        "totalDebits": 1049.25,
        "netBalance": 150.75
      },
      "recentTransactions": [
        // Last 20 transactions
      ],
      "caregiver": {
        "id": 456,
        "firstName": "Mary",
        "middleName": "Jane",
        "surname": "Johnson",
        "email": "mary.johnson@example.com"
      }
    }
  }
}
```

---

### 3. **Caregiver Dashboard Statistics** 📊
```http
GET /api/caregiver/stats
```

**🔑 Authentication**: Bearer token + caregiver role required

**💡 What You Get**:
- Total dependents count
- Dependents by status breakdown
- Total account balance across all dependents
- Recent activity count (last 7 days)

**🎯 Use Cases**:
- Dashboard summary widgets
- Quick overview of caregiver responsibilities
- Monitoring dependent statuses
- Financial overview

**Example Request**:
```bash
GET /api/caregiver/stats
Authorization: Bearer your_caregiver_token
```

**Sample Response**:
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
    "totalAccountBalance": 2450.75,
    "recentTransactionsCount": 23,
    "currency": "ZAR"
  }
}
```

---

### 4. **Recent Activity Across All Dependents** 📈
```http
GET /api/caregiver/activity
```

**🔑 Authentication**: Bearer token + caregiver role required

**📊 Query Parameters**:
- `limit` (default: 20) - Maximum transactions to return
- `days` (default: 7) - Number of days to look back

**💡 What You Get**:
- Recent transactions from all dependents
- Dependent information for each transaction
- Chronological activity feed

**🎯 Use Cases**:
- Activity monitoring dashboard
- Recent transactions overview
- Account activity feed
- Compliance monitoring

**Example Request**:
```bash
GET /api/caregiver/activity?limit=10&days=14
Authorization: Bearer your_caregiver_token
```

**Sample Response**:
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
        "reference": "REF123456",
        "timestamp": "2025-01-15T14:20:00Z",
        "createdAt": "2025-01-15T14:20:00Z",
        "dependent": {
          "id": 123,
          "name": "John David Smith",
          "accountNumber": "1234567890"
        }
      }
    ],
    "period": "Last 14 days",
    "totalTransactions": 10
  }
}
```

---

### 5. **Account-Focused Dependent Data** 💳
```http
GET /api/accounts/caregiver/all-dependents
```

**🔑 Authentication**: Bearer token + caregiver role required

**💡 What You Get**:
- Account-centric view of all dependents
- Focus on financial/account information
- Minimal user profile data

**🎯 Use Cases**:
- Financial reporting
- Account management focus
- Balance monitoring
- Financial analytics

---

### 6. **Specific Dependent's Accounts** 💰
```http
GET /api/accounts/caregiver/dependent/:dependentId
```

**🔑 Authentication**: Bearer token + caregiver role required

**💡 What You Get**:
- All accounts for a specific dependent
- Account details and balances
- Account-specific information

**🎯 Use Cases**:
- Reviewing specific dependent's financial status
- Account management for one person
- Financial analysis for individual dependent

---

## 🚀 Best Practices & Recommendations

### **For Main Dashboard** 
→ Use: `GET /api/caregiver/dependents` with pagination

### **For Detailed View**
→ Use: `GET /api/caregiver/dependents/:id` for complete profile

### **For Quick Stats**
→ Use: `GET /api/caregiver/stats` for summary widgets

### **For Activity Feed**
→ Use: `GET /api/caregiver/activity` for recent transactions

### **For Financial Focus**
→ Use: `GET /api/accounts/caregiver/all-dependents` for account-centric view

---

## 🔐 Authentication Requirements

All endpoints require:
1. **Valid Bearer Token** in Authorization header
2. **Caregiver Role** - User must have `role: 'caregiver'`
3. **Active Status** - User must not be blocked or suspended
4. **Assignment** - Caregiver must be assigned to the dependents they're requesting

---

## 🎯 Common Use Case Examples

### **Loading Main Dashboard**
```javascript
// 1. Get basic stats for widgets
const stats = await fetch('/api/caregiver/stats');

// 2. Get first page of dependents
const dependents = await fetch('/api/caregiver/dependents?page=1&limit=10');

// 3. Get recent activity for timeline
const activity = await fetch('/api/caregiver/activity?limit=5');
```

### **Searching for Dependents**
```javascript
// Search by name
const results = await fetch('/api/caregiver/dependents?search=John&status=all');

// Filter by status
const blocked = await fetch('/api/caregiver/dependents?status=blocked');
```

### **Viewing Dependent Details**
```javascript
// Get complete profile
const dependent = await fetch('/api/caregiver/dependents/123');

// Get account-focused view
const accounts = await fetch('/api/accounts/caregiver/dependent/123');
```

---

## ⚠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

**Common Error Codes**:
- `401` - Authentication required or invalid token
- `403` - Access denied (not a caregiver or not assigned to dependent)
- `404` - Dependent not found or not assigned to you
- `500` - Server error

---

## 📝 Summary

**Total Endpoints Available**: 6 main endpoints for fetching dependents
**Primary Endpoint**: `GET /api/caregiver/dependents` (most comprehensive)
**Most Used Combination**: Main endpoint + stats + activity for dashboard
**Authentication**: All require caregiver role and valid token
**Features**: Pagination, search, filtering, sorting, detailed profiles, statistics

This comprehensive system allows caregivers to efficiently manage and monitor all their assigned dependents through multiple specialized endpoints tailored to different use cases.
