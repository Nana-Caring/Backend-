# Transaction Table Manual Setup Guide

This guide provides multiple options for manually setting up the Transaction table with proper UUID support if migrations are not working correctly.

## Quick Setup Options

### Option 1: Use the PowerShell Script (Recommended for Windows)
```powershell
# Edit the database connection parameters in the script first
.\setup-transaction-table.ps1
```

### Option 2: Use Direct SQL (For any database client)
```sql
-- Execute the SQL file directly
\i manual-transaction-table-setup.sql
```

### Option 3: Use Node.js Verification Script
```bash
# After any setup method, verify it works
node verify-transaction-setup.js
```

## Manual Setup Steps

### Step 1: Update Database Connection Parameters

Before running any script, update your database connection details:

**For PowerShell script (`setup-transaction-table.ps1`):**
```powershell
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "your_database_name"
$DB_USER = "your_username"
$DB_PASSWORD = "your_password"
```

**For SQL client:**
- Use your preferred PostgreSQL client (pgAdmin, DBeaver, psql, etc.)
- Connect to your database with your credentials

### Step 2: Choose Your Setup Method

#### Method A: Complete Recreation (DELETES ALL TRANSACTION DATA)
```sql
-- WARNING: This will delete all existing transaction data
DROP TABLE IF EXISTS "Transactions" CASCADE;

-- Create new table with UUID support
CREATE TABLE "Transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL,
    "amount" FLOAT NOT NULL,
    "type" VARCHAR(255) NOT NULL CHECK ("type" IN ('Debit', 'Credit')),
    "description" VARCHAR(255),
    "reference" VARCHAR(255) UNIQUE,
    "metadata" JSONB,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT "fk_transactions_account" 
        FOREIGN KEY ("accountId") 
        REFERENCES "Accounts"("id") 
        ON DELETE CASCADE
);
```

#### Method B: Safe Migration (Preserves existing data if any)
```sql
-- Step 1: Create backup
CREATE TABLE "Transactions_backup" AS SELECT * FROM "Transactions";

-- Step 2: Drop constraints and recreate table
ALTER TABLE "Transactions" DROP CONSTRAINT IF EXISTS "fk_transactions_account";
DROP TABLE "Transactions";

-- Step 3: Create new table (same as Method A)
-- Step 4: Migrate data if needed (convert IDs to UUIDs)
```

### Step 3: Add Indexes and Constraints
```sql
-- Performance indexes
CREATE INDEX "idx_transactions_account_id" ON "Transactions"("accountId");
CREATE INDEX "idx_transactions_type" ON "Transactions"("type");
CREATE INDEX "idx_transactions_timestamp" ON "Transactions"("timestamp");
CREATE INDEX "idx_transactions_reference" ON "Transactions"("reference");
```

### Step 4: Enable UUID Extension (if needed)
```sql
-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Step 5: Verify Setup
```sql
-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Transactions' 
ORDER BY ordinal_position;

-- Test UUID generation
SELECT gen_random_uuid() AS test_uuid;

-- Check foreign key constraints
SELECT tc.constraint_name, tc.constraint_type, kcu.column_name,
       ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'Transactions';
```

## Verification and Testing

### After Setup - Run Node.js Verification
```bash
node verify-transaction-setup.js
```

This script will:
- ✅ Test database connection
- ✅ Verify table structure
- ✅ Test UUID generation
- ✅ Create and delete a test transaction
- ✅ Check foreign key relationships
- ✅ Verify payment card integration readiness

### Test Money Transfer Flow
```bash
# Test with Postman or curl
POST http://localhost:3000/api/transfers/send
Content-Type: application/json

{
    "funderId": "uuid-of-funder",
    "dependentId": "uuid-of-dependent", 
    "paymentCardId": "uuid-of-payment-card",
    "amount": 25.00,
    "description": "Test transfer"
}
```

## Common Issues and Solutions

### Issue 1: UUID Extension Not Available
```sql
-- Solution: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Alternative: Use different UUID function
-- Replace gen_random_uuid() with uuid_generate_v4()
```

### Issue 2: Foreign Key Constraint Errors
```sql
-- Check if Accounts table uses UUID for id
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'Accounts' AND column_name = 'id';

-- If Accounts.id is not UUID, you need to fix that first
```

### Issue 3: Permission Denied
```sql
-- Ensure your database user has necessary permissions
GRANT ALL PRIVILEGES ON TABLE "Transactions" TO your_username;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_username;
```

### Issue 4: Sequelize Model Sync Issues
```javascript
// In your Node.js app, force sync the model
await Transaction.sync({ force: true }); // WARNING: Deletes data
// Or just sync without force
await Transaction.sync({ alter: true });
```

## Files Created

1. **`manual-transaction-table-setup.sql`** - Complete SQL setup script
2. **`setup-transaction-table.ps1`** - PowerShell automation script  
3. **`verify-transaction-setup.js`** - Node.js verification script
4. **`MANUAL_TRANSACTION_SETUP.md`** - This guide

## Next Steps After Setup

1. **Verify everything works:**
   ```bash
   node verify-transaction-setup.js
   ```

2. **Test payment card endpoints:**
   ```bash
   # Add a test card
   curl -X POST http://localhost:3000/api/payment-cards/add-test \
     -H "Content-Type: application/json" \
     -d '{"userId": "your-funder-uuid"}'
   ```

3. **Test money transfer:**
   ```bash
   # Send money (use actual UUIDs from your database)
   curl -X POST http://localhost:3000/api/transfers/send \
     -H "Content-Type: application/json" \
     -d '{
       "funderId": "funder-uuid",
       "dependentId": "dependent-uuid", 
       "paymentCardId": "card-uuid",
       "amount": 25.00,
       "description": "Test transfer"
     }'
   ```

4. **Check transaction creation:**
   ```sql
   SELECT * FROM "Transactions" ORDER BY "createdAt" DESC LIMIT 5;
   ```

## Production Deployment Notes

- Always backup your database before running any of these scripts
- Test on a development/staging environment first
- Consider running during low-traffic periods
- Monitor the application logs after deployment
- Verify all existing functionality still works

## Support

If you encounter issues:

1. Check the Node.js application logs
2. Check PostgreSQL logs for database errors
3. Verify all UUIDs are properly formatted
4. Ensure foreign key relationships are correct
5. Test with the debug endpoints in the API

The money transfer system should now work correctly with proper UUID support in the Transaction table.
