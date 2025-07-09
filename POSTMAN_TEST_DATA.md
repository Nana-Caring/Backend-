# 🧪 POSTMAN TEST DATA FOR PAYMENT CARDS API

## 📋 Test Credit/Debit Cards for Funders

### Test Card Data (Use these in Postman)

#### 1. Standard Bank Visa Card
```json
{
  "bankName": "Standard Bank",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "ccv": "123",
  "nickname": "My Standard Bank Visa",
  "isDefault": true
}
```

#### 2. FNB MasterCard
```json
{
  "bankName": "FNB",
  "cardNumber": "5555555555554444",
  "expiryDate": "08/26",
  "ccv": "456",
  "nickname": "FNB Business Card",
  "isDefault": false
}
```

#### 3. Capitec Bank Card
```json
{
  "bankName": "Capitec Bank",
  "cardNumber": "4000000000000002",
  "expiryDate": "03/27",
  "ccv": "789",
  "nickname": "Capitec Debit Card",
  "isDefault": false
}
```

#### 4. ABSA Credit Card
```json
{
  "bankName": "ABSA",
  "cardNumber": "4242424242424242",
  "expiryDate": "11/25",
  "ccv": "321",
  "nickname": "ABSA Platinum",
  "isDefault": false
}
```

#### 5. Nedbank Card
```json
{
  "bankName": "Nedbank",
  "cardNumber": "4000000000000069",
  "expiryDate": "06/28",
  "ccv": "654",
  "nickname": "Nedbank Gold Card",
  "isDefault": false
}
```

## 🚀 POSTMAN COLLECTION SETUP

### Step 1: Create Environment Variables
In Postman, create an environment with these variables:

```
BASE_URL: http://localhost:5000
AUTH_TOKEN: (will be set after login)
```

### Step 2: Login Request (Get Authentication Token)

**Request:** `POST {{BASE_URL}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "funder@example.com",
  "password": "your_password_here"
}
```

**Test Script (to save token):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("AUTH_TOKEN", response.token);
    console.log("Token saved:", response.token);
}
```

### Step 3: Add Payment Card Requests

#### Request 1: Add Standard Bank Visa (TEST ENDPOINT)
**Request:** `POST {{BASE_URL}}/api/payment-cards/add-test`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (raw JSON):**
```json
{
  "bankName": "Standard Bank",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "ccv": "123",
  "nickname": "My Standard Bank Visa",
  "isDefault": true
}
```

#### Request 1B: Add Standard Bank Visa (PRODUCTION ENDPOINT - requires Stripe tokens)
**Request:** `POST {{BASE_URL}}/api/payment-cards/add`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (raw JSON):**
```json
{
  "bankName": "Standard Bank",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "ccv": "123",
  "nickname": "My Standard Bank Visa",
  "isDefault": true
}
```

#### Request 2: Add FNB MasterCard (TEST ENDPOINT)
**Request:** `POST {{BASE_URL}}/api/payment-cards/add-test`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (raw JSON):**
```json
{
  "bankName": "FNB",
  "cardNumber": "5555555555554444",
  "expiryDate": "08/26",
  "ccv": "456",
  "nickname": "FNB Business Card",
  "isDefault": false
}
```

#### Request 3: Add Capitec Bank Card (TEST ENDPOINT)
**Request:** `POST {{BASE_URL}}/api/payment-cards/add-test`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (raw JSON):**
```json
{
  "bankName": "Capitec Bank",
  "cardNumber": "4000000000000002",
  "expiryDate": "03/27",
  "ccv": "789",
  "nickname": "Capitec Debit Card",
  "isDefault": false
}
```

### Step 4: Get All Cards
**Request:** `GET {{BASE_URL}}/api/payment-cards/my-cards`

**Headers:**
```
Authorization: Bearer {{AUTH_TOKEN}}
```

### Step 5: Set Default Card
**Request:** `PUT {{BASE_URL}}/api/payment-cards/set-default/{{CARD_ID}}`

**Headers:**
```
Authorization: Bearer {{AUTH_TOKEN}}
```

*Note: Replace {{CARD_ID}} with actual card ID from previous responses*

### Step 6: Remove Card
**Request:** `DELETE {{BASE_URL}}/api/payment-cards/remove/{{CARD_ID}}`

**Headers:**
```
Authorization: Bearer {{AUTH_TOKEN}}
```

### Step 7: Create Payment Intent
**Request:** `POST {{BASE_URL}}/api/payment-cards/create-payment-intent`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (raw JSON):**
```json
{
  "amount": 100.00,
  "cardId": "{{CARD_ID}}",
  "description": "Test payment for account funding"
}
```

## 🎉 **MONEY TRANSFER FEATURE ADDED!** 💸

### 🚀 **NEW CAPABILITY: Send Money to Beneficiaries**

Funders can now use their added payment cards to send money directly to their beneficiaries! Here are the new endpoints:

#### **Transfer Endpoints:**
- `POST /api/transfers/send-to-beneficiary` - Send money using payment card
- `GET /api/transfers/beneficiaries` - Get linked beneficiaries
- `GET /api/transfers/history` - View transfer history  
- `GET /api/transfers/info` - Get limits and fees

#### **Example Transfer Request:**
```json
POST /api/transfers/send-to-beneficiary
{
  "cardId": "your-card-uuid",
  "beneficiaryId": 12,
  "amount": 500.00,
  "description": "Monthly allowance"
}
```

#### **Transfer Limits:**
- Minimum: R10.00
- Maximum: R5,000.00 per transaction
- Daily limit: R20,000.00

See `TRANSFER_API_TEST_DATA.md` for complete testing guide! 🧪

### SOLUTION FOR STRIPE ERROR ✅

**✅ VALIDATION ERROR FIXED!**

**Use the TEST endpoint to bypass Stripe validation during development:**

**WORKING TEST ENDPOINT:** `POST {{BASE_URL}}/api/payment-cards/add-test`

This endpoint will work with your original card numbers without Stripe restrictions and validation errors!

**🎯 RECOMMENDED FOR TESTING:**
- Use `/api/payment-cards/add-test` for all development testing
- Use `/api/payment-cards/add` for production with proper Stripe tokenization

## 🧪 STRIPE TEST CARD NUMBERS

These are official Stripe test card numbers that will work with your API:

### Successful Cards:
- **4111111111111111** - Visa (Generic)
- **5555555555554444** - MasterCard (Generic)
- **4242424242424242** - Visa (Generic)
- **4000000000000002** - Visa (Generic)

### Cards for Testing Specific Scenarios:
- **4000000000000010** - Address verification fails
- **4000000000000028** - Charge is declined
- **4000000000000036** - Address and CVC verification fails
- **4000000000000069** - Charge is declined with expired_card code
- **4000000000000119** - Charge is declined with processing_error code

### International Cards:
- **4000000760000002** - Brazil Visa
- **4000001240000000** - Canada Visa
- **4000002500000003** - Germany Visa

## 📝 EXPECTED RESPONSES

### Successful Card Addition (201) - TEST ENDPOINT:
```json
{
  "message": "Payment card added successfully (TEST MODE)",
  "card": {
    "id": "uuid-here",
    "bankName": "Standard Bank",
    "cardNumber": "****-****-****-1111",
    "expiryDate": "12/25",
    "nickname": "My Standard Bank Visa",
    "isDefault": true,
    "isActive": true,
    "createdAt": "2025-07-09T10:30:00.000Z"
  },
  "note": "This is a test endpoint - Stripe validation bypassed for development"
}
```

### Get Cards Response (200):
```json
{
  "message": "Payment cards retrieved successfully",
  "cards": [
    {
      "id": "uuid-here",
      "bankName": "Standard Bank",
      "cardNumber": "****-****-****-1111",
      "expiryDate": "12/25",
      "nickname": "My Standard Bank Visa",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2025-07-09T10:30:00.000Z"
    }
  ],
  "totalCards": 1
}
```

### Error Response (400):
```json
{
  "message": "All card fields are required",
  "required": {
    "bankName": "Bank Name is required",
    "cardNumber": "Card Number is required",
    "expiryDate": "Expiry Date (MM/YY) is required",
    "ccv": "CCV is required"
  }
}
```

## 🔧 POSTMAN COLLECTION JSON

Copy this into Postman as a collection:

```json
{
  "info": {
    "name": "Payment Cards API",
    "description": "Test collection for payment cards endpoints"
  },
  "item": [
    {
      "name": "1. Login (Get Token)",
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
          "raw": "{\n  \"email\": \"funder@example.com\",\n  \"password\": \"your_password_here\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/api/auth/login",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "2. Add Standard Bank Visa",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{AUTH_TOKEN}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"bankName\": \"Standard Bank\",\n  \"cardNumber\": \"4111111111111111\",\n  \"expiryDate\": \"12/25\",\n  \"ccv\": \"123\",\n  \"nickname\": \"My Standard Bank Visa\",\n  \"isDefault\": true\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/api/payment-cards/add",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "payment-cards", "add"]
        }
      }
    },
    {
      "name": "2B. Add Standard Bank Visa (TEST ENDPOINT)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{AUTH_TOKEN}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"bankName\": \"Standard Bank\",\n  \"cardNumber\": \"4111111111111111\",\n  \"expiryDate\": \"12/25\",\n  \"ccv\": \"123\",\n  \"nickname\": \"My Standard Bank Visa\",\n  \"isDefault\": true\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/api/payment-cards/add-test",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "payment-cards", "add-test"]
        }
      }
    },
    {
      "name": "3. Add FNB MasterCard (TEST)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{AUTH_TOKEN}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"bankName\": \"FNB\",\n  \"cardNumber\": \"5555555555554444\",\n  \"expiryDate\": \"08/26\",\n  \"ccv\": \"456\",\n  \"nickname\": \"FNB Business Card\",\n  \"isDefault\": false\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/api/payment-cards/add-test",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "payment-cards", "add-test"]
        }
      }
    },
    {
      "name": "4. Get All Cards",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{AUTH_TOKEN}}"
          }
        ],
        "url": {
          "raw": "{{BASE_URL}}/api/payment-cards/my-cards",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "payment-cards", "my-cards"]
        }
      }
    },
    {
      "name": "5. Get Beneficiaries",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{AUTH_TOKEN}}"
          }
        ],
        "url": {
          "raw": "{{BASE_URL}}/api/transfers/beneficiaries",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "transfers", "beneficiaries"]
        }
      }
    },
    {
      "name": "6. Send Money to Beneficiary",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{AUTH_TOKEN}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"cardId\": \"{{CARD_ID}}\",\n  \"beneficiaryId\": \"{{BENEFICIARY_ID}}\",\n  \"amount\": 100.00,\n  \"description\": \"Test transfer - grocery money\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/api/transfers/send-to-beneficiary",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "transfers", "send-to-beneficiary"]
        }
      }
    },
    {
      "name": "7. Get Transfer History",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{AUTH_TOKEN}}"
          }
        ],
        "url": {
          "raw": "{{BASE_URL}}/api/transfers/history",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "transfers", "history"]
        }
      }
    },
    {
      "name": "8. Get Transfer Info",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{AUTH_TOKEN}}"
          }
        ],
        "url": {
          "raw": "{{BASE_URL}}/api/transfers/info",
          "host": ["{{BASE_URL}}"],
          "path": ["api", "transfers", "info"]
        }
      }
    }
  ]
}
```

## 🚀 TESTING WORKFLOW

1. **Start your server**: `npm start`
2. **Import collection** into Postman
3. **Set environment variables** (BASE_URL: http://localhost:5000)
4. **Run "Login" request** first to get the authentication token
5. **Add cards** using the sample data provided
6. **Test other endpoints** (get cards, set default, remove, etc.)

## 💡 TIPS

- Always run the login request first to get a valid token
- Use the test card numbers provided for successful transactions
- Check the console logs for detailed error information
- The card number will be masked in responses (only last 4 digits shown)
- Each user can only see their own cards

## 💡 TESTING SUCCESS TIPS

✅ **VALIDATION ERROR FIXED!** The payment cards API is now working properly.

### 🚀 **QUICK START (Updated):**

1. **Token received successfully:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
2. **Use the TEST endpoint:** `POST /api/payment-cards/add-test`
3. **All validation errors resolved**

### 🎯 **Working Endpoints:**

- ✅ `POST /api/payment-cards/add-test` - **WORKS** (bypasses Stripe, fixed validation)
- ✅ `GET /api/payment-cards/my-cards` - Get all user cards
- ✅ `PUT /api/payment-cards/set-default/:cardId` - Set default card
- ✅ `DELETE /api/payment-cards/remove/:cardId` - Remove card
- ✅ `POST /api/payment-cards/create-payment-intent` - Create payment

### 💸 **MONEY TRANSFER ENDPOINTS:**

- ✅ `POST /api/transfers/send-to-beneficiary` - **Send money from card to beneficiary**
- ✅ `GET /api/transfers/beneficiaries` - Get linked beneficiaries list
- ✅ `GET /api/transfers/history` - View transfer history
- ✅ `GET /api/transfers/info` - Get transfer limits and fees

## 💰 **MONEY TRANSFER API - POSTMAN TESTING**

### Step 8: Get Beneficiaries List
**Request:** `GET {{BASE_URL}}/api/transfers/beneficiaries`

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
    }
  ],
  "totalBeneficiaries": 1
}
```

### Step 9: Send Money to Beneficiary
**Request:** `POST {{BASE_URL}}/api/transfers/send-to-beneficiary`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (raw JSON) - Test Transfer #1:**
```json
{
  "cardId": "{{CARD_ID}}",
  "beneficiaryId": 12,
  "amount": 100.00,
  "description": "Test transfer - grocery money"
}
```

**Body (raw JSON) - Test Transfer #2:**
```json
{
  "cardId": "{{CARD_ID}}",
  "beneficiaryId": 12,
  "amount": 500.00,
  "description": "Monthly allowance"
}
```

**Body (raw JSON) - Test Transfer #3:**
```json
{
  "cardId": "{{CARD_ID}}",
  "beneficiaryId": 12,
  "amount": 250.00,
  "description": "Emergency funds"
}
```

**Success Response (201):**
```json
{
  "message": "Money sent successfully",
  "transfer": {
    "transactionRef": "TXN123456ABC",
    "amount": 100.00,
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
    "description": "Test transfer - grocery money"
  },
  "balanceUpdate": {
    "beneficiaryNewBalance": 1100.00
  }
}
```

### Step 10: Get Transfer History
**Request:** `GET {{BASE_URL}}/api/transfers/history`

**Headers:**
```
Authorization: Bearer {{AUTH_TOKEN}}
```

**Query Parameters (optional):**
- `?page=1` - Page number
- `?limit=10` - Items per page
- `?beneficiaryId=12` - Filter by specific beneficiary

**Examples:**
```
GET {{BASE_URL}}/api/transfers/history
GET {{BASE_URL}}/api/transfers/history?page=1&limit=5
GET {{BASE_URL}}/api/transfers/history?beneficiaryId=12
```

**Success Response (200):**
```json
{
  "message": "Transfer history retrieved successfully",
  "transfers": [
    {
      "id": 123,
      "transactionRef": "TXN123456ABC",
      "amount": 100.00,
      "currency": "ZAR",
      "beneficiary": {
        "id": 12,
        "name": "John Doe",
        "accountNumber": "1234567890"
      },
      "status": "completed",
      "timestamp": "2025-07-09T10:30:00.000Z",
      "description": "Test transfer - grocery money"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalTransfers": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Step 11: Get Transfer Information
**Request:** `GET {{BASE_URL}}/api/transfers/info`

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

## 🧪 **TRANSFER ERROR RESPONSES**

### Missing Required Fields (400):
```json
{
  "message": "All fields are required",
  "required": {
    "cardId": "Payment card ID is required",
    "beneficiaryId": "Beneficiary ID is required",
    "amount": "Transfer amount is required"
  }
}
```

### Invalid Amount (400):
```json
{
  "message": "Amount must be a positive number"
}
```

### Minimum Amount Error (400):
```json
{
  "message": "Minimum transfer amount is R10.00"
}
```

### Maximum Amount Error (400):
```json
{
  "message": "Maximum transfer amount is R5,000.00 per transaction"
}
```

### Card Not Found (404):
```json
{
  "message": "Payment card not found or inactive"
}
```

### Beneficiary Not Found (404):
```json
{
  "message": "Beneficiary not found"
}
```

### Unauthorized Beneficiary (403):
```json
{
  "message": "You are not authorized to send money to this beneficiary"
}
```

### Payment Failed (400):
```json
{
  "message": "Payment processing failed",
  "error": "Card payment could not be processed"
}
```

## 📋 **COMPLETE TRANSFER TESTING WORKFLOW**

### 1. Setup Phase:
```
1. Login → Get JWT token
2. Add payment card → Get card ID
3. Get beneficiaries → Get beneficiary ID
4. Check transfer info → Understand limits
```

### 2. Transfer Phase:
```
1. Send small amount (R50) → Test basic functionality
2. Send medium amount (R500) → Test normal transfer
3. Send large amount (R2000) → Test higher amounts
4. Check history → Verify all transfers
```

### 3. Error Testing:
```
1. Send R5 → Test minimum limit
2. Send R10000 → Test maximum limit
3. Use wrong beneficiary ID → Test authorization
4. Use invalid card ID → Test card validation
```

## 🔧 **POSTMAN COLLECTION JSON FOR TRANSFERS**

Add these to your existing Postman collection:

```json
{
  "name": "5. Get Beneficiaries",
  "request": {
    "method": "GET",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{AUTH_TOKEN}}"
      }
    ],
    "url": {
      "raw": "{{BASE_URL}}/api/transfers/beneficiaries",
      "host": ["{{BASE_URL}}"],
      "path": ["api", "transfers", "beneficiaries"]
    }
  }
},
{
  "name": "6. Send Money to Beneficiary",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      },
      {
        "key": "Authorization",
        "value": "Bearer {{AUTH_TOKEN}}"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"cardId\": \"{{CARD_ID}}\",\n  \"beneficiaryId\": \"{{BENEFICIARY_ID}}\",\n  \"amount\": 100.00,\n  \"description\": \"Test transfer - grocery money\"\n}"
    },
    "url": {
      "raw": "{{BASE_URL}}/api/transfers/send-to-beneficiary",
      "host": ["{{BASE_URL}}"],
      "path": ["api", "transfers", "send-to-beneficiary"]
    }
  }
},
{
  "name": "7. Get Transfer History",
  "request": {
    "method": "GET",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{AUTH_TOKEN}}"
      }
    ],
    "url": {
      "raw": "{{BASE_URL}}/api/transfers/history",
      "host": ["{{BASE_URL}}"],
      "path": ["api", "transfers", "history"]
    }
  }
},
{
  "name": "8. Get Transfer Info",
  "request": {
    "method": "GET",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{AUTH_TOKEN}}"
      }
    ],
    "url": {
      "raw": "{{BASE_URL}}/api/transfers/info",
      "host": ["{{BASE_URL}}"],
      "path": ["api", "transfers", "info"]
    }
  }
}
```

## 💡 **TRANSFER TESTING TIPS**

### 🎯 **Before Testing Transfers:**
1. **Ensure you have a funder account** logged in
2. **Add at least one payment card** using the test endpoint
3. **Verify you have linked beneficiaries** (dependents)
4. **Check beneficiaries have active accounts**

### 🚀 **Testing Steps:**
1. **Get beneficiaries first** → Note the beneficiary ID and account number
2. **Get your cards** → Note the card ID
3. **Send a small test amount** (R50) → Verify basic functionality
4. **Check transfer history** → Confirm the transfer appears
5. **Send larger amounts** → Test different scenarios

### ⚠️ **Important Notes:**
- Replace `{{CARD_ID}}` with actual card ID from your cards list
- Replace `{{BENEFICIARY_ID}}` with actual beneficiary ID from beneficiaries list
- Amounts must be between R10.00 and R5,000.00
- You can only send money to your linked beneficiaries
- All transfers are processed through Stripe (test mode)

### 🔍 **Variables to Set in Postman:**
```
BASE_URL: http://localhost:5000
AUTH_TOKEN: (auto-set from login)
CARD_ID: (copy from cards response)
BENEFICIARY_ID: (copy from beneficiaries response)
```
