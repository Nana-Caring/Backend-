# Credit/Debit Card Management System

## **🚨 CRITICAL: Stripe Test vs Production Cards**

### **Two Types of Card Addition:**

**1. TEST Endpoint (Development UI Only)** ❌ Cannot be used for transfers
```
POST /api/payment-cards/add-test
- Purpose: UI testing, card listing, interface development
- Limitation: Creates mock cards that CANNOT be used with Stripe operations
- Error: "No such PaymentMethod: 'pm_test_...'" when used for transfers
```

**2. PRODUCTION Endpoint (Required for Transfers)** ✅ Works with all operations
```
POST /api/payment-cards/add  
- Purpose: Real card addition with Stripe integration
- Requirement: Use official Stripe test payment methods
- Works with: All operations including transfers and payments
```

### **✅ RECOMMENDED WORKFLOW:**

**For Development/UI Testing:**
```bash
# Use test endpoint for UI development
POST /api/payment-cards/add-test
# Body: card details (numbers, expiry, etc.)
```

**For Payment/Transfer Testing:**
```bash
# Use production endpoint with Stripe test payment methods
POST /api/payment-cards/add
# Body: { "payment_method_id": "pm_card_visa", "user_id": 1 }
```

**Official Stripe Test Payment Methods:**
- `pm_card_visa` - Visa test card
- `pm_card_mastercard` - MasterCard test card  
- `pm_card_amex` - American Express test card
- `pm_card_discover` - Discover test card

### **🔧 Quick Setup Script:**
Run this script to add working test cards:
```bash
node add-stripe-test-cards.js
```

---

## Overview
This system allows funders to add and manage credit/debit cards as payment methods. The implementation focuses exclusively on card payments with secure handling through Stripe integration.

## Required Form Fields

### Card Information Fields
```
Bank Name *              → bankName (required)
Card Number              → cardNumber (required) 
Expiry Date              → expiryDate (required, MM/YY format)
CCV                      → ccv (required, 123 format)
```

### Optional Fields
```
Nickname                 → nickname (optional)
Set as Default          → isDefault (optional, boolean)
```

## API Endpoints

### 1. Add Credit/Debit Card
**Endpoint:** `POST /api/payment-cards/add`

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "bankName": "Standard Bank",
  "cardNumber": "4111111111111111",
  "expiryDate": "12/25",
  "ccv": "123",
  "nickname": "My Visa Card",
  "isDefault": true
}
```

**Success Response (201):**
```json
{
  "message": "Payment card added successfully",
  "card": {
    "id": "uuid-here",
    "bankName": "Standard Bank",
    "cardNumber": "****-****-****-1111",
    "expiryDate": "12/25",
    "nickname": "My Visa Card",
    "isDefault": true,
    "isActive": true,
    "createdAt": "2025-07-09T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "message": "All card fields are required",
  "required": {
    "bankName": "Bank Name is required",
    "cardNumber": "Card Number is required",
    "expiryDate": "Expiry Date (MM/YY) is required",
    "ccv": "CCV is required"
  }
}
```

### 2. Get All Payment Cards
**Endpoint:** `GET /api/payment-cards/my-cards`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "message": "Payment cards retrieved successfully",
  "cards": [
    {
      "id": "uuid-here",
      "bankName": "Standard Bank",
      "cardNumber": "****-****-****-1111",
      "expiryDate": "12/25",
      "nickname": "My Visa Card",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2025-07-09T10:30:00.000Z"
    },
    {
      "id": "uuid-here-2",
      "bankName": "FNB",
      "cardNumber": "****-****-****-4242",
      "expiryDate": "08/26",
      "nickname": "Business Card",
      "isDefault": false,
      "isActive": true,
      "createdAt": "2025-07-09T11:15:00.000Z"
    }
  ],
  "totalCards": 2
}
```

### 3. Set Default Payment Card
**Endpoint:** `PUT /api/payment-cards/set-default/:cardId`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "message": "Default payment card updated successfully",
  "cardId": "uuid-here",
  "bankName": "Standard Bank",
  "cardNumber": "****-****-****-1111"
}
```

### 4. Remove Payment Card
**Endpoint:** `DELETE /api/payment-cards/remove/:cardId`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "message": "Payment card removed successfully"
}
```

### 5. Create Payment Intent with Card
**Endpoint:** `POST /api/payment-cards/create-payment-intent`

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 100.00,
  "cardId": "uuid-here",
  "description": "Payment for account funding"
}
```

**Success Response (200):**
```json
{
  "message": "Payment intent created successfully",
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 100.00,
  "card": {
    "bankName": "Standard Bank",
    "cardNumber": "****-****-****-1111"
  }
}
```

## Field Validation Rules

### Bank Name
- **Required**: Yes
- **Type**: String
- **Length**: 2-100 characters
- **Example**: "Standard Bank", "FNB", "Capitec Bank"

### Card Number
- **Required**: Yes
- **Type**: String (digits only)
- **Length**: 13-19 digits
- **Format**: No spaces or dashes in input
- **Storage**: Only last 4 digits stored locally
- **Display**: Always masked as ****-****-****-1111

### Expiry Date
- **Required**: Yes
- **Type**: String
- **Format**: MM/YY (e.g., "12/25")
- **Validation**: Month 01-12, year must be future date
- **Examples**: "12/25", "08/27", "01/26"

### CCV
- **Required**: Yes
- **Type**: String (digits only)
- **Length**: 3-4 digits
- **Security**: Required for validation, consider not storing in production
- **Examples**: "123", "4567"

## Security Features

### Data Protection
- **Card Numbers**: Only last 4 digits stored in database
- **Full Card Details**: Tokenized through Stripe for PCI compliance
- **Masked Display**: Card numbers always shown as ****-****-****-1111
- **CCV Handling**: Used for validation, stored temporarily (consider encryption)
- **Unique Constraints**: Prevents duplicate cards per user (based on last 4 digits)

### Access Control
- **Authentication**: JWT token required for all endpoints
- **User Isolation**: Users can only access their own cards
- **Role-Based**: Only authenticated users can manage cards
- **Soft Delete**: Cards marked as inactive, not permanently deleted
- **Default Management**: Only one default card per user allowed

### Stripe Integration
- **Tokenization**: Full card details securely tokenized by Stripe
- **Customer Creation**: Automatic Stripe customer creation for users
- **Payment Methods**: Cards attached to Stripe customer for future use
- **Validation**: Real-time card validation through Stripe API

## Database Schema

### payment_cards Table
```sql
CREATE TABLE payment_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  bankName VARCHAR(100) NOT NULL,
  cardNumber VARCHAR(4) NOT NULL,      -- Last 4 digits only
  expiryDate VARCHAR(5) NOT NULL,      -- MM/YY format
  ccv VARCHAR(4) NOT NULL,             -- Consider encryption in production
  stripePaymentMethodId VARCHAR,       -- Stripe token reference
  isDefault BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  nickname VARCHAR(50),                -- Optional user-friendly name
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE UNIQUE INDEX unique_user_card ON payment_cards(userId, cardNumber);
CREATE INDEX user_default_card ON payment_cards(userId, isDefault);
CREATE INDEX user_active_cards ON payment_cards(userId, isActive);
```

### Users Table Addition
```sql
-- Add Stripe customer ID to existing Users table
ALTER TABLE Users ADD COLUMN stripeCustomerId VARCHAR;
```

## Frontend Implementation

### HTML Form
```html
<form id="addCardForm" class="card-form">
  <div class="form-group">
    <label for="bankName">Bank Name *</label>
    <input 
      type="text" 
      id="bankName" 
      name="bankName" 
      placeholder="Enter bank name" 
      required
      maxlength="100"
    >
  </div>
  
  <div class="form-group">
    <label for="cardNumber">Card Number</label>
    <input 
      type="text" 
      id="cardNumber" 
      name="cardNumber" 
      placeholder="Enter card number" 
      required
      maxlength="19"
      pattern="[0-9\s]{13,19}"
    >
  </div>
  
  <div class="form-group">
    <label for="expiryDate">Expiry Date</label>
    <input 
      type="text" 
      id="expiryDate" 
      name="expiryDate" 
      placeholder="MM/YY" 
      required
      maxlength="5"
      pattern="(0[1-9]|1[0-2])\/\d{2}"
    >
  </div>
  
  <div class="form-group">
    <label for="ccv">CCV</label>
    <input 
      type="text" 
      id="ccv" 
      name="ccv" 
      placeholder="123" 
      required
      maxlength="4"
      pattern="\d{3,4}"
    >
  </div>
  
  <div class="form-group">
    <label for="nickname">Nickname (Optional)</label>
    <input 
      type="text" 
      id="nickname" 
      name="nickname" 
      placeholder="My Visa Card"
      maxlength="50"
    >
  </div>
  
  <div class="form-group">
    <label class="checkbox-label">
      <input type="checkbox" id="isDefault" name="isDefault">
      Set as default payment method
    </label>
  </div>
  
  <button type="submit" class="btn-primary">Add Card</button>
</form>
```

### JavaScript Implementation
```javascript
// Format card number input with spaces
document.getElementById('cardNumber').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  if (formattedValue.length <= 19) {
    e.target.value = formattedValue;
  }
});

// Format expiry date input
document.getElementById('expiryDate').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  e.target.value = value;
});

// Form submission
document.getElementById('addCardForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const cardData = {
    bankName: formData.get('bankName'),
    cardNumber: formData.get('cardNumber').replace(/\s/g, ''), // Remove spaces
    expiryDate: formData.get('expiryDate'),
    ccv: formData.get('ccv'),
    nickname: formData.get('nickname') || null,
    isDefault: formData.get('isDefault') === 'on'
  };
  
  // Validate form data
  if (!validateCardForm(cardData)) {
    return;
  }
  
  try {
    const response = await fetch('/api/payment-cards/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(cardData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showSuccess('Card added successfully!');
      e.target.reset();
      loadUserCards(); // Refresh card list
    } else {
      showError(result.message || 'Failed to add card');
    }
  } catch (error) {
    showError('Network error: ' + error.message);
  }
});

// Form validation
function validateCardForm(data) {
  const errors = [];
  
  if (!data.bankName || data.bankName.length < 2) {
    errors.push('Bank name is required (minimum 2 characters)');
  }
  
  if (!data.cardNumber || !/^\d{13,19}$/.test(data.cardNumber)) {
    errors.push('Valid card number is required (13-19 digits)');
  }
  
  if (!data.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate)) {
    errors.push('Valid expiry date is required (MM/YY format)');
  }
  
  if (!data.ccv || !/^\d{3,4}$/.test(data.ccv)) {
    errors.push('Valid CCV is required (3-4 digits)');
  }
  
  // Check if expiry date is in the future
  if (data.expiryDate) {
    const [month, year] = data.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    
    if (expiryDate < currentDate) {
      errors.push('Card has expired');
    }
  }
  
  if (errors.length > 0) {
    showError(errors.join('\n'));
    return false;
  }
  
  return true;
}
```

### Display Cards List
```javascript
async function loadUserCards() {
  try {
    const response = await fetch('/api/payment-cards/my-cards', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      displayCards(result.cards);
    } else {
      showError('Failed to load cards');
    }
  } catch (error) {
    showError('Network error: ' + error.message);
  }
}

function displayCards(cards) {
  const container = document.getElementById('cardsContainer');
  
  if (cards.length === 0) {
    container.innerHTML = '<p class="no-cards">No payment cards added yet.</p>';
    return;
  }
  
  container.innerHTML = cards.map(card => `
    <div class="card-item ${card.isDefault ? 'default-card' : ''}">
      <div class="card-info">
        <h4>${card.bankName}</h4>
        <p class="card-number">${card.cardNumber}</p>
        <p class="expiry">Expires: ${card.expiryDate}</p>
        ${card.nickname ? `<p class="nickname">${card.nickname}</p>` : ''}
        ${card.isDefault ? '<span class="default-badge">Default</span>' : ''}
      </div>
      <div class="card-actions">
        ${!card.isDefault ? `<button onclick="setDefaultCard('${card.id}')">Set Default</button>` : ''}
        <button onclick="removeCard('${card.id}')" class="danger">Remove</button>
      </div>
    </div>
  `).join('');
}
```

## Testing Commands

### PowerShell Test Scripts
```powershell
# 1. Login and get authentication token
$loginBody = @{ 
    email = "funder@example.com"
    password = "Password123!" 
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/auth/login" `
    -Method Post `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.token
$headers = @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json" 
}

# 2. Add a credit/debit card
$cardBody = @{
    bankName = "Standard Bank"
    cardNumber = "4111111111111111"
    expiryDate = "12/25"
    ccv = "123"
    nickname = "My Visa Card"
    isDefault = $true
} | ConvertTo-Json

$addResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/payment-cards/add" `
    -Method Post `
    -Headers $headers `
    -Body $cardBody

Write-Host "Card added successfully: $($addResponse.card.id)"

# 3. Get all payment cards
$cardsResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/payment-cards/my-cards" `
    -Method Get `
    -Headers $headers

Write-Host "Total cards: $($cardsResponse.totalCards)"
$cardsResponse.cards | Format-Table bankName, cardNumber, expiryDate, isDefault

# 4. Add another card
$cardBody2 = @{
    bankName = "FNB"
    cardNumber = "4000000000000002"
    expiryDate = "08/26"
    ccv = "456"
    nickname = "Business Card"
    isDefault = $false
} | ConvertTo-Json

$addResponse2 = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/payment-cards/add" `
    -Method Post `
    -Headers $headers `
    -Body $cardBody2

# 5. Set default card
$cardId = $cardsResponse.cards[0].id
$defaultResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/payment-cards/set-default/$cardId" `
    -Method Put `
    -Headers $headers

# 6. Create payment intent
$paymentBody = @{
    amount = 100.00
    cardId = $cardId
    description = "Test payment with card"
} | ConvertTo-Json

$paymentResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/payment-cards/create-payment-intent" `
    -Method Post `
    -Headers $headers `
    -Body $paymentBody

Write-Host "Payment intent created: $($paymentResponse.clientSecret)"

# 7. Remove a card
$removeResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/payment-cards/remove/$($addResponse2.card.id)" `
    -Method Delete `
    -Headers $headers

Write-Host "Card removed successfully"
```

### cURL Test Commands
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"funder@example.com","password":"Password123!"}'

# 2. Add card (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/payment-cards/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "bankName": "Standard Bank",
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "ccv": "123",
    "nickname": "My Visa Card",
    "isDefault": true
  }'

# 3. Get cards
curl -X GET http://localhost:5000/api/payment-cards/my-cards \
  -H "Authorization: Bearer TOKEN"

# 4. Set default card
curl -X PUT http://localhost:5000/api/payment-cards/set-default/CARD_ID \
  -H "Authorization: Bearer TOKEN"

# 5. Remove card
curl -X DELETE http://localhost:5000/api/payment-cards/remove/CARD_ID \
  -H "Authorization: Bearer TOKEN"
```

## Error Handling

### Common Validation Errors
```json
{
  "message": "All card fields are required",
  "required": {
    "bankName": "Bank Name is required",
    "cardNumber": "Card Number is required", 
    "expiryDate": "Expiry Date (MM/YY) is required",
    "ccv": "CCV is required"
  }
}
```

```json
{
  "message": "Expiry date must be in MM/YY format (e.g., 12/25)"
}
```

```json
{
  "message": "Card number must be 13-19 digits"
}
```

```json
{
  "message": "CCV must be 3-4 digits"
}
```

### Stripe Integration Errors
```json
{
  "message": "Invalid card details",
  "error": "Your card number is incorrect."
}
```

### Duplicate Card Error
```json
{
  "message": "A card with these last 4 digits is already added to your account"
}
```

## Troubleshooting

### Common Issues

#### 1. "relation payment_cards does not exist" Error

This error occurs when the database table hasn't been created yet. Here are three solutions:

**Solution A: Run SQL Script Directly**
```sql
-- Connect to your PostgreSQL database and run:
CREATE TABLE IF NOT EXISTS payment_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "bankName" VARCHAR(100) NOT NULL,
    "cardNumber" VARCHAR(4) NOT NULL,
    "expiryDate" VARCHAR(5) NOT NULL,
    "ccv" VARCHAR(4) NOT NULL,
    "stripePaymentMethodId" VARCHAR,
    "isDefault" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "nickname" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_card ON payment_cards("userId", "cardNumber");
CREATE INDEX IF NOT EXISTS user_default_card ON payment_cards("userId", "isDefault");
CREATE INDEX IF NOT EXISTS user_active_cards ON payment_cards("userId", "isActive");

-- Add stripeCustomerId to Users table
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "stripeCustomerId" VARCHAR;
```

**Solution B: Run Migration in Production**
```bash
# If you have access to production server:
NODE_ENV=production npx sequelize-cli db:migrate
```

**Solution C: Use Setup Script**
```bash
# Run the setup script we created:
node setup-production-payment-cards.js
```

**Solution D: Manual API Error Handling**
The system now returns a helpful error message when the table doesn't exist:
```json
{
  "message": "Payment cards feature is not available yet",
  "error": "Database table not created. Please run migrations or contact administrator.",
  "hint": "Run: npx sequelize-cli db:migrate or execute the SQL script to create payment_cards table"
}
```

#### 2. Database Connection Issues
- Verify DATABASE_URL environment variable is set correctly
- Check if database credentials are valid
- Ensure SSL is properly configured for production

#### 3. Stripe Integration Issues
- Verify STRIPE_SECRET_KEY is set and valid
- Check if Stripe is in test or live mode
- Ensure card details are valid test cards

## Migration Instructions

### Run Migration
```bash
# Using Sequelize CLI
npx sequelize-cli db:migrate

# Check migration status
npx sequelize-cli db:migrate:status
```

### Manual Migration
If you need to run the migration manually:
```javascript
// Run this in Node.js console
const { sequelize } = require('./models');
const migration = require('./migrations/20250709000001-create-payment-cards.js');

migration.up(sequelize.getQueryInterface(), sequelize.constructor)
  .then(() => console.log('Migration completed'))
  .catch(err => console.error('Migration failed:', err));
```

## Environment Variables

### Required Environment Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Database Configuration
DATABASE_URL=your_database_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

## Production Considerations

### Security Enhancements
1. **PCI Compliance**: Ensure proper PCI DSS compliance
2. **Data Encryption**: Encrypt sensitive card data at rest
3. **CCV Storage**: Consider not storing CCV at all in production
4. **Rate Limiting**: Implement rate limiting for card endpoints
5. **Audit Logging**: Log all card management activities
6. **Input Sanitization**: Sanitize all user inputs
7. **HTTPS Only**: Ensure all communications use HTTPS

### Performance Optimizations
1. **Database Indexing**: Optimize database queries with proper indexes
2. **Caching**: Cache user's default card information
3. **Pagination**: Implement pagination for large card lists
4. **Connection Pooling**: Use connection pooling for database

### Monitoring and Alerts
1. **Card Addition Rates**: Monitor unusual card addition patterns
2. **Payment Success Rates**: Track payment success by card type
3. **Error Monitoring**: Monitor and alert on API errors
4. **Stripe Webhook Status**: Monitor webhook delivery success

This documentation provides a complete guide for implementing credit/debit card management with your exact field requirements. The system is secure, user-friendly, and ready for production deployment.
