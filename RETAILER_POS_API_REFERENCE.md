# Retailer POS API Reference

## Base URL
**Production**: `https://nanacaring-backend.onrender.com`

## Authentication
All POS endpoints (except login) require a Bearer token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

---

## 1. Retailer Login

### Request
```http
POST /api/auth/retailer-login
Content-Type: application/json

{
  "email": "retailer_admin@clicksstore.com",
  "password": "retailer_admin2025",
  "storeId": "main_store"
}
```

### Response (Success - 200)
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

### Response (Error - 401)
```json
{
  "success": false,
  "error": "Invalid retailer credentials or account not found"
}
```

---

## 2. View Pending Orders

### Request
```http
GET /api/orders/pos/pending
Authorization: Bearer {accessToken}
```

### Response (Success - 200)
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

### Response (Error - 403)
```json
{
  "success": false,
  "message": "Access denied. Required roles: retailer, caregiver. Your role: dependent"
}
```

---

## 3. Confirm Order Ready for Pickup

### Request
```http
POST /api/orders/{orderId}/confirm-pickup
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "staffId": "staff_123",
  "notes": "Order packed and ready for collection"
}
```

### Response (Success - 200)
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

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Order status is delivered, cannot confirm. Expected: processing"
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

## 4. Mark Order as Collected

### Request
```http
POST /api/orders/{orderId}/mark-collected
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "collectionMethod": "in_store_pickup",
  "staffId": "staff_123",
  "notes": "Collected by customer with ID verification"
}
```

### Response (Success - 200)
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

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Order status is delivered, cannot collect. Expected: ready_for_pickup or processing"
}
```

---

## 5. Get Order Details by Store Code

### Request
```http
GET /api/orders/store-code/{storeCode}
Authorization: Bearer {accessToken}
```

### Response (Success - 200)
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

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

## Order Status Flow

```
processing → ready_for_pickup → delivered
     ↓              ↓             ↓
   (confirm)    (mark-collected) (final)
```

1. **processing**: Order placed by customer, awaiting store preparation
2. **ready_for_pickup**: Store confirms order is packed and ready
3. **delivered**: Customer has collected the order

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid data or order status |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient role permissions |
| 404  | Not Found - Order/resource doesn't exist |
| 500  | Internal Server Error |

---

## Common Headers

### Request Headers
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Response Headers
```
Content-Type: application/json
```

---

## Frontend Integration Example

```javascript
class RetailerPOSAPI {
  constructor(baseURL = 'https://nanacaring-backend.onrender.com') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('retailerToken');
  }

  async login(email, password, storeId) {
    const response = await fetch(`${this.baseURL}/api/auth/retailer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, storeId })
    });
    
    const data = await response.json();
    if (data.success) {
      this.token = data.accessToken;
      localStorage.setItem('retailerToken', this.token);
    }
    return data;
  }

  async getPendingOrders() {
    const response = await fetch(`${this.baseURL}/api/orders/pos/pending`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return await response.json();
  }

  async confirmPickup(orderId, staffId, notes) {
    const response = await fetch(`${this.baseURL}/api/orders/${orderId}/confirm-pickup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ staffId, notes })
    });
    return await response.json();
  }

  async markCollected(orderId, staffId, notes) {
    const response = await fetch(`${this.baseURL}/api/orders/${orderId}/mark-collected`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collectionMethod: 'in_store_pickup',
        staffId,
        notes
      })
    });
    return await response.json();
  }
}

// Usage
const posAPI = new RetailerPOSAPI();

// Login
await posAPI.login('retailer_admin@clicksstore.com', 'retailer_admin2025', 'main_store');

// Get orders
const orders = await posAPI.getPendingOrders();

// Confirm order ready
await posAPI.confirmPickup(8, 'staff_123', 'Order packed and ready');

// Mark as collected
await posAPI.markCollected(8, 'staff_123', 'Customer collected with ID');
```