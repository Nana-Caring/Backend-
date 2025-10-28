# 📱 Frontend Integration Guide - Funder Transfer System

## 🎯 **What We Built**

We've implemented a **Smart Funder Transfer System** that allows funders to send money to their dependents with intelligent automatic distribution. The system supports two transfer modes:

1. **🧠 Smart Auto-Distribution** → Send to Main account, system automatically budgets across categories
2. **🎯 Direct Category Transfer** → Send directly to specific categories (Healthcare, Education, etc.)

---

## 🚀 **API Endpoints**

### **Base URL:** `https://nanacaring-backend.onrender.com/api`

---

## 🔐 **Authentication Required**
All endpoints require JWT token in Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
}
```

---

## 💰 **1. Funder Transfer Endpoint**

### **POST** `/funder/transfer`

**Purpose:** Transfer funds from funder to dependent with smart distribution

**Request Body:**
```javascript
{
  "beneficiaryUserId": 123,           // Required: Dependent's user ID
  "accountType": "Main",              // Required: "Main" or category name
  "amount": 100,                      // Required: Amount in ZAR
  "currency": "ZAR",                  // Required: Currency code
  "description": "Monthly support"     // Optional: Transfer description
}
```

**Account Types Available:**
- `"Main"` → Triggers auto-distribution
- `"Healthcare"` → Direct to healthcare account  
- `"Education"` → Direct to education account
- `"Groceries"` → Direct to groceries account
- `"Transport"` → Direct to transport account
- `"Entertainment"` → Direct to entertainment account
- `"Clothing"` → Direct to clothing account
- `"Baby Care"` → Direct to baby care account
- `"Pregnancy"` → Direct to pregnancy account

---

### **Response Examples:**

#### **✅ Success - Main Account (Auto-Distribution)**
```javascript
{
  "success": true,
  "message": "Transfer completed successfully with automatic distribution",
  "data": {
    "transferReference": "TRF-1761640052046-qkhtjlur9",
    "amount": 100,
    "currency": "ZAR",
    "targetAccountType": "Main",
    "funder": {
      "userId": 456,
      "name": "John Smith",
      "newBalance": 950
    },
    "beneficiary": {
      "userId": 123,
      "name": "Emma Johnson",
      "accountType": "Main",
      "newBalance": 20  // Main account keeps emergency fund
    },
    "autoDistribution": {
      "enabled": true,
      "totalAmount": 100,
      "totalDistributed": 80,  // 80% distributed to categories
      "emergencyFund": {
        "amount": 20,
        "percentage": 20,
        "newMainBalance": 20
      },
      "categories": [
        {
          "category": "Healthcare",
          "percentage": 20,  // 20% of total transfer
          "amount": 20,
          "newBalance": 45,
          "accountId": 789
        },
        {
          "category": "Education", 
          "percentage": 16,  // 16% of total transfer
          "amount": 16,
          "newBalance": 36,
          "accountId": 790
        },
        {
          "category": "Groceries",
          "percentage": 16, 
          "amount": 16,
          "newBalance": 16,
          "accountId": 791
        }
        // ... more categories (totaling 80%)
      ]
    },
    "timestamp": "2025-10-28T10:30:00Z"
  }
}
```

#### **✅ Success - Category Account (Direct Transfer)**
```javascript
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "transferReference": "TRF-1761640064853-az2p8bjli",
    "amount": 50,
    "currency": "ZAR", 
    "targetAccountType": "Healthcare",
    "funder": {
      "userId": 456,
      "name": "John Smith",
      "newBalance": 900
    },
    "beneficiary": {
      "userId": 123,
      "name": "Emma Johnson", 
      "accountType": "Healthcare",
      "newBalance": 125
    },
    "autoDistribution": null,  // No distribution for direct transfers
    "timestamp": "2025-10-28T10:35:00Z"
  }
}
```

#### **❌ Error Responses**
```javascript
// Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    },
    {
      "field": "beneficiaryUserId",
      "message": "Beneficiary user ID is required"
    }
  ]
}

// Insufficient Funds
{
  "success": false,
  "message": "Insufficient funds",
  "data": {
    "requestedAmount": 1000,
    "availableBalance": 500,
    "currency": "ZAR"
  }
}

// Unauthorized Transfer
{
  "success": false,
  "message": "You are not authorized to transfer to this beneficiary"
}
```

---

## 👥 **2. Get Funder's Dependents**

### **GET** `/funder/beneficiaries`

**Purpose:** Get list of dependents the funder can transfer to

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "userId": 123,
      "name": "Emma Johnson",
      "email": "emma@example.com",
      "relationship": "daughter",
      "accounts": [
        {
          "accountId": 789,
          "accountType": "Main", 
          "balance": 130,
          "currency": "ZAR"
        },
        {
          "accountId": 790,
          "accountType": "Healthcare",
          "balance": 75,
          "currency": "ZAR"
        }
        // ... more accounts
      ]
    }
  ]
}
```

---

## 💳 **3. Get Funder Account Balance**

### **GET** `/funder/balance`

**Purpose:** Get funder's current account balance

**Response:**
```javascript
{
  "success": true,
  "data": {
    "userId": 456,
    "balance": 1500,
    "currency": "ZAR",
    "accountId": 999
  }
}
```

---

## 📊 **4. Get Transfer History**

### **GET** `/funder/transfers?limit=10&offset=0`

**Purpose:** Get funder's transfer history

**Query Parameters:**
- `limit` (optional): Number of records (default: 10)
- `offset` (optional): Records to skip (default: 0)
- `beneficiaryUserId` (optional): Filter by specific beneficiary

**Response:**
```javascript
{
  "success": true,
  "data": {
    "transfers": [
      {
        "transferId": 567,
        "reference": "TRF-1761640052046-qkhtjlur9",
        "amount": 100,
        "currency": "ZAR",
        "targetAccountType": "Main",
        "beneficiary": {
          "userId": 123,
          "name": "Emma Johnson"
        },
        "autoDistributionTriggered": true,
        "description": "Monthly support",
        "timestamp": "2025-10-28T10:30:00Z",
        "status": "completed"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## 🎯 **Frontend Implementation Examples**

### **1. Transfer to Main Account (Auto-Distribution)**

```javascript
const transferToMain = async (beneficiaryId, amount) => {
  try {
    const response = await fetch('/api/funder/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        beneficiaryUserId: beneficiaryId,
        accountType: 'Main',  // This triggers auto-distribution
        amount: amount,
        currency: 'ZAR',
        description: 'General support'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Show success with distribution breakdown
      console.log('Auto-distribution activated!');
      console.log(`Distributed ZAR ${result.data.autoDistribution.totalDistributed}`);
      
      // Display category breakdown
      result.data.autoDistribution.categories.forEach(cat => {
        if (cat.amount > 0) {
          console.log(`${cat.category}: +ZAR ${cat.amount} (Balance: ZAR ${cat.newBalance})`);
        }
      });
    }
  } catch (error) {
    console.error('Transfer failed:', error);
  }
};
```

### **2. Transfer to Specific Category**

```javascript
const transferToCategory = async (beneficiaryId, category, amount) => {
  try {
    const response = await fetch('/api/funder/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        beneficiaryUserId: beneficiaryId,
        accountType: category,  // e.g., 'Healthcare', 'Education'
        amount: amount,
        currency: 'ZAR',
        description: `Direct ${category} support`
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Show direct transfer success
      console.log(`Direct transfer to ${category} successful!`);
      console.log(`New ${category} balance: ZAR ${result.data.beneficiary.newBalance}`);
      // Note: autoDistribution will be null for direct transfers
    }
  } catch (error) {
    console.error('Transfer failed:', error);
  }
};
```

### **3. Load Beneficiaries with Account Info**

```javascript
const loadBeneficiaries = async () => {
  try {
    const response = await fetch('/api/funder/beneficiaries', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data.map(beneficiary => ({
        ...beneficiary,
        // Group accounts by type for UI
        mainAccount: beneficiary.accounts.find(acc => acc.accountType === 'Main'),
        categoryAccounts: beneficiary.accounts.filter(acc => acc.accountType !== 'Main')
      }));
    }
  } catch (error) {
    console.error('Failed to load beneficiaries:', error);
  }
};
```

---

## 🎨 **UI/UX Recommendations**

### **Transfer Form Design:**

1. **Beneficiary Selection**
   ```
   👤 Select Beneficiary: [Dropdown: Emma Johnson, Mike Johnson]
   ```

2. **Transfer Type Selection** 
   ```
   🎯 Transfer Type:
   ○ General Support (Auto-budget across priorities)
   ○ Specific Need (Choose category)
   ```

3. **Category Selection** (if specific need selected)
   ```
   📂 Category: [Dropdown: Healthcare, Education, Groceries...]
   ```

4. **Amount Input**
   ```
   💰 Amount: ZAR [_______] 
   Available Balance: ZAR 1,500
   ```

### **Success Feedback:**

#### **For Auto-Distribution:**
```
✅ Transfer Successful!
ZAR 100 sent to Emma Johnson

🧠 Smart Distribution Applied:
├── Healthcare: ZAR 25 (25%)
├── Education: ZAR 20 (20%) 
├── Groceries: ZAR 20 (20%)
└── 6 more categories...

📄 Reference: TRF-1761640052046
```

#### **For Direct Transfer:**
```
✅ Transfer Successful!
ZAR 50 sent directly to Emma's Healthcare

💳 New Healthcare Balance: ZAR 125

📄 Reference: TRF-1761640064853
```

---

## 🚨 **Error Handling**

### **Common Error Scenarios:**

1. **Validation Errors** → Show field-specific messages
2. **Insufficient Funds** → Show available balance vs requested
3. **Network Errors** → Retry mechanism with user feedback
4. **Authorization Errors** → Redirect to login

### **Error Display Example:**
```javascript
if (!result.success) {
  if (result.errors) {
    // Show validation errors
    result.errors.forEach(error => {
      showFieldError(error.field, error.message);
    });
  } else {
    // Show general error
    showErrorMessage(result.message);
  }
}
```

---

## 🔍 **Testing Your Integration**

### **Test Scenarios:**

1. **✅ Main Account Transfer**
   - Send ZAR 100 to Main account
   - Verify auto-distribution response
   - Check category balances updated

2. **✅ Direct Healthcare Transfer** 
   - Send ZAR 50 to Healthcare
   - Verify no auto-distribution
   - Check direct balance update

3. **❌ Insufficient Funds**
   - Try transfer > available balance
   - Verify error handling

4. **❌ Invalid Beneficiary**
   - Try transfer to non-existent user
   - Verify authorization error

---

## 📱 **Mobile Considerations**

- **Offline Support** → Cache beneficiary list
- **Touch Optimization** → Large buttons for amount/category selection
- **Quick Actions** → Common transfer amounts (ZAR 50, 100, 200)
- **Biometric Auth** → For transfer confirmation
- **Push Notifications** → Transfer success/failure alerts

---

## 🔒 **Security Notes**

- **Always validate JWT token** before API calls
- **Use HTTPS** for all requests
- **Implement request timeouts** (30 seconds recommended)
- **Store sensitive data securely** (keychain/secure storage)
- **Log errors** but not sensitive information

---

## 📞 **Support**

For integration questions or issues:
- **Backend Team:** Review API logs for detailed error information
- **Database:** All transactions logged with references
- **Testing:** Use test accounts for safe development

---

**Status: ✅ Production Ready**
**Last Updated:** October 28, 2025
**API Version:** 1.0