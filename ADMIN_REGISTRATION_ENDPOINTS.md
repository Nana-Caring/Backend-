# 🔐 Admin Registration Endpoints Documentation

## Overview
These endpoints allow High Court and Admin users to register new funders and caregivers through the admin panel. Both endpoints require admin authentication and provide comprehensive user creation with automatic account setup.

---

## 🏦 Register New Funder

### Endpoint
```http
POST /admin/users/register-funder
```

### Authentication
- **Required**: Admin or High Court JWT token
- **Header**: `Authorization: Bearer <admin_or_highcourt_token>`

### Request Body
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "surname": "Smith",
  "email": "john.smith@example.com",
  "password": "SecurePass123!",
  "Idnumber": "8901234567890",
  "phoneNumber": "+27821234567",
  "homeAddressLine1": "123 Main Street",
  "homeAddressLine2": "Apt 4B",
  "homeCity": "Cape Town",
  "homeProvince": "Western Cape",
  "homeCode": "8001",
  "postalAddressLine1": "PO Box 123",
  "postalAddressLine2": "Private Bag X1",
  "postalCity": "Cape Town",
  "postalProvince": "Western Cape",
  "postalCode": "8001"
}
```

### Required Fields
- `firstName` (string): First name
- `surname` (string): Last name/surname  
- `email` (string): Valid email address
- `password` (string): Minimum 6 characters
- `Idnumber` (string): Exactly 13 digits

### Optional Fields
- `middleName` (string): Middle name
- `phoneNumber` (string): Contact number
- `homeAddressLine1` (string): Home address line 1
- `homeAddressLine2` (string): Home address line 2
- `homeCity` (string): Home city
- `homeProvince` (string): Home province
- `homeCode` (string): Home postal code
- `postalAddressLine1` (string): Postal address line 1
- `postalAddressLine2` (string): Postal address line 2
- `postalCity` (string): Postal city
- `postalProvince` (string): Postal province
- `postalCode` (string): Postal code

### Success Response (201)
```json
{
  "success": true,
  "message": "Funder registered successfully by admin",
  "user": {
    "id": 25,
    "firstName": "John",
    "middleName": "Michael",
    "surname": "Smith",
    "email": "john.smith@example.com",
    "role": "funder",
    "Idnumber": "8901234567890",
    "phoneNumber": "+27821234567",
    "status": "active",
    "isBlocked": false,
    "homeAddressLine1": "123 Main Street",
    "homeAddressLine2": "Apt 4B",
    "homeCity": "Cape Town",
    "homeProvince": "Western Cape",
    "homeCode": "8001",
    "postalAddressLine1": "PO Box 123",
    "postalAddressLine2": "Private Bag X1",
    "postalCity": "Cape Town",
    "postalProvince": "Western Cape",
    "postalCode": "8001",
    "createdAt": "2025-10-31T10:30:00.000Z",
    "updatedAt": "2025-10-31T10:30:00.000Z",
    "account": {
      "id": 15,
      "userId": 25,
      "accountType": "Main",
      "balance": 0,
      "accountNumber": "ACC789012345",
      "parentAccountId": null,
      "createdAt": "2025-10-31T10:30:00.000Z",
      "updatedAt": "2025-10-31T10:30:00.000Z"
    }
  }
}
```

### Error Responses

#### 400 - Validation Error
```json
{
  "success": false,
  "message": "Required fields missing: firstName, surname, email, password, Idnumber"
}
```

#### 400 - Email Already Exists
```json
{
  "success": false,
  "message": "Email already exists"
}
```

#### 400 - ID Number Already Exists
```json
{
  "success": false,
  "message": "ID number already exists"
}
```

#### 400 - Invalid Email Format
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

#### 400 - Invalid ID Number
```json
{
  "success": false,
  "message": "ID number must be exactly 13 digits"
}
```

---

## 👩‍⚕️ Register New Caregiver

### Endpoint
```http
POST /admin/users/register-caregiver
```

### Authentication
- **Required**: Admin or High Court JWT token
- **Header**: `Authorization: Bearer <admin_or_highcourt_token>`

### Request Body
```json
{
  "firstName": "Sarah",
  "middleName": "Jane",
  "surname": "Williams",
  "email": "sarah.williams@example.com",
  "password": "CaregiverPass123!",
  "Idnumber": "9012345678901",
  "phoneNumber": "+27834567890",
  "homeAddressLine1": "456 Oak Avenue",
  "homeAddressLine2": "Unit 2C",
  "homeCity": "Johannesburg",
  "homeProvince": "Gauteng",
  "homeCode": "2000",
  "postalAddressLine1": "PO Box 456",
  "postalAddressLine2": "Private Bag X2",
  "postalCity": "Johannesburg",
  "postalProvince": "Gauteng",
  "postalCode": "2000"
}
```

### Required Fields
- `firstName` (string): First name
- `surname` (string): Last name/surname
- `email` (string): Valid email address
- `password` (string): Minimum 6 characters
- `Idnumber` (string): Exactly 13 digits

### Optional Fields
- `middleName` (string): Middle name
- `phoneNumber` (string): Contact number
- `homeAddressLine1` (string): Home address line 1
- `homeAddressLine2` (string): Home address line 2
- `homeCity` (string): Home city
- `homeProvince` (string): Home province
- `homeCode` (string): Home postal code
- `postalAddressLine1` (string): Postal address line 1
- `postalAddressLine2` (string): Postal address line 2
- `postalCity` (string): Postal city
- `postalProvince` (string): Postal province
- `postalCode` (string): Postal code

### Success Response (201)
```json
{
  "success": true,
  "message": "Caregiver registered successfully by admin",
  "user": {
    "id": 26,
    "firstName": "Sarah",
    "middleName": "Jane",
    "surname": "Williams",
    "email": "sarah.williams@example.com",
    "role": "caregiver",
    "Idnumber": "9012345678901",
    "phoneNumber": "+27834567890",
    "status": "active",
    "isBlocked": false,
    "homeAddressLine1": "456 Oak Avenue",
    "homeAddressLine2": "Unit 2C",
    "homeCity": "Johannesburg",
    "homeProvince": "Gauteng",
    "homeCode": "2000",
    "postalAddressLine1": "PO Box 456",
    "postalAddressLine2": "Private Bag X2",
    "postalCity": "Johannesburg",
    "postalProvince": "Gauteng",
    "postalCode": "2000",
    "createdAt": "2025-10-31T10:30:00.000Z",
    "updatedAt": "2025-10-31T10:30:00.000Z"
  }
}
```

### Error Responses
Same error responses as funder registration (400 - validation, email exists, ID exists, invalid formats, etc.)

---

## 🔧 Usage Examples

### Register Funder with Admin Token
```bash
curl -X POST https://nanacaring-backend.onrender.com/admin/users/register-funder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "firstName": "Michael",
    "surname": "Johnson",
    "email": "michael.johnson@example.com",
    "password": "FunderPass123!",
    "Idnumber": "8505151234567",
    "phoneNumber": "+27821234567"
  }'
```

### Register Caregiver with High Court Token
```bash
curl -X POST https://nanacaring-backend.onrender.com/admin/users/register-caregiver \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_HIGHCOURT_TOKEN" \
  -d '{
    "firstName": "Linda",
    "surname": "Davis",
    "email": "linda.davis@example.com",
    "password": "CaregiverPass123!",
    "Idnumber": "8712251234567",
    "phoneNumber": "+27834567890"
  }'
```

---

## 📊 Features

### ✅ What These Endpoints Do:
1. **Full User Creation**: Create complete user profiles with all personal details
2. **Automatic Account Setup**: Funders get main accounts with unique account numbers
3. **Email Notifications**: Welcome emails sent with login credentials
4. **Data Validation**: Email format, ID number format, duplicate checking
5. **Password Security**: Automatic password hashing with bcrypt
6. **Role Assignment**: Automatic role assignment (funder/caregiver)
7. **Status Setup**: Users created with active status and not blocked

### 🔒 Security Features:
- Admin/High Court authentication required
- Input validation and sanitization
- Duplicate email/ID number prevention
- Password hashing
- SQL injection protection

### 📧 Email Integration:
- Welcome emails sent automatically
- Contains login credentials
- Professional email templates
- Fails gracefully if email service unavailable

---

## 🧪 Testing the Endpoints

You can test these endpoints using the High Court credentials:
- **Email**: `highcourt@nanacaring.com`
- **Password**: `highcourt2025`

1. First login to get admin token via `/api/auth/admin-login`
2. Use the token to register users via the admin endpoints
3. Check the response for successful user creation
4. Verify the user can login with their new credentials

---

## 📝 Notes

- **Funder Accounts**: Funders automatically get a main account with balance 0
- **Caregiver Accounts**: Caregivers don't get financial accounts (can register dependents)
- **Email Service**: Welcome emails include the original password for user convenience
- **Password Requirements**: Minimum 6 characters (consider enforcing stronger passwords in production)
- **ID Number Validation**: South African 13-digit ID number format required
- **Status**: All users created with "active" status and not blocked by default