# Funder Transfer Flow Documentation

## 📋 Overview
This document explains how a funder sends money to their beneficiaries (dependents) in the NANA Project backend system.

---

## 🔄 Complete Flow

### 1️⃣ **Step 1: Get Beneficiaries List**
First, the funder needs to get the list of their linked beneficiaries and their accounts.

#### **Endpoint:**
```
GET /api/funder/get-beneficiaries
OR
GET /api/funder/beneficiaries
```

#### **Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

#### **Response Example:**
```json
{
  "beneficiaries": [
    {
      "id": 13,
      "name": "Emma Johnson",
      "firstName": "Emma",
      "middleName": null,
      "surname": "Johnson",
      "email": "emma@example.com",
      "phoneNumber": "+27123456789",
      "Accounts": [
        {
          "id": "b9856421-7829-4171-ac8b-e0d73a97da45",
          "accountName": "Main",
          "accountNumber": "ACC202501001",
          "accountType": "Main",
          "balance": "ZAR 1500.00",
          "caregiverId": null
        },
        {
          "id": "a1234567-89ab-cdef-0123-456789abcdef",
          "accountName": "Savings",
          "accountNumber": "ACC202501002",
          "accountType": "Savings",
          "balance": "ZAR 500.00",
          "caregiverId": null
        }
      ]
    }
  ]
}
```

**Key Information to Extract:**
- `beneficiaryId`: The `id` field (e.g., `13`)
- `accountNumber`: From the `Accounts` array (e.g., `"ACC202501001"`)
- `accountType`: To display which account (e.g., `"Main"`, `"Savings"`)

---

### 2️⃣ **Step 2: Transfer Money**

Once you have the beneficiary information, you can initiate a transfer.

#### **Endpoint:**
```
POST /api/funder/transfer
```

#### **Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

#### **Request Body:**
```json
{
  "beneficiaryId": 13,
  "accountNumber": "ACC202501001",
  "amount": 200.00,
  "description": "Monthly allowance"
}
```

#### **Request Body Fields:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `beneficiaryId` | Integer | ✅ Yes | The ID of the dependent/beneficiary | `13` |
| `accountNumber` | String | ✅ Yes | The account number from beneficiary's accounts | `"ACC202501001"` |
| `amount` | Float | ✅ Yes | Transfer amount (must be > 0.01) | `200.00` |
| `description` | String | ❌ No | Optional description (max 500 chars) | `"Monthly allowance"` |

#### **Success Response (200):**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "transferReference": "TRF-1730000000000-abc123xyz",
    "amount": 200,
    "currency": "ZAR",
    "funder": {
      "accountId": "f1234567-89ab-cdef-0123-456789abcdef",
      "newBalance": 800.00
    },
    "beneficiary": {
      "accountId": "b9856421-7829-4171-ac8b-e0d73a97da45",
      "accountName": "Main",
      "accountType": "Main",
      "newBalance": 1700.00
    }
  }
}
```

#### **Error Responses:**

**400 - Invalid Amount:**
```json
{
  "success": false,
  "message": "Invalid transfer amount"
}
```

**400 - Insufficient Funds:**
```json
{
  "success": false,
  "message": "Insufficient funds. Available: ZAR 100.00, Requested: ZAR 200.00"
}
```

**403 - Not Authorized:**
```json
{
  "success": false,
  "message": "Not authorized to transfer to this beneficiary"
}
```

**404 - Beneficiary Account Not Found:**
```json
{
  "success": false,
  "message": "Beneficiary account not found"
}
```

**404 - Funder Account Not Found:**
```json
{
  "success": false,
  "message": "Funder account not found"
}
```

**422 - Validation Error:**
```json
{
  "errors": [
    {
      "msg": "Valid beneficiary ID is required",
      "param": "beneficiaryId",
      "location": "body"
    }
  ]
}
```

---

### 3️⃣ **Step 3: View Transfer History (Optional)**

#### **Endpoint:**
```
GET /api/funder/transfer/history?page=1&limit=20
```

#### **Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

#### **Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Integer | ❌ No | `1` | Page number (min: 1) |
| `limit` | Integer | ❌ No | `20` | Results per page (1-50) |

#### **Response:**
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "id": 101,
        "type": "Debit",
        "amount": 200,
        "description": "Transfer to Main account - Monthly allowance",
        "reference": "TRF-1730000000000-abc123xyz",
        "createdAt": "2025-10-27T10:30:00.000Z"
      },
      {
        "id": 100,
        "type": "Credit",
        "amount": 1000,
        "description": "Deposit via Stripe",
        "reference": "DEP-1729999999999-xyz789abc",
        "createdAt": "2025-10-26T15:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalTransfers": 45,
      "hasMore": true
    }
  }
}
```

---

## 🔒 Security & Validation

### **Authentication:**
- All endpoints require JWT token in Authorization header
- Token is validated by `authenticate` middleware

### **Role Check:**
- Transfer endpoints require `role: 'funder'`
- Verified by `isFunderRole` middleware

### **Validation Rules:**

1. **beneficiaryId:**
   - Must be an integer
   - Must be > 0
   - Must be linked to the funder

2. **accountNumber:**
   - Must not be empty
   - Must be a string
   - Must belong to the beneficiary
   - Must exist in database

3. **amount:**
   - Must be a float
   - Must be >= 0.01
   - Funder must have sufficient balance

4. **description:**
   - Optional field
   - Max 500 characters

---

## 🏗️ Technical Architecture

### **Routes Structure:**

```
server.js
  ↓
app.use('/api/funder', funderRoutes)
  ↓ GET /beneficiaries → beneficiaryController.getMyBeneficiaries
  
app.use('/api/funder/transfer', funderTransferRoutes)
  ↓ [authenticate middleware]
  ↓ [isFunderRole middleware]
  ↓
  ├─ POST / → [validateTransfer] → funderTransferController.transferToBeneficiary
  └─ GET /history → [validateHistory] → funderTransferController.getTransferHistory
```

### **Database Operations:**

1. **Verify Relationship:**
   - Check `FunderDependent` table for link between funder and beneficiary

2. **Get Funder Account:**
   - Query `Account` table where `userId = funderId` AND `accountType = 'Main'`

3. **Check Balance:**
   - Ensure `funderAccount.balance >= amount`

4. **Get Beneficiary Account:**
   - Query `Account` table where `accountNumber = accountNumber` AND `userId = beneficiaryId`

5. **Update Balances (in transaction):**
   - Deduct from funder: `funderBalance - amount`
   - Add to beneficiary: `beneficiaryBalance + amount`

6. **Create Transaction Records:**
   - **Debit** record for funder with reference
   - **Credit** record for beneficiary with same reference

7. **Commit Transaction:**
   - If all operations succeed, commit
   - If any fails, rollback everything

---

## 📝 Example Frontend Implementation

### **React/JavaScript Example:**

```javascript
// Step 1: Get beneficiaries
const getBeneficiaries = async () => {
  const response = await fetch('/api/funder/beneficiaries', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const data = await response.json();
  return data.beneficiaries;
};

// Step 2: Transfer money
const transferMoney = async (beneficiaryId, accountNumber, amount, description) => {
  const response = await fetch('/api/funder/transfer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      beneficiaryId: beneficiaryId,
      accountNumber: accountNumber,
      amount: parseFloat(amount),
      description: description || ''
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Transfer failed');
  }
  
  return data;
};

// Usage example
try {
  const beneficiaries = await getBeneficiaries();
  const emma = beneficiaries.find(b => b.firstName === 'Emma');
  const mainAccount = emma.Accounts.find(acc => acc.accountType === 'Main');
  
  const result = await transferMoney(
    emma.id,                    // 13
    mainAccount.accountNumber,  // "ACC202501001"
    200.00,                     // amount
    'Monthly allowance'         // description
  );
  
  console.log('Transfer successful!', result);
  console.log('Reference:', result.data.transferReference);
  console.log('New beneficiary balance:', result.data.beneficiary.newBalance);
  
} catch (error) {
  console.error('Transfer error:', error.message);
}
```

---

## 🧪 Testing with cURL

### **1. Get Beneficiaries:**
```bash
curl -X GET "http://localhost:5000/api/funder/beneficiaries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **2. Transfer Money:**
```bash
curl -X POST "http://localhost:5000/api/funder/transfer" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "beneficiaryId": 13,
    "accountNumber": "ACC202501001",
    "amount": 200.00,
    "description": "Monthly allowance"
  }'
```

### **3. Get Transfer History:**
```bash
curl -X GET "http://localhost:5000/api/funder/transfer/history?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Database Schema Reference

### **Tables Involved:**

1. **Users** - Stores funder and beneficiary user info
2. **Accounts** - Stores account info (Main, Savings, etc.)
3. **FunderDependent** - Links funders to beneficiaries
4. **Transaction** - Records all financial transactions

### **Transaction Types:**
- `Debit` - Money going out (funder side)
- `Credit` - Money coming in (beneficiary side)

---

## ⚠️ Important Notes

1. **Account Number vs Account ID:**
   - The system uses `accountNumber` (string like "ACC202501001") for transfers
   - Not `accountId` (UUID like "b9856421-7829-4171-ac8b-e0d73a97da45")
   - This makes the API more user-friendly and avoids UUID validation issues

2. **Transaction Safety:**
   - All operations use database transactions
   - If any step fails, everything is rolled back
   - Ensures data consistency

3. **Balance Format:**
   - Stored as decimal/float in database
   - Displayed as string with "ZAR" prefix in API responses
   - Frontend should parse and format as needed

4. **Reference Numbers:**
   - Generated automatically: `TRF-{timestamp}-{random}`
   - Same reference used for both funder debit and beneficiary credit
   - Helps track related transactions

---

## 🐛 Common Issues & Solutions

### **Issue: "Beneficiary account not found"**
**Solution:** Verify:
- The `accountNumber` is correct
- The account belongs to the specified `beneficiaryId`
- The account exists in the database

### **Issue: "Not authorized to transfer to this beneficiary"**
**Solution:** 
- Ensure the funder-beneficiary relationship exists in `FunderDependent` table
- Use `/api/funder/link-dependent` to create the relationship first

### **Issue: "Insufficient funds"**
**Solution:**
- Check funder's Main account balance
- Funder needs to deposit funds first via Stripe

### **Issue: "Access denied. Funder role required"**
**Solution:**
- Ensure the user has `role: 'funder'` in the Users table
- Check JWT token contains correct role information

---

## 📞 Support

For questions or issues, refer to:
- Backend codebase: `routes/funderTransferRoutes.js`
- Controller logic: `controllers/funderTransferController.js`
- Beneficiary endpoint: `controllers/getbeneficiaryController.js`
