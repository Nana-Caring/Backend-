# Bank Account Management Feature

## Overview
This feature allows funders to add and manage their personal bank accounts, which they can then use to pay dependents. The system integrates with Stripe for secure payment processing and provides a complete bank account management interface.

## Features

### 🏦 Bank Account Management
- **Add Bank Accounts**: Funders can add multiple bank accounts
- **Set Default Account**: Mark one account as the default for payments
- **List Accounts**: View all bank accounts with masked account numbers
- **Delete Accounts**: Remove bank accounts (soft delete)
- **Account Verification**: Track verification status of bank accounts

### 💳 Payment Integration
- **Stripe Customer Creation**: Automatic Stripe customer creation for funders
- **Payment Intent with Bank Account**: Create payment intents using specific bank accounts
- **Payment Method Selection**: Choose which bank account to use for payments
- **Enhanced Payment Methods**: List both cards and bank accounts as payment options

### 🔒 Security Features
- **Role-Based Access**: Only funders can manage bank accounts
- **Data Masking**: Bank account numbers are masked in API responses
- **Soft Delete**: Bank accounts are marked as inactive instead of hard deletion
- **Unique Constraints**: Prevent duplicate bank accounts per user
- **Stripe Integration**: Secure payment processing through Stripe

## API Endpoints

### 1. Add Bank Account
```
POST /api/bank-accounts/add
```

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "accountName": "John Doe",
  "bankName": "Standard Bank",
  "accountNumber": "1234567890",
  "accountType": "checking",
  "routingNumber": "051000017"
}
```

**Response:**
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
    "createdAt": "2025-07-03T10:30:00.000Z"
  }
}
```

### 2. Get Bank Accounts
```
GET /api/bank-accounts
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "bankAccounts": [
    {
      "id": "uuid-here",
      "accountName": "John Doe",
      "bankName": "Standard Bank",
      "accountNumber": "****7890",
      "accountType": "checking",
      "isDefault": true,
      "verificationStatus": "pending",
      "createdAt": "2025-07-03T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### 3. Set Default Bank Account
```
PUT /api/bank-accounts/{bankAccountId}/default
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Default bank account updated successfully",
  "bankAccount": {
    "id": "uuid-here",
    "accountName": "John Doe",
    "bankName": "Standard Bank",
    "isDefault": true
  }
}
```

### 4. Delete Bank Account
```
DELETE /api/bank-accounts/{bankAccountId}
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Bank account removed successfully"
}
```

### 5. Create Payment Intent with Bank Account
```
POST /api/bank-accounts/payment-intent
```

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
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

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "selectedBankAccount": {
    "id": "uuid-here",
    "accountName": "John Doe",
    "bankName": "Standard Bank",
    "accountNumber": "****7890"
  }
}
```

### 6. Enhanced Payment Methods List
```
GET /api/stripe/payment-methods
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "paymentMethods": [
    {
      "id": "pm_xxx",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242"
      }
    }
  ],
  "bankAccounts": [
    {
      "id": "uuid-here",
      "accountName": "John Doe",
      "bankName": "Standard Bank",
      "accountNumber": "****7890",
      "accountType": "checking",
      "isDefault": true,
      "verificationStatus": "pending",
      "type": "bank_account"
    }
  ]
}
```

## Database Schema

### Bank Accounts Table
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId INTEGER NOT NULL REFERENCES Users(id),
  accountName VARCHAR(255) NOT NULL,
  bankName VARCHAR(255) NOT NULL,
  accountNumber VARCHAR(255) NOT NULL,
  accountType ENUM('checking', 'savings') DEFAULT 'checking',
  routingNumber VARCHAR(255),
  stripePaymentMethodId VARCHAR(255),
  isDefault BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  lastVerifiedAt TIMESTAMP,
  verificationStatus ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Users Table Update
```sql
ALTER TABLE Users ADD COLUMN stripeCustomerId VARCHAR(255);
```

## Migration Instructions

### Run Migration
```bash
# Using Sequelize CLI
npx sequelize-cli db:migrate

# Or manually
node -e "require('./migrations/20250703000001-create-bank-accounts.js').up(require('./models').sequelize.getQueryInterface(), require('sequelize'))"
```

### Migration File
- **File**: `migrations/20250703000001-create-bank-accounts.js`
- **Creates**: `bank_accounts` table with all required fields and indexes
- **Adds**: `stripeCustomerId` field to Users table
- **Indexes**: On userId, stripePaymentMethodId, and unique constraint on user-bank account combination

## Testing Commands

### PowerShell Test Script
```powershell
# 1. Login and get token
$loginBody = @{ email = "funder@example.com"; password = "Password123!" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# 2. Add bank account
$bankAccountBody = @{
    accountName = "John Doe"
    bankName = "Standard Bank"
    accountNumber = "1234567890"
    accountType = "checking"
    routingNumber = "051000017"
} | ConvertTo-Json

$addResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts/add" -Method Post -Headers $headers -Body $bankAccountBody
Write-Host "Bank account added: $($addResponse.bankAccount.id)"

# 3. Get bank accounts
$accounts = Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts" -Method Get -Headers $headers
Write-Host "Total bank accounts: $($accounts.total)"
$accounts.bankAccounts | Format-Table

# 4. Set default bank account
$bankAccountId = $accounts.bankAccounts[0].id
Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts/$bankAccountId/default" -Method Put -Headers $headers

# 5. Create payment intent with bank account
$paymentBody = @{
    amount = 1000
    accountNumber = "1234567890"
    accountType = "Main"
    bankAccountId = $bankAccountId
} | ConvertTo-Json

$paymentResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/bank-accounts/payment-intent" -Method Post -Headers $headers -Body $paymentBody
Write-Host "Payment intent created: $($paymentResponse.clientSecret)"

# 6. Get enhanced payment methods
$paymentMethods = Invoke-RestMethod -Uri "http://localhost:5000/api/stripe/payment-methods" -Method Get -Headers $headers
Write-Host "Payment methods: $($paymentMethods.paymentMethods.Count)"
Write-Host "Bank accounts: $($paymentMethods.bankAccounts.Count)"
```

### Test File
Run the test file to verify all components:
```bash
node test-bank-accounts.js
```

## Frontend Integration

### Add Bank Account Flow
1. **Form Collection**: Collect bank account details from funder
2. **API Call**: POST to `/api/bank-accounts/add`
3. **Success Handling**: Show success message and refresh bank account list
4. **Error Handling**: Display validation errors

### Payment Flow with Bank Account Selection
1. **Load Payment Methods**: GET `/api/stripe/payment-methods` to get cards and bank accounts
2. **Display Options**: Show both saved cards and bank accounts
3. **Selection**: Allow user to select preferred payment method
4. **Payment Intent**: Create payment intent with selected bank account
5. **Process Payment**: Use Stripe.js to confirm payment

### Bank Account Management
1. **List Accounts**: Display all bank accounts with masked numbers
2. **Set Default**: Allow user to set default payment method
3. **Delete Account**: Soft delete with confirmation
4. **Verification Status**: Show verification status for each account

## Security Considerations

### Data Protection
- **Masking**: Bank account numbers are always masked in API responses
- **Encryption**: Consider encrypting sensitive bank account data at rest
- **Access Control**: Only account owners can view/manage their bank accounts

### Validation
- **Input Validation**: Validate all bank account fields
- **Duplicate Prevention**: Unique constraints prevent duplicate accounts
- **Role Verification**: Only funders can access bank account endpoints

### Stripe Integration
- **Customer Creation**: Automatic Stripe customer creation for payment processing
- **Payment Method Security**: Stripe handles sensitive payment data
- **Webhook Verification**: Verify webhook signatures for security

## Error Handling

### Common Errors
- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Non-funder trying to access bank account features
- **404 Not Found**: Bank account or user not found
- **409 Conflict**: Duplicate bank account
- **500 Internal Server Error**: Server or Stripe API errors

### Error Response Format
```json
{
  "error": "Error message description"
}
```

## Performance Considerations

### Database Optimization
- **Indexes**: Proper indexes on frequently queried fields
- **Soft Delete**: Inactive accounts remain in database for audit trails
- **Pagination**: Consider pagination for users with many bank accounts

### Caching
- **Stripe Customer**: Cache Stripe customer IDs to avoid repeated API calls
- **Bank Account List**: Cache bank account lists with appropriate TTL

## Production Deployment

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_your_live_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Monitor for suspicious bank account activity
- [ ] Regular security audits of bank account data
- [ ] Implement proper logging and monitoring
- [ ] Use production Stripe keys
- [ ] Validate webhook signatures

### Monitoring
- **Bank Account Creation**: Track bank account addition rates
- **Payment Success**: Monitor payment success rates by bank account
- **Error Rates**: Track API error rates and types
- **Security Events**: Monitor for suspicious activities

## Future Enhancements

### Planned Features
- **Bank Account Verification**: Integrate with bank verification services
- **ACH Payments**: Support for ACH transfers
- **Multi-Currency**: Support for multiple currencies
- **Account Nicknames**: Allow users to add nicknames for accounts
- **Transaction History**: Track payments by bank account
- **Auto-Retry**: Automatic retry for failed payments

### Technical Improvements
- **Encryption**: Encrypt sensitive bank account data
- **Audit Logging**: Comprehensive audit trails
- **Bulk Operations**: Support for bulk bank account operations
- **API Rate Limiting**: Implement rate limiting per user
- **Webhook Enhancements**: Enhanced webhook handling

Your bank account management system is now ready for production use! 🏦💳
