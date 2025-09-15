# Caregiver Transaction Tracking API Documentation

## Overview
These endpoints allow caregivers to comprehensively track all financial transactions of their dependents across all account types (Main, Education, Healthcare, Clothing, Entertainment, Baby Care, Pregnancy, Savings).

## Authentication
All endpoints require:
- Bearer token authentication
- User must have `caregiver` role
- Only shows dependents assigned to the authenticated caregiver

## Base URL
```
/api/caregiver
```

---

## 1. Get All Dependent Transactions

**Endpoint:** `GET /api/caregiver/transactions`

**Description:** Get all transactions across all dependents and all their accounts assigned to this caregiver.

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 20 | Number of transactions per page |
| `dependentId` | integer | - | Filter by specific dependent ID |
| `accountType` | string | "all" | Filter by account type: `Main`, `Education`, `Healthcare`, `Clothing`, `Entertainment`, `Baby Care`, `Pregnancy`, `Savings`, or `all` |
| `transactionType` | string | "all" | Filter by transaction type: `Credit`, `Debit`, or `all` |
| `startDate` | string | - | Start date filter (ISO 8601 format: YYYY-MM-DD) |
| `endDate` | string | - | End date filter (ISO 8601 format: YYYY-MM-DD) |
| `minAmount` | number | - | Minimum transaction amount |
| `maxAmount` | number | - | Maximum transaction amount |
| `sortBy` | string | "timestamp" | Sort field: `timestamp`, `amount`, `type` |
| `sortOrder` | string | "DESC" | Sort order: `ASC` or `DESC` |

### Example Request
```bash
GET /api/caregiver/transactions?page=1&limit=10&accountType=Main&transactionType=Credit&startDate=2025-01-01&endDate=2025-03-15
```

### Response
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "amount": 500.00,
        "type": "Credit",
        "description": "Allowance deposit",
        "reference": "REF123456",
        "timestamp": "2025-03-15T10:30:00Z",
        "metadata": {},
        "dependent": {
          "id": 15,
          "firstName": "Ayanda",
          "middleName": null,
          "surname": "Dlamini",
          "fullName": "Ayanda Dlamini",
          "email": "ayanda.sipho@example.com"
        },
        "account": {
          "id": "account-uuid",
          "accountNumber": "8740722672",
          "accountType": "Main",
          "balance": 1500.00
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 2. Get Specific Dependent Transactions

**Endpoint:** `GET /api/caregiver/dependents/:dependentId/transactions`

**Description:** Get all transactions for a specific dependent across all their accounts.

### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `dependentId` | integer | ID of the dependent |

### Query Parameters
Same as endpoint #1 (except `dependentId` which is in the URL)

### Example Request
```bash
GET /api/caregiver/dependents/15/transactions?accountType=Education&transactionType=Debit&page=1&limit=5
```

### Response
```json
{
  "success": true,
  "message": "Dependent transactions retrieved successfully",
  "data": {
    "dependent": {
      "id": 15,
      "firstName": "Ayanda",
      "middleName": null,
      "surname": "Dlamini",
      "fullName": "Ayanda Dlamini",
      "email": "ayanda.sipho@example.com"
    },
    "accountSummaries": [
      {
        "id": "account-uuid",
        "accountNumber": "8740722672",
        "accountType": "Main",
        "balance": 1500.00,
        "transactionCount": 25,
        "totalCredits": 2500.00,
        "totalDebits": 1000.00,
        "netAmount": 1500.00
      },
      {
        "id": "account-uuid-2",
        "accountNumber": "8740722673",
        "accountType": "Education",
        "balance": 800.00,
        "transactionCount": 12,
        "totalCredits": 1000.00,
        "totalDebits": 200.00,
        "netAmount": 800.00
      }
    ],
    "transactions": [
      {
        "id": "uuid",
        "amount": 50.00,
        "type": "Debit",
        "description": "School supplies purchase",
        "reference": "EDU789",
        "timestamp": "2025-03-14T14:20:00Z",
        "metadata": {"category": "supplies"},
        "account": {
          "id": "account-uuid-2",
          "accountNumber": "8740722673",
          "accountType": "Education",
          "balance": 800.00
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 12,
      "itemsPerPage": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 3. Get Transaction Analytics

**Endpoint:** `GET /api/caregiver/transactions/analytics`

**Description:** Get transaction analytics and insights for all or specific dependents.

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | integer | 30 | Number of days to analyze |
| `dependentId` | integer | - | Analyze specific dependent only |
| `groupBy` | string | "day" | Group analytics by: `day`, `week`, `month` |

### Example Request
```bash
GET /api/caregiver/transactions/analytics?period=30&dependentId=15
```

### Response
```json
{
  "success": true,
  "message": "Transaction analytics retrieved successfully",
  "data": {
    "period": "30 days",
    "overallTotals": {
      "totalCredits": 5000.00,
      "totalDebits": 2000.00,
      "creditCount": 15,
      "debitCount": 32,
      "netAmount": 3000.00,
      "totalTransactions": 47
    },
    "dailyBreakdown": [
      {
        "date": "2025-03-01",
        "totalCredits": 500.00,
        "totalDebits": 150.00,
        "creditCount": 2,
        "debitCount": 3,
        "netAmount": 350.00
      },
      {
        "date": "2025-03-02",
        "totalCredits": 0.00,
        "totalDebits": 75.00,
        "creditCount": 0,
        "debitCount": 2,
        "netAmount": -75.00
      }
    ],
    "summary": {
      "averageDailyCredits": 166.67,
      "averageDailyDebits": 66.67,
      "averageTransactionSize": 148.94
    }
  }
}
```

---

## Account Types Explained

| Account Type | Purpose | Description |
|--------------|---------|-------------|
| `Main` | Primary account | Main spending account, mirrors savings balance |
| `Education` | School expenses | Tuition, books, supplies, educational activities |
| `Healthcare` | Medical expenses | Doctor visits, medications, health insurance |
| `Clothing` | Apparel | Clothes, shoes, accessories |
| `Entertainment` | Fun activities | Movies, games, recreational activities |
| `Baby Care` | Infant needs | Diapers, formula, baby supplies |
| `Pregnancy` | Prenatal care | Pregnancy-related expenses |
| `Savings` | Long-term savings | Money saved for future use |

---

## Transaction Types

| Type | Description |
|------|-------------|
| `Credit` | Money IN - deposits, allowances, transfers received |
| `Debit` | Money OUT - purchases, withdrawals, transfers sent |

---

## Error Responses

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Caregiver role required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Dependent not found or not assigned to you"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve transactions",
  "error": "Detailed error message"
}
```

---

## Usage Examples

### Track all spending across all dependents
```bash
GET /api/caregiver/transactions?transactionType=Debit&limit=50
```

### Monitor educational expenses for specific dependent
```bash
GET /api/caregiver/dependents/15/transactions?accountType=Education
```

### Analyze spending patterns over last 90 days
```bash
GET /api/caregiver/transactions/analytics?period=90
```

### Find large transactions over R1000
```bash
GET /api/caregiver/transactions?minAmount=1000&sortBy=amount&sortOrder=DESC
```

### Track money received in the last week
```bash
GET /api/caregiver/transactions?transactionType=Credit&startDate=2025-03-08&endDate=2025-03-15
```

---

## Integration Notes

1. **Real-time Updates**: These endpoints reflect the current state of transactions
2. **Security**: Only shows dependents assigned to the authenticated caregiver
3. **Performance**: Pagination is recommended for large datasets
4. **Filtering**: Multiple filters can be combined for precise queries
5. **Analytics**: Use analytics endpoint for dashboard visualizations

This comprehensive tracking system allows caregivers to have complete oversight of their dependents' financial activities across all account types and transaction types.
