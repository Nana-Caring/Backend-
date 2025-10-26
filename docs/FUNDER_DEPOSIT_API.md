# Funder Deposit System API Documentation

## Overview
The Funder Deposit System allows funders to deposit money into their accounts using Stripe payments and then transfer funds to their beneficiaries.

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

## Base URLs
- **Production**: `https://nanacaring-backend.onrender.com/api`
- **Local**: `http://localhost:3000/api`

---

## Endpoints

### 1. Create Deposit Intent

Creates a Stripe Payment Intent for depositing funds into funder account.

**Endpoint**: `POST /funder/deposit/create-intent`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "amount": 5000,           // Amount in cents (5000 = R50.00)
  "currency": "zar"         // Optional, defaults to "zar"
}
```

**Success Response** (200):
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

**Error Responses**:
- **400 Bad Request**:
  ```json
  {
    "success": false,
    "message": "Minimum deposit amount is R10.00"
  }
  ```
- **404 Not Found**:
  ```json
  {
    "success": false,
    "message": "Funder account not found"
  }
  ```

---

### 2. Confirm Deposit

Confirms a successful Stripe payment and updates the funder's account balance.

**Endpoint**: `POST /funder/deposit/confirm`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

**Success Response** (200):
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

**Error Responses**:
- **400 Bad Request**:
  ```json
  {
    "success": false,
    "message": "Payment not completed"
  }
  ```
- **403 Forbidden**:
  ```json
  {
    "success": false,
    "message": "Payment does not belong to this user"
  }
  ```

---

### 3. Get Account Information

Retrieves funder's account balance and recent transaction history.

**Endpoint**: `GET /funder/deposit/account`

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
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

## Usage Flow

### 1. Frontend Integration
```javascript
// Step 1: Create payment intent
const response = await fetch('/api/funder/deposit/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 5000 // R50.00 in cents
  })
});

const { clientSecret, paymentIntentId } = await response.json();

// Step 2: Use Stripe.js to handle payment
const stripe = Stripe('pk_test_...');
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'John Smith'
    }
  }
});

// Step 3: Confirm deposit on backend
if (result.paymentIntent.status === 'succeeded') {
  await fetch('/api/funder/deposit/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      paymentIntentId: paymentIntentId
    })
  });
}
```

### 2. Mobile Integration (React Native)
```javascript
import { useStripe } from '@stripe/stripe-react-native';

const { confirmPayment } = useStripe();

// After creating payment intent
const { error } = await confirmPayment(clientSecret, {
  paymentMethodType: 'Card',
  billingDetails: {
    name: 'John Smith'
  }
});

if (!error) {
  // Confirm deposit on backend
  // ... same as above
}
```

---

## Error Handling

All endpoints return consistent error structures:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details (in development)"
}
```

### Common HTTP Status Codes:
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (user role restrictions)
- **404**: Not Found (resource not found)
- **500**: Internal Server Error

---

## Security Notes

1. **Token Validation**: All endpoints validate JWT tokens
2. **Role Authorization**: Only users with `funder` role can access these endpoints
3. **Payment Verification**: Payment intents are verified against user ID
4. **Stripe Security**: All payment processing handled by Stripe's secure infrastructure

---

## Rate Limits

- **Deposit Intent Creation**: 10 requests per minute per user
- **Deposit Confirmation**: 5 requests per minute per user
- **Account Information**: 60 requests per minute per user

---

## Testing

Use the provided test scripts:
- `scripts/test-funder-deposit-complete.js` - Comprehensive testing
- `scripts/test-funder-endpoints.js` - Quick endpoint testing

Example test command:
```bash
node scripts/test-funder-deposit-complete.js
```
