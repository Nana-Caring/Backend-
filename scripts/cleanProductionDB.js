const { Sequelize } = require('sequelize');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: envFile });

const config = require('../config/config.json');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false
    });
}

async function cleanProductionDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to production database');

        // Get current counts before deletion
        const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Users"');
        const [accountCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Accounts"');
        const [transactionCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Transactions"');
        
        console.log(`📊 Current database state:`);
        console.log(`   - Users: ${userCount[0].count}`);
        console.log(`   - Accounts: ${accountCount[0].count}`);
        console.log(`   - Transactions: ${transactionCount[0].count}`);

        console.log('\n🧹 Starting database cleanup...');

        // Delete in correct order to respect foreign key constraints
        
        // 1. Delete transactions first
        await sequelize.query('DELETE FROM "Transactions"');
        console.log('✅ Cleared Transactions table');

        // 2. Delete order items
        try {
            await sequelize.query('DELETE FROM "OrderItems"');
            console.log('✅ Cleared OrderItems table');
        } catch (error) {
            console.log('ℹ️  OrderItems table does not exist or is empty');
        }

        // 3. Delete orders
        try {
            await sequelize.query('DELETE FROM "Orders"');
            console.log('✅ Cleared Orders table');
        } catch (error) {
            console.log('ℹ️  Orders table does not exist or is empty');
        }

        // 4. Delete cart items
        try {
            await sequelize.query('DELETE FROM "Carts"');
            console.log('✅ Cleared Carts table');
        } catch (error) {
            console.log('ℹ️  Carts table does not exist or is empty');
        }

        // 5. Delete payment cards
        try {
            await sequelize.query('DELETE FROM "PaymentCards"');
            console.log('✅ Cleared PaymentCards table');
        } catch (error) {
            console.log('ℹ️  PaymentCards table does not exist or is empty');
        }

        // 6. Delete funder dependencies
        try {
            await sequelize.query('DELETE FROM "FunderDependents"');
            console.log('✅ Cleared FunderDependents table');
        } catch (error) {
            console.log('ℹ️  FunderDependents table does not exist or is empty');
        }

        // 7. Delete accounts (this will handle the foreign key to users)
        await sequelize.query('DELETE FROM "Accounts"');
        console.log('✅ Cleared Accounts table');

        // 8. Finally delete users
        await sequelize.query('DELETE FROM "Users"');
        console.log('✅ Cleared Users table');

        // Reset sequences if they exist
        try {
            await sequelize.query('ALTER SEQUENCE "Users_id_seq" RESTART WITH 1');
            console.log('✅ Reset Users ID sequence');
        } catch (error) {
            console.log('ℹ️  Users sequence not found or not needed');
        }

        // Verify cleanup
        const [finalUserCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Users"');
        const [finalAccountCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Accounts"');
        const [finalTransactionCount] = await sequelize.query('SELECT COUNT(*) as count FROM "Transactions"');
        
        console.log('\n🎯 Database cleanup completed:');
        console.log(`   - Users: ${finalUserCount[0].count}`);
        console.log(`   - Accounts: ${finalAccountCount[0].count}`);
        console.log(`   - Transactions: ${finalTransactionCount[0].count}`);
        
        if (finalUserCount[0].count === '0' && finalAccountCount[0].count === '0') {
            console.log('\n✅ Production database successfully cleaned!');
        } else {
            console.log('\n⚠️  Some data may still remain in the database');
        }

    } catch (error) {
        console.error('❌ Error cleaning production database:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run the script
if (require.main === module) {
    cleanProductionDB()
        .then(() => {
            console.log('✅ Database cleanup completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Database cleanup failed:', error);
            process.exit(1);
        });
}

module.exports = cleanProductionDB;
