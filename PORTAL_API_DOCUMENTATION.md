# User Portal API Documentation

This portal allows users to securely view and manage their accounts, transactions, and personal details. Admins can manage users, but cannot access a user's portal without explicit user consent.

## Authentication
- All endpoints require JWT authentication.
- Users log in with their email and password via `/api/auth/login`.
- Admins must request access and be approved by the user to access a user's portal.

---

## Endpoints


### 1. Portal Login (Admin-as-User)
```
POST /api/portal/admin-login
{
  "username": "user@example.com", // user's email
  "password": "userPassword"       // user's password
}
```
- Returns: `{ token: <portalJWT>, user: { ... } }`

**Description:**
- Admin logs in to the portal using the credentials of the user whose portal they wish to access.
- The portal issues a special JWT token scoped for that user.
- All subsequent requests to portal endpoints must use this token.


---


### 2. Get User Details (Private via Portal)
```
GET /api/portal/me
Authorization: Bearer <portalJWT>
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


### 3. Get User Accounts (Private via Portal)
```
GET /api/portal/me/accounts
Authorization: Bearer <portalJWT>
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


### 4. Get User Transactions (Private via Portal)
```
GET /api/portal/me/transactions?type=Credit&startDate=2025-07-01&endDate=2025-07-23&search=school&page=1&limit=10
Authorization: Bearer <portalJWT>
```
- Returns: List of user's transactions with advanced filtering and pagination
### 5. Edit User Details (Private via Portal)
```
PUT /api/portal/me
Authorization: Bearer <portalJWT>
{
  "firstName": "NewName",
  "surname": "NewSurname",
  "email": "new.email@example.com",
  ...
}
```
- Allows editing of user details, only accessible via portal login.

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
