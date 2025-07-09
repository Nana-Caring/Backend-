// SOLUTION 2: Run this script on your production server
const { Sequelize } = require('sequelize');

// Use production database URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

async function createProductionTables() {
    try {
        console.log('🔗 Connecting to production database...');
        await sequelize.authenticate();
        console.log('✅ Connected to production database');

        console.log('📋 Creating payment_cards table...');
        
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

        console.log('📊 Creating indexes...');
        
        await sequelize.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS unique_user_card 
            ON payment_cards("userId", "cardNumber");
        `);
        
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS user_default_card 
            ON payment_cards("userId", "isDefault");
        `);
        
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS user_active_cards 
            ON payment_cards("userId", "isActive");
        `);

        console.log('👤 Adding stripeCustomerId to Users table...');
        
        try {
            await sequelize.query(`
                ALTER TABLE "Users" 
                ADD COLUMN IF NOT EXISTS "stripeCustomerId" VARCHAR;
            `);
            console.log('✅ stripeCustomerId column added to Users table');
        } catch (error) {
            console.log('ℹ️  stripeCustomerId column may already exist');
        }

        // Verify table creation
        const [results] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'payment_cards' 
            ORDER BY ordinal_position;
        `);

        console.log('✅ payment_cards table created successfully!');
        console.log('📋 Table structure:', results);

        console.log('🎉 Production database setup complete!');
        
    } catch (error) {
        console.error('❌ Error setting up production database:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the setup
createProductionTables();

module.exports = createProductionTables;
