require('dotenv').config();
const { Client } = require('pg');

async function setupPaymentCardsTable() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PaymentCards'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ PaymentCards table already exists');
      return;
    }

    console.log('🛠️  Creating PaymentCards table with Sequelize naming...');

    // Create table with exact Sequelize naming conventions
    await client.query(`
      CREATE TABLE "PaymentCards" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
        "bankName" VARCHAR(100) NOT NULL,
        "cardNumber" VARCHAR(19) NOT NULL,
        "expiryDate" VARCHAR(5) NOT NULL,
        "ccv" VARCHAR(4),
        "stripePaymentMethodId" VARCHAR(255) UNIQUE,
        "isDefault" BOOLEAN DEFAULT false,
        "isActive" BOOLEAN DEFAULT true,
        "nickname" VARCHAR(50),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ PaymentCards table created successfully');

    // Create indexes
    await client.query('CREATE INDEX "idx_PaymentCards_userId" ON "PaymentCards"("userId");');
    await client.query('CREATE INDEX "idx_PaymentCards_stripePaymentMethodId" ON "PaymentCards"("stripePaymentMethodId");');
    await client.query('CREATE INDEX "idx_PaymentCards_isDefault" ON "PaymentCards"("isDefault");');
    await client.query('CREATE INDEX "idx_PaymentCards_isActive" ON "PaymentCards"("isActive");');

    console.log('✅ Indexes created successfully');

    // Add stripeCustomerId to Users table if it doesn't exist
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users' AND column_name = 'stripeCustomerId';
    `);

    if (columnCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE "Users" 
        ADD COLUMN "stripeCustomerId" VARCHAR(255) UNIQUE;
      `);
      
      await client.query('CREATE INDEX "idx_Users_stripeCustomerId" ON "Users"("stripeCustomerId");');
      console.log('✅ stripeCustomerId column added to Users table');
    } else {
      console.log('✅ stripeCustomerId column already exists');
    }

    console.log('🎉 Production database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await client.end();
    console.log('🔒 Database connection closed');
  }
}

setupPaymentCardsTable();
