# 💸 MONEY TRANSFER API - FUNDER TO BENEFICIARY

## **🚨 CRITICAL STRIPE LIMITATION**

**❌ IMPORTANT:** Cards added via the TEST endpoint (`/add-test`) cannot be used for real Stripe operations!

**Error you'll get:**
```
"No such PaymentMethod: 'pm_test_...'"
```

**✅ SOLUTION: Use Real Stripe Test Payment Methods**

Before testing transfers, add cards using the NEW STRIPE endpoint with official Stripe test payment methods:

```bash
POST {{BASE_URL}}/api/payment-cards/add-stripe
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
    "payment_method_id": "pm_card_visa",
    "is_default": true
}
```

**Available Stripe Test Payment Methods:**
- `pm_card_visa` - Visa test card (✅ Works with all operations)
- `pm_card_mastercard` - MasterCard test card
- `pm_card_amex` - American Express test card
- `pm_card_discover` - Discover test card

---

## 🎯 Overview
Enable funders to send money from their added payment cards directly to their beneficiaries' accounts.

## 🚀 **NEW TRANSFER ENDPOINTS**

### 1. Send Money to Beneficiary
**Endpoint:** `POST /api/transfers/send-to-beneficiary`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (JSON):**
```json
{
  "cardId": "your-card-uuid-here",
  "beneficiaryId": 12,
  "amount": 500.00,
  "description": "Monthly allowance"
}
```

**Success Response (201):**
```json
{
  "message": "Money sent successfully",
  "transfer": {
    "transactionRef": "TXN123456ABC",
    "amount": 500.00,
    "currency": "ZAR",
    "fromCard": {
      "bankName": "Standard Bank",
      "cardNumber": "****-****-****-1111",
      "nickname": "My Standard Bank Visa"
    },
    "toBeneficiary": {
      "name": "John Doe",
      "accountNumber": "1234567890"
    },
    "status": "completed",
    "timestamp": "2025-07-09T10:30:00.000Z",
    "description": "Monthly allowance"
  },
  "balanceUpdate": {
    "beneficiaryNewBalance": 1500.00
  }
}
```

### 2. Get Transfer History
**Endpoint:** `GET /api/transfers/history`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `beneficiaryId` (optional) - Filter by specific beneficiary

**Headers:**
```
Authorization: Bearer {{AUTH_TOKEN}}
```

**Success Response (200):**
```json
{
  "message": "Transfer history retrieved successfully",
  "transfers": [
    {
      "id": 123,
      "transactionRef": "TXN123456ABC",
      "amount": 500.00,
      "currency": "ZAR",
      "beneficiary": {
        "id": 12,
        "name": "John Doe",
        "accountNumber": "1234567890"
      },
      "status": "completed",
      "timestamp": "2025-07-09T10:30:00.000Z",
      "description": "Monthly allowance"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalTransfers": 47,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. Get Beneficiaries List
**Endpoint:** `GET /api/transfers/beneficiaries`

**Headers:**
```
Authorization: Bearer {{AUTH_TOKEN}}
```

**Success Response (200):**
```json
{
  "message": "Beneficiaries retrieved successfully",
  "beneficiaries": [
    {
      "id": 12,
      "name": "John Doe",
      "email": "john@example.com",
      "account": {
        "id": "uuid-here",
        "accountNumber": "1234567890",
        "balance": 1000.00,
        "currency": "ZAR"
      },
      "hasActiveAccount": true
    },
    {
      "id": 15,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "account": {
        "id": "uuid-here",
        "accountNumber": "0987654321",
        "balance": 250.00,
        "currency": "ZAR"
      },
      "hasActiveAccount": true
    }
  ],
  "totalBeneficiaries": 2
}
```

### 4. Get Transfer Information
**Endpoint:** `GET /api/transfers/info`

**Headers:**
```
Authorization: Bearer {{AUTH_TOKEN}}
```

**Success Response (200):**
```json
{
  "message": "Transfer information retrieved successfully",
  "limits": {
    "minimum": 10.00,
    "maximum": 5000.00,
    "dailyLimit": 20000.00,
    "currency": "ZAR"
  },
  "fees": {
    "transferFee": 0.00,
    "stripeProcessingFee": "2.9% + R2.00",
    "currency": "ZAR"
  },
  "processingTime": {
    "standard": "Instant",
    "description": "Transfers are processed immediately upon successful payment"
  }
}
```

## 🧪 **POSTMAN TEST COLLECTION FOR TRANSFERS**

### Test Data Setup

First, you'll need:
1. **A funder account** (logged in with JWT token)
2. **Added payment cards** (using previous card endpoints)
3. **Linked beneficiaries** (dependents linked to the funder)

### Step 1: Get Your Cards and Beneficiaries

```
GET {{BASE_URL}}/api/payment-cards/my-cards
Authorization: Bearer {{AUTH_TOKEN}}
```

```
GET {{BASE_URL}}/api/transfers/beneficiaries
Authorization: Bearer {{AUTH_TOKEN}}
```

### Step 2: Send Money to Beneficiary

**Request:** `POST {{BASE_URL}}/api/transfers/send-to-beneficiary`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Test Transfer #1 - Monthly Allowance:**
```json
{
  "cardId": "your-card-id-from-step-1",
  "beneficiaryId": "beneficiary-id-from-step-1",
  "amount": 500.00,
  "description": "Monthly allowance"
}
```

**Test Transfer #2 - Emergency Funds:**
```json
{
  "cardId": "your-card-id-from-step-1",
  "beneficiaryId": "beneficiary-id-from-step-1",
  "amount": 200.00,
  "description": "Emergency funds"
}
```

**Test Transfer #3 - Groceries:**
```json
{
  "cardId": "your-card-id-from-step-1",
  "beneficiaryId": "beneficiary-id-from-step-1",
  "amount": 350.00,
  "description": "Grocery money"
}
```

### Step 3: Check Transfer History

```
GET {{BASE_URL}}/api/transfers/history
Authorization: Bearer {{AUTH_TOKEN}}
```

### Step 4: Check Transfer Information

```
GET {{BASE_URL}}/api/transfers/info
Authorization: Bearer {{AUTH_TOKEN}}
```

## 🔄 **COMPLETE WORKFLOW EXAMPLE**

### 1. Login and Get Token
```json
POST /api/auth/login
{
  "email": "funder@example.com",
  "password": "password123"
}
```

### 2. Add Payment Card
```json
POST /api/payment-cards/add-test
{
  "bankName": "Standard Bank",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "ccv": "123",
  "nickname": "My Visa Card",
  "isDefault": true
}
```

### 3. Get Beneficiaries
```json
GET /api/transfers/beneficiaries
```

### 4. Send Money
```json
POST /api/transfers/send-to-beneficiary
{
  "cardId": "card-uuid-from-step-2",
  "beneficiaryId": "beneficiary-id-from-step-3",
  "amount": 500.00,
  "description": "Monthly allowance"
}
```

### 5. Check History
```json
GET /api/transfers/history
```

## ⚠️ **VALIDATION RULES**

### Amount Limits:
- **Minimum:** R10.00
- **Maximum:** R5,000.00 per transaction
- **Daily Limit:** R20,000.00

### Required Fields:
- `cardId` - Must be valid and belong to the funder
- `beneficiaryId` - Must be a linked dependent
- `amount` - Must be within limits

### Security:
- Funder can only send to their linked beneficiaries
- Card must be active and belong to the funder
- Beneficiary must have an active account

## 🎯 **ERROR RESPONSES**

### Invalid Amount:
```json
{
  "message": "Amount must be a positive number"
}
```

### Minimum Amount:
```json
{
  "message": "Minimum transfer amount is R10.00"
}
```

### Maximum Amount:
```json
{
  "message": "Maximum transfer amount is R5,000.00 per transaction"
}
```

### Card Not Found:
```json
{
  "message": "Payment card not found or inactive"
}
```

### Unauthorized Beneficiary:
```json
{
  "message": "You are not authorized to send money to this beneficiary"
}
```

### Payment Failed:
```json
{
  "message": "Payment processing failed",
  "error": "Card payment could not be processed"
}
```

## 💡 **TESTING TIPS**

1. **Start with small amounts** (R10-R50) for testing
2. **Use the test card endpoint** first to add cards
3. **Check beneficiaries list** before sending money
4. **Monitor transfer history** to verify transactions
5. **Test error scenarios** (invalid amounts, unauthorized beneficiaries)

## 🔗 **COMPLETE API FLOW**

```
1. Funder logs in → Gets JWT token
2. Funder adds payment card → Card stored securely
3. Funder views beneficiaries → Gets linked dependents
4. Funder sends money → Card charged, beneficiary credited
5. Transaction recorded → Viewable in history
6. Beneficiary receives funds → Account balance updated
```

Your funder-to-beneficiary transfer system is now ready for testing! 🚀
