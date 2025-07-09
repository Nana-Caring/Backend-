-- Manual SQL Setup for Transaction Table with UUID Support
-- Use this script if you need to manually recreate the Transaction table
-- This script handles the complete recreation of the Transaction table with proper UUID support

-- Step 1: Drop existing Transaction table if it exists (BE CAREFUL - THIS WILL DELETE ALL DATA)
-- Uncomment the next line only if you're sure you want to delete all transaction data
-- DROP TABLE IF EXISTS "Transactions" CASCADE;

-- Step 2: Create the Transaction table with UUID support
CREATE TABLE IF NOT EXISTS "Transactions" (
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
    
    -- Foreign key constraint to Accounts table
    CONSTRAINT "fk_transactions_account" 
        FOREIGN KEY ("accountId") 
        REFERENCES "Accounts"("id") 
        ON DELETE CASCADE
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_transactions_account_id" ON "Transactions"("accountId");
CREATE INDEX IF NOT EXISTS "idx_transactions_type" ON "Transactions"("type");
CREATE INDEX IF NOT EXISTS "idx_transactions_timestamp" ON "Transactions"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_transactions_reference" ON "Transactions"("reference");

-- Step 4: Verify the table structure
-- Run this to check if the table was created correctly
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'Transactions' 
ORDER BY ordinal_position;

-- Step 5: Test UUID generation
-- Run this to verify UUID generation is working
INSERT INTO "Transactions" 
("accountId", "amount", "type", "description") 
VALUES 
((SELECT "id" FROM "Accounts" LIMIT 1), 10.00, 'Credit', 'Test transaction - DELETE ME');

-- Check the inserted record
SELECT * FROM "Transactions" WHERE "description" = 'Test transaction - DELETE ME';

-- Clean up test record
DELETE FROM "Transactions" WHERE "description" = 'Test transaction - DELETE ME';

-- Step 6: Alternative - If you need to preserve existing data, use this migration approach:

-- 6a. Create backup of existing data (if any)
-- CREATE TABLE "Transactions_backup" AS SELECT * FROM "Transactions";

-- 6b. Drop the old table
-- DROP TABLE IF EXISTS "Transactions" CASCADE;

-- 6c. Create new table (use the CREATE TABLE statement from Step 2 above)

-- 6d. If you had data to migrate, you would insert it here with proper UUID conversion
-- INSERT INTO "Transactions" ("accountId", "amount", "type", "description", "reference", "metadata", "timestamp")
-- SELECT 
--     CAST("accountId" AS UUID),  -- Convert to UUID if it wasn't already
--     "amount",
--     "type",
--     "description", 
--     "reference",
--     "metadata",
--     "timestamp"
-- FROM "Transactions_backup";

-- Step 7: Verify foreign key relationship works
-- This should show all accounts that can receive transactions
SELECT 
    a."id" as account_id,
    a."accountName",
    a."accountNumber",
    COUNT(t."id") as transaction_count
FROM "Accounts" a
LEFT JOIN "Transactions" t ON a."id" = t."accountId"
GROUP BY a."id", a."accountName", a."accountNumber"
ORDER BY a."accountName";

-- Step 8: Test transaction creation with proper UUID
-- Replace 'YOUR_ACCOUNT_ID_HERE' with an actual account UUID from your Accounts table
/*
INSERT INTO "Transactions" 
("accountId", "amount", "type", "description", "reference", "metadata") 
VALUES 
(
    'YOUR_ACCOUNT_ID_HERE',  -- Replace with actual UUID from Accounts table
    25.50, 
    'Credit', 
    'Manual test credit transaction',
    'manual-test-' || EXTRACT(EPOCH FROM NOW()),
    '{"source": "manual_sql", "test": true}'::jsonb
);
*/

-- Step 9: Common troubleshooting queries

-- Check if UUID extension is available
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- If UUID extension is not available, enable it (PostgreSQL specific)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Alternative UUID generation function (if gen_random_uuid() doesn't work)
-- You can replace gen_random_uuid() with uuid_generate_v4() in the table creation

-- Check table constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'Transactions';

-- Final verification - show table info
\d "Transactions"
