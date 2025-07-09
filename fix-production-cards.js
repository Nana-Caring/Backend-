// PRODUCTION DEPLOYMENT SCRIPT
// Deploy this script to your Render service and run it

const { Sequelize } = require('sequelize');

// Use your production database URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: console.log
});

async function fixProductionDatabase() {
    try {
        console.log('🔧 FIXING PRODUCTION DATABASE...');
        console.log('Database URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
        
        await sequelize.authenticate();
        console.log('✅ Connected to production database');

        // Create payment_cards table
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

        // Create indexes
        await sequelize.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS unique_user_card ON payment_cards("userId", "cardNumber");
        `);
        
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS user_default_card ON payment_cards("userId", "isDefault");
        `);
        
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS user_active_cards ON payment_cards("userId", "isActive");
        `);

        // Add stripeCustomerId to Users table
        await sequelize.query(`
            ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "stripeCustomerId" VARCHAR;
        `);

        // Verify table exists
        const [results] = await sequelize.query(`
            SELECT COUNT(*) as column_count 
            FROM information_schema.columns 
            WHERE table_name = 'payment_cards';
        `);

        console.log('🎉 PRODUCTION DATABASE FIXED!');
        console.log('✅ payment_cards table created with', results[0].column_count, 'columns');
        console.log('✅ All indexes created');
        console.log('✅ stripeCustomerId added to Users table');
        
        return true;
        
    } catch (error) {
        console.error('❌ PRODUCTION FIX FAILED:', error);
        return false;
    } finally {
        await sequelize.close();
    }
}

// Run the fix
if (require.main === module) {
    fixProductionDatabase()
        .then(success => {
            console.log(success ? '🚀 READY FOR PAYMENT CARDS!' : '💥 MANUAL INTERVENTION REQUIRED');
            process.exit(success ? 0 : 1);
        });
}

module.exports = fixProductionDatabase;
