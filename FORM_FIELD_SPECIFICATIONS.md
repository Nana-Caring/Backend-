# Form Field Specifications for Payment Methods

## Overview
This document outlines the exact form fields used for funder payment method management, matching your specified requirements for Bank Name, Account Number, Card Number, Expiry Date (MM/YY), and CCV.

## Form Field Specifications

### Bank Account Form Fields

| Form Label | Backend Field | Required | Type | Validation |
|------------|---------------|----------|------|------------|
| **Bank Name** | `bankName` | ✅ Yes | String | Must not be empty |
| **Account Number** | `accountNumber` | ✅ Yes | String | Must not be empty |
| Account Name | `accountName` | ✅ Yes | String | Account holder name |
| Account Type | `accountType` | No | Enum | checking/savings (default: checking) |
| Routing Number | `routingNumber` | No | String | Optional routing number |

### Card Form Fields

| Form Label | Backend Field | Required | Type | Validation |
|------------|---------------|----------|------|------------|
| **Card Number** | `cardNumber` | ✅ Yes | String | Must not be empty for cards |
| **Expiry Date (MM/YY)** | `expiryDate` | ✅ Yes | String | Must match MM/YY format |
| **CCV** | `ccv` | ✅ Yes | String | Required for validation (not stored) |
| Account Name | `accountName` | ✅ Yes | String | Card holder name |

## API Request Examples

### Adding a Bank Account
```http
POST /api/bank-accounts/add
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "accountName": "John Doe",
  "bankName": "Standard Bank",
  "accountNumber": "1234567890",
  "accountType": "checking",
  "routingNumber": "051000017"
}
```

### Adding a Card
```http
POST /api/bank-accounts/add
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "accountName": "John Doe",
  "accountType": "card",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "ccv": "123"
}
```

## Form Validation Rules

### Bank Account Validation
- **Bank Name**: Required, must be non-empty string
- **Account Number**: Required, must be non-empty string
- **Account Name**: Required, must be non-empty string
- **Account Type**: Optional, defaults to "checking", accepts "checking" or "savings"
- **Routing Number**: Optional string

### Card Validation
- **Card Number**: Required for cards, must be non-empty string
- **Expiry Date (MM/YY)**: Required for cards, must match regex pattern `^\d{2}/\d{2}$`
- **CCV**: Required for cards, must be non-empty string (not stored in database)
- **Account Name**: Required, must be non-empty string
- **Account Type**: Automatically set to "card" for card payments

## Security Features

### Data Protection
- **Account Numbers**: Only last 4 digits stored/displayed (`****7890`)
- **Card Numbers**: Only last 4 digits stored/displayed (`****1111`)
- **CCV Codes**: Never stored in database, used only for validation
- **Unique Constraints**: Prevent duplicate payment methods per user

### Response Format
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

## Frontend Form Implementation

### HTML Form Structure
```html
<!-- Bank Account Form -->
<form id="bankAccountForm">
  <input type="text" name="accountName" placeholder="Account Name" required>
  <input type="text" name="bankName" placeholder="Bank Name" required>
  <input type="text" name="accountNumber" placeholder="Account Number" required>
  <select name="accountType">
    <option value="checking">Checking</option>
    <option value="savings">Savings</option>
  </select>
  <input type="text" name="routingNumber" placeholder="Routing Number">
  <button type="submit">Add Bank Account</button>
</form>

<!-- Card Form -->
<form id="cardForm">
  <input type="text" name="accountName" placeholder="Account Name" required>
  <input type="text" name="cardNumber" placeholder="Card Number" required>
  <input type="text" name="expiryDate" placeholder="MM/YY" pattern="\d{2}/\d{2}" required>
  <input type="text" name="ccv" placeholder="CCV" required>
  <input type="hidden" name="accountType" value="card">
  <button type="submit">Add Card</button>
</form>
```

### JavaScript Form Handling
```javascript
// Bank Account Form
document.getElementById('bankAccountForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const payload = {
    accountName: formData.get('accountName'),
    bankName: formData.get('bankName'),
    accountNumber: formData.get('accountNumber'),
    accountType: formData.get('accountType'),
    routingNumber: formData.get('routingNumber')
  };
  
  try {
    const response = await fetch('/api/bank-accounts/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('Bank account added:', result);
  } catch (error) {
    console.error('Error adding bank account:', error);
  }
});

// Card Form
document.getElementById('cardForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const payload = {
    accountName: formData.get('accountName'),
    accountType: 'card',
    cardNumber: formData.get('cardNumber'),
    expiryDate: formData.get('expiryDate'),
    ccv: formData.get('ccv')
  };
  
  try {
    const response = await fetch('/api/bank-accounts/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('Card added:', result);
  } catch (error) {
    console.error('Error adding card:', error);
  }
});
```

## PowerShell Test Commands

### Setup Authentication
```powershell
# Login and get token
$loginBody = @{ email = "funder@example.com"; password = "Password123!" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
```

### Test Bank Account
```powershell
# Add bank account
$bankAccountBody = @{
    accountName = "John Doe"
    bankName = "Standard Bank"
    accountNumber = "1234567890"
    accountType = "checking"
    routingNumber = "051000017"
} | ConvertTo-Json

$addResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts/add" -Method Post -Headers $headers -Body $bankAccountBody
Write-Host "Bank account added: $($addResponse.bankAccount.id)"
```

### Test Card
```powershell
# Add card
$cardBody = @{
    accountName = "John Doe"
    accountType = "card"
    cardNumber = "4111111111111111"
    expiryDate = "12/25"
    ccv = "123"
} | ConvertTo-Json

$addCardResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts/add" -Method Post -Headers $headers -Body $cardBody
Write-Host "Card added: $($addCardResponse.bankAccount.id)"
```

## Summary

✅ **All Required Fields Implemented:**
- Bank Name → `bankName`
- Account Number → `accountNumber`
- Card Number → `cardNumber`
- Expiry Date (MM/YY) → `expiryDate`
- CCV → `ccv`

✅ **Security Features:**
- Account numbers masked in responses
- Card numbers masked in responses
- CCV codes never stored
- Unique constraints prevent duplicates
- Soft delete for payment methods

✅ **Validation Rules:**
- Required field validation
- Format validation for expiry dates
- Type-specific validation logic
- Unique constraint validation

The system is fully implemented and ready for use with the exact field names you specified.
