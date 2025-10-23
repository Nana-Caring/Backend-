const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.production' });

// Initialize database connection
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

async function cleanProductionDatabase() {
  try {
    console.log('🚨 PRODUCTION DATABASE CLEANUP SCRIPT');
    console.log('⚠️  This will DELETE ALL existing data!');
    console.log('🗄️  Database:', process.env.DATABASE_URL.split('@')[1]);
    
    // Confirm environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('❌ Not in production environment. Exiting for safety.');
      process.exit(1);
    }

    console.log('\n📊 Checking current database status...');
    
    // Check existing data
    const userCount = await sequelize.query('SELECT COUNT(*) FROM "Users"', { type: Sequelize.QueryTypes.SELECT });
    const accountCount = await sequelize.query('SELECT COUNT(*) FROM "Accounts"', { type: Sequelize.QueryTypes.SELECT });
    const transactionCount = await sequelize.query('SELECT COUNT(*) FROM "Transactions"', { type: Sequelize.QueryTypes.SELECT });
    
    console.log(`📈 Current data count:`);
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Accounts: ${accountCount[0].count}`);
    console.log(`   Transactions: ${transactionCount[0].count}`);

    console.log('\n🧹 Starting database cleanup...');
    
    // Delete data in correct order (respecting foreign key constraints)
    const tablesToClean = [
      'OrderItems', 'Orders', 'Carts', 'Transactions', 
      'PaymentCards', 'BankAccounts', 'FunderDependents', 
      'Accounts', 'Users'
    ];

    for (const table of tablesToClean) {
      console.log(`🗑️  Deleting ${table}...`);
      try {
        await sequelize.query(`DELETE FROM "${table}"`);
      } catch (error) {
        if (error.original?.code === '42P01') {
          console.log(`   ⚠️  Table ${table} does not exist, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    // Reset sequences for auto-increment fields
    console.log('🔄 Resetting ID sequences...');
    const sequences = [
      'Users_id_seq', 'Accounts_id_seq', 'Orders_id_seq', 
      'OrderItems_id_seq', 'Carts_id_seq', 'PaymentCards_id_seq', 
      'BankAccounts_id_seq'
    ];

    for (const seq of sequences) {
      try {
        await sequelize.query(`ALTER SEQUENCE "${seq}" RESTART WITH 1`);
      } catch (error) {
        if (error.original?.code === '42P01') {
          console.log(`   ⚠️  Sequence ${seq} does not exist, skipping...`);
        } else {
          console.log(`   ⚠️  Could not reset sequence ${seq}:`, error.message);
        }
      }
    }
    
    console.log('✅ Production database cleaned successfully!');
    console.log('📊 All user data has been removed');
    console.log('🔄 ID sequences have been reset');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Safety check - require explicit confirmation
if (process.argv.includes('--confirm-delete')) {
  cleanProductionDatabase()
    .then(() => {
      console.log('\n🎯 Database cleanup completed successfully!');
      console.log('📝 Next step: Run the demo user creation script');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Database cleanup failed:', error);
      process.exit(1);
    });
} else {
  console.log('🚨 PRODUCTION DATABASE CLEANUP SCRIPT');
  console.log('⚠️  This script will DELETE ALL existing data in production!');
  console.log('');
  console.log('📋 To execute the cleanup, run:');
  console.log('   node scripts/clean-production-db.js --confirm-delete');
  console.log('');
  console.log('🔒 Safety: --confirm-delete flag required to prevent accidental execution');
}
