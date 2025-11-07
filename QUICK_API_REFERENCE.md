# 📱 Quick API Reference - Funder Transfer System

## 🔥 **Essential Endpoints**

### **🚀 Transfer Money**
```javascript
POST /api/funder/transfer
{
  "beneficiaryUserId": 123,
  "accountType": "Main",        // "Main" = auto-distribute
  "amount": 100,               // "Healthcare", "Education" = direct
  "currency": "ZAR"
}
```

### **👥 Get Dependents** 
```javascript
GET /api/funder/beneficiaries
// Returns: List of dependents with their account balances
```

### **💳 Check Balance**
```javascript
GET /api/funder/balance  
// Returns: Current funder account balance
```

### **📊 Transfer History**
```javascript
GET /api/funder/transfers?limit=10&offset=0
// Returns: Paginated transfer history
```

---

## 🎯 **Account Types**

| Type | Behavior |
|------|----------|
| `"Main"` | 🧠 **Auto-distributes** across categories |
| `"Healthcare"` | 🏥 **Direct** to healthcare account |
| `"Education"` | 📚 **Direct** to education account |
| `"Groceries"` | 🛒 **Direct** to groceries account |
| `"Transport"` | 🚗 **Direct** to transport account |
| `"Entertainment"` | 🎮 **Direct** to entertainment account |
| `"Clothing"` | 👕 **Direct** to clothing account |
| `"Baby Care"` | 👶 **Direct** to baby care account |
| `"Pregnancy"` | 🤱 **Direct** to pregnancy account |

---

## 🧠 **Auto-Distribution Logic**

When sending to **Main account**, money automatically splits:

**🚨 Emergency Fund: 20% stays in Main account for emergencies**
**📊 Category Distribution: 80% split across spending categories**

| Category | % of Transfer | % of Distribution | Priority |
|----------|---------------|-------------------|----------|
| **Emergency Fund** | **20%** | **N/A** | 🟠 **Emergency Access** |
| Healthcare | 20% | 25% | 🔴 Critical |
| Groceries | 16% | 20% | 🔴 Critical |
| Education | 16% | 20% | 🟡 High |
| Transport | 8% | 10% | 🟡 High |
| Pregnancy | 8% | 10% | 🟡 High |
| Entertainment | 4% | 5% | 🟢 Low |
| Clothing | 4% | 5% | 🟢 Low |
| Baby Care | 4% | 5% | 🟢 Low |

---

## ✅ **Success Response Examples**

### **Main Account (Auto-Distribution):**
```javascript
{
  "success": true,
  "data": {
    "transferReference": "TRF-xxx",
    "autoDistribution": {
      "totalDistributed": 100,
      "categories": [
        {"category": "Healthcare", "amount": 25, "newBalance": 75}
        // ... more categories
      ]
    }
  }
}
```

### **Direct Transfer:**
```javascript
{
  "success": true, 
  "data": {
    "transferReference": "TRF-xxx",
    "beneficiary": {
      "accountType": "Healthcare",
      "newBalance": 125
    },
    "autoDistribution": null  // No auto-distribution
  }
}
```

---

## 🚨 **Error Handling**

```javascript
// Always check success flag
if (response.success) {
  // Handle success
} else {
  // Handle errors
  if (response.errors) {
    // Validation errors - show per field
    response.errors.forEach(err => {
      showError(err.field, err.message);
    });
  } else {
    // General error - show message
    showError(response.message);
  }
}
```

---

## 🔐 **Authentication**

```javascript
headers: {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
}
```

---

## 🎨 **UI Flow Suggestions**

1. **Step 1:** Select beneficiary from dropdown
2. **Step 2:** Choose transfer type:
   - 🧠 "General Support" → Main account
   - 🎯 "Specific Need" → Category selection
3. **Step 3:** Enter amount
4. **Step 4:** Show preview with distribution (if Main account)
5. **Step 5:** Confirm transfer
6. **Step 6:** Show success with reference number

---

## 📱 **Quick Implementation**

```javascript
// Main account transfer (auto-distribution)
const sendGeneralSupport = (beneficiaryId, amount) => {
  return fetch('/api/funder/transfer', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      beneficiaryUserId: beneficiaryId,
      accountType: 'Main',  // Triggers auto-distribution
      amount, currency: 'ZAR'
    })
  });
};

// Direct category transfer
const sendToCategory = (beneficiaryId, category, amount) => {
  return fetch('/api/funder/transfer', {
    method: 'POST', 
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      beneficiaryUserId: beneficiaryId,
      accountType: category,  // Direct transfer
      amount, currency: 'ZAR'
    })
  });
};
```

---

## 🎉 **What Users Love**

✅ **Funders get:**
- Choice between auto-budgeting and targeted giving
- Complete transparency on where money goes
- Simple one-click transfers

✅ **Dependents get:**
- Automatic smart budgeting (no work required)
- Priority-based fund allocation 
- Emergency direct access when needed

---

**🚀 Ready to integrate? You've got everything you need!**

*Questions? Check the full FRONTEND_INTEGRATION_GUIDE.md*