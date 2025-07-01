# User Blocking System Documentation

## Overview
The user blocking system allows administrators to block, suspend, or manage user access to the application. This system includes database fields, middleware, API endpoints, and proper status checking.

## Database Schema

### New Fields Added to Users Table
```sql
- isBlocked: BOOLEAN (default: false)
- blockedAt: DATE (nullable)
- blockedBy: INTEGER (references Users.id, nullable)
- blockReason: TEXT (nullable)
- status: ENUM('active', 'blocked', 'suspended', 'pending') (default: 'active')
```

## User Status Types

### 1. **Active** (`status: 'active'`)
- Normal user state
- Full access to the system
- Can login and use all features

### 2. **Blocked** (`status: 'blocked'` or `isBlocked: true`)
- User is permanently blocked
- Cannot login
- All API requests are denied
- Requires admin action to unblock

### 3. **Suspended** (`status: 'suspended'`)
- Temporary restriction
- Cannot login
- All API requests are denied
- Can be reactivated by admin

### 4. **Pending** (`status: 'pending'`)
- Account awaiting activation
- Cannot login until activated
- Used for new registrations requiring approval

## API Endpoints

### Admin Endpoints (Requires Admin Role)

#### 1. Block User
```http
PUT /admin/users/:userId/block
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Violation of terms of service"
}
```

**Response:**
```json
{
  "message": "User blocked successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "surname": "Doe",
    "isBlocked": true,
    "status": "blocked",
    "blockedAt": "2025-07-01T10:00:00.000Z",
    "blockReason": "Violation of terms of service"
  }
}
```

#### 2. Unblock User
```http
PUT /admin/users/:userId/unblock
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "User unblocked successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "surname": "Doe",
    "isBlocked": false,
    "status": "active"
  }
}
```

#### 3. Suspend User
```http
PUT /admin/users/:userId/suspend
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Suspicious activity detected"
}
```

**Response:**
```json
{
  "message": "User suspended successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "surname": "Doe",
    "status": "suspended",
    "blockedAt": "2025-07-01T10:00:00.000Z",
    "blockReason": "Suspicious activity detected"
  }
}
```

#### 4. Get Blocked/Suspended Users
```http
GET /admin/blocked-users?status=blocked
GET /admin/blocked-users?status=suspended
GET /admin/blocked-users?status=all
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Blocked users retrieved successfully",
  "count": 5,
  "users": [
    {
      "id": 123,
      "firstName": "John",
      "surname": "Doe",
      "email": "user@example.com",
      "role": "funder",
      "isBlocked": true,
      "status": "blocked",
      "blockedAt": "2025-07-01T10:00:00.000Z",
      "blockReason": "Violation of terms",
      "BlockedByUser": {
        "id": 1,
        "firstName": "Admin",
        "surname": "User",
        "email": "admin@example.com"
      }
    }
  ]
}
```

## Login Behavior

When a blocked/suspended user tries to login:

### Blocked User Response:
```json
{
  "error": "Account blocked",
  "message": "Your account has been blocked. Please contact support.",
  "code": "ACCOUNT_BLOCKED",
  "details": {
    "blockedAt": "2025-07-01T10:00:00.000Z",
    "reason": "Violation of terms of service"
  }
}
```

### Suspended User Response:
```json
{
  "error": "Account suspended",
  "message": "Your account has been suspended. Please contact support.",
  "code": "ACCOUNT_SUSPENDED",
  "details": {
    "blockedAt": "2025-07-01T10:00:00.000Z",
    "reason": "Suspicious activity detected"
  }
}
```

### Pending User Response:
```json
{
  "error": "Account pending",
  "message": "Your account is pending activation. Please contact support.",
  "code": "ACCOUNT_PENDING"
}
```

## Middleware

### checkUserStatus Middleware
Add this middleware to protected routes that require active user status:

```javascript
const checkUserStatus = require('../middlewares/checkUserStatus');

// Apply to all user routes
router.use('/users', authenticate, checkUserStatus);

// Or apply to specific routes
router.get('/protected-route', authenticate, checkUserStatus, controller);
```

The middleware will automatically:
- Check if user is blocked, suspended, or pending
- Return appropriate error responses
- Allow active users to continue

## Frontend Integration

### JavaScript Example
```javascript
// Handle login response
const login = async (email, password) => {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle blocking errors
      if (data.code === 'ACCOUNT_BLOCKED') {
        showBlockedMessage(data.message, data.details);
        return;
      }
      if (data.code === 'ACCOUNT_SUSPENDED') {
        showSuspendedMessage(data.message, data.details);
        return;
      }
      if (data.code === 'ACCOUNT_PENDING') {
        showPendingMessage(data.message);
        return;
      }
    }

    // Normal login success
    localStorage.setItem('token', data.accessToken);
    redirectToApp();
  } catch (error) {
    console.error('Login error:', error);
  }
};

// Admin functions
const blockUser = async (userId, reason) => {
  const response = await fetch(\`/admin/users/\${userId}/block\`, {
    method: 'PUT',
    headers: {
      'Authorization': \`Bearer \${adminToken}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  return response.json();
};

const getBlockedUsers = async () => {
  const response = await fetch('/admin/blocked-users', {
    headers: {
      'Authorization': \`Bearer \${adminToken}\`
    }
  });
  return response.json();
};
```

## Security Features

1. **Self-Protection**: Admins cannot block themselves
2. **Audit Trail**: All blocking actions are tracked with timestamp and admin ID
3. **Reason Logging**: All blocks/suspensions include a reason
4. **Immediate Effect**: Blocked users are denied access immediately
5. **Token Validation**: Existing tokens are checked against current user status

## Database Migration Applied

The migration has been applied to both development and production databases:
- ✅ Development: Local PostgreSQL
- ✅ Production: Render PostgreSQL

## Usage Notes

1. **Blocking vs Suspending**: Use "block" for permanent restrictions, "suspend" for temporary ones
2. **Status Priority**: The system checks both `isBlocked` field and `status` field for maximum compatibility
3. **Admin Access**: Only users with `role: 'admin'` can access blocking endpoints
4. **Immediate Effect**: Changes take effect immediately on next API request or login attempt

The user blocking system is now fully implemented and ready for use in both development and production environments! 🔒
