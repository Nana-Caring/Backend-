# Stripe Routes Testing Guide

## Overview
This guide provides comprehensive testing instructions for all Stripe routes in your backend system.

## Available Stripe Routes

### 1. Create Payment Intent
- **Endpoint**: `POST /api/stripe/create-payment-intent`
- **Auth**: Required (Bearer token)
- **Purpose**: Create a payment intent for funding an account
- **Request Body**:
```json
{
  "amount": 1000,
  "accountNumber": "1234567890",
  "accountType": "Main"
}
```
- **Response**:
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

### 2. Create Setup Intent
- **Endpoint**: `POST /api/stripe/create-setup-intent`
- **Auth**: Required (Bearer token)
- **Purpose**: Create setup intent for saving payment methods
- **Request Body**: `{}` (empty)
- **Response**:
```json
{
  "clientSecret": "seti_xxx_secret_xxx"
}
```

### 3. List Payment Methods
- **Endpoint**: `GET /api/stripe/payment-methods`
- **Auth**: Required (Bearer token)
- **Purpose**: List saved payment methods for user
- **Response**:
```json
{
  "paymentMethods": [...]
}
```

### 4. Webhook Handler
- **Endpoint**: `POST /api/stripe/webhook`
- **Auth**: None (Stripe signature verification)
- **Purpose**: Handle Stripe webhook events
- **Request**: Raw Stripe webhook payload
- **Response**:
```json
{
  "received": true
}
```

## PowerShell Test Commands

### Step 1: Start the Server
```powershell
npm start
# or
node server.js
```

### Step 2: Get Authentication Token
```powershell
# Login to get JWT token
$loginBody = @{ 
    email = "funder@example.com"
    password = "Password123!" 
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "Token obtained: $token"
```

### Step 3: Test Create Payment Intent
```powershell
$paymentBody = @{
    amount = 1000
    accountNumber = "1234567890"
    accountType = "Main"
} | ConvertTo-Json

try {
    $paymentResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/stripe/create-payment-intent" -Method Post -Headers $headers -Body $paymentBody
    Write-Host "✅ Payment Intent created: $($paymentResponse.clientSecret)"
} catch {
    Write-Host "⚠️ Payment Intent error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response.StatusCode)"
}
```

### Step 4: Test Create Setup Intent
```powershell
try {
    $setupResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/stripe/create-setup-intent" -Method Post -Headers $headers
    Write-Host "✅ Setup Intent created: $($setupResponse.clientSecret)"
} catch {
    Write-Host "⚠️ Setup Intent error: $($_.Exception.Message)"
}
```

### Step 5: Test List Payment Methods
```powershell
try {
    $paymentMethods = Invoke-RestMethod -Uri "http://localhost:5000/api/stripe/payment-methods" -Method Get -Headers $headers
    Write-Host "✅ Payment Methods: $($paymentMethods.paymentMethods.Count) found"
} catch {
    Write-Host "⚠️ Payment Methods error: $($_.Exception.Message)"
}
```

### Step 6: Test Webhook
```powershell
$webhookBody = @{
    id = "evt_test_webhook"
    type = "payment_intent.succeeded"
    data = @{
        object = @{
            id = "pi_test_payment_intent"
            amount = 10000
            currency = "zar"
            metadata = @{
                accountNumber = "1234567890"
                accountType = "Main"
            }
        }
    }
} | ConvertTo-Json -Depth 5

$webhookHeaders = @{ "stripe-signature" = "test_signature"; "Content-Type" = "application/json" }

try {
    $webhookResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/stripe/webhook" -Method Post -Headers $webhookHeaders -Body $webhookBody
    Write-Host "✅ Webhook processed: $($webhookResponse.received)"
} catch {
    Write-Host "⚠️ Webhook error: $($_.Exception.Message)"
}
```

## curl Commands (Alternative)

### Get Token
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"funder@example.com","password":"Password123!"}' \
  | jq -r '.token')
echo "Token: $TOKEN"
```

### Test Payment Intent
```bash
curl -X POST http://localhost:5000/api/stripe/create-payment-intent \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"accountNumber":"1234567890","accountType":"Main"}' \
  | jq '.'
```

### Test Setup Intent
```bash
curl -X POST http://localhost:5000/api/stripe/create-setup-intent \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
```

### Test Payment Methods
```bash
curl -X GET http://localhost:5000/api/stripe/payment-methods \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

### Test Webhook
```bash
curl -X POST http://localhost:5000/api/stripe/webhook \
  -H "stripe-signature: test_signature" \
  -H "Content-Type: application/json" \
  -d '{"id":"evt_test","type":"payment_intent.succeeded","data":{"object":{"id":"pi_test","amount":10000,"currency":"zar","metadata":{"accountNumber":"1234567890","accountType":"Main"}}}}' \
  | jq '.'
```

## Environment Setup

### Required Environment Variables
Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Database Configuration
DATABASE_URL=your_database_url
```

### Stripe Dashboard Setup
1. **Get API Keys**:
   - Log into Stripe Dashboard
   - Go to Developers > API keys
   - Copy Test Secret Key (sk_test_...)
   - Copy Test Publishable Key (pk_test_...)

2. **Configure Webhooks**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`
   - Copy webhook signing secret

3. **Test with Stripe CLI**:
```bash
# Install Stripe CLI
# Then forward webhooks to local development
stripe listen --forward-to localhost:5000/api/stripe/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

## Expected Responses

### Success Responses
- **Payment Intent**: `{ "clientSecret": "pi_xxx_secret_xxx" }`
- **Setup Intent**: `{ "clientSecret": "seti_xxx_secret_xxx" }`
- **Payment Methods**: `{ "paymentMethods": [...] }`
- **Webhook**: `{ "received": true }`

### Error Responses
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User not linked to dependent account
- **404 Not Found**: Account or Stripe customer not found
- **500 Internal Server Error**: Stripe API error or server issue

## Security Features

### Authentication
- All payment-related endpoints require valid JWT token
- Token must include user ID and role
- Funder-dependent relationships are validated

### Webhook Security
- Webhook signatures are verified using Stripe's signing secret
- Only valid Stripe webhooks are processed
- Raw body parsing ensures signature validation works

### Data Validation
- Amount validation (positive numbers)
- Account number format validation
- Funder-dependent relationship verification

## Integration Flow

### Frontend Payment Flow
1. User initiates payment on frontend
2. Frontend calls `/create-payment-intent` with amount and account details
3. Backend validates user permissions and creates Stripe PaymentIntent
4. Frontend receives `clientSecret` and uses Stripe.js to complete payment
5. Stripe processes payment and sends webhook to backend
6. Backend updates account balance based on webhook event

### Payment Method Management
1. User wants to save payment method
2. Frontend calls `/create-setup-intent`
3. Backend creates Stripe SetupIntent
4. Frontend uses `clientSecret` with Stripe Elements to save payment method
5. Saved payment methods can be retrieved via `/payment-methods`

## Troubleshooting

### Common Issues
1. **Database Connection Errors**: Ensure DATABASE_URL is correct
2. **Stripe Key Issues**: Verify STRIPE_SECRET_KEY is set and valid
3. **Authentication Errors**: Check JWT_SECRET and token format
4. **Webhook Signature Errors**: Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard

### Debug Commands
```powershell
# Check if server is running
Test-NetConnection localhost -Port 5000

# Verify environment variables
Get-ChildItem Env: | Where-Object {$_.Name -like "*STRIPE*"}

# Test database connection
node -e "require('./models'); console.log('DB connected')"
```

## Testing Checklist

- [ ] All route files load without errors
- [ ] All controller methods exist and are functions
- [ ] Authentication middleware is properly applied
- [ ] Stripe package is available and configured
- [ ] Environment variables are set
- [ ] Database models are accessible
- [ ] Server starts without errors
- [ ] All endpoints respond to requests
- [ ] Authentication is properly enforced
- [ ] Webhook signature validation works
- [ ] Error handling returns appropriate status codes

## Production Considerations

### Security
- Use HTTPS in production
- Rotate Stripe keys regularly
- Monitor webhook endpoints for suspicious activity
- Implement rate limiting on payment endpoints

### Monitoring
- Set up Stripe Dashboard alerts
- Monitor payment success/failure rates
- Track webhook delivery status
- Log all payment-related events

### Performance
- Cache Stripe customer data when possible
- Implement proper error handling and retries
- Use Stripe's idempotency keys for payment intents
- Monitor API request latency

Your Stripe integration is now ready for comprehensive testing!
