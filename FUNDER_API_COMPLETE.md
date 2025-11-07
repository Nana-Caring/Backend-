# Funder Deposit & Transfer API Documentation

## Overview
The Funder API provides comprehensive deposit and transfer functionality for funders to manage their accounts and send funds to linked beneficiaries. The system integrates with Stripe for secure payments and supports multiple account types with ZAR currency.

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
https://nanacaring-backend.onrender.com/api
```

---

## Funder Deposit Endpoints

### 1. Create Stripe Payment Intent
**POST** `/funder/deposit/create-intent`

Creates a Stripe payment intent for depositing funds into the funder's account.

#### Request Body
```json
{
  "amount": 5000,        // Amount in cents (5000 = R50.00)
  "currency": "zar"      // Optional, defaults to "zar"
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_3SMS0HROeQRel9O50...",
    "paymentIntentId": "pi_3SMS0HROeQRel9O50dSr7B1K",
    "amount": 5000,
    "currency": "zar",
    "accountId": "uuid-account-id"
  }
}
```

#### Error Responses
- **400** - Invalid amount (minimum R10.00)
- **404** - Funder account not found
- **500** - Stripe API error

---

### 2. Confirm Deposit
**POST** `/funder/deposit/confirm`

Confirms a successful Stripe payment and updates the funder's account balance.

#### Request Body
```json
{
  "paymentIntentId": "pi_3SMS0HROeQRel9O50dSr7B1K"
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Deposit confirmed successfully",
  "data": {
    "amount": 50.00,
    "newBalance": 125.50,
    "currency": "ZAR",
    "paymentIntentId": "pi_3SMS0HROeQRel9O50dSr7B1K"
  }
}
```

#### Error Responses
- **400** - Payment not completed
- **403** - Payment does not belong to this user
- **404** - Account not found

---

### 3. Get Account Balance & Transactions
**GET** `/funder/deposit/account`

Retrieves the funder's account balance and recent transaction history.

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "accountId": "uuid-account-id",
    "accountNumber": "8489953194",
    "accountName": "Main",
    "accountType": "Main",
    "balance": "ZAR 125.50",
    "rawBalance": 125.50,
    "transactions": [
      {
        "id": "tx-uuid",
        "type": "Credit",
        "amount": 50.00,
        "description": "Stripe deposit - pi_3SMS0HROeQRel9O50dSr7B1K",
        "createdAt": "2025-10-26T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 4. Demo Add Balance (Testing Only)
**POST** `/funder/deposit/demo-add-balance`

Adds demo funds to funder account for testing purposes.

#### Request Body
```json
{
  "amount": 100.00,
  "description": "Demo funds for testing"  // Optional
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Demo balance added successfully",
  "data": {
    "amount": 100.00,
    "newBalance": 225.50,
    "currency": "ZAR"
  }
}
```

---

## Funder Transfer Endpoints

### 1. Transfer to Beneficiary
**POST** `/funder/transfer`

Transfers funds from funder's account to a beneficiary's specific account.

#### Request Body
```json
{
  "beneficiaryId": 13,                    // Beneficiary user ID
  "targetAccountId": "uuid-account-id",   // Target account ID
  "amount": 25.00,                        // Amount in ZAR
  "description": "Monthly allowance"      // Optional description
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "transferReference": "TRF-1729942800000-abc123def",
    "amount": 25.00,
    "currency": "ZAR",
    "funder": {
      "accountId": "funder-account-uuid",
      "newBalance": 200.50
    },
    "beneficiary": {
      "accountId": "beneficiary-account-uuid",
      "accountName": "Education",
      "accountType": "Education",
      "newBalance": 25.00
    }
  }
}
```

#### Error Responses
- **400** - Invalid amount or insufficient funds
- **403** - Not authorized to transfer to this beneficiary
- **404** - Funder or beneficiary account not found

---

### 2. Get Transfer History
**GET** `/funder/transfer/history`

Retrieves the funder's transfer history with pagination.

#### Query Parameters
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 50)

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "id": "tx-uuid",
        "type": "Debit",
        "amount": -25.00,
        "description": "Transfer to Education account - Monthly allowance",
        "status": "completed",
        "reference": "TRF-1729942800000-abc123def",
        "createdAt": "2025-10-26T10:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalTransfers": 15,
      "hasMore": true
    }
  }
}
```

---

## Complete Integration Guide

### Frontend Stripe Integration Example
```javascript
// 1. Create payment intent
const response = await fetch('/api/funder/deposit/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ amount: 10000 }) // R100.00
});

const { clientSecret } = await response.json();

// 2. Process payment with Stripe
const result = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: {
    return_url: 'https://your-app.com/success'
  }
});

// 3. Confirm deposit on backend
if (result.paymentIntent.status === 'succeeded') {
  await fetch('/api/funder/deposit/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      paymentIntentId: result.paymentIntent.id 
    })
  });
}
```

---

## Account Types & Purpose

| Account Type | Description | Use Cases |
|-------------|-------------|-----------|
| **Main** | General living expenses | Food, transport, daily needs |
| **Education** | Educational expenses | School fees, books, tutoring |
| **Healthcare** | Medical expenses | Doctor visits, medication, therapy |
| **Savings** | Long-term savings | Future investments, emergency fund |
| **Clothing** | Apparel needs | Clothes, shoes, accessories |
| **Entertainment** | Recreation | Movies, games, outings |
| **Baby Care** | Childcare | Diapers, formula, baby products |
| **Pregnancy** | Pregnancy support | Prenatal care, supplements |

---

## Production-Ready Features ✅

- **Stripe Payment Integration** - Secure PCI-compliant payments
- **Multi-Beneficiary Support** - Link and manage multiple dependents
- **Multi-Account Transfers** - Send to specific account types
- **Real-time Balance Updates** - Instant balance synchronization
- **Complete Transaction History** - Full audit trail
- **ZAR Currency Support** - South African Rand formatting
- **Role-Based Security** - Secure authentication and authorization
- **Relationship Validation** - Only authorized transfers allowed
- **Balance Protection** - Overdraft prevention
- **Demo Testing Mode** - Safe testing environment

The Funder Deposit & Transfer system is now **fully operational and production-ready**! 🎉
