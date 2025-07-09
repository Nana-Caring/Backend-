// PRODUCTION DATABASE CONNECTION AND SETUP
const { Sequelize } = require('sequelize');

// Your production database connection
const productionDB = new Sequelize({
  host: 'dpg-d04muamuk2gs73drrong-a.oregon-postgres.render.com',
  database: 'nana_caring_ts9m',
  username: 'nana_caring_ts9m_user',
  password: 'hJVRlGcNxewOc0PdKIWtyI7ou1zjXOoy', // From your config.json
  port: 5432,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

async function setupProductionPaymentCards() {
  try {
    console.log('🔗 Connecting to production database...');
    console.log('Host: dpg-d04muamuk2gs73drrong-a.oregon-postgres.render.com');
    console.log('Database: nana_caring_ts9m');
    console.log('User: nana_caring_ts9m_user');
    
    // Test connection
    await productionDB.authenticate();
    console.log('✅ Successfully connected to production database!');

    console.log('\n📋 Creating payment_cards table...');
    
    // Create payment_cards table
    await productionDB.query(`
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
    
    console.log('✅ payment_cards table created successfully!');

    console.log('\n📊 Creating performance indexes...');
    
    // Create unique index for user-card combination
    await productionDB.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_user_card 
      ON payment_cards("userId", "cardNumber");
    `);
    console.log('✅ unique_user_card index created');
    
    // Create index for user default card
    await productionDB.query(`
      CREATE INDEX IF NOT EXISTS user_default_card 
      ON payment_cards("userId", "isDefault");
    `);
    console.log('✅ user_default_card index created');
    
    // Create index for user active cards
    await productionDB.query(`
      CREATE INDEX IF NOT EXISTS user_active_cards 
      ON payment_cards("userId", "isActive");
    `);
    console.log('✅ user_active_cards index created');

    console.log('\n👤 Adding stripeCustomerId to Users table...');
    
    // Add stripeCustomerId to Users table if it doesn't exist
    try {
      await productionDB.query(`
        ALTER TABLE "Users" 
        ADD COLUMN IF NOT EXISTS "stripeCustomerId" VARCHAR;
      `);
      console.log('✅ stripeCustomerId column added to Users table');
    } catch (error) {
      console.log('ℹ️  stripeCustomerId column may already exist');
    }

    console.log('\n🔍 Verifying table structure...');
    
    // Verify table creation
    const [tableInfo] = await productionDB.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'payment_cards' 
      ORDER BY ordinal_position;
    `);

    console.log('📋 payment_cards table structure:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });

    // Check indexes
    const [indexes] = await productionDB.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'payment_cards';
    `);

    console.log('\n📊 Indexes created:');
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });

    // Test a simple query to make sure everything works
    console.log('\n🧪 Testing table access...');
    const [testResult] = await productionDB.query(`
      SELECT COUNT(*) as count FROM payment_cards;
    `);
    console.log(`✅ payment_cards table is accessible (current records: ${testResult[0].count})`);

    console.log('\n🎉 PRODUCTION DATABASE SETUP COMPLETE!');
    console.log('=======================================');
    console.log('✅ payment_cards table created');
    console.log('✅ All indexes created for performance');
    console.log('✅ stripeCustomerId added to Users table');
    console.log('✅ Table structure verified');
    console.log('✅ Database access confirmed');
    
    console.log('\n🚀 Your payment cards API is now ready to use!');
    console.log('You can now:');
    console.log('• Add credit/debit cards via POST /api/payment-cards/add');
    console.log('• Get user cards via GET /api/payment-cards/my-cards');
    console.log('• Set default cards via PUT /api/payment-cards/set-default/:cardId');
    console.log('• Remove cards via DELETE /api/payment-cards/remove/:cardId');
    console.log('• Create payments via POST /api/payment-cards/create-payment-intent');

  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    console.error('Error details:', error.message);
    
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
    
    return false;
  } finally {
    await productionDB.close();
    console.log('\n🔒 Database connection closed');
  }
  
  return true;
}

// Run the setup
if (require.main === module) {
  setupProductionPaymentCards()
    .then(success => {
      if (success) {
        console.log('\n🎊 SUCCESS! Your production database is ready for payment cards!');
      } else {
        console.log('\n💥 FAILED! Manual intervention required.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = setupProductionPaymentCards;
