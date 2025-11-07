# 🛒 NANA Project - Order API Documentation

**Authentication:** Required (Bearer Token)  
**User Type:** Dependents only

---

## 1. 🔄 **POST /api/orders/checkout**
**Creates order from cart items**

### Request
```http
POST /api/orders/checkout
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (Optional):**
```json
{
  "shippingAddress": {
    "fullName": "Emma Johnson",
    "address1": "123 Main Street",
    "address2": "Apartment 4B",
    "city": "Johannesburg",
  "fulfillmentType": "pickup", // or "delivery" (default is pickup)
  "address": "123 Main Street, Johannesburg, Gauteng, 2001", // quick single-line address (optional)
    "province": "Gauteng", 
    "postalCode": "2001",
    "phone": "+27812345678"

Notes:
- If `shippingAddress` is not provided and `address` is provided, the backend will map it to `shippingAddress.address1` and use the user's name.
- If neither is provided, the backend will auto-fill from the user's saved home/postal address.
- `fulfillmentType` is embedded into the saved shippingAddress JSON for clarity and defaults to `pickup`.
  },
  "paymentMethod": "account_balance"
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "id": 15,
      "orderNumber": "ORD1730713456789123",
      "storeCode": "ABC12345",
      "userId": 13,
      "accountId": 8,
      "totalAmount": "41.98",
      "orderStatus": "processing",
      "paymentStatus": "completed",
      "paymentMethod": "account_balance",
      "shippingAddress": "{\"fullName\":\"Emma Johnson\",...}",
      "paidAt": "2024-11-04T10:30:56.789Z",
      "shippedAt": null,
      "deliveredAt": null,
      "createdAt": "2024-11-04T10:30:56.789Z",
      "updatedAt": "2024-11-04T10:30:56.789Z",
      "items": [
        {
          "id": 23,
          "orderId": 15,
          "productId": 12,
          "quantity": 1,
          "priceAtOrder": "22.99",
          "subtotal": "22.99",
          "productSnapshot": "{\"id\":12,\"name\":\"Calcium Rich Milk 1L\",...}",
          "product": {
            "name": "Calcium Rich Milk 1L",
            "brand": "Parmalat",
            "image": "https://example.com/milk.jpg"
          }
        },
        {
          "id": 24,
          "orderId": 15, 
          "productId": 18,
          "quantity": 1,
          "priceAtOrder": "18.99",
          "subtotal": "18.99",
          "productSnapshot": "{\"id\":18,\"name\":\"Organic Baby Food Puree\",...}",
          "product": {
            "name": "Organic Baby Food Puree - Mixed Vegetables",
            "brand": "Purity",
            "image": "https://example.com/baby-food.jpg"
          }
        "surname": "Johnson",
      ],
      "user": {
    },
    "collection": {
      "mode": "pickup",
      "pickupHint": "Johannesburg, Gauteng"
    }
        "lastName": "Johnson",
        "email": "emma.johnson@example.com"
      }
    }
  }
}
```

### Error Responses
**400 - Validation Failed:**
```json
{
  "success": false,
  "message": "Validation failed", 
  "errors": [
    {
      "msg": "Phone number must be a valid South African number",
      "param": "shippingAddress.phone",
      "location": "body"
    }
  ]
}
```

**400 - Insufficient Balance:**
```json
{
  "success": false,
  "message": "Insufficient account balance",
  "data": {
    "required": 79.99,
    "available": 50.00,
    "shortfall": 29.99
  }
}
```

**400 - Empty Cart:**
```json
{
  "success": false,
  "message": "Cart is empty"
}
```

**403 - Access Denied:**
```json
{
  "success": false,
}
```

---

## 2. 📜 **GET /api/orders**
**Lists user's order history with pagination**

### Request
```http
GET /api/orders?page=1&limit=10&status=processing
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page 1-50 (default: 10) 
- `status` (optional): Filter by status (`processing`, `confirmed`, `shipped`, `delivered`, `cancelled`)

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 15,
        "orderNumber": "ORD1730713456789123", 
        "storeCode": "ABC12345",
        "userId": 13,
        "accountId": 8,
        "totalAmount": "41.98",
        "orderStatus": "processing",
        "paymentStatus": "completed",
        "paymentMethod": "account_balance",
        "shippingAddress": "{\"fullName\":\"Emma Johnson\",...}",
        "paidAt": "2024-11-04T10:30:56.789Z",
        "shippedAt": null,
        "deliveredAt": null,
        "createdAt": "2024-11-04T10:30:56.789Z",
        "updatedAt": "2024-11-04T10:30:56.789Z",
        "items": [
          {
            "id": 23,
            "quantity": 1,
            "priceAtOrder": "22.99",
            "subtotal": "22.99",
            "product": {
              "id": 12,
              "name": "Calcium Rich Milk 1L",
              "brand": "Parmalat",
              "category": "Groceries",
              "subcategory": "Dairy",
              "image": "https://example.com/milk.jpg",
              "sku": "PAR-MILK-1L-001"
            }
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalOrders": 25,
      "hasMore": true
    }
}
```

---

## 3. 🔍 **GET /api/orders/:id**
**Get detailed order information**

### Request
```http
GET /api/orders/15
Authorization: Bearer {token}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 15,
    "orderNumber": "ORD1730713456789123",
    "storeCode": "ABC12345", 
    "userId": 13,
    "accountId": 8,
    "totalAmount": "41.98",
    "orderStatus": "processing",
    "paymentStatus": "completed",
    "paymentMethod": "account_balance",
    "shippingAddress": "{\"fullName\":\"Emma Johnson\",\"address1\":\"123 Main Street\",...}",
    "paidAt": "2024-11-04T10:30:56.789Z",
    "shippedAt": null,
    "deliveredAt": null,
    "createdAt": "2024-11-04T10:30:56.789Z",
    "updatedAt": "2024-11-04T10:30:56.789Z",
    "orderItems": [
      {
        "id": 23,
        "orderId": 15,
        "productId": 12,
        "quantity": 1,
        "priceAtOrder": "22.99",
        "subtotal": "22.99",
        "productSnapshot": "{\"id\":12,\"name\":\"Calcium Rich Milk 1L\",...}",
        "productAtOrderTime": {
          "id": 12,
          "name": "Calcium Rich Milk 1L",
          "brand": "Parmalat",
          "price": "22.99",
          "category": "Groceries",
          "description": "Fresh calcium-rich milk",
          "image": "https://example.com/milk.jpg",
          "ingredients": "Fresh milk, Vitamin D",
          "nutritionalInfo": "Per 100ml: Energy 270kJ...",
          "weight": "1L",
          "manufacturer": "Parmalat Ltd"
        },
        "currentProduct": {
          "id": 12,
          "name": "Calcium Rich Milk 1L",
          "inStock": true,
          "isActive": true
        },
        "displayProduct": {
          "name": "Calcium Rich Milk 1L",
          "brand": "Parmalat", 
          "image": "https://example.com/milk.jpg",
          "description": "Fresh calcium-rich milk"
        }
      }
    ],
    "user": {
      "firstName": "Emma",
      "lastName": "Johnson", 
      "email": "emma.johnson@example.com"
    },
    "storeInstructions": {
      "code": "ABC12345",
      "message": "Present this code at checkout: ABC12345",
      "note": "This code verifies your order for in-store pickup"
    }
  }
}
```

### Error Response (404 Not Found)
```json
{
  "success": false,
}
```

---

## 4. 🏪 **GET /api/orders/store/:storeCode**
**Store verification by unique code**

### Request
```http
GET /api/orders/store/ABC12345
Authorization: Bearer {token}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Order verified successfully",
  "data": {
    "id": 15,
    "orderNumber": "ORD1730713456789123",
    "storeCode": "ABC12345",
    "userId": 13,
    "totalAmount": "41.98",
    "orderStatus": "processing",
    "paymentStatus": "completed",
    "createdAt": "2024-11-04T10:30:56.789Z",
    "orderItems": [
      {
        "id": 23,
        "quantity": 1,
        "priceAtOrder": "22.99",
        "subtotal": "22.99",
        "displayProduct": {
          "name": "Calcium Rich Milk 1L",
          "brand": "Parmalat",
          "sku": "PAR-MILK-1L-001",
          "image": "https://example.com/milk.jpg"
        }
      }
    ],
    "user": {
      "firstName": "Emma",
      "lastName": "Johnson",
      "email": "emma.johnson@example.com"
    },
    "verificationInfo": {
      "storeCode": "ABC12345",
      "customerName": "Emma Johnson",
      "orderDate": "2024-11-04T10:30:56.789Z",
      "orderStatus": "processing",
      "paymentStatus": "completed",
      "totalAmount": "41.98"
    }
  }
}
```

### Error Response (404 Not Found)
```json
{
  "success": false,
}
```

---

## 5. ❌ **POST /api/orders/:id/cancel**
**Cancel orders (if still processing)**

### Request
```http
POST /api/orders/15/cancel
Authorization: Bearer {token}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

### Error Responses
**404 - Order Not Found:**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**400 - Cannot Cancel:**
```json
{
  "success": false,
}
```

---

## 📊 **Order Status Flow**

```
processing → confirmed → shipped → delivered
     ↓
  cancelled (only from processing)
- **Role Restriction:** Only dependents can place/manage orders  
- **Balance Validation:** Checkout validates sufficient account balance
- **Input Validation:** All request bodies validated with express-validator
- **Format:** 8-character alphanumeric (e.g., "ABC12345")
- **Uniqueness:** Guaranteed unique across all orders
- **Case Insensitive:** Accepts both upper and lowercase
- **Purpose:** In-store pickup verification and order lookup