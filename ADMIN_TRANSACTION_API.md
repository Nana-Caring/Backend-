# Admin Transaction Management API

Complete API documentation for admin transaction management endpoints.

## Authentication Required
All endpoints require:
- Valid JWT token in Authorization header: `Bearer <token>`
- User must have admin role

## Base URL
```
http://localhost:3000/api/admin
```

---

## 📊 Get All Transactions (Advanced)

### `GET /transactions`

Retrieve all transactions with advanced filtering, pagination, and sorting.

#### Query Parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Number of transactions per page |
| `type` | string | - | Filter by transaction type: `Credit` or `Debit` |
| `accountId` | string | - | Filter by specific account UUID |
| `userId` | string | - | Filter by user UUID (through account) |
| `startDate` | string | - | Start date filter (ISO format) |
| `endDate` | string | - | End date filter (ISO format) |
| `minAmount` | number | - | Minimum transaction amount |
| `maxAmount` | number | - | Maximum transaction amount |
| `search` | string | - | Search in description or reference |
| `sortBy` | string | createdAt | Sort field: `createdAt`, `amount`, `type` |
| `sortOrder` | string | DESC | Sort order: `ASC` or `DESC` |

#### Example Request:
```bash
GET /api/admin/transactions?page=1&limit=10&type=Credit&startDate=2025-01-01&search=transfer
```

#### Example Response:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "accountId": "550e8400-e29b-41d4-a716-446655440001",
        "amount": 50.00,
        "type": "Credit",
        "description": "Money transfer from funder",
        "reference": "transfer-1704067200000",
        "metadata": {
          "source": "money_transfer",
          "funderId": "550e8400-e29b-41d4-a716-446655440002"
        },
        "timestamp": "2025-01-01T12:00:00.000Z",
        "createdAt": "2025-01-01T12:00:00.000Z",
        "updatedAt": "2025-01-01T12:00:00.000Z",
        "account": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "accountName": "John Doe Savings",
          "accountNumber": "ACC001234567890",
          "balance": 150.00,
          "user": {
            "id": "550e8400-e29b-41d4-a716-446655440003",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "role": "dependent"
          }
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
}
```

---

## 🔍 Get Transaction by ID

### `GET /transactions/:id`

Retrieve a specific transaction with full details.

#### Path Parameters:
- `id` (string, required): Transaction UUID

#### Example Request:
```bash
GET /api/admin/transactions/550e8400-e29b-41d4-a716-446655440000
```

#### Example Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "accountId": "550e8400-e29b-41d4-a716-446655440001",
    "amount": 50.00,
    "type": "Credit",
    "description": "Money transfer from funder",
    "reference": "transfer-1704067200000",
    "metadata": {
      "source": "money_transfer",
      "funderId": "550e8400-e29b-41d4-a716-446655440002",
      "paymentCardId": "550e8400-e29b-41d4-a716-446655440004"
    },
    "timestamp": "2025-01-01T12:00:00.000Z",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z",
    "account": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "accountName": "John Doe Savings",
      "accountNumber": "ACC001234567890",
      "balance": 150.00,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "dependent",
        "idNumber": "ID123456789"
      }
    }
  }
}
```

---

## ➕ Create Manual Transaction

### `POST /transactions`

Create a manual transaction (admin only).

#### Request Body:
```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 25.50,
  "type": "Credit",
  "description": "Manual credit adjustment",
  "reference": "admin-adjustment-001",
  "metadata": {
    "reason": "Account balance correction",
    "category": "adjustment"
  }
}
```

#### Required Fields:
- `accountId` (string): Target account UUID
- `amount` (number): Transaction amount (positive number)
- `type` (string): `Credit` or `Debit`

#### Optional Fields:
- `description` (string): Transaction description
- `reference` (string): Unique reference (auto-generated if not provided)
- `metadata` (object): Additional transaction data

#### Example Response:
```json
{
  "success": true,
  "message": "Manual transaction created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "accountId": "550e8400-e29b-41d4-a716-446655440001",
    "amount": 25.50,
    "type": "Credit",
    "description": "Manual credit adjustment",
    "reference": "admin-adjustment-001",
    "metadata": {
      "reason": "Account balance correction",
      "category": "adjustment",
      "source": "admin_manual",
      "adminId": "550e8400-e29b-41d4-a716-446655440006",
      "adminEmail": "admin@example.com",
      "createdAt": "2025-01-01T12:00:00.000Z"
    },
    "account": {
      "accountName": "John Doe Savings",
      "balance": 175.50
    }
  }
}
```

---

## ✏️ Update Transaction

### `PUT /transactions/:id`

Update transaction details (limited fields for safety).

#### Path Parameters:
- `id` (string, required): Transaction UUID

#### Request Body:
```json
{
  "description": "Updated description",
  "metadata": {
    "updated_reason": "Correction needed",
    "category": "correction"
  }
}
```

#### Updatable Fields:
- `description` (string): Transaction description
- `metadata` (object): Additional metadata (merged with existing)

#### Example Response:
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Updated description",
    "metadata": {
      "source": "money_transfer",
      "updated_reason": "Correction needed",
      "category": "correction",
      "lastModified": "2025-01-01T13:00:00.000Z",
      "modifiedBy": "550e8400-e29b-41d4-a716-446655440006"
    }
  }
}
```

---

## 🔄 Reverse Transaction

### `POST /transactions/:id/reverse`

Create a reversal transaction (opposite of original).

#### Path Parameters:
- `id` (string, required): Original transaction UUID

#### Request Body:
```json
{
  "reason": "Customer dispute - refund requested"
}
```

#### Example Response:
```json
{
  "success": true,
  "message": "Transaction reversed successfully",
  "data": {
    "originalTransaction": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 50.00,
      "type": "Credit",
      "metadata": {
        "isReversed": true,
        "reversalTransactionId": "550e8400-e29b-41d4-a716-446655440007",
        "reversedBy": "550e8400-e29b-41d4-a716-446655440006",
        "reversedAt": "2025-01-01T14:00:00.000Z",
        "reversalReason": "Customer dispute - refund requested"
      }
    },
    "reversalTransaction": {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "amount": 50.00,
      "type": "Debit",
      "description": "Reversal of transaction: Money transfer from funder",
      "reference": "reversal-550e8400-e29b-41d4-a716-446655440000",
      "metadata": {
        "isReversal": true,
        "originalTransactionId": "550e8400-e29b-41d4-a716-446655440000",
        "reason": "Customer dispute - refund requested",
        "reversedBy": "550e8400-e29b-41d4-a716-446655440006"
      }
    }
  }
}
```

---

## 🗑️ Delete Transaction

### `DELETE /transactions/:id`

Permanently delete a transaction (use with extreme caution).

#### Path Parameters:
- `id` (string, required): Transaction UUID

#### Request Body:
```json
{
  "confirmDelete": true,
  "adjustBalance": true
}
```

#### Required Fields:
- `confirmDelete` (boolean): Must be `true` to proceed
- `adjustBalance` (boolean): Whether to adjust account balance

#### Example Response:
```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": {
    "deletedTransaction": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "accountId": "550e8400-e29b-41d4-a716-446655440001",
      "amount": 50.00,
      "type": "Credit",
      "description": "Money transfer from funder",
      "reference": "transfer-1704067200000"
    },
    "balanceAdjusted": true
  }
}
```

---

## 📈 Transaction Statistics

### `GET /transactions/stats`

Get comprehensive transaction statistics.

#### Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | string | Start date for stats (ISO format) |
| `endDate` | string | End date for stats (ISO format) |
| `accountId` | string | Filter by specific account |
| `userId` | string | Filter by specific user |

#### Example Request:
```bash
GET /api/admin/transactions/stats?startDate=2025-01-01&endDate=2025-01-31
```

#### Example Response:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTransactions": 150,
      "creditTransactions": 90,
      "debitTransactions": 60,
      "totalCreditAmount": 4500.00,
      "totalDebitAmount": 2800.00,
      "netAmount": 1700.00,
      "averageTransactionAmount": "30.00"
    },
    "dailyStats": [
      {
        "date": "2025-01-01",
        "count": "12",
        "totalAmount": "350.00"
      },
      {
        "date": "2025-01-02",
        "count": "8",
        "totalAmount": "240.00"
      }
    ],
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    }
  }
}
```

---

## 🔢 Bulk Operations

### `POST /transactions/bulk`

Perform bulk operations on multiple transactions.

#### Request Body:
```json
{
  "operation": "delete",
  "transactionIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "data": {
    "confirmDelete": true
  }
}
```

#### Supported Operations:

##### Delete Multiple Transactions
```json
{
  "operation": "delete",
  "transactionIds": ["id1", "id2", "id3"],
  "data": {
    "confirmDelete": true
  }
}
```

##### Update Multiple Descriptions
```json
{
  "operation": "updateDescription",
  "transactionIds": ["id1", "id2", "id3"],
  "data": {
    "description": "Bulk updated description"
  }
}
```

#### Example Response:
```json
{
  "success": true,
  "message": "Bulk delete completed successfully",
  "data": {
    "deletedCount": 3
  }
}
```

---

## 📋 Legacy Simple Endpoints

For backward compatibility, simple endpoints are available:

### `GET /transactions/simple`
Simple list of all transactions without filtering.

### `DELETE /transactions/:id/simple`
Simple transaction deletion without confirmation.

---

## 🛡️ Error Responses

All endpoints may return these error formats:

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Account ID, amount, and type are required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch transactions",
  "error": "Database connection error"
}
```

---

## 🔧 Testing with Postman

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Admin Transaction Management",
    "description": "Complete admin transaction endpoints"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{adminToken}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Get All Transactions",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/admin/transactions?page=1&limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["api", "admin", "transactions"],
          "query": [
            {"key": "page", "value": "1"},
            {"key": "limit", "value": "10"}
          ]
        }
      }
    },
    {
      "name": "Create Manual Transaction",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"accountId\": \"{{accountId}}\",\n  \"amount\": 25.50,\n  \"type\": \"Credit\",\n  \"description\": \"Manual admin credit\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/admin/transactions",
          "host": ["{{baseUrl}}"],
          "path": ["api", "admin", "transactions"]
        }
      }
    },
    {
      "name": "Get Transaction Stats",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/admin/transactions/stats",
          "host": ["{{baseUrl}}"],
          "path": ["api", "admin", "transactions", "stats"]
        }
      }
    }
  ]
}
```

---

## ⚠️ Important Notes

1. **Security**: All endpoints require admin authentication
2. **Data Integrity**: Delete and reverse operations are permanent
3. **Balance Updates**: Manual transactions automatically update account balances
4. **Audit Trail**: All admin actions are logged in transaction metadata
5. **Performance**: Use pagination for large datasets
6. **Backup**: Always backup data before bulk operations

## 🚀 Quick Start

1. **Authenticate as admin**:
   ```bash
   POST /api/auth/login
   {
     "email": "admin@example.com",
     "password": "admin_password"
   }
   ```

2. **Get transactions**:
   ```bash
   GET /api/admin/transactions?limit=5
   ```

3. **Create manual transaction**:
   ```bash
   POST /api/admin/transactions
   {
     "accountId": "account-uuid",
     "amount": 50.00,
     "type": "Credit",
     "description": "Admin adjustment"
   }
   ```

4. **View statistics**:
   ```bash
   GET /api/admin/transactions/stats
   ```
