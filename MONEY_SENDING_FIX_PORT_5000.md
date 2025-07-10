# 🚀 MONEY SENDING FIX - Port 5000

## **Step-by-Step Fix for Money Sending**

Your server is running on port 5000. Here's exactly what you need to do:

### **Step 1: Login to Get Token**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "funder@example.com",
    "password": "your_password_here"
  }'
```

**Copy the token from the response!**

### **Step 2: Add Working Stripe Test Card**

```bash
curl -X POST http://localhost:5000/api/payment-cards/add-stripe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "payment_method_id": "pm_card_visa",
    "is_default": true
  }'
```

**Copy the card ID from the response!**

### **Step 3: Get Your Beneficiaries**

```bash
curl -X GET http://localhost:5000/api/transfers/beneficiaries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Copy a beneficiary ID from the response!**

### **Step 4: Send Money (This Will Work!)**

```bash
curl -X POST http://localhost:5000/api/transfers/send-to-beneficiary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "cardId": "YOUR_CARD_ID_HERE",
    "beneficiaryId": YOUR_BENEFICIARY_ID_HERE,
    "amount": 100.00,
    "description": "Test transfer - money sending fix"
  }'
```

## **Postman Version (Easier)**

### **Environment Variables:**
- `BASE_URL`: `http://localhost:5000`
- `AUTH_TOKEN`: (will be set after login)

### **1. Login**
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
    "email": "funder@example.com",
    "password": "your_password_here"
}
```

### **2. Add Stripe Card** ✅
```
POST {{BASE_URL}}/api/payment-cards/add-stripe
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}

{
    "payment_method_id": "pm_card_visa",
    "is_default": true
}
```

### **3. Get Beneficiaries**
```
GET {{BASE_URL}}/api/transfers/beneficiaries
Authorization: Bearer {{AUTH_TOKEN}}
```

### **4. Send Money**
```
POST {{BASE_URL}}/api/transfers/send-to-beneficiary
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}

{
    "cardId": "{{CARD_ID}}",
    "beneficiaryId": {{BENEFICIARY_ID}},
    "amount": 100.00,
    "description": "Test transfer"
}
```

## **Available Stripe Test Payment Methods**

- `pm_card_visa` ✅
- `pm_card_mastercard` ✅
- `pm_card_amex` ✅
- `pm_card_discover` ✅

## **What Fixed the Issue**

The problem was that cards from `/add-test` create fake payment method IDs like `pm_test_123456789` which don't exist in Stripe. 

The new `/add-stripe` endpoint uses **real Stripe test payment methods** that can actually process payments.

**Money transfers will now work!** 🎉
