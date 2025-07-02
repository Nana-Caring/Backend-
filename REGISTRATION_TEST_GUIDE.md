# Test Dependent Registration Endpoint

## 🧪 Testing the Fixed Registration

The issue with the Account ID constraint has been resolved! The Account model now properly uses UUID for the primary key, which matches the database schema.

### ✅ What Was Fixed:
1. **Account Model**: Updated to use `UUID` instead of `INTEGER` for the primary key
2. **UUID Generation**: Proper `UUIDV4` default value for auto-generation
3. **Parent Account References**: Updated to use UUID type for consistency
4. **Import Issues**: Fixed utility function imports

### 🚀 Test the Registration Endpoint

#### Method 1: Using curl (PowerShell)
```powershell
# Make sure your server is running first
# Then run this command:

$body = @{
    firstName = "Emily"
    middleName = "Rose"
    surname = "Johnson"
    email = "emily.johnson@example.com"
    password = "DependentPass123!"
    Idnumber = "0512345678902"
    relation = "daughter"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register-dependent" -Method Post -Body $body -ContentType "application/json"
```

#### Method 2: Using curl (if available)
```bash
curl -X POST http://localhost:5000/api/auth/register-dependent \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Emily",
    "middleName": "Rose",
    "surname": "Johnson",
    "email": "emily.johnson@example.com",
    "password": "DependentPass123!",
    "Idnumber": "0512345678902",
    "relation": "daughter"
  }'
```

#### Method 3: Using Postman
1. **URL**: `POST http://localhost:5000/api/auth/register-dependent`
2. **Headers**: `Content-Type: application/json`
3. **Body** (raw JSON):
```json
{
  "firstName": "Emily",
  "middleName": "Rose",
  "surname": "Johnson",
  "email": "emily.johnson@example.com",
  "password": "DependentPass123!",
  "Idnumber": "0512345678902",
  "relation": "daughter"
}
```

### 📋 Expected Response:
```json
{
  "message": "Dependent registered successfully",
  "dependent": {
    "id": 32,
    "firstName": "Emily",
    "middleName": "Rose",
    "surname": "Johnson",
    "email": "emily.johnson@example.com",
    "Idnumber": "0512345678902",
    "relation": "daughter",
    "role": "dependent",
    "phoneNumber": null,
    "postalAddressLine1": null,
    "postalAddressLine2": null,
    "postalCity": null,
    "postalProvince": null,
    "postalCode": null,
    "homeAddressLine1": null,
    "homeAddressLine2": null,
    "homeCity": null,
    "homeProvince": null,
    "homeCode": null,
    "isBlocked": false,
    "blockedAt": null,
    "blockedBy": null,
    "blockReason": null,
    "status": "active",
    "createdAt": "2025-07-02T19:xx:xx.xxxZ",
    "updatedAt": "2025-07-02T19:xx:xx.xxxZ",
    "accounts": [
      {
        "id": "uuid-string",
        "userId": 32,
        "accountType": "Main",
        "accountNumber": "1234567890",
        "balance": 0,
        "currency": "ZAR",
        "status": "active",
        "parentAccountId": null,
        "createdAt": "2025-07-02T19:xx:xx.xxxZ",
        "updatedAt": "2025-07-02T19:xx:xx.xxxZ"
      },
      {
        "id": "uuid-string",
        "userId": 32,
        "accountType": "Education",
        "accountNumber": "0987654321",
        "balance": 0,
        "currency": "ZAR",
        "status": "active",
        "parentAccountId": "main-account-uuid",
        "createdAt": "2025-07-02T19:xx:xx.xxxZ",
        "updatedAt": "2025-07-02T19:xx:xx.xxxZ"
      }
      // ... other sub-accounts (Healthcare, Clothing, Entertainment, Baby Care, Pregnancy, Savings)
    ]
  }
}
```

### 🎯 What Happens During Registration:
1. **User Creation**: Creates a new dependent user with role 'dependent'
2. **Personal Details**: All personal detail fields are set to null (to be filled later)
3. **Main Account**: Creates a main account with a unique account number
4. **Sub-Accounts**: Creates 7 sub-accounts (Education, Healthcare, Clothing, Entertainment, Baby Care, Pregnancy, Savings)
5. **Account Hierarchy**: Sub-accounts are linked to the main account via parentAccountId
6. **Initial Balance**: All accounts start with 0 balance
7. **Currency**: All accounts use ZAR (South African Rand)

### 🔒 Security Features:
- Password is properly hashed using bcrypt
- User status is set to 'active' by default
- All blocking fields are set to null (not blocked)
- Personal details are null until user edits them

### 📊 Accounts Created:
- **1 Main Account**: Primary account for the dependent
- **7 Sub-Accounts**: 
  - Education
  - Healthcare  
  - Clothing
  - Entertainment
  - Baby Care
  - Pregnancy
  - Savings

### 🧪 Validation:
The registration endpoint validates:
- Required fields (firstName, surname, email, password, Idnumber, relation)
- Email format and uniqueness
- Password strength (should be strong enough)
- ID number format and uniqueness

**Note**: After successful registration, the dependent can:
1. Login using their email and password
2. Access their accounts via `/api/accounts/dependent/my-accounts`
3. Update their profile with personal details
4. View account balances and transactions
