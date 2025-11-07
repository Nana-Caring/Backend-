# Caregiver API Documentation

## Overview
Complete API documentation for caregiver endpoints with request/response examples for frontend integration.

**Base URL**: `{API_BASE_URL}/api/caregiver`  
**Authentication**: Bearer Token (JWT) required  
**Role**: User must have `caregiver` role  

---

## Authentication Headers
All requests must include:
```javascript
headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
}
```

---

## 1. Get Caregiver Dependents

### Endpoint
```
GET /api/caregiver/dependents
```

### Description
Retrieve all dependents assigned to the authenticated caregiver with pagination and filtering options.

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of items per page |
| `search` | string | - | Search by dependent name or email |
| `status` | string | 'active' | Filter by status: active, blocked, suspended, pending |
| `sortBy` | string | 'createdAt' | Sort field: createdAt, firstName, surname |
| `sortOrder` | string | 'DESC' | Sort order: ASC, DESC |

### Frontend Request Example
```javascript
const fetchDependents = async (params = {}) => {
    const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        status: params.status || 'active',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'DESC'
    }).toString();

    const response = await fetch(`/api/caregiver/dependents?${queryString}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    return await response.json();
};
```

### Response Structure
```json
{
    "success": true,
    "message": "Dependents retrieved successfully",
    "data": {
        "dependents": [
            {
                "id": 13,
                "firstName": "Emma",
                "middleName": null,
                "surname": "Johnson",
                "fullName": "Emma Johnson",
                "email": "dependent@demo.com",
                "idNumber": "0101015800088",
                "phoneNumber": "+27123456789",
                "relation": "daughter",
                "status": "active",
                "isBlocked": false,
                "createdAt": "2024-10-25T10:30:00.000Z",
                "updatedAt": "2024-10-29T14:22:00.000Z",
                "accountsCount": 8,
                "account": {
                    "id": "uuid-main-account",
                    "accountNumber": "6472659461",
                    "accountType": "Main",
                    "balance": 2117.87,
                    "currency": "ZAR",
                    "status": "active",
                    "createdAt": "2024-10-25T10:30:00.000Z",
                    "lastTransactionDate": "2024-10-29T12:00:00.000Z",
                    "recentTransactions": []
                },
                "totalTransactions": 15
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalDependents": 8,
            "hasNextPage": false,
            "hasPrevPage": false,
            "limit": 10
        }
    }
}
```

---

## 2. Get Caregiver Dashboard Statistics

### Endpoint
```
GET /api/caregiver/stats
```

### Description
Get overview statistics for the caregiver dashboard including dependent counts and financial summaries.

### Frontend Request Example
```javascript
const fetchCaregiverStats = async () => {
    const response = await fetch('/api/caregiver/stats', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    return await response.json();
};
```

### Response Structure
```json
{
    "success": true,
    "message": "Caregiver statistics retrieved successfully",
    "data": {
        "totalDependents": 8,
        "dependentsByStatus": {
            "active": 7,
            "blocked": 0,
            "suspended": 1,
            "pending": 0
        },
        "totalBalance": 15847.32,
        "totalTransactions": 142,
        "monthlyTransactions": 23,
        "averageBalance": 1980.92,
        "accountSummary": {
            "totalAccounts": 64,
            "activeAccounts": 62,
            "inactiveAccounts": 2
        },
        "recentActivity": {
            "lastLogin": "2024-10-29T14:22:00.000Z",
            "lastTransaction": "2024-10-29T12:15:00.000Z",
            "newDependents": 0
        }
    }
}
```

---

## 3. Get Recent Activity

### Endpoint
```
GET /api/caregiver/activity
```

### Description
Retrieve recent activity across all dependents including transactions and account changes.

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Number of activities to return |
| `days` | number | 7 | Number of days to look back |

### Frontend Request Example
```javascript
const fetchRecentActivity = async (limit = 20, days = 7) => {
    const response = await fetch(`/api/caregiver/activity?limit=${limit}&days=${days}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    return await response.json();
};
```

### Response Structure
```json
{
    "success": true,
    "message": "Recent activity retrieved successfully",
    "data": {
        "activities": [
            {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "type": "Debit",
                "description": "Grocery shopping - Fresh produce",
                "amount": -125.50,
                "currency": "ZAR",
                "reference": "PUR-20241029-PNP001",
                
                // 🆕 Enhanced Transaction Details
                "senderName": "Emma Johnson",
                "senderAccountNumber": "1335066315",
                "recipientName": "Pick n Pay Hypermarket", 
                "recipientAccountNumber": "MERCHANT-PICK-N-PAY",
                "transactionCategory": "purchase",
                "merchantName": "Pick n Pay",
                
                "dependent": {
                    "id": 13,
                    "name": "Emma Johnson",
                    "email": "dependent@demo.com"
                },
                "account": {
                    "accountNumber": "1335066315",
                    "accountType": "Groceries"
                },
                "timestamp": "2024-10-29T12:15:00.000Z",
                "createdAt": "2024-10-29T12:15:00.000Z"
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "type": "Credit",
                "description": "Weekly allowance from Sarah Williams",
                "amount": 500.00,
                "currency": "ZAR",
                "reference": "TRF-20241029-ABC123-IN",
                
                // 🆕 Enhanced Fund Transfer Details
                "senderName": "Sarah Williams",
                "senderAccountNumber": "1234567890",
                "recipientName": "Emma Johnson",
                "recipientAccountNumber": "6472659461",
                "transactionCategory": "allowance",
                "merchantName": null,
                
                "dependent": {
                    "id": 13,
                    "name": "Emma Johnson",
                    "email": "dependent@demo.com"
                },
                "account": {
                    "accountNumber": "6472659461",
                    "accountType": "Main"
                },
                "timestamp": "2024-10-28T09:00:00.000Z",
                "createdAt": "2024-10-28T09:00:00.000Z"
            }
        ],
        "summary": {
            "totalActivities": 2,
            "dateRange": {
                "from": "2024-10-22T00:00:00.000Z",
                "to": "2024-10-29T23:59:59.000Z"
            }
        }
    }
}
```

---

## 4. Get All Dependent Transactions

### Endpoint
```
GET /api/caregiver/transactions
```

### Description
Retrieve transactions for all dependents under this caregiver with filtering and pagination.

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Number of transactions per page |
| `startDate` | string | - | Start date filter (ISO format) |
| `endDate` | string | - | End date filter (ISO format) |
| `accountType` | string | - | Filter by account type |
| `transactionType` | string | - | Filter by transaction type |
| `dependentId` | number | - | Filter by specific dependent |

### Frontend Request Example
```javascript
const fetchAllTransactions = async (params = {}) => {
    const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
        ...(params.accountType && { accountType: params.accountType }),
        ...(params.transactionType && { transactionType: params.transactionType }),
        ...(params.dependentId && { dependentId: params.dependentId })
    }).toString();

    const response = await fetch(`/api/caregiver/transactions?${queryString}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    return await response.json();
};
```

### Response Structure
```json
{
    "success": true,
    "message": "Transactions retrieved successfully",
    "data": {
        "transactions": [
            {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "amount": -125.50,
                "currency": "ZAR",
                "type": "Debit",
                "description": "Grocery shopping - Fresh produce",
                "reference": "PUR-20241029-PNP001",
                "createdAt": "2024-10-29T14:30:00.000Z",
                
                // 🆕 Enhanced Fields for Better Statement Clarity
                "senderName": "Emma Johnson",
                "senderAccountNumber": "1335066315", 
                "recipientName": "Pick n Pay Hypermarket",
                "recipientAccountNumber": "MERCHANT-PICK-N-PAY",
                "transactionCategory": "purchase",
                "merchantName": "Pick n Pay",
                
                "dependent": {
                    "id": 13,
                    "name": "Emma Johnson",
                    "email": "dependent@demo.com"
                },
                "account": {
                    "id": "groceries-account-uuid",
                    "accountNumber": "1335066315",
                    "accountType": "Groceries",
                    "balance": 25.10,
                    "owner": {
                        "id": 13,
                        "name": "Emma Johnson",
                        "email": "dependent@demo.com"
                    }
                }
            }
        ],
        "summary": {
            "totalAmount": -125.50,
            "totalTransactions": 1,
            "averageTransaction": -125.50
        },
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalTransactions": 1,
            "hasNextPage": false,
            "hasPrevPage": false,
            "limit": 20
        }
    }
}
```

---

## 5. Get Transaction Analytics

### Endpoint
```
GET /api/caregiver/transactions/analytics
```

### Description
Get analytical data about transactions including spending patterns and trends.

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | 'month' | Analytics period: week, month, quarter, year |
| `dependentId` | number | - | Filter analytics for specific dependent |

### Frontend Request Example
```javascript
const fetchTransactionAnalytics = async (period = 'month', dependentId = null) => {
    const params = { period };
    if (dependentId) params.dependentId = dependentId;
    
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`/api/caregiver/transactions/analytics?${queryString}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    return await response.json();
};
```

### Response Structure
```json
{
    "success": true,
    "message": "Transaction analytics retrieved successfully",
    "data": {
        "period": "month",
        "dateRange": {
            "from": "2024-10-01T00:00:00.000Z",
            "to": "2024-10-31T23:59:59.000Z"
        },
        "totalSpending": 3247.85,
        "totalIncome": 4000.00,
        "netBalance": 752.15,
        "transactionCount": 45,
        "spendingByCategory": {
            "Groceries": 890.45,
            "Healthcare": 567.20,
            "Education": 445.60,
            "Entertainment": 289.30,
            "Clothing": 223.15,
            "Baby Care": 178.90,
            "Pregnancy": 653.25
        },
        "spendingTrend": [
            { "date": "2024-10-01", "amount": 125.50 },
            { "date": "2024-10-02", "amount": 89.30 },
            { "date": "2024-10-03", "amount": 234.75 }
        ],
        "topMerchants": [
            {
                "name": "Pick n Pay",
                "category": "Groceries",
                "amount": 456.78,
                "transactions": 8
            },
            {
                "name": "Clicks Pharmacy",
                "category": "Healthcare", 
                "amount": 234.50,
                "transactions": 3
            }
        ]
    }
}
```

---

## 6. Get Dependent Transactions by ID

### Endpoint
```
GET /api/caregiver/dependents/:dependentId/transactions
```

### Description
Get transaction history for a specific dependent.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dependentId` | number | Yes | ID of the specific dependent |

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Number of transactions per page |
| `accountType` | string | - | Filter by account type |
| `startDate` | string | - | Start date filter (ISO format) |
| `endDate` | string | - | End date filter (ISO format) |

### Frontend Request Example
```javascript
const fetchDependentTransactions = async (dependentId, params = {}) => {
    const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.accountType && { accountType: params.accountType }),
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate })
    }).toString();

    const response = await fetch(`/api/caregiver/dependents/${dependentId}/transactions?${queryString}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    return await response.json();
};
```

### Response Structure
```json
{
    "success": true,
    "message": "Dependent transactions retrieved successfully",
    "data": {
        "dependent": {
            "id": 13,
            "name": "Emma Johnson",
            "email": "dependent@demo.com"
        },
        "transactions": [
            {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "amount": -125.50,
                "currency": "ZAR", 
                "type": "Debit",
                "description": "Grocery shopping - Fresh produce",
                "reference": "PUR-20241029-PNP001",
                "createdAt": "2024-10-29T12:15:00.000Z",
                
                // 🆕 Enhanced Transaction Fields
                "senderName": "Emma Johnson",
                "senderAccountNumber": "1335066315",
                "recipientName": "Pick n Pay Hypermarket",
                "recipientAccountNumber": "MERCHANT-PICK-N-PAY", 
                "transactionCategory": "purchase",
                "merchantName": "Pick n Pay",
                
                "account": {
                    "id": "groceries-account-uuid",
                    "accountNumber": "1335066315",
                    "accountType": "Groceries",
                    "balance": 25.10
                }
            }
        ],
        "summary": {
            "totalSpending": 125.50,
            "transactionCount": 1,
            "accountBalances": {
                "Main": 2117.87,
                "Groceries": 75.60,
                "Healthcare": 477.98,
                "Education": 327.38,
                "Clothing": 75.60,
                "Baby Care": 75.60,
                "Entertainment": 75.60,
                "Pregnancy": 146.21
            }
        },
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalTransactions": 1,
            "hasNextPage": false,
            "hasPrevPage": false,
            "limit": 20
        }
    }
}
```

---

## 7. Get Dependent Details by ID

### Endpoint
```
GET /api/caregiver/dependents/:dependentId
```

### Description
Get detailed information about a specific dependent including all accounts and recent activity.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dependentId` | number | Yes | ID of the specific dependent |

### Frontend Request Example
```javascript
const fetchDependentDetails = async (dependentId) => {
    const response = await fetch(`/api/caregiver/dependents/${dependentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    return await response.json();
};
```

### Response Structure
```json
{
    "success": true,
    "message": "Dependent details retrieved successfully",
    "data": {
        "dependent": {
            "id": 13,
            "firstName": "Emma",
            "middleName": null,
            "surname": "Johnson",
            "fullName": "Emma Johnson",
            "email": "dependent@demo.com",
            "idNumber": "0101015800088",
            "phoneNumber": "+27123456789",
            "relation": "daughter",
            "status": "active",
            "isBlocked": false,
            "createdAt": "2024-10-25T10:30:00.000Z",
            "updatedAt": "2024-10-29T14:22:00.000Z"
        },
        "accounts": [
            {
                "id": "account-uuid-1",
                "accountNumber": "6472659461",
                "accountType": "Main",
                "balance": 2117.87,
                "currency": "ZAR",
                "status": "active",
                "allocatedAmount": 3000.00,
                "isActive": true,
                "createdAt": "2024-10-25T10:30:00.000Z"
            },
            {
                "id": "account-uuid-2",
                "accountNumber": "1335066315",
                "accountType": "Groceries",
                "balance": 75.60,
                "currency": "ZAR",
                "status": "active",
                "allocatedAmount": 500.00,
                "isActive": true,
                "parentAccountId": "account-uuid-1",
                "createdAt": "2024-10-29T14:22:00.000Z"
            }
        ],
        "summary": {
            "totalBalance": 3371.83,
            "totalAccounts": 8,
            "activeAccounts": 8,
            "recentTransactionCount": 5,
            "lastTransactionDate": "2024-10-29T12:15:00.000Z"
        }
    }
}
```

---

## 🆕 Enhanced Transaction Fields

All transaction responses now include enhanced fields for better statement clarity and professional financial tracking:

### New Transaction Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `senderName` | string | Name of person/entity sending money | "Sarah Williams" |
| `senderAccountNumber` | string | Account number money is coming from | "1234567890" |
| `recipientName` | string | Name of person/entity receiving money | "Emma Johnson" |
| `recipientAccountNumber` | string | Account number money is going to | "6472659461" |
| `transactionCategory` | enum | Purpose/category of transaction | "allowance", "purchase", "smart_distribution" |
| `merchantName` | string | Store/business name (for purchases) | "Pick n Pay" |

### Transaction Categories

| Category | Description | Use Case |
|----------|-------------|----------|
| `fund_transfer` | Money transfers between accounts | Caregiver → Dependent transfers |
| `purchase` | Purchases at merchants/stores | Shopping transactions |
| `allowance` | Regular allowance payments | Weekly/monthly allowances |
| `emergency_fund` | Emergency fund allocations | Emergency savings |
| `smart_distribution` | Automatic category distributions | Main → Category account splits |
| `manual_transfer` | Manual administrative transfers | Corrections, adjustments |
| `refund` | Refunds and reversals | Return transactions |
| `fee` | System or account fees | Service charges |
| `deposit` | Direct deposits | External money coming in |
| `withdrawal` | Cash withdrawals | ATM or cash transactions |

### Enhanced Statement Display Examples

#### Before (Old Format):
```
Description: Transfer from funder
Amount: +R500.00
```

#### After (Enhanced Format):
```
From: Sarah Williams (Account: 1234567890)
To: Emma Johnson (Account: 6472659461)
Description: Weekly allowance from Sarah Williams
Amount: +R500.00
Category: Allowance
Reference: TRF-20241029-ABC123-IN
```

---

## Error Response Structure

All endpoints return errors in this format:

```json
{
    "success": false,
    "message": "Error description",
    "error": "Detailed error information (in development mode)",
    "code": "ERROR_CODE" // Optional
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Frontend Integration Examples

### Enhanced Transaction Display Component
```javascript
// Enhanced Transaction Item Component
const EnhancedTransactionItem = ({ transaction }) => {
    const getTransactionFlow = () => {
        if (transaction.type === 'Credit') {
            return {
                icon: '↓',
                color: 'text-green-600',
                direction: 'Received from',
                counterparty: transaction.senderName || 'Unknown Sender',
                accountNumber: transaction.senderAccountNumber
            };
        } else {
            return {
                icon: '↑', 
                color: 'text-red-600',
                direction: 'Sent to',
                counterparty: transaction.recipientName || 'Unknown Recipient',
                accountNumber: transaction.recipientAccountNumber
            };
        }
    };

    const { icon, color, direction, counterparty, accountNumber } = getTransactionFlow();
    const amount = Math.abs(transaction.amount);
    const isCredit = transaction.type === 'Credit';

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-3">
            {/* Transaction Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <span className={`text-xl ${color}`}>{icon}</span>
                    <div>
                        <p className="font-semibold text-gray-900">
                            {direction}: {counterparty}
                        </p>
                        {transaction.merchantName && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                @ {transaction.merchantName}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`text-lg font-bold ${color}`}>
                    {isCredit ? '+' : '-'}R{amount.toFixed(2)}
                </div>
            </div>

            {/* Transaction Details */}
            <div className="text-sm text-gray-600 space-y-1">
                <p>{transaction.description}</p>
                
                {/* Account Flow */}
                {accountNumber && (
                    <p className="font-mono text-xs">
                        Account: {accountNumber}
                    </p>
                )}
                
                {/* Category & Reference */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {transaction.transactionCategory && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                {transaction.transactionCategory.replace('_', ' ').toUpperCase()}
                            </span>
                        )}
                        <span className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                        {transaction.reference}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Usage in Transaction List
const TransactionsList = ({ transactions }) => {
    const groupedByCategory = transactions.reduce((groups, txn) => {
        const category = txn.transactionCategory || 'Other';
        if (!groups[category]) groups[category] = [];
        groups[category].push(txn);
        return groups;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(groupedByCategory).map(([category, categoryTxns]) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                        <span className="ml-2 text-sm text-gray-500">
                            ({categoryTxns.length} transactions)
                        </span>
                    </h3>
                    {categoryTxns.map(transaction => (
                        <EnhancedTransactionItem 
                            key={transaction.id} 
                            transaction={transaction} 
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};
```

### React Hook for Caregiver Data
```javascript
import { useState, useEffect } from 'react';

const useCaregiverData = () => {
    const [dependents, setDependents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDependents = async (params = {}) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/caregiver/dependents?${new URLSearchParams(params)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setDependents(data.data.dependents);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch dependents');
        } finally {
            setLoading(false);
        }
    };

    // Enhanced transaction fetching with filtering
    const fetchTransactions = async (params = {}) => {
        try {
            const queryString = new URLSearchParams({
                page: params.page || 1,
                limit: params.limit || 20,
                ...(params.category && { transactionCategory: params.category }),
                ...(params.dependentId && { dependentId: params.dependentId }),
                ...(params.startDate && { startDate: params.startDate }),
                ...(params.endDate && { endDate: params.endDate })
            }).toString();

            const response = await fetch(`/api/caregiver/transactions?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return await response.json();
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            return { success: false, message: 'Failed to fetch transactions' };
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/caregiver/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    useEffect(() => {
        fetchDependents();
        fetchStats();
    }, []);

    return { 
        dependents, 
        stats, 
        loading, 
        error, 
        fetchDependents, 
        fetchStats, 
        fetchTransactions 
    };
};

export default useCaregiverData;
```

### Authentication Status Checking
```javascript
const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    return true;
};

// Use before making API calls
if (checkAuth()) {
    // Proceed with API call
}
```

---

## Test Credentials

### Caregiver Account
- **Email**: `caregiver@demo.com`
- **Password**: `Demo123!@#`
- **Role**: `caregiver`
- **Has access to**: 8 dependents with complete account structures

---

## 🎯 Summary of Enhancements

### What's New in v2.0

✅ **Enhanced Transaction Clarity**
- All transactions now include sender and recipient names
- Complete account number traceability for money flow
- Professional merchant identification for purchases

✅ **Transaction Categorization**
- 10+ transaction categories for better organization
- Category-based filtering and analysis
- Purpose-driven transaction grouping

✅ **Professional Statement Format**
- Bank-quality transaction descriptions
- Clear "From → To" transaction flow
- Complete audit trail for financial oversight

✅ **Frontend-Ready Components**
- React components for enhanced transaction display
- Category-based transaction grouping
- Professional transaction item styling

### Migration from v1.0

**Old Transaction Response:**
```javascript
{
  "description": "Transfer from funder",
  "amount": 500.00,
  "type": "Credit"
}
```

**New Enhanced Response:**
```javascript
{
  "description": "Weekly allowance from Sarah Williams",
  "amount": 500.00,
  "type": "Credit",
  "senderName": "Sarah Williams",
  "senderAccountNumber": "1234567890",
  "recipientName": "Emma Johnson", 
  "recipientAccountNumber": "6472659461",
  "transactionCategory": "allowance"
}
```

### Benefits for Users

**For Caregivers:**
- Clear visibility of money flow between accounts
- Professional transaction statements
- Better monitoring of dependent spending patterns
- Merchant tracking for purchase oversight

**For Dependents:**
- Bank-style transaction statements
- Clear identification of money sources
- Professional financial records
- Easy understanding of account activity

**For System Administrators:**
- Complete audit trail for all transactions
- Enhanced financial reporting capabilities
- Better compliance with financial regulations
- Professional financial management system

This documentation provides all the necessary information for frontend developers to integrate with the enhanced caregiver API endpoints effectively.