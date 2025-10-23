# Secure Direct Deposit System

## 🔒 Security-First Approach

This system implements a secure direct deposit flow that **never stores sensitive payment information** in our database while still leveraging Stripe's robust payment infrastructure.

## 🏗️ Architecture Overview

### Key Security Principles

1. **No Storage of Payment Methods** - Credit cards, bank accounts, or payment tokens are never saved
2. **One-Time Payment Intents** - Each deposit creates a fresh payment intent with no future usage setup
3. **Stripe-Only Processing** - All sensitive payment data remains with Stripe (PCI compliant)
4. **Metadata Tracking** - Only transaction references and amounts are stored locally

### Payment Flow

```
Funder Request → Create Payment Intent → Frontend Payment → Confirm Deposit → Update Balances
     ↓                    ↓                     ↓              ↓              ↓
No Card Storage    Stripe Handles     Secure Processing   Verify Payment   Local Records
```

## 📝 API Endpoints

### 1. Create Direct Deposit Intent
```
POST /api/direct-deposits/create-deposit-intent
```

**Purpose**: Creates a one-time payment intent for depositing to a dependent's account

**Request Body**:
```json
{
  "dependentId": 123,
  "amount": 500.00,
  "description": "Monthly allowance",
  "currency": "zar"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 500.00,
    "currency": "ZAR",
    "recipient": {
      "id": 123,
      "name": "Emma Williams",
      "email": "emma@example.com"
    },
    "accountDetails": {
      "id": "account-uuid",
      "accountNumber": "ACC001234567",
      "currentBalance": 250.00
    }
  }
}
```

### 2. Confirm Direct Deposit
```
POST /api/direct-deposits/confirm-deposit
```

**Purpose**: Confirms successful payment and updates account balances

**Request Body**:
```json
{
  "paymentIntentId": "pi_xxx"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Deposit completed successfully",
  "data": {
    "transaction": {
      "id": 456,
      "amount": 500.00,
      "currency": "ZAR",
      "description": "Monthly allowance",
      "reference": "STRIPE_pi_xxx"
    },
    "account": {
      "id": "account-uuid",
      "accountNumber": "ACC001234567",
      "previousBalance": 250.00,
      "newBalance": 750.00,
      "recipient": {
        "name": "Emma Williams",
        "email": "emma@example.com"
      }
    },
    "paymentDetails": {
      "paymentIntentId": "pi_xxx",
      "stripeStatus": "succeeded"
    }
  }
}
```

### 3. Get Deposit History
```
GET /api/direct-deposits/deposit-history?page=1&limit=10&dependentId=123
```

**Purpose**: View funder's deposit transaction history

**Response**:
```json
{
  "success": true,
  "data": {
    "deposits": [
      {
        "id": 456,
        "amount": 500.00,
        "currency": "ZAR",
        "description": "Monthly allowance",
        "reference": "STRIPE_pi_xxx",
        "balanceAfter": 750.00,
        "createdAt": "2024-10-23T10:30:00Z",
        "recipient": {
          "id": 123,
          "name": "Emma Williams",
          "email": "emma@example.com"
        },
        "account": {
          "id": "account-uuid",
          "accountNumber": "ACC001234567"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalDeposits": 50,
      "hasMore": true
    }
  }
}
```

### 4. Get Available Payment Methods
```
GET /api/direct-deposits/payment-methods
```

**Purpose**: Get supported payment methods for UI display (no storage)

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentMethods": {
      "cards": [
        { "type": "visa", "name": "Visa", "icon": "visa" },
        { "type": "mastercard", "name": "Mastercard", "icon": "mastercard" }
      ],
      "banks": [
        { "type": "eft", "name": "EFT Bank Transfer", "icon": "bank" }
      ],
      "digital": [
        { "type": "apple_pay", "name": "Apple Pay", "icon": "apple_pay" }
      ]
    },
    "currency": "ZAR",
    "minimumAmount": 10.00,
    "maximumAmount": 50000.00,
    "processingNote": "No payment information is stored on our servers."
  }
}
```

## 🔐 Security Features

### 1. No Payment Method Storage
```javascript
// Payment intent explicitly prevents future usage
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100),
  currency: 'zar',
  setup_future_usage: null, // ← Key: No storage!
  automatic_payment_methods: { enabled: true }
});
```

### 2. Metadata-Only Tracking
```javascript
// Only non-sensitive metadata stored locally
metadata: {
  funderId: funderId.toString(),
  dependentId: dependentId.toString(), 
  accountId: dependentAccount.id.toString(),
  description: description,
  type: 'direct_deposit'
}
```

### 3. Payment Verification
```javascript
// Verify payment success before updating balances
if (paymentIntent.status !== 'succeeded') {
  return res.status(400).json({
    success: false,
    message: 'Payment not completed successfully'
  });
}
```

### 4. Duplicate Prevention
```javascript
// Prevent double-processing of same payment
const existingTransaction = await Transaction.findOne({
  where: { 
    reference: `STRIPE_${paymentIntentId}`,
    status: 'completed'
  }
});
```

## 💰 Automatic Category Distribution

When funds are deposited to a main account, they are automatically distributed to category accounts:

### Distribution Logic
```javascript
const categoryAllocations = {
  'healthcare': 0.25,    // 25%
  'groceries': 0.30,     // 30%
  'education': 0.20,     // 20%
  'transport': 0.15,     // 15%
  'entertainment': 0.05, // 5%
  'other': 0.05          // 5%
};
```

### Example Distribution
```
Deposit: R500.00
├── Healthcare:    R125.00 (25%)
├── Groceries:     R150.00 (30%)
├── Education:     R100.00 (20%)
├── Transport:     R75.00  (15%)
├── Entertainment: R25.00  (5%)
└── Other:         R25.00  (5%)

Main Account Final Balance: R0.00
```

## 🔄 Frontend Integration

### 1. Create Payment Intent
```javascript
const response = await fetch('/api/direct-deposits/create-deposit-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dependentId: 123,
    amount: 500.00,
    description: 'Monthly allowance'
  })
});

const { clientSecret } = await response.json();
```

### 2. Process Payment with Stripe Elements
```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Create payment form with Stripe Elements
const elements = stripe.elements();
const cardElement = elements.create('card');

// Confirm payment
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Funder Name',
      email: 'funder@example.com'
    }
  }
});
```

### 3. Confirm Successful Payment
```javascript
if (result.paymentIntent.status === 'succeeded') {
  // Confirm with backend
  await fetch('/api/direct-deposits/confirm-deposit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentIntentId: result.paymentIntent.id
    })
  });
}
```

## 📊 Transaction Records

### Local Database Storage (Non-Sensitive Only)
```sql
-- Transaction table stores only references and amounts
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  account_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'credit' for deposits
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'deposit', 'allocation'
  status VARCHAR(20), -- 'completed'
  reference VARCHAR(255), -- 'STRIPE_pi_xxx'
  balance_after DECIMAL(10,2),
  metadata JSONB -- Non-sensitive data only
);
```

### Metadata Example
```json
{
  "stripePaymentIntentId": "pi_xxx",
  "funderId": 456,
  "paymentMethod": "stripe_direct_deposit",
  "currency": "ZAR"
}
```

## 🛡️ Security Benefits

### 1. PCI Compliance
- **No card data storage** - Automatic PCI compliance
- **Stripe handles security** - Bank-grade encryption and security
- **Reduced liability** - No sensitive data breach risk

### 2. Data Protection
- **Minimal data retention** - Only transaction references stored
- **No customer payment profiles** - Fresh payment each time
- **Audit trail** - Complete transaction history without sensitive data

### 3. Regulatory Compliance
- **GDPR compliant** - No unnecessary personal financial data storage
- **Banking regulations** - Stripe handles financial compliance
- **Data minimization** - Store only what's needed for business logic

## 🚀 Usage Flow Example

### Complete Deposit Process

1. **Funder initiates deposit**
   ```javascript
   POST /api/direct-deposits/create-deposit-intent
   { dependentId: 123, amount: 500.00 }
   ```

2. **System creates payment intent**
   - Verifies funder-dependent relationship
   - Creates one-time Stripe payment intent
   - Returns client secret for frontend

3. **Frontend processes payment**
   - Uses Stripe Elements for secure payment form
   - Customer enters payment details directly to Stripe
   - Payment is processed by Stripe infrastructure

4. **Backend confirms and records**
   ```javascript
   POST /api/direct-deposits/confirm-deposit
   { paymentIntentId: "pi_xxx" }
   ```
   - Verifies payment success with Stripe
   - Updates account balances in database
   - Distributes funds to category accounts
   - Creates transaction records

5. **Dependent sees updated balances**
   - Category accounts reflect new balances
   - Transaction history shows deposit
   - No sensitive payment data exposed

## 🔧 Error Handling

### Payment Failures
```javascript
// Handle various Stripe payment statuses
switch (paymentIntent.status) {
  case 'requires_payment_method':
    return { error: 'Payment method declined' };
  case 'requires_confirmation':
    return { error: 'Payment requires additional confirmation' };
  case 'canceled':
    return { error: 'Payment was canceled' };
  case 'succeeded':
    // Process successful payment
    break;
}
```

### Network Failures
```javascript
// Idempotent operations prevent duplicate processing
const existingTransaction = await Transaction.findOne({
  where: { reference: `STRIPE_${paymentIntentId}` }
});

if (existingTransaction) {
  return res.status(400).json({
    message: 'Payment already processed'
  });
}
```

This secure direct deposit system ensures that sensitive payment information never touches your servers while still providing a seamless deposit experience through Stripe's trusted infrastructure! 🔒✨
