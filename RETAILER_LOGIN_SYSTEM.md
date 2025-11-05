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
// Login (Production)
const loginResponse = await fetch('https://nanacaring-backend.onrender.com/api/auth/retailer-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'retailer_admin@clicksstore.com',
    password: 'retailer_admin2025',
    storeId: 'main_store'
  })
});

const { accessToken, retailer } = await loginResponse.json();

// Use token for POS operations (Production)
const ordersResponse = await fetch('https://nanacaring-backend.onrender.com/api/orders/pos/pending', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Production Deployment 🌐

**Production Server**: `https://nanacaring-backend.onrender.com`

### Production API Endpoints:
- **Login**: `POST https://nanacaring-backend.onrender.com/api/auth/retailer-login`
- **Pending Orders**: `GET https://nanacaring-backend.onrender.com/api/orders/pos/pending`
- **Confirm Pickup**: `POST https://nanacaring-backend.onrender.com/api/orders/:id/confirm-pickup`
- **Mark Collected**: `POST https://nanacaring-backend.onrender.com/api/orders/:id/mark-collected`

## Successful Implementation ✅

- **✅ Login Working**: Retailer can successfully login and navigate to dashboard
- **✅ Authentication**: JWT tokens are properly generated and validated
- **✅ API Access**: POS endpoints are accessible with retailer tokens
- **✅ Test Results**: 2 pending orders retrieved successfully via API
- **✅ Production Ready**: System deployed and accessible at nanacaring-backend.onrender.com

## Troubleshooting

### Frontend Not Showing Orders
If you can login but can't see orders in the dashboard:

1. **Check Frontend API Calls**: Ensure the frontend is calling the POS-specific endpoint:
   ```javascript
   // ❌ Wrong - Regular endpoint (won't work for retailers)
   fetch('https://nanacaring-backend.onrender.com/api/orders')
   
   // ✅ Correct - POS endpoint for retailers
   fetch('https://nanacaring-backend.onrender.com/api/orders/pos/pending', {
     headers: { 'Authorization': `Bearer ${accessToken}` }
   })
   ```

2. **Verify Token Usage**: Make sure the frontend is using the retailer token:
   ```javascript
   // Store the retailer token after login
   localStorage.setItem('retailerToken', accessToken);
   
   // Use it in API calls
   const token = localStorage.getItem('retailerToken');
   fetch('https://nanacaring-backend.onrender.com/api/orders/pos/pending', {
     headers: { 'Authorization': `Bearer ${token}` }
   })
   ```

3. **Check Role-Based UI**: The frontend might need to show different views for retailers:
   ```javascript
   if (user.role === 'retailer') {
     // Show POS dashboard with pending orders
     loadPOSOrders();
   } else {
     // Show regular user dashboard
     loadUserOrders();
   }
   ```

### Common Issues
- **Wrong Endpoint**: Using `/api/orders` instead of `/api/orders/pos/pending`
- **Missing Authorization**: Not including Bearer token in headers
- **Role Check**: Frontend filtering out orders for retailer role
- **State Management**: Frontend not updating state after successful API call

## Complete API Reference 📚

### 1. Retailer Login
**Endpoint**: `POST /api/auth/retailer-login`  
**URL**: `https://nanacaring-backend.onrender.com/api/auth/retailer-login`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "retailer_admin@clicksstore.com",
  "password": "retailer_admin2025",
  "storeId": "main_store"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Retailer login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "retailer": {
    "id": 28,
    "firstName": "Clicks",
    "middleName": null,
    "surname": "Retailer Store",
    "email": "retailer_admin@clicksstore.com",
    "role": "retailer",
    "storeId": "main_store",
    "loginTime": "2025-11-04T18:10:17.628Z"
  },
  "permissions": [
    "view_pending_orders",
    "confirm_pickup",
    "mark_collected",
    "view_order_details"
  ]
}
```

**Error Response (401)**:
```json
{
  "success": false,
  "error": "Invalid retailer credentials or account not found"
}
```

---

### 2. View Pending Orders
**Endpoint**: `GET /api/orders/pos/pending`  
**URL**: `https://nanacaring-backend.onrender.com/api/orders/pos/pending`

**Request Headers**:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Pending orders retrieved",
  "data": [
    {
      "id": 8,
      "orderNumber": "ORD1762261407711629",
      "storeCode": "LKECMX5Y",
      "customerName": "Mandla Khumalo",
      "customerAge": 20,
      "totalAmount": "79.99",
      "itemCount": 1,
      "orderStatus": "processing",
      "createdAt": "2025-11-04T13:03:27.738Z",
      "confirmedAt": null
    },
    {
      "id": 7,
      "orderNumber": "ORD1762240466684451",
      "storeCode": "DM9QL5MF",
      "customerName": "Emma Johnson",
      "customerAge": 1,
      "totalAmount": "254.96",
      "itemCount": 3,
      "orderStatus": "processing",
      "createdAt": "2025-11-04T07:14:26.713Z",
      "confirmedAt": null
    }
  ]
}
```

**Error Response (403)**:
```json
{
  "success": false,
  "message": "Access denied. Required roles: retailer, caregiver. Your role: dependent"
}
```

---

### 3. Confirm Order Ready for Pickup
**Endpoint**: `POST /api/orders/:id/confirm-pickup`  
**URL**: `https://nanacaring-backend.onrender.com/api/orders/8/confirm-pickup`

**Request Headers**:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "staffId": "staff_123",
  "notes": "Order packed and ready for collection"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Order confirmed and ready for pickup",
  "data": {
    "order": {
      "id": 8,
      "orderNumber": "ORD1762261407711629",
      "storeCode": "LKECMX5Y",
      "orderStatus": "ready_for_pickup",
      "confirmedAt": "2025-11-04T18:30:00.000Z",
      "customerName": "Mandla Khumalo",
      "notes": "Order packed and ready for collection"
    }
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "Order status is delivered, cannot confirm. Expected: processing"
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### 4. Mark Order as Collected
**Endpoint**: `POST /api/orders/:id/mark-collected`  
**URL**: `https://nanacaring-backend.onrender.com/api/orders/8/mark-collected`

**Request Headers**:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "collectionMethod": "in_store_pickup",
  "staffId": "staff_123",
  "notes": "Collected by customer with ID verification"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Order marked as collected",
  "data": {
    "order": {
      "id": 8,
      "orderNumber": "ORD1762261407711629",
      "storeCode": "LKECMX5Y",
      "orderStatus": "delivered",
      "collectedAt": "2025-11-04T18:45:00.000Z",
      "collectionMethod": "in_store_pickup",
      "customerName": "Mandla Khumalo",
      "totalAmount": "79.99",
      "itemCount": 1,
      "notes": "Collected by customer with ID verification"
    }
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "Order status is delivered, cannot collect. Expected: ready_for_pickup or processing"
}
```

---

### 5. Get Order Details by Store Code
**Endpoint**: `GET /api/orders/store-code/:storeCode`  
**URL**: `https://nanacaring-backend.onrender.com/api/orders/store-code/LKECMX5Y`

**Request Headers**:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Success Response (200)**:
```json
{
  "success": true,
  "order": {
    "id": 8,
    "orderNumber": "ORD1762261407711629",
    "storeCode": "LKECMX5Y",
    "orderStatus": "processing",
    "totalAmount": "79.99",
    "paymentStatus": "completed",
    "createdAt": "2025-11-04T13:03:27.738Z",
    "customer": {
      "firstName": "Mandla",
      "surname": "Khumalo",
      "age": 20
    },
    "orderItems": [
      {
        "quantity": 1,
        "priceAtTime": "79.99",
        "totalPrice": "79.99",
        "productSnapshot": {
          "name": "Baby Formula - Stage 1",
          "brand": "Nan",
          "category": "Infant Nutrition"
        }
      }
    ]
  }
}
```

## Migration Notes

- **Database Change**: Added `'retailer'` to User role enum
- **Backward Compatibility**: Existing caregiver accounts can still access POS endpoints
- **New Accounts**: Use `create-pos-retailer.js` to create proper retailer accounts
- **Role Check**: POS endpoints now verify retailer/caregiver role before allowing access
