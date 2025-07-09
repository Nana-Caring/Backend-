const { sequelize } = require('./models');

async function createPaymentCardsTable() {
  try {
    console.log('Creating payment_cards table...');
    
    await sequelize.query(`
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
    `);
    
    console.log('Creating indexes...');
    
    // Create unique index for user-card combination
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_user_card 
      ON payment_cards("userId", "cardNumber");
    `);
    
    // Create index for user default card
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS user_default_card 
      ON payment_cards("userId", "isDefault");
    `);
    
    // Create index for user active cards
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS user_active_cards 
      ON payment_cards("userId", "isActive");
    `);
    
    // Add stripeCustomerId to Users table if it doesn't exist
    try {
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN IF NOT EXISTS "stripeCustomerId" VARCHAR;
      `);
      console.log('Added stripeCustomerId column to Users table');
    } catch (error) {
      console.log('stripeCustomerId column may already exist:', error.message);
    }
    
    console.log('✅ Payment cards table created successfully!');
    console.log('✅ All indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating payment cards table:', error);
  } finally {
    await sequelize.close();
  }
}

createPaymentCardsTable();
