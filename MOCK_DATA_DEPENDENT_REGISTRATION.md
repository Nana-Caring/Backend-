# Mock Data for Registering Dependents

## 📋 Registration Options

There are two ways to register a dependent:

### 1. Direct Registration (as caregiver first, then dependent)
### 2. Caregiver-initiated Dependent Registration

---

## 🧑‍🤝‍🧑 Option 1: Register Caregiver First, Then Dependent

### Step 1: Register a Caregiver

**Endpoint:** `POST /api/auth/register`
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Mock Data for Caregiver:**
```json
{
  "firstName": "Sarah",
  "middleName": "Jane",
  "surname": "Williams",
  "email": "sarah.williams@example.com",
  "password": "SecurePass123!",
  "role": "caregiver",
  "Idnumber": "9012345678901"
}
```

### Step 2: Register Dependent (Requires Caregiver JWT Token)

**Endpoint:** `POST /api/auth/register-dependent`
**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <caregiver_jwt_token>"
}
```

**Mock Data for Dependent:**
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

---

## 🧑‍🍼 Option 2: Complete Mock Data Examples

### Multiple Dependent Examples

#### Dependent 1 - Young Child
```json
{
  "firstName": "Michael",
  "middleName": "David",
  "surname": "Thompson",
  "email": "michael.thompson@example.com",
  "password": "ChildPass123!",
  "Idnumber": "1510230123456",
  "relation": "son"
}
```

#### Dependent 2 - Teenager
```json
{
  "firstName": "Sophia",
  "middleName": null,
  "surname": "Davis",
  "email": "sophia.davis@example.com",
  "password": "TeenPass123!",
  "Idnumber": "0703456789012",
  "relation": "daughter"
}
```

#### Dependent 3 - Elderly Parent
```json
{
  "firstName": "Robert",
  "middleName": "James",
  "surname": "Wilson",
  "email": "robert.wilson@example.com",
  "password": "ElderPass123!",
  "Idnumber": "5408123456789",
  "relation": "father"
}
```

#### Dependent 4 - Sibling
```json
{
  "firstName": "Jessica",
  "middleName": "Marie",
  "surname": "Brown",
  "email": "jessica.brown@example.com",
  "password": "SiblingPass123!",
  "Idnumber": "9201234567890",
  "relation": "sister"
}
```

---

## 📝 Field Specifications

### Required Fields
- `firstName` (string, required)
- `surname` (string, required) 
- `email` (string, required, must be unique, valid email format)
- `password` (string, required, minimum 6 characters)
- `Idnumber` (string, required, exactly 13 digits, must be unique)
- `relation` (string, required for dependents)

### Optional Fields
- `middleName` (string, optional, can be null)

### Auto-Generated Fields
When a dependent is registered, the system automatically:
- Sets `role` to "dependent"
- Sets all personal details to `null` (phoneNumber, addresses, etc.)
- Creates a Main account with balance 0
- Creates sub-accounts: Education, Healthcare, Clothing, Entertainment, Baby Care, Pregnancy, Savings
- Generates unique account numbers for all accounts

---

## 🧪 Testing with cURL

### Test Caregiver Registration
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sarah",
    "middleName": "Jane", 
    "surname": "Williams",
    "email": "sarah.williams@example.com",
    "password": "SecurePass123!",
    "role": "caregiver",
    "Idnumber": "9012345678901"
  }'
```

### Test Dependent Registration (Replace JWT token)
```bash
curl -X POST "http://localhost:5000/api/auth/register-dependent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CAREGIVER_JWT_TOKEN_HERE" \
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

---

## ✅ Expected Successful Response

### Caregiver Registration Response
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "firstName": "Sarah",
    "middleName": "Jane",
    "surname": "Williams", 
    "email": "sarah.williams@example.com",
    "role": "caregiver",
    "Idnumber": "9012345678901",
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
    "createdAt": "2025-07-02T10:30:00.000Z",
    "updatedAt": "2025-07-02T10:30:00.000Z"
  }
}
```

### Dependent Registration Response
```json
{
  "message": "Dependent registered successfully",
  "dependent": {
    "id": 2,
    "firstName": "Emily",
    "middleName": "Rose",
    "surname": "Johnson",
    "email": "emily.johnson@example.com",
    "role": "dependent",
    "Idnumber": "0512345678902",
    "relation": "daughter",
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
    "createdAt": "2025-07-02T10:35:00.000Z",
    "updatedAt": "2025-07-02T10:35:00.000Z"
  },
  "accounts": [
    {
      "id": 1,
      "accountNumber": "ACC0012345",
      "accountType": "Main", 
      "balance": 0,
      "parentAccountId": null
    },
    {
      "id": 2,
      "accountNumber": "ACC0012346",
      "accountType": "Education",
      "balance": 0,
      "parentAccountId": 1
    }
    // ... other sub-accounts
  ]
}
```

---

## ❌ Common Error Responses

### Email Already Exists
```json
{
  "message": "Email already exists"
}
```

### ID Number Already Exists
```json
{
  "message": "ID number already exists"
}
```

### Invalid ID Number Format
```json
{
  "message": "Valid 13-digit numeric ID number required"
}
```

### Missing Required Fields
```json
{
  "message": "Required fields are missing"
}
```

### Unauthorized (for dependent registration)
```json
{
  "message": "Access denied. Token required."
}
```

### Wrong Role (for dependent registration)
```json
{
  "message": "Only caregivers can register dependents"
}
```

---

## 🔍 ID Number Format Guidelines

South African ID numbers follow this format: `YYMMDDGGGSCAZ`
- `YYMMDD`: Date of birth (year, month, day)
- `GGG`: Gender (000-499 female, 500-999 male)
- `S`: Citizenship (0=SA citizen, 1=permanent resident)
- `C`: Usually 8 or 9
- `A`: Usually 0-9
- `Z`: Checksum digit

**Example Valid ID Numbers:**
- `9012345678901` (Born 1990-12-34, male)
- `0512345678902` (Born 2005-12-34, male)  
- `1510230123456` (Born 2015-10-23, female)
- `0703456789012` (Born 2007-03-45, male)

---

## 💡 Quick Start Guide

1. **First, register a caregiver:**
   ```bash
   POST /api/auth/register
   ```

2. **Login as caregiver to get JWT token:**
   ```bash
   POST /api/auth/login
   ```

3. **Use the JWT token to register dependents:**
   ```bash
   POST /api/auth/register-dependent
   ```

4. **Verify dependent can access their accounts:**
   ```bash
   GET /api/accounts/dependent/my-accounts
   ```
