# User Portal API Documentation

This portal allows users to securely view and manage their accounts, transactions, and personal details. Admins can manage users, but cannot access a user's portal without explicit user consent.

## Authentication
- All endpoints require JWT authentication.
- Users log in with their email and password via `/api/auth/login`.
- Admins must request access and be approved by the user to access a user's portal.

---

## Endpoints

### 1. Login
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "userPassword"
}
```
- Returns: `{ token: <JWT> }`

---

### 2. Get User Details (Dynamic)
```
GET /api/portal/me
Authorization: Bearer <token>
```
- Returns: User profile info, dependents, accounts, and recent transactions

**Response Example:**
```
{
  "user": {
    "id": 1,
    "firstName": "Jane",
    "surname": "Doe",
    "email": "jane.doe@example.com",
    "role": "caregiver",
    "status": "active",
    "createdAt": "2025-07-23T10:00:00Z",
    "updatedAt": "2025-07-23T10:00:00Z",
    "Dependents": [ ... ],
    "Accounts": [ ... ]
  },
  "recentTransactions": [ ... ]
}
```

---

### 3. Get User Accounts (Advanced)
```
GET /api/portal/me/accounts
Authorization: Bearer <token>
```
- Returns: List of user's accounts, each with sub-accounts and parent account info

**Response Example:**
```
{
  "accounts": [
    {
      "id": 101,
      "accountNumber": "ACC123456",
      "accountType": "Main",
      "balance": "1000.00",
      "currency": "ZAR",
      "status": "active",
      "subAccounts": [ ... ],
      "parentAccount": null
    },
    {
      "id": 102,
      "accountNumber": "ACC123457",
      "accountType": "Education",
      "balance": "200.00",
      "currency": "ZAR",
      "status": "active",
      "subAccounts": [],
      "parentAccount": { ... }
    }
  ]
}
```

---

### 4. Get User Transactions (Advanced)
```
GET /api/portal/me/transactions?type=Credit&startDate=2025-07-01&endDate=2025-07-23&search=school&page=1&limit=10
Authorization: Bearer <token>
```
- Returns: List of user's transactions with advanced filtering and pagination

**Response Example:**
```
{
  "transactions": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 5. Admin Requests Access to User Portal
```
POST /api/portal/request-access/:userId
Authorization: Bearer <admin-token>
```
- Admin requests access; triggers user notification/approval

---

### 6. User Approves Admin Access
```
POST /api/portal/approve-access/:adminId
Authorization: Bearer <user-token>
```
- User approves admin access; admin receives temporary token

---

### 7. Admin Accesses User Portal (with approval)
```
GET /api/portal/user/:userId
Authorization: Bearer <admin-temp-token>
```
- Returns: User's portal data (accounts, transactions, details)

---

## Security Notes
- All portal endpoints require authentication.
- Admin access to user portal is only possible after user approval.
- All access is logged and auditable.

---

## Example Workflow
1. User logs in to portal with email/password.
2. User views their accounts, transactions, and details.
3. Admin requests access to a user's portal.
4. User receives notification and approves access.
5. Admin receives temporary token and can view the user's portal data.

---

## Integration
- Use the same authentication and user model as your main app.
- Protect all portal endpoints with `authenticate` middleware.
- Implement approval workflow for admin access.

---

## Contact
For further integration or customization, contact the backend team.
