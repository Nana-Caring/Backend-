# Payment Methods API Documentation

## Overview
Funders can add and manage both bank accounts and credit/debit cards as payment methods. The system supports the exact form fields you specified and provides secure handling of payment information.

## Form Fields

### Bank Account Fields
```
Bank Name *              → bankName (required)
Account Number *         → accountNumber (required)
Account Name            → accountName (required)
Account Type            → accountType (checking/savings)
Routing Number          → routingNumber (optional)
```

### Card Fields
```
Card Number             → cardNumber (required for cards)
Expiry Date (MM/YY)     → expiryDate (required for cards)
CCV                     → ccv (required for cards, not stored)
Account Name            → accountName (required)
```

## API Endpoints

### 1. Add Payment Method (Bank Account or Card)
```
POST /api/bank-accounts/add
```

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body for Bank Account:**
```json
{
  "accountName": "John Doe",
  "bankName": "Standard Bank",
  "accountNumber": "1234567890",
  "accountType": "checking",
  "routingNumber": "051000017"
}
```

**Request Body for Card:**
```json
{
  "accountName": "John Doe",
  "accountType": "card",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "ccv": "123"
}
```

**Success Response:**
```json
{
  "message": "Bank account added successfully",
  "bankAccount": {
    "id": "uuid-here",
    "accountName": "John Doe",
    "bankName": "Standard Bank",
    "accountNumber": "****7890",
    "accountType": "checking",
    "isDefault": true,
    "verificationStatus": "pending",
    "createdAt": "2025-07-03T10:30:00.000Z",
    "type": "bank_account"
  }
}
```

**Card Response:**
```json
{
  "message": "Card added successfully",
  "bankAccount": {
    "id": "uuid-here",
    "accountName": "John Doe",
    "bankName": "Card Payment",
    "cardNumber": "****1111",
    "expiryDate": "12/25",
    "accountType": "card",
    "isDefault": false,
    "verificationStatus": "pending",
    "createdAt": "2025-07-03T10:30:00.000Z",
    "type": "card"
  }
}
```

### 2. Get All Payment Methods
```
GET /api/bank-accounts
```

**Response:**
```json
{
  "paymentMethods": [
    {
      "id": "uuid-1",
      "accountName": "John Doe",
      "bankName": "Standard Bank",
      "accountNumber": "****7890",
      "accountType": "checking",
      "isDefault": true,
      "verificationStatus": "pending",
      "createdAt": "2025-07-03T10:30:00.000Z",
      "type": "bank_account"
    },
    {
      "id": "uuid-2",
      "accountName": "John Doe",
      "bankName": "Card Payment",
      "cardNumber": "****1111",
      "expiryDate": "12/25",
      "accountType": "card",
      "isDefault": false,
      "verificationStatus": "pending",
      "createdAt": "2025-07-03T10:35:00.000Z",
      "type": "card"
    }
  ],
  "total": 2
}
```

### 3. Set Default Payment Method
```
PUT /api/bank-accounts/{paymentMethodId}/default
```

### 4. Delete Payment Method
```
DELETE /api/bank-accounts/{paymentMethodId}
```

### 5. Create Payment Intent with Selected Method
```
POST /api/bank-accounts/payment-intent
```

**Request Body:**
```json
{
  "amount": 1000,
  "accountNumber": "1234567890",
  "accountType": "Main",
  "bankAccountId": "uuid-here"
}
```

## Frontend Integration Guide

### HTML Form Example
```html
<form id="paymentMethodForm">
  <!-- Payment Type Selection -->
  <div>
    <input type="radio" id="bankAccount" name="paymentType" value="bank" checked>
    <label for="bankAccount">Bank Account</label>
    
    <input type="radio" id="card" name="paymentType" value="card">
    <label for="card">Credit/Debit Card</label>
  </div>

  <!-- Common Fields -->
  <div>
    <label for="accountName">Account Name *</label>
    <input type="text" id="accountName" name="accountName" required 
           placeholder="Enter account holder name">
  </div>

  <!-- Bank Account Fields -->
  <div id="bankFields">
    <div>
      <label for="bankName">Bank Name *</label>
      <input type="text" id="bankName" name="bankName" 
             placeholder="Enter bank name">
    </div>
    
    <div>
      <label for="accountNumber">Account Number *</label>
      <input type="text" id="accountNumber" name="accountNumber" 
             placeholder="Enter account number">
    </div>
    
    <div>
      <label for="accountType">Account Type</label>
      <select id="accountType" name="accountType">
        <option value="checking">Checking</option>
        <option value="savings">Savings</option>
      </select>
    </div>
    
    <div>
      <label for="routingNumber">Routing Number</label>
      <input type="text" id="routingNumber" name="routingNumber" 
             placeholder="Enter routing number">
    </div>
  </div>

  <!-- Card Fields -->
  <div id="cardFields" style="display: none;">
    <div>
      <label for="cardNumber">Card Number *</label>
      <input type="text" id="cardNumber" name="cardNumber" 
             placeholder="Enter card number" maxlength="19">
    </div>
    
    <div>
      <label for="expiryDate">Expiry Date *</label>
      <input type="text" id="expiryDate" name="expiryDate" 
             placeholder="MM/YY" maxlength="5">
    </div>
    
    <div>
      <label for="ccv">CCV *</label>
      <input type="text" id="ccv" name="ccv" 
             placeholder="123" maxlength="4">
    </div>
  </div>

  <button type="submit">Add Payment Method</button>
</form>
```

### JavaScript Form Handling
```javascript
// Toggle between bank account and card fields
document.querySelectorAll('input[name="paymentType"]').forEach(radio => {
  radio.addEventListener('change', function() {
    const bankFields = document.getElementById('bankFields');
    const cardFields = document.getElementById('cardFields');
    
    if (this.value === 'bank') {
      bankFields.style.display = 'block';
      cardFields.style.display = 'none';
      
      // Make bank fields required
      document.getElementById('bankName').required = true;
      document.getElementById('accountNumber').required = true;
      
      // Remove card field requirements
      document.getElementById('cardNumber').required = false;
      document.getElementById('expiryDate').required = false;
      document.getElementById('ccv').required = false;
    } else {
      bankFields.style.display = 'none';
      cardFields.style.display = 'block';
      
      // Remove bank field requirements
      document.getElementById('bankName').required = false;
      document.getElementById('accountNumber').required = false;
      
      // Make card fields required
      document.getElementById('cardNumber').required = true;
      document.getElementById('expiryDate').required = true;
      document.getElementById('ccv').required = true;
    }
  });
});

// Format card number with spaces
document.getElementById('cardNumber').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  e.target.value = formattedValue;
});

// Format expiry date
document.getElementById('expiryDate').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  e.target.value = value;
});

// Form submission
document.getElementById('paymentMethodForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const paymentType = formData.get('paymentType');
  
  const requestBody = {
    accountName: formData.get('accountName')
  };
  
  if (paymentType === 'bank') {
    requestBody.bankName = formData.get('bankName');
    requestBody.accountNumber = formData.get('accountNumber');
    requestBody.accountType = formData.get('accountType');
    requestBody.routingNumber = formData.get('routingNumber');
  } else {
    requestBody.accountType = 'card';
    requestBody.cardNumber = formData.get('cardNumber').replace(/\s/g, '');
    requestBody.expiryDate = formData.get('expiryDate');
    requestBody.ccv = formData.get('ccv');
  }
  
  try {
    const response = await fetch('/api/bank-accounts/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getJWTToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('Payment method added successfully!');
      loadPaymentMethods(); // Refresh the list
      e.target.reset(); // Clear form
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Network error: ' + error.message);
  }
});

// Load payment methods list
async function loadPaymentMethods() {
  try {
    const response = await fetch('/api/bank-accounts', {
      headers: {
        'Authorization': `Bearer ${getJWTToken()}`
      }
    });
    
    const data = await response.json();
    
    const container = document.getElementById('paymentMethodsList');
    container.innerHTML = '';
    
    data.paymentMethods.forEach(method => {
      const methodDiv = document.createElement('div');
      methodDiv.className = 'payment-method-item';
      
      let displayText = '';
      if (method.type === 'card') {
        displayText = `Card ending in ${method.cardNumber} (${method.expiryDate})`;
      } else {
        displayText = `${method.bankName} - ${method.accountNumber}`;
      }
      
      methodDiv.innerHTML = `
        <div class="method-info">
          <strong>${method.accountName}</strong><br>
          ${displayText}
          ${method.isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        <div class="method-actions">
          <button onclick="setDefault('${method.id}')" ${method.isDefault ? 'disabled' : ''}>
            Set Default
          </button>
          <button onclick="deleteMethod('${method.id}')" class="delete-btn">
            Delete
          </button>
        </div>
      `;
      
      container.appendChild(methodDiv);
    });
  } catch (error) {
    console.error('Error loading payment methods:', error);
  }
}

// Set default payment method
async function setDefault(methodId) {
  try {
    const response = await fetch(`/api/bank-accounts/${methodId}/default`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getJWTToken()}`
      }
    });
    
    if (response.ok) {
      alert('Default payment method updated!');
      loadPaymentMethods();
    } else {
      const error = await response.json();
      alert('Error: ' + error.error);
    }
  } catch (error) {
    alert('Network error: ' + error.message);
  }
}

// Delete payment method
async function deleteMethod(methodId) {
  if (confirm('Are you sure you want to delete this payment method?')) {
    try {
      const response = await fetch(`/api/bank-accounts/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getJWTToken()}`
        }
      });
      
      if (response.ok) {
        alert('Payment method deleted!');
        loadPaymentMethods();
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  }
}

// Helper function to get JWT token
function getJWTToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Load payment methods on page load
document.addEventListener('DOMContentLoaded', loadPaymentMethods);
```

### CSS Styling
```css
.payment-method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
}

.method-info strong {
  color: #333;
}

.default-badge {
  background-color: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 10px;
}

.method-actions button {
  margin-left: 10px;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.method-actions button:first-child {
  background-color: #007bff;
  color: white;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.method-actions button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
```

## Testing Commands

### PowerShell Test Script
```powershell
# Get authentication token
$loginBody = @{ email = "funder@example.com"; password = "Password123!" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# Test 1: Add bank account
$bankAccountBody = @{
    accountName = "John Doe"
    bankName = "Standard Bank"
    accountNumber = "1234567890"
    accountType = "checking"
    routingNumber = "051000017"
} | ConvertTo-Json

$bankResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts/add" -Method Post -Headers $headers -Body $bankAccountBody
Write-Host "Bank account added: $($bankResponse.bankAccount.id)"

# Test 2: Add card
$cardBody = @{
    accountName = "John Doe"
    accountType = "card"
    cardNumber = "4111111111111111"
    expiryDate = "12/25"
    ccv = "123"
} | ConvertTo-Json

$cardResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts/add" -Method Post -Headers $headers -Body $cardBody
Write-Host "Card added: $($cardResponse.bankAccount.id)"

# Test 3: Get all payment methods
$methods = Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts" -Method Get -Headers $headers
Write-Host "Total payment methods: $($methods.total)"
$methods.paymentMethods | Format-Table

# Test 4: Set default
$methodId = $methods.paymentMethods[0].id
Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts/$methodId/default" -Method Put -Headers $headers
Write-Host "Set $methodId as default"
```

## Security Features

### Data Protection
- **Masking**: Account numbers show only last 4 digits (****7890)
- **Card Security**: Card numbers show only last 4 digits (****1111)
- **CCV Handling**: CCV codes are not stored in the database
- **Encryption**: Consider encrypting sensitive data at rest

### Validation
- **Bank Account**: Validates bank name and account number
- **Card**: Validates card number, expiry date format (MM/YY), and CCV
- **Duplicates**: Prevents duplicate payment methods per user
- **Role Check**: Only funders can manage payment methods

### Error Handling
- **400**: Missing required fields or invalid format
- **401**: Invalid authentication
- **403**: Non-funder access attempt
- **409**: Duplicate payment method
- **500**: Server or database errors

Your payment methods system is now ready with support for both bank accounts and credit/debit cards using the exact form fields you specified! 💳🏦
