-- SOLUTION 1: Direct SQL for Production Database
-- Connect to your PostgreSQL database and run this script

-- Create payment_cards table
CREATE TABLE IF NOT EXISTS payment_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "bankName" VARCHAR(100) NOT NULL,
    "cardNumber" VARCHAR(4) NOT NULL,
    "expiryDate" VARCHAR(5) NOT NULL,
    "ccv" VARCHAR(4) NOT NULL,
    "stripePaymentMethodId" VARCHAR,
    "isDefault" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "nickname" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_card ON payment_cards("userId", "cardNumber");
CREATE INDEX IF NOT EXISTS user_default_card ON payment_cards("userId", "isDefault");
CREATE INDEX IF NOT EXISTS user_active_cards ON payment_cards("userId", "isActive");

-- Add stripeCustomerId column to Users table
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "stripeCustomerId" VARCHAR;

-- Verify table creation
SELECT 'payment_cards table created successfully' as result;
