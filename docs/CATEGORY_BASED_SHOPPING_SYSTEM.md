# Category-Based Shopping Cart & Checkout System

## 🎯 System Overview

This system implements a sophisticated category-based budgeting and shopping system where:

1. **Each dependent user has multiple accounts** - one for each product category (Healthcare, Groceries, Education, Transport, Entertainment, Other)
2. **Products are categorized** and automatically deducted from the appropriate category account during checkout
3. **Split payments** occur automatically - if a cart contains products from multiple categories, each category account is debited separately
4. **Budget management** allows users to transfer funds between categories and view category-specific balances

## 📋 Database Schema Updates

### Accounts Table Enhancements
```sql
-- New columns added to Accounts table
ALTER TABLE "Accounts" ADD COLUMN "category" VARCHAR(50);
ALTER TABLE "Accounts" ADD COLUMN "isMainAccount" BOOLEAN DEFAULT false;
ALTER TABLE "Accounts" ADD COLUMN "allocatedFromId" INTEGER REFERENCES "Accounts"("id");
```

### Account Categories
- `healthcare` - Medical expenses, vitamins, health products
- `groceries` - Food, beverages, household items
- `education` - Books, school supplies, educational materials
- `transport` - Transportation costs, fuel, public transport
- `entertainment` - Movies, games, recreational activities
- `other` - Miscellaneous purchases

## 🏗️ Architecture Components

### 1. Enhanced Models

#### Account Model Updates
- **category**: Product category this account handles
- **isMainAccount**: Boolean flag for main savings account
- **allocatedFromId**: Reference to parent account (for category accounts)
- **Self-referential associations**: Main accounts have many category accounts

### 2. Controllers

#### CategoryOrderController
- **Split Payment Logic**: Automatically detects product categories and debits appropriate accounts
- **Insufficient Funds Validation**: Checks each category account balance before processing
- **Category-based Refunds**: Returns funds to correct category accounts on cancellation

#### CategoryAccountController  
- **Balance Management**: View balances across all category accounts
- **Inter-category Transfers**: Move funds between different category accounts
- **Account Details**: Get specific category account information

### 3. API Endpoints

#### Shopping Endpoints
```
POST /api/category-orders/checkout
GET  /api/category-orders/
GET  /api/category-orders/:id  
PATCH /api/category-orders/:id/cancel
```

#### Account Management Endpoints
```
GET  /api/category-accounts/balances
GET  /api/category-accounts/:category
POST /api/category-accounts/transfer
```

## 🛒 Checkout Process Flow

### 1. Cart Analysis
```javascript
// System groups cart items by product category
const itemsByCategory = {
  'healthcare': [vitaminProduct, medicineProduct],
  'groceries': [milkProduct, breadProduct],  
  'education': [bookProduct]
}
```

### 2. Payment Validation
```javascript
// Check sufficient funds in each category account
const paymentPlan = [
  { category: 'healthcare', account: healthcareAccount, amount: 75.50 },
  { category: 'groceries', account: groceriesAccount, amount: 45.25 },
  { category: 'education', account: educationAccount, amount: 120.00 }
]
```

### 3. Split Payment Execution
```javascript
// Debit each category account separately
for (const plan of paymentPlan) {
  await plan.account.update({ 
    balance: plan.account.balance - plan.amount 
  });
  
  // Create transaction record for each category
  await Transaction.create({
    accountId: plan.account.id,
    amount: plan.amount,
    description: `Purchase - Order ${orderNumber} (${plan.category})`
  });
}
```

## 💰 Budget Allocation System

### Initial Setup (via Seeder)
When category accounts are created, existing balances are distributed:
- **Healthcare**: 25%
- **Groceries**: 30% 
- **Education**: 20%
- **Transport**: 15%
- **Entertainment**: 5%
- **Other**: 5%

### Example Distribution
```
Original Deposit: R500.00
├── Healthcare:    R125.00 (25%)
├── Groceries:     R150.00 (30%)
├── Education:     R100.00 (20%)
├── Transport:     R75.00  (15%)
├── Entertainment: R25.00  (5%)
└── Other:         R25.00  (5%)

Main Account Balance: R500.00 (Shows total of all category accounts)
```

## 🔄 Fund Transfer System

### Inter-Category Transfers
Users can move funds between categories:

```javascript
POST /api/category-accounts/transfer
{
  "fromCategory": "entertainment",
  "toCategory": "healthcare", 
  "amount": 15.00,
  "description": "Moving funds for medical purchase"
}
```

### Transfer Validation
- Source account must have sufficient funds
- Both accounts must exist and be active
- Cannot transfer to same category
- Creates audit trail with transaction records

## 📊 API Response Examples

### Category Balances Response
```json
{
  "success": true,
  "data": {
    "mainAccount": {
      "id": "main-account-id",
      "balance": 0.00,
      "accountName": "Emma Williams - Main Savings"
    },
    "categoryAccounts": [
      {
        "category": "healthcare",
        "balance": 125.00,
        "accountName": "Emma Williams - Healthcare"
      },
      {
        "category": "groceries", 
        "balance": 150.00,
        "accountName": "Emma Williams - Groceries"
      }
    ],
    "summary": {
      "totalCategoryBalance": 500.00,
      "totalAccounts": 6,
      "categories": ["healthcare", "groceries", "education", "transport", "entertainment", "other"]
    }
  }
}
```

### Checkout Response with Payment Breakdown
```json
{
  "success": true,
  "message": "Order placed successfully with category-based payment",
  "data": {
    "order": {
      "id": 123,
      "orderNumber": "ORD1729797123456",
      "totalAmount": 245.75,
      "paymentStatus": "completed"
    },
    "paymentBreakdown": [
      {
        "category": "healthcare",
        "accountName": "Emma Williams - Healthcare", 
        "amount": 75.50,
        "items": 2
      },
      {
        "category": "groceries",
        "accountName": "Emma Williams - Groceries",
        "amount": 45.25, 
        "items": 3
      },
      {
        "category": "education",
        "accountName": "Emma Williams - Education",
        "amount": 125.00,
        "items": 1
      }
    ]
  }
}
```

## 🚀 Usage Examples

### 1. Check Category Balances
```bash
GET /api/category-accounts/balances
Authorization: Bearer [dependent-user-token]
```

### 2. Add Items to Cart (Existing API)
```bash  
POST /api/cart/add
{
  "productId": 123,
  "quantity": 2
}
```

### 3. Category-Based Checkout
```bash
POST /api/category-orders/checkout  
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Cape Town",
    "postalCode": "8001"
  }
}
```

### 4. Transfer Between Categories
```bash
POST /api/category-accounts/transfer
{
  "fromCategory": "entertainment",
  "toCategory": "healthcare",
  "amount": 25.00,
  "description": "Need more healthcare budget"
}
```

### 5. View Order History
```bash
GET /api/category-orders/
```

## ⚡ Key Benefits

### For Users
- **Budget Control**: Automatic category-based spending limits
- **Transparency**: Clear breakdown of where money is spent
- **Flexibility**: Ability to transfer funds between categories as needed
- **Education**: Learn spending patterns by category

### For System
- **Automated Budgeting**: No manual category assignment needed
- **Audit Trail**: Complete transaction history per category  
- **Scalability**: Easy to add new product categories
- **Data Insights**: Rich analytics on spending patterns

## 🛡️ Security & Validation

### Account Access Control
- Users can only access their own category accounts
- Authentication required for all operations
- Insufficient funds validation prevents overspending

### Transaction Integrity  
- Database transactions ensure atomicity
- Rollback on any failure during checkout
- Consistent state maintained across multiple accounts

### Input Validation
- Category names validated against allowed list
- Amount validation (positive numbers only)
- Product category matching enforced

## 📈 Future Enhancements

### Potential Additions
1. **Budget Alerts**: Notify when category balance is low
2. **Spending Analytics**: Monthly reports by category
3. **Auto-allocation Rules**: Automatic fund distribution on deposits
4. **Category Limits**: Maximum spending limits per category
5. **Parent Controls**: Caregiver approval for large purchases
6. **Savings Goals**: Category-specific saving targets

## 🔧 Technical Implementation Notes

### Database Relationships
```javascript
// Account Model Associations
Account.belongsTo(Account, {
  foreignKey: 'allocatedFromId',
  as: 'parentAccount'
});

Account.hasMany(Account, {
  foreignKey: 'allocatedFromId', 
  as: 'categoryAccounts'
});
```

### Error Handling
- Graceful degradation if category accounts missing
- Fallback to main account for unknown categories  
- Detailed error messages for insufficient funds
- Transaction rollback on any checkout failure

### Performance Considerations
- Bulk operations for multiple account updates
- Efficient queries using proper indexes
- Transaction batching for large orders
- Caching of category account lookups

---

This system provides a comprehensive foundation for category-based budgeting and spending control, enabling sophisticated financial management for dependent users while maintaining simplicity and transparency.
