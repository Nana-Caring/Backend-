# 📊 Transaction Tracking System for Dependents

## 🎯 **System Overview**

The transaction tracking system provides dependents with comprehensive visibility into their financial activities, including:
- **Money-IN**: Deposits from funders and transfers
- **Purchases**: All shopping transactions with detailed product information
- **Analytics**: Spending patterns, category breakdowns, and monthly reports

---

## 🔧 **API Endpoints**

### **1. Get Transaction History**
```http
GET /api/transactions
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-50, default: 20)
- `type` (optional): `credit` (money-in) or `debit` (purchases)
- `category` (optional): `healthcare`, `groceries`, `education`, `transport`, `entertainment`, `other`
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `accountId` (optional): Specific account UUID

**Response Example:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn-uuid",
        "userId": "user-uuid",
        "accountId": "account-uuid", 
        "type": "debit",
        "amount": 75.50,
        "description": "Purchase - Order ORD1698067234567890",
        "category": "groceries",
        "status": "completed",
        "reference": "ORDER_123",
        "balanceAfter": 424.50,
        "createdAt": "2024-10-23T10:30:00Z",
        "account": {
          "id": "account-uuid",
          "accountName": "Emma Williams - Groceries",
          "category": "groceries",
          "isMainAccount": false
        },
        "orderDetails": {
          "orderNumber": "ORD1698067234567890",
          "storeCode": "ABC12345",
          "status": "processing",
          "itemCount": 3,
          "items": [
            {
              "name": "Fresh Milk 2L",
              "brand": "Farm Fresh",
              "quantity": 2,
              "price": 25.00,
              "image": "/uploads/milk.jpg"
            }
          ]
        }
      },
      {
        "id": "txn-uuid-2",
        "type": "credit",
        "amount": 500.00,
        "description": "Deposit from funder",
        "reference": "DEPOSIT_456",
        "depositInfo": {
          "type": "funder_deposit",
          "message": "Money received from funder"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTransactions": 87,
      "hasMore": true
    }
  }
}
```

### **2. Get Transaction Summary**
```http
GET /api/transactions/summary?period=30
```

**Query Parameters:**
- `period` (optional): Number of days (1-365, default: 30)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "period": "Last 30 days",
    "totalDeposits": 1500.00,
    "totalSpending": 876.50,
    "transactionCount": 24,
    "netAmount": 623.50,
    "totalBalance": 623.50,
    "categoryBreakdown": {
      "groceries": {
        "deposits": 450.00,
        "spending": 287.50,
        "count": 8
      },
      "healthcare": {
        "deposits": 375.00,
        "spending": 125.00,
        "count": 4
      }
    },
    "accountBalances": [
      {
        "id": "main-account-id",
        "name": "Emma Williams - Main Savings",
        "category": null,
        "balance": 623.50,
        "isMain": true
      },
      {
        "id": "grocery-account-id",
        "name": "Emma Williams - Groceries",
        "category": "groceries",
        "balance": 162.50,
        "isMain": false
      }
    ]
  }
}
```

### **3. Get Monthly Report**
```http
GET /api/transactions/monthly-report?year=2024&month=10
```

**Query Parameters:**
- `year` (optional): Year (2020-2030, default: current year)
- `month` (optional): Month (1-12, default: current month)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "period": {
      "year": 2024,
      "month": 10,
      "monthName": "October"
    },
    "summary": {
      "totalDeposits": 2000.00,
      "totalSpending": 1245.75,
      "transactionCount": 35,
      "netAmount": 754.25
    },
    "categorySpending": {
      "groceries": 456.25,
      "healthcare": 289.50,
      "education": 200.00,
      "transport": 150.00,
      "entertainment": 100.00,
      "other": 50.00
    },
    "dailySpending": {
      "1": 45.50,
      "2": 0,
      "3": 125.75,
      "15": 89.25
    },
    "topPurchases": [
      {
        "date": "2024-10-15T14:30:00Z",
        "amount": 125.75,
        "description": "Purchase - Order ORD1698123456789",
        "category": "education",
        "reference": "ORDER_789"
      }
    ]
  }
}
```

### **4. Get Transaction Details**
```http
GET /api/transactions/:id
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "txn-uuid",
    "userId": "user-uuid",
    "accountId": "account-uuid",
    "type": "debit",
    "amount": 125.75,
    "description": "Purchase - Order ORD1698123456789",
    "category": "education",
    "status": "completed",
    "reference": "ORDER_789",
    "balanceAfter": 374.25,
    "createdAt": "2024-10-15T14:30:00Z",
    "account": {
      "id": "account-uuid",
      "accountName": "Emma Williams - Education",
      "category": "education",
      "isMainAccount": false
    },
    "orderDetails": {
      "orderNumber": "ORD1698123456789",
      "storeCode": "EDU78901",
      "status": "delivered",
      "paymentStatus": "completed",
      "createdAt": "2024-10-15T14:30:00Z",
      "items": [
        {
          "productId": "prod-123",
          "name": "Mathematics Textbook Grade 10",
          "brand": "Oxford University Press",
          "image": "/uploads/math-textbook.jpg",
          "sku": "OUP-MATH-10",
          "quantity": 1,
          "priceAtOrder": 125.75,
          "subtotal": 125.75
        }
      ]
    }
  }
}
```

---

## 🎨 **User Experience Features**

### **Transaction Types Visualization**

#### **💰 Money-IN Transactions (Credits)**
- **Funder Deposits**: Automatic category distribution
- **Transfers**: Inter-category movements
- **Refunds**: Order cancellation refunds
- **Visual Indicators**: Green color scheme, up arrows

#### **🛒 Purchase Transactions (Debits)**
- **Order Purchases**: Complete product details with images
- **Store Codes**: Unique codes for in-store verification
- **Category Deduction**: Automatic from appropriate category accounts
- **Visual Indicators**: Red color scheme, down arrows

### **Enhanced Transaction Context**

#### **Purchase Transactions Include:**
- **Order Information**: Order number, store code, status
- **Product Details**: Names, brands, images, quantities, prices
- **Shopping Context**: Total items, category breakdown
- **Store Instructions**: In-store pickup codes and instructions

#### **Deposit Transactions Include:**
- **Source Information**: Which funder made the deposit
- **Distribution Details**: How funds were allocated across categories
- **Timing**: When funds were received and distributed

---

## 📱 **Mobile-Friendly Features**

### **Quick Filters**
- **This Week**: Recent 7 days
- **This Month**: Current month
- **Money In**: Only credit transactions
- **Purchases**: Only debit transactions
- **By Category**: Filter by spending category

### **Summary Cards**
- **Balance Overview**: Current total balance
- **This Month**: Monthly spending summary
- **Top Category**: Highest spending category
- **Recent Activity**: Last 5 transactions

### **Visual Indicators**
- **Transaction Icons**: Different icons for deposits, purchases, transfers
- **Status Badges**: Order status, payment status
- **Amount Colors**: Green for credits, red for debits
- **Category Colors**: Unique colors for each spending category

---

## 🔍 **Advanced Analytics**

### **Spending Patterns**
- **Daily Trends**: Daily spending visualization
- **Category Analysis**: Breakdown by category over time
- **Monthly Comparison**: Compare current month to previous months
- **Budget Tracking**: Compare spending to category allocations

### **Purchase Insights**
- **Top Purchases**: Highest individual transactions
- **Frequent Categories**: Most used spending categories
- **Average Transaction**: Average purchase amounts
- **Shopping Habits**: Peak spending days and times

---

## 🔒 **Security & Privacy**

### **Access Control**
- **User Authentication**: JWT-based authentication required
- **User Isolation**: Users can only see their own transactions
- **Role-Based Access**: Dependent-only access to transaction tracking

### **Data Protection**
- **Sensitive Data**: Payment details not stored in transaction history
- **Audit Trail**: Complete transaction history maintained
- **Privacy Compliance**: User data handled according to privacy policies

---

## 🎯 **Integration Points**

### **Order System Integration**
- **Real-Time Updates**: Transactions created immediately after orders
- **Product Information**: Complete product snapshots stored
- **Store Codes**: Automatic generation and linking

### **Account System Integration**
- **Balance Tracking**: Real-time balance updates after each transaction
- **Category Management**: Automatic category assignment
- **Main Account Sync**: Main account shows total of all categories

### **Payment System Integration**
- **Direct Deposits**: Secure payment processing integration
- **Fund Distribution**: Automatic allocation across categories
- **Transaction Records**: Complete audit trail of all money movements

---

## 🚀 **Benefits for Dependents**

### **Financial Awareness**
- **Complete Visibility**: See exactly where money comes from and goes
- **Category Understanding**: Understand spending limits per category
- **Purchase History**: Review past purchases with full details
- **Balance Tracking**: Monitor available funds in real-time

### **Better Decision Making**
- **Spending Insights**: Identify spending patterns and trends
- **Budget Management**: See how spending aligns with allocations
- **Purchase Planning**: Make informed decisions based on available funds
- **Goal Setting**: Track progress towards financial goals

### **Convenience Features**
- **Store Codes**: Easy in-store verification with unique codes
- **Order Tracking**: Monitor order status through transaction history
- **Product Recall**: Easily find and review past purchases
- **Receipt Replacement**: Digital record of all transactions

This comprehensive transaction tracking system empowers dependents with complete financial transparency while maintaining security and ease of use! 🎉
