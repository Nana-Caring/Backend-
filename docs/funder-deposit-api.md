# Funder Deposit & Transfer System API Documentation

## Overview
The Funder Deposit & Transfer System allows funders to deposit money into their accounts using Stripe and transfer funds to their linked beneficiaries.

## Base URL
```
Production: https://nanacaring-backend.onrender.com/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Deposit Intent
Creates a Stripe payment intent for depositing funds.

**Endpoint:** `POST /api/funder/deposit/create-intent`

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "amount": 10000,     // Amount in cents (10000 = R100.00)
  "currency": "zar"    // Optional, defaults to "zar"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_3SLZKLROeQRel9O50KZ6rfcr",
    "amount": 10000,
    "currency": "zar",
    "accountId": "account-uuid"
  }
}
```

**Error Responses:**
- `400`: Minimum deposit amount is R10.00
- `404`: Funder account not found
- `500`: Failed to create deposit intent

---

### 2. Confirm Deposit
Confirms a successful Stripe payment and updates account balance.

**Endpoint:** `POST /api/funder/deposit/confirm`

**Request Body:**
```json
{
  "paymentIntentId": "pi_3SLZKLROeQRel9O50KZ6rfcr"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Deposit confirmed successfully",
  "data": {
    "amount": 100.00,
    "newBalance": 100.00,
    "currency": "ZAR",
    "paymentIntentId": "pi_3SLZKLROeQRel9O50KZ6rfcr"
  }
}
```

**Error Responses:**
- `400`: Payment not completed
- `403`: Payment does not belong to this user
- `404`: Account not found
- `500`: Failed to confirm deposit

---

### 3. Get Account Information
Retrieves funder account balance and recent transactions.

**Endpoint:** `GET /api/funder/deposit/account`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accountId": "account-uuid",
    "accountNumber": "8489953194",
    "accountType": "Main",
    "balance": "ZAR 100.00",
    "rawBalance": 100.00,
    "transactions": [
      {
        "id": "transaction-uuid",
        "type": "Credit",
        "amount": 100.00,
        "description": "Stripe deposit - pi_xxx",
        "createdAt": "2025-10-26T10:30:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `404`: Funder account not found
- `500`: Failed to retrieve account information

---

### 4. Transfer to Beneficiary
Transfers funds from funder account to beneficiary account.

**Endpoint:** `POST /api/funder/transfer`

**Request Body:**
```json
{
  "beneficiaryId": 13,
  "targetAccountId": "beneficiary-account-uuid",
  "amount": 25.50,
  "description": "Education expenses"  // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "transferReference": "TRF-1698765432-abc123",
    "amount": 25.50,
    "currency": "ZAR",
    "funder": {
      "accountId": "funder-account-uuid",
      "newBalance": 74.50
    },
    "beneficiary": {
      "accountId": "beneficiary-account-uuid",
      "accountType": "Education",
      "newBalance": 25.50
    }
  }
}
```

**Error Responses:**
- `400`: Invalid transfer amount or insufficient funds
- `403`: Not authorized to transfer to this beneficiary
- `404`: Funder account or beneficiary account not found
- `500`: Failed to complete transfer

---

### 5. Get Transfer History
Retrieves transfer history for the funder.

**Endpoint:** `GET /api/funder/transfer/history`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "id": "transaction-uuid",
        "type": "Credit",
        "amount": 100.00,
        "description": "Stripe deposit - pi_xxx",
        "reference": "pi_3SLZKLROeQRel9O50KZ6rfcr",
        "createdAt": "2025-10-26T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalTransfers": 1,
      "hasMore": false
    }
  }
}
```

---

## Complete Workflow

### Frontend Integration Steps:

1. **Login**: User authenticates and receives JWT token
2. **Check Balance**: Get current account balance
3. **Create Intent**: Create Stripe payment intent
4. **Process Payment**: Use Stripe frontend to process payment
5. **Confirm Deposit**: Call confirm endpoint after successful payment
6. **Transfer Funds**: Transfer money to beneficiaries
7. **View History**: Check transaction history

### Example Frontend Code:

```javascript
// 1. Create deposit intent
const response = await fetch('/api/funder/deposit/create-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ amount: 10000 }) // R100.00
});

const { clientSecret, paymentIntentId } = await response.json();

// 2. Process with Stripe (using Stripe.js)
const stripe = Stripe('pk_...');
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'John Smith' }
  }
});

// 3. Confirm deposit on success
if (!error) {
  await fetch('/api/funder/deposit/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ paymentIntentId })
  });
}
```

## Testing

Run the test scripts:
```bash
# Test all endpoints
node scripts/test-complete-funder-flow.js

# Test individual endpoints
node scripts/test-funder-endpoints.js
```

## Security Features

- ✅ JWT authentication required
- ✅ Funder role validation
- ✅ Payment intent ownership verification
- ✅ Beneficiary relationship validation
- ✅ Transaction atomicity with database transactions
- ✅ Input validation and sanitization
- ✅ Stripe webhook verification (for production)

## Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

## Currency

- All amounts are in South African Rand (ZAR)
- Stripe amounts are in cents (100 cents = R1.00)
- Display format: "ZAR 100.00"
