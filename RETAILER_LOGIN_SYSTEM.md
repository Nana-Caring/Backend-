# Retailer POS Login System

## Overview
The retailer login system provides dedicated authentication for POS (Point of Sale) store staff to manage order fulfillment operations.

## Setup

### 1. Create Retailer Account
Run the setup script to create a retailer account:
```bash
node create-pos-retailer.js
```

**Default Credentials:**
- Email: `retailer_admin@clicksstore.com`
- Password: `retailer_admin2025`
- Role: `retailer`

### 2. Environment Variables
Set these in your `.env` file:
```env
RETAILER_ADMIN_EMAIL=retailer_admin@clicksstore.com
RETAILER_ADMIN_PASSWORD=retailer_admin2025
```

## API Endpoints

### Retailer Login
**POST** `/api/auth/retailer-login`

**Request Body:**
```json
{
  "email": "retailer_admin@clicksstore.com",
  "password": "retailer_admin2025",
  "storeId": "main_store" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Retailer login successful",
  "accessToken": "jwt_token_here",
  "jwt": "jwt_token_here",
  "retailer": {
    "id": 123,
    "firstName": "Clicks",
    "surname": "Retailer Store",
    "email": "retailer_admin@clicksstore.com",
    "role": "retailer",
    "storeId": "main_store",
    "loginTime": "2025-11-04T10:30:00.000Z"
  },
  "permissions": [
    "view_pending_orders",
    "confirm_pickup",
    "mark_collected",
    "view_order_details"
  ]
}
```

## POS Operations

After logging in, retailer staff can access these POS endpoints:

### 1. View Pending Orders
**GET** `/api/orders/pos/pending`
- Headers: `Authorization: Bearer {accessToken}`
- Returns: List of orders awaiting pickup

### 2. Confirm Order Ready for Pickup
**POST** `/api/orders/:id/confirm-pickup`
- Headers: `Authorization: Bearer {accessToken}`
- Body: `{ "staffId": "staff_123", "notes": "Order packed and ready" }`
- Changes status: `processing` → `ready_for_pickup`

### 3. Mark Order as Collected
**POST** `/api/orders/:id/mark-collected`
- Headers: `Authorization: Bearer {accessToken}`
- Body: `{ "collectionMethod": "in_store_pickup", "staffId": "staff_123", "notes": "Collected by customer" }`
- Changes status: `ready_for_pickup` → `delivered`

## Authentication Features

- **Extended Session**: 12-hour token expiry for store operations
- **Store Tracking**: Optional `storeId` field for multi-store setups
- **Role-Based Access**: Only `retailer` role can access POS endpoints
- **Backward Compatibility**: `caregiver` role also supported for existing setups
- **Secure Cookies**: Refresh tokens stored in httpOnly cookies

## Security

- Retailer accounts use dedicated role (`retailer`) 
- POS endpoints require specific role authorization
- JWT tokens include retailer-specific payload
- Separate refresh token cookies for security
- Rate limiting on login attempts

## Frontend Integration

Use the retailer login for POS terminal applications:

```javascript
// Login
const loginResponse = await fetch('/api/auth/retailer-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'retailer_admin@clicksstore.com',
    password: 'retailer_admin2025',
    storeId: 'main_store'
  })
});

const { accessToken, retailer } = await loginResponse.json();

// Use token for POS operations
const ordersResponse = await fetch('/api/orders/pos/pending', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Migration Notes

- **Database Change**: Added `'retailer'` to User role enum
- **Backward Compatibility**: Existing caregiver accounts can still access POS endpoints
- **New Accounts**: Use `create-pos-retailer.js` to create proper retailer accounts
- **Role Check**: POS endpoints now verify retailer/caregiver role before allowing access
