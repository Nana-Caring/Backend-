# Database Schema - Users Table

## Current User Schema (After Migration)

```sql
CREATE TABLE "Users" (
  "id" SERIAL PRIMARY KEY,
  "firstName" VARCHAR(255) NOT NULL,
  "middleName" VARCHAR(255),
  "surname" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) NOT NULL CHECK (role IN ('funder', 'caregiver', 'dependent')),
  "Idnumber" VARCHAR(13) NOT NULL UNIQUE,
  "relation" VARCHAR(255),
  
  -- User blocking/status fields
  "isBlocked" BOOLEAN NOT NULL DEFAULT false,
  "blockedAt" TIMESTAMP,
  "blockedBy" INTEGER REFERENCES "Users"("id"),
  "blockReason" TEXT,
  "status" VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended', 'pending')),
  
  -- Personal details
  "phoneNumber" VARCHAR(15),
  
  -- Postal Address
  "postalAddressLine1" VARCHAR(255),
  "postalAddressLine2" VARCHAR(255),
  "postalCity" VARCHAR(255),
  "postalProvince" VARCHAR(255),
  "postalCode" VARCHAR(10),
  
  -- Home Address
  "homeAddressLine1" VARCHAR(255),
  "homeAddressLine2" VARCHAR(255),
  "homeCity" VARCHAR(255),
  "homeProvince" VARCHAR(255),
  "homeCode" VARCHAR(10),
  
  -- Stripe integration
  "stripeCustomerId" VARCHAR(255),
  
  -- Password reset fields (NEW)
  "resetToken" VARCHAR(255),
  "resetTokenExpires" BIGINT,
  
  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Portal API Schema Response

### GET /api/portal/me Response:
```json
{
  "user": {
    "id": 1,
    "firstName": "Jane",
    "middleName": "Marie",
    "surname": "Doe",
    "email": "jane.doe@example.com",
    "role": "caregiver",
    "status": "active",
    "phoneNumber": "+27821234567",
    "postalAddressLine1": "123 Main Street",
    "postalAddressLine2": "Apt 4B",
    "postalCity": "Cape Town",
    "postalProvince": "Western Cape",
    "postalCode": "8000",
    "homeAddressLine1": "456 Oak Avenue",
    "homeAddressLine2": "",
    "homeCity": "Cape Town",
    "homeProvince": "Western Cape",
    "homeCode": "8001",
    "createdAt": "2025-07-23T10:00:00Z",
    "updatedAt": "2025-08-05T12:00:00Z",
    "accounts": [
      {
        "id": 101,
        "accountNumber": "ACC123456",
        "accountType": "Main",
        "balance": "1000.00",
        "currency": "ZAR",
        "status": "active"
      }
    ],
    "Dependents": [
      {
        "id": 2,
        "firstName": "John",
        "middleName": "",
        "surname": "Doe",
        "email": "john.doe@example.com",
        "role": "dependent",
        "status": "active",
        "accounts": [...]
      }
    ]
  },
  "recentTransactions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "accountId": "101",
      "amount": 50.00,
      "type": "Credit",
      "description": "Money transfer from funder",
      "reference": "transfer-1704067200000",
      "metadata": {
        "source": "money_transfer",
        "funderId": "550e8400-e29b-41d4-a716-446655440002"
      },
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-01T12:00:00.000Z",
      "account": {
        "accountNumber": "ACC123456",
        "accountType": "Main"
      }
    }
  ]
}
```

### PUT /api/portal/me Request Body:
```json
{
  "firstName": "Jane",
  "middleName": "Marie",
  "surname": "Doe",
  "email": "new.email@example.com",
  "phoneNumber": "+27821234567",
  "postalAddressLine1": "123 New Street",
  "postalAddressLine2": "Unit 5",
  "postalCity": "Cape Town",
  "postalProvince": "Western Cape",
  "postalCode": "8000",
  "homeAddressLine1": "456 Home Street",
  "homeAddressLine2": "",
  "homeCity": "Cape Town",
  "homeProvince": "Western Cape",
  "homeCode": "8001"
}
```

## Migration Applied
✅ **20250805123718-add-reset-token-fields-to-users.js** - Added resetToken and resetTokenExpires fields
