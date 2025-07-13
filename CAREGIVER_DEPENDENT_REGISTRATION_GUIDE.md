# 🏥 Complete Guide: Caregiver Dependent Registration & Management Endpoints

## 🎯 Quick Reference - Dependent Registration & Management

### **Registration Endpoints**
| Endpoint | Method | Purpose | Authority |
|----------|--------|---------|-----------|
| `/api/register-dependent` | POST | Register a new dependent | Caregiver only |
| `/api/users/dependents` | POST | Alternative registration route | Caregiver only |

### **Management & Retrieval Endpoints**
| Endpoint | Method | Purpose | Features |
|----------|--------|---------|----------|
| `/api/caregiver/dependents` | GET | Get all assigned dependents | Pagination, search, filtering |
| `/api/caregiver/dependents/:id` | GET | Get specific dependent details | Complete profile & account info |
| `/api/users/dependents` | GET | Get all dependents (general) | Basic dependent information |
| `/api/accounts/caregiver/all-dependents` | GET | Get all dependents' accounts | Account-focused view |

---

## 📋 Detailed Registration Documentation

### 1. **Primary Registration Endpoint** ⭐ **RECOMMENDED**
```http
POST /api/register-dependent
```

**🔑 Authentication**: Bearer token + caregiver role required

**📊 Request Body**:
```json
{
  "firstName": "John",
  "middleName": "David",
  "surname": "Smith", 
  "email": "john.smith@example.com",
  "password": "securePassword123",
  "Idnumber": "9001015678901",
  "relation": "Son"
}
```

**📝 Field Requirements**:
- `firstName` ✅ **Required** - Dependent's first name
- `middleName` ⚠️ **Optional** - Middle name (can be null)
- `surname` ✅ **Required** - Dependent's surname/last name  
- `email` ✅ **Required** - Valid, unique email address
- `password` ✅ **Required** - Login password for dependent
- `Idnumber` ✅ **Required** - 13-digit South African ID number (unique)
- `relation` ✅ **Required** - Relationship to caregiver (e.g., "Son", "Daughter", "Grandchild")

**🎯 What Happens**:
1. ✅ Validates caregiver authentication and role
2. ✅ Validates all required fields and formats
3. ✅ Checks email and ID number uniqueness
4. ✅ Creates dependent user account with `role: 'dependent'`
5. ✅ **Auto-creates 8 accounts for the dependent**:
   - **Main Account** (primary account)
   - **Education** (sub-account)
   - **Healthcare** (sub-account)
   - **Clothing** (sub-account)
   - **Entertainment** (sub-account)
   - **Baby Care** (sub-account)
   - **Pregnancy** (sub-account)
   - **Savings** (sub-account)
6. ✅ Generates unique account numbers for all accounts
7. ✅ Sets up parent-child relationships (sub-accounts linked to main)

**Example Request**:
```bash
POST /api/register-dependent
Authorization: Bearer your_caregiver_token
Content-Type: application/json

{
  "firstName": "Sarah",
  "middleName": "Jane",
  "surname": "Williams",
  "email": "sarah.williams@example.com",
  "password": "MySecurePassword123!",
  "Idnumber": "0005147896321",
  "relation": "Daughter"
}
```

**Success Response**:
```json
{
  "message": "Dependent registered successfully",
  "dependent": {
    "id": 245,
    "firstName": "Sarah",
    "middleName": "Jane",
    "surname": "Williams",
    "email": "sarah.williams@example.com",
    "Idnumber": "0005147896321",
    "relation": "Daughter",
    "role": "dependent",
    "status": "active",
    "isBlocked": false,
    "phoneNumber": null,
    "postalAddressLine1": null,
    "createdAt": "2025-01-16T09:30:00Z",
    "updatedAt": "2025-01-16T09:30:00Z",
    "accounts": [
      {
        "id": "uuid-main-account",
        "accountType": "Main",
        "balance": 0,
        "parentAccountId": null,
        "accountNumber": "1234567890",
        "userId": 245
      },
      {
        "id": "uuid-education-account", 
        "accountType": "Education",
        "balance": 0,
        "parentAccountId": "uuid-main-account",
        "accountNumber": "1234567891",
        "userId": 245
      },
      {
        "id": "uuid-healthcare-account",
        "accountType": "Healthcare", 
        "balance": 0,
        "parentAccountId": "uuid-main-account",
        "accountNumber": "1234567892",
        "userId": 245
      },
      {
        "id": "uuid-clothing-account",
        "accountType": "Clothing",
        "balance": 0,
        "parentAccountId": "uuid-main-account", 
        "accountNumber": "1234567893",
        "userId": 245
      },
      {
        "id": "uuid-entertainment-account",
        "accountType": "Entertainment",
        "balance": 0,
        "parentAccountId": "uuid-main-account",
        "accountNumber": "1234567894", 
        "userId": 245
      },
      {
        "id": "uuid-babycare-account",
        "accountType": "Baby Care",
        "balance": 0,
        "parentAccountId": "uuid-main-account",
        "accountNumber": "1234567895",
        "userId": 245
      },
      {
        "id": "uuid-pregnancy-account",
        "accountType": "Pregnancy", 
        "balance": 0,
        "parentAccountId": "uuid-main-account",
        "accountNumber": "1234567896",
        "userId": 245
      },
      {
        "id": "uuid-savings-account",
        "accountType": "Savings",
        "balance": 0,
        "parentAccountId": "uuid-main-account",
        "accountNumber": "1234567897",
        "userId": 245
      }
    ]
  }
}
```

**Error Responses**:
```json
// Missing required fields
{
  "message": "Required fields are missing"
}

// Invalid email format
{
  "message": "Valid email address required"
}

// Email already exists
{
  "message": "Email already exists"
}

// Invalid ID number format
{
  "message": "Valid 13-digit numeric ID number required"
}

// ID number already exists
{
  "message": "ID number already exists"
}

// Not a caregiver
{
  "message": "Only caregivers can register dependents"
}

// Duplicate email or ID
{
  "message": "Email or ID number already in use"
}
```

---

### 2. **Alternative Registration Route**
```http
POST /api/users/dependents
```

**🔑 Authentication**: Bearer token + caregiver role required

**💡 Note**: This is an alternative route that calls the same `registerDependent` function. Use the primary route (`/api/register-dependent`) for consistency.

---

## 📋 Management & Retrieval Endpoints

### 3. **Get All Assigned Dependents** ⭐ **RECOMMENDED FOR MANAGEMENT**
```http
GET /api/caregiver/dependents
```

**🔑 Authentication**: Bearer token + caregiver role required

**💡 What You Get**:
- All dependents assigned to this caregiver via account assignment
- Complete profiles with account information
- Pagination and search capabilities

**🎯 Use Cases**:
- View all dependents you're managing
- Search through your assigned dependents
- Dashboard overview of dependent accounts

**Note**: This shows dependents based on account assignment (`caregiverId` in accounts), not registration history.

---

### 4. **Get Specific Dependent Details**
```http
GET /api/caregiver/dependents/:dependentId
```

**🔑 Authentication**: Bearer token + caregiver role required

**💡 What You Get**:
- Complete dependent profile including addresses
- Full account details and transaction history
- Account statistics and analytics

**🎯 Use Cases**:
- Detailed view of a specific dependent
- Account management and monitoring
- Transaction history review

---

### 5. **Get All Dependents (General)**
```http
GET /api/users/dependents
```

**🔑 Authentication**: Bearer token + caregiver role required

**💡 What You Get**:
- All dependents in the system (not filtered by assignment)
- Basic user information and account details

**🎯 Use Cases**:
- System-wide dependent overview
- General dependent management
- Administrative purposes

---

### 6. **Get Account-Focused Dependent View**
```http
GET /api/accounts/caregiver/all-dependents
```

**🔑 Authentication**: Bearer token + caregiver role required

**💡 What You Get**:
- Account-centric view of assigned dependents
- Focus on financial information
- Account balances and details

**🎯 Use Cases**:
- Financial management focus
- Account monitoring
- Balance oversight

---

## 🏗️ System Architecture Notes

### **Registration Process Flow**:
1. **Caregiver Authentication** → Verify caregiver role
2. **Data Validation** → Check all required fields and formats
3. **Uniqueness Check** → Verify email and ID number aren't taken
4. **User Creation** → Create dependent user account
5. **Account Creation** → Auto-create 8 accounts (1 main + 7 sub-accounts)
6. **Account Linking** → Set up parent-child relationships
7. **Response** → Return created dependent with all accounts

### **Account Structure Created**:
```
Main Account (Parent)
├── Education (Sub-account)
├── Healthcare (Sub-account) 
├── Clothing (Sub-account)
├── Entertainment (Sub-account)
├── Baby Care (Sub-account)
├── Pregnancy (Sub-account)
└── Savings (Sub-account)
```

### **Important Notes**:
- 🔍 **No Registration Tracking**: The system doesn't currently track which caregiver registered which dependent
- 🏥 **Assignment-Based Management**: Caregivers manage dependents through account assignment (`caregiverId` field)
- 🆔 **Auto-Assignment**: When a caregiver registers a dependent, they may need to be manually assigned as the account caregiver
- 📝 **Profile Completion**: Most personal details (phone, address) are set to `null` and must be updated later

---

## 🔄 Workflow Recommendations

### **For Registering New Dependents**:
1. Use `POST /api/register-dependent` to create the dependent
2. Use `GET /api/caregiver/dependents` to verify the dependent appears in your managed list
3. If needed, assign yourself as caregiver to the dependent's accounts

### **For Managing Existing Dependents**:
1. Use `GET /api/caregiver/dependents` for overview and search
2. Use `GET /api/caregiver/dependents/:id` for detailed management
3. Use account-specific endpoints for financial management

### **For System Administration**:
1. Use `GET /api/users/dependents` for system-wide dependent overview
2. Use admin endpoints for bulk management operations

---

## ⚠️ Current Limitations

1. **No Registration History Tracking**: Cannot query "dependents registered by specific caregiver"
2. **Manual Assignment May Be Required**: Caregiver-dependent relationship through account assignment
3. **No Bulk Registration**: Must register dependents one at a time
4. **Limited Profile Data**: Personal details are initially null and require separate updates

---

## 🔐 Security & Validation

### **Authentication Requirements**:
- Valid Bearer token in Authorization header
- User must have `caregiver` role
- User must be active (not blocked or suspended)

### **Data Validation**:
- Email format validation
- 13-digit South African ID number format
- Uniqueness checks for email and ID number
- Required field validation
- Password complexity (handled by frontend)

### **Business Rules**:
- Only caregivers can register dependents
- Each dependent gets exactly 8 accounts (1 main + 7 sub-accounts)
- Unique account numbers generated automatically
- Savings account balance mirrors main account balance

This comprehensive system allows caregivers to efficiently register and manage dependents with full account setup and proper validation.
