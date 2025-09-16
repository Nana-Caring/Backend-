# Payment Card Management - Credit/Debit Cards Only

## Overview
This system allows funders to add and manage credit/debit cards as payment methods. The implementation focuses solely on card payments with the exact fields you specified.

## Form Fields

### Required Card Fields
```
Bank Name *              → bankName (required)
Card Number              → cardNumber (required) 
Expiry Date (MM/YY)      → expiryDate (required)
CCV (123)                → ccv (required)
```

### Optional Fields
```
Nickname                 → nickname (optional)
Set as Default          → isDefault (optional, boolean)
```

## API Endpoints

### 1. Add Payment Card
```
POST /api/payment-cards/add
```

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

**Success Response:**
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

### 2. Get All Payment Cards
```
GET /api/payment-cards/my-cards
```

**Success Response:**
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
    }
  ],
  "totalCards": 1
}
```

### 3. Set Default Card
```
PUT /api/payment-cards/set-default/:cardId
```

**Success Response:**
```json
{
  "message": "Default payment card updated successfully",
  "cardId": "uuid-here",
  "bankName": "Standard Bank",
  "cardNumber": "****-****-****-1111"
}
```

### 4. Remove Payment Card
```
DELETE /api/payment-cards/remove/:cardId
```

**Success Response:**
```json
{
  "message": "Payment card removed successfully"
}
```

### 5. Create Payment Intent with Card
```
POST /api/payment-cards/create-payment-intent
```

**Request Body:**
```json
{
  "amount": 100.00,
  "cardId": "uuid-here",
  "description": "Payment for account funding"
}
```

**Success Response:**
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

## Security Features

### Data Protection
- **Card Numbers**: Only last 4 digits stored in database
- **Full Card Details**: Tokenized through Stripe for security
- **Masked Display**: Card numbers always shown as ****-****-****-1111
- **CCV Handling**: Required for validation but consider not storing
- **Unique Constraints**: Prevents duplicate cards per user

### Access Control
- **Authentication**: JWT token required for all endpoints
- **User Isolation**: Users can only access their own cards
- **Soft Delete**: Cards marked as inactive, not permanently deleted
- **Default Management**: Only one default card per user

## Database Schema

### PaymentCards Table
```sql
CREATE TABLE payment_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId INTEGER NOT NULL REFERENCES Users(id),
  bankName VARCHAR(100) NOT NULL,
  cardNumber VARCHAR(4) NOT NULL,  -- Last 4 digits only
  expiryDate VARCHAR(5) NOT NULL,  -- MM/YY format
  ccv VARCHAR(4) NOT NULL,         -- Consider encryption
  stripePaymentMethodId VARCHAR,
  isDefault BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  nickname VARCHAR(50),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
CREATE UNIQUE INDEX unique_user_card ON payment_cards(userId, cardNumber);
CREATE INDEX user_default_card ON payment_cards(userId, isDefault);
CREATE INDEX user_active_cards ON payment_cards(userId, isActive);
```

## Frontend Form Implementation

### HTML Form Example
```html
<form id="addCardForm">
  <div class="form-group">
    <label for="bankName">Bank Name *</label>
    <input type="text" id="bankName" name="bankName" placeholder="Enter bank name" required>
  </div>
  
  <div class="form-group">
    <label for="cardNumber">Card Number</label>
    <input type="text" id="cardNumber" name="cardNumber" placeholder="Enter card number" required>
  </div>
  
  <div class="form-group">
    <label for="expiryDate">Expiry Date</label>
    <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" required>
  </div>
  
  <div class="form-group">
    <label for="ccv">CCV</label>
    <input type="text" id="ccv" name="ccv" placeholder="123" required>
  </div>
  
  <div class="form-group">
    <label for="nickname">Nickname (Optional)</label>
    <input type="text" id="nickname" name="nickname" placeholder="My Visa Card">
  </div>
  
  <div class="form-group">
    <label>
      <input type="checkbox" id="isDefault" name="isDefault">
      Set as default payment method
    </label>
  </div>
  
  <button type="submit">Add Card</button>
</form>
```

### JavaScript Form Handling
```javascript
document.getElementById('addCardForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const cardData = {
    bankName: formData.get('bankName'),
    cardNumber: formData.get('cardNumber'),
    expiryDate: formData.get('expiryDate'),
    ccv: formData.get('ccv'),
    nickname: formData.get('nickname'),
    isDefault: formData.get('isDefault') === 'on'
  };
  
  try {
    const response = await fetch('/api/payment-cards/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(cardData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('Card added successfully!');
      loadCards(); // Refresh card list
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert('Error adding card: ' + error.message);
  }
});
```

## Testing Commands

### PowerShell Test Commands
```powershell
# 1. Login and get token
$loginBody = @{ email = "funder@example.com"; password = "Password123!" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# 2. Add card
$cardBody = @{
    bankName = "Standard Bank"
    cardNumber = "4111111111111111"
    expiryDate = "12/25"
    ccv = "123"
    nickname = "My Visa Card"
    isDefault = $true
} | ConvertTo-Json
$addResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payment-cards/add" -Method Post -Headers $headers -Body $cardBody

# 3. Get cards
$cards = Invoke-RestMethod -Uri "http://localhost:5000/api/payment-cards/my-cards" -Method Get -Headers $headers

# 4. Create payment intent
$paymentBody = @{
    amount = 100.00
    cardId = $cards.cards[0].id
    description = "Test payment"
} | ConvertTo-Json
$paymentResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/payment-cards/create-payment-intent" -Method Post -Headers $headers -Body $paymentBody
```

## Migration

Run the migration to create the payment cards table:
```bash
npx sequelize-cli db:migrate
```

## Environment Variables

Ensure these Stripe environment variables are set:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Error Handling

### Common Validation Errors
- **Missing Fields**: "All card fields are required"
- **Invalid Expiry**: "Expiry date must be in MM/YY format"
- **Invalid Card**: "Card number must be 13-19 digits"
- **Invalid CCV**: "CCV must be 3-4 digits"
- **Duplicate Card**: "A card with these last 4 digits is already added"

### Stripe Integration Errors
- **Invalid Card Details**: "Invalid card details" (from Stripe validation)
- **Payment Method Creation**: Handled gracefully with user-friendly messages

## Production Considerations

### Security Enhancements
1. **PCI Compliance**: Ensure proper PCI compliance for card data handling
2. **Encryption**: Consider encrypting sensitive fields at rest
3. **CCV Storage**: Avoid storing CCV in production
4. **Rate Limiting**: Implement rate limiting for card addition endpoints
5. **Audit Logging**: Log all card management activities

### Performance Optimizations
1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Caching**: Cache user's default card information
3. **Pagination**: Implement pagination for large card lists

This implementation provides a complete, secure payment card management system focused exclusively on credit/debit cards with the exact fields you specified.
