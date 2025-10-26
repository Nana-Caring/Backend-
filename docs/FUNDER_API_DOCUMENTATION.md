# Funder Deposit & Transfer System API Documentation

## Overview
The Funder Deposit & Transfer System allows funders to deposit funds into their accounts using Stripe and transfer money to their beneficiaries' accounts.

## Base URL
```
https://nanacaring-backend.onrender.com/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## 🏦 Funder Deposit Endpoints

### 1. Create Deposit Intent
Creates a Stripe payment intent for depositing funds into funder's account.

**Endpoint:** `POST /api/funder/deposit/create-intent`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "amount": 5000,      // Amount in cents (5000 = R50.00)
  "currency": "zar"    // Optional, defaults to "zar"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdef",
    "paymentIntentId": "pi_1234567890",
    "amount": 5000,
    "currency": "zar",
    "accountId": "account-uuid-here"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Minimum deposit amount is R10.00"
}
```

---

### 2. Confirm Deposit
Confirms a successful Stripe payment and updates the funder's account balance.

**Endpoint:** `POST /api/funder/deposit/confirm`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Deposit confirmed successfully",
  "data": {
    "amount": 50.00,
    "newBalance": 150.00,
    "currency": "ZAR",
    "paymentIntentId": "pi_1234567890"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Payment not completed"
}
```

---

### 3. Get Funder Account
Retrieves funder's account balance and recent transaction history.

**Endpoint:** `GET /api/funder/deposit/account`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "accountId": "account-uuid-here",
    "accountNumber": "1234567890",
    "accountType": "Main",
    "balance": "ZAR 150.00",
    "rawBalance": 150.00,
    "transactions": [
      {
        "id": "transaction-uuid",
        "type": "Credit",
        "amount": 50.00,
        "description": "Stripe deposit - pi_1234567890",
        "createdAt": "2025-10-26T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 🔄 Funder Transfer Endpoints

### 4. Transfer to Beneficiary
Transfers funds from funder's account to a beneficiary's account.

**Endpoint:** `POST /api/funder/transfer`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "beneficiaryId": 13,
  "targetAccountId": "beneficiary-account-uuid",
  "amount": 25.00,
  "description": "Education expenses"  // Optional
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "transferReference": "TRF-1698765432-abc123def",
    "amount": 25.00,
    "currency": "ZAR",
    "funder": {
      "accountId": "funder-account-uuid",
      "newBalance": 125.00
    },
    "beneficiary": {
      "accountId": "beneficiary-account-uuid",
      "accountType": "Education",
      "newBalance": 25.00
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Insufficient funds. Available: ZAR 50.00, Requested: ZAR 75.00"
}
```

---

### 5. Get Transfer History
Retrieves funder's transfer history with pagination.

**Endpoint:** `GET /api/funder/transfer/history`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 50)

**Example:** `GET /api/funder/transfer/history?page=1&limit=10`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "id": "transaction-uuid",
        "type": "Credit",
        "amount": 50.00,
        "description": "Stripe deposit - pi_1234567890",
        "reference": "pi_1234567890",
        "createdAt": "2025-10-26T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalTransfers": 25,
      "hasMore": true
    }
  }
}
```

---

## 👥 Beneficiary Endpoints

### 6. Get Beneficiaries
Retrieves funder's linked beneficiaries and their accounts.

**Endpoint:** `GET /api/funder/get-beneficiaries`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Success - 200):**
```json
{
  "beneficiaries": [
    {
      "id": 13,
      "name": "Emma Johnson",
      "firstName": "Emma",
      "surname": "Johnson",
      "email": "dependent@demo.com",
      "phoneNumber": null,
      "Accounts": [
        {
          "id": "account-uuid-1",
          "accountType": "Main",
          "accountNumber": "6472659461",
          "balance": "ZAR 0.00"
        },
        {
          "id": "account-uuid-2", 
          "accountType": "Education",
          "accountNumber": "5429233870",
          "balance": "ZAR 25.00"
        }
      ]
    }
  ]
}
```

---

## 🧪 Testing Guide

### Prerequisites
1. Funder account created and logged in
2. Stripe account configured with test keys
3. At least one beneficiary linked to the funder

### Test Flow
1. **Login as Funder** → Get authentication token
2. **Check Account Balance** → Verify starting balance
3. **Create Deposit Intent** → Get Stripe client secret
4. **Process Payment** → Complete Stripe payment (frontend)
5. **Confirm Deposit** → Update account balance
6. **Get Beneficiaries** → Choose transfer target
7. **Transfer Funds** → Send money to beneficiary
8. **Check History** → Verify transaction records

---

## 💰 Currency & Amounts

- **Currency:** All amounts are in South African Rand (ZAR)
- **Stripe Amounts:** Use cents (R1.00 = 100 cents)
- **API Amounts:** Use decimal format (25.50 for R25.50)
- **Display Format:** "ZAR 25.50"

---

## 🔒 Security & Validation

### Deposit Validation
- Minimum deposit: R10.00 (1000 cents)
- Maximum deposit: R10,000.00 (1,000,000 cents)
- Currency must be "zar"

### Transfer Validation
- Must have sufficient funds
- Must be authorized to transfer to beneficiary
- Amount must be greater than R0.01
- Description limited to 500 characters

### Authentication
- All endpoints require valid JWT token
- Token must have 'funder' role
- Tokens expire after configured time period

---

## 📝 Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input data |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 500  | Internal Server Error - System error |

---

## 🔗 Integration Notes

### Frontend Integration
1. Use `clientSecret` from deposit intent for Stripe Elements
2. Call confirm endpoint after successful Stripe payment
3. Handle all error responses gracefully
4. Show loading states during API calls

### Webhook Integration
- Set up Stripe webhooks for payment confirmations
- Verify webhook signatures for security
- Handle failed payments and refunds
