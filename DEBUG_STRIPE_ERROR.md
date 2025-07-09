# 🔧 DEBUG: Stripe Payment Method ID Issue

## **The Error You're Getting:**
```json
{
  "message": "Stripe payment method ID is required",
  "example": {
    "payment_method_id": "pm_card_visa",
    "user_id": 9,
    "is_default": true
  }
}
```

## **This means:**
✅ The endpoint `/api/payment-cards/add-stripe` is working
✅ Your authentication is working (user_id: 9)
❌ The request body is missing `payment_method_id`

## **❌ WRONG ENDPOINT/FORMAT COMBINATION:**

**You're sending card details to the Stripe endpoint:**
```
POST /api/payment-cards/add-stripe
{
  "bankName": "FNB",
  "cardNumber": "4242424242424242",
  "expiryDate": "08/26",
  "ccv": "456",
  "nickname": "FNB Business Card",
  "isDefault": false
}
```

**This won't work!** Different endpoints expect different formats.

## **✅ CORRECT FORMAT OPTIONS:**

### **Option 1: Use Stripe Endpoint (RECOMMENDED for transfers)**
```
POST /api/payment-cards/add-stripe
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "payment_method_id": "pm_card_visa",
  "is_default": false
}
```

### **Option 2: Use Card Details Endpoint (UI testing only)**
```
POST /api/payment-cards/add
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "bankName": "FNB",
  "cardNumber": "4242424242424242",
  "expiryDate": "08/26",
  "ccv": "456",
  "nickname": "FNB Business Card",
  "isDefault": false
}
```

**Note:** Option 2 cards **cannot be used for money transfers** - they'll give the Stripe error.

## **✅ CORRECT REQUEST FORMAT:**

### **cURL (Windows):**
```bash
curl -X POST http://localhost:5000/api/payment-cards/add-stripe ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"payment_method_id\":\"pm_card_visa\",\"is_default\":true}"
```

### **PowerShell:**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

$body = @{
    payment_method_id = "pm_card_visa"
    is_default = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/payment-cards/add-stripe" -Method POST -Headers $headers -Body $body
```

### **Postman:**
```
Method: POST
URL: http://localhost:5000/api/payment-cards/add-stripe

Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN_HERE

Body (raw JSON):
{
    "payment_method_id": "pm_card_visa",
    "is_default": true
}
```

## **🧪 QUICK TEST - Copy & Paste:**

**Step 1: Get Token First**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
    "email": "your_email_here",
    "password": "your_password_here"
}
```

**Step 2: Use Token in Card Request**
```
POST http://localhost:5000/api/payment-cards/add-stripe
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "payment_method_id": "pm_card_visa",
    "is_default": true
}
```

## **🔍 DEBUGGING CHECKLIST:**

- [ ] Using POST method?
- [ ] Correct URL: `/api/payment-cards/add-stripe`?
- [ ] Content-Type header set to `application/json`?
- [ ] Authorization header with valid Bearer token?
- [ ] Body format is raw JSON (not form data)?
- [ ] Field name exactly: `payment_method_id`?
- [ ] Valid token (not expired)?

## **🎯 QUICK FIX FOR YOUR SPECIFIC CASE:**

**What you sent:**
```json
{
  "bankName": "FNB",
  "cardNumber": "4242424242424242",
  "expiryDate": "08/26",
  "ccv": "456",
  "nickname": "FNB Business Card",
  "isDefault": false
}
```

**Fix #1: Change endpoint to `/add` (keeps your format):**
```
POST http://localhost:5000/api/payment-cards/add
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "bankName": "FNB",
  "cardNumber": "4242424242424242",
  "expiryDate": "08/26",
  "ccv": "456",
  "nickname": "FNB Business Card",
  "isDefault": false
}
```

**Fix #2: Change body to Stripe format (for transfers):**
```
POST http://localhost:5000/api/payment-cards/add-stripe
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "payment_method_id": "pm_card_visa",
  "is_default": false
}
```

## **💡 RECOMMENDATION:**
Use **Fix #2** if you want to test money transfers later!
