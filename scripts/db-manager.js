#!/usr/bin/env node

/**
 * Production Database Management Script
 * Provides safe database operations for production environment
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.production' });

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

const commands = {
  async status() {
    console.log('📊 PRODUCTION DATABASE STATUS');
    console.log('🗄️  Database:', process.env.DATABASE_URL.split('@')[1]);
    
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection: OK');
      
      const tables = [
        'Users', 'Accounts', 'Transactions', 'Orders', 'OrderItems', 
        'Carts', 'products', 'PaymentCards', 'BankAccounts', 'FunderDependents'
      ];
      
      console.log('\n📊 Table counts:');
      for (const table of tables) {
        try {
          const [result] = await sequelize.query(`SELECT COUNT(*) FROM "${table}"`);
          console.log(`   ${table}: ${result[0].count} records`);
        } catch (error) {
          console.log(`   ${table}: ❌ Error (${error.message})`);
        }
      }
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
  },

  async backup() {
    console.log('💾 PRODUCTION DATABASE BACKUP');
    console.log('⚠️  This feature requires pg_dump to be installed');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-production-${timestamp}.sql`;
    
    console.log(`📁 Backup file: ${backupFile}`);
    console.log('📝 Run this command manually:');
    console.log(`   pg_dump "${process.env.DATABASE_URL}" > ${backupFile}`);
  },

  async clean() {
    console.log('🚨 PRODUCTION DATABASE CLEANUP');
    console.log('⚠️  This will DELETE ALL user data!');
    console.log('🔒 For safety, use the dedicated clean script:');
    console.log('   node scripts/clean-production-db.js --confirm-delete');
  },

  async seed() {
    console.log('🌱 PRODUCTION DATABASE SEEDING');
    console.log('👥 Creates demo users and sample data');
    console.log('📝 Run the demo user creation script:');
    console.log('   node scripts/create-demo-users.js');
  },

  async test() {
    console.log('🧪 PRODUCTION FUNCTIONALITY TESTING');
    console.log('🎯 Tests all features with demo users');
    console.log('📝 Run the testing script:');
    console.log('   node scripts/test-production-functionality.js');
  },

  async migrate() {
    console.log('🗄️  PRODUCTION DATABASE MIGRATIONS');
    console.log('📝 Run database migrations:');
    console.log('   $env:NODE_ENV="production"; npx sequelize-cli db:migrate');
  },

  help() {
    console.log('🛠️  PRODUCTION DATABASE MANAGEMENT COMMANDS');
    console.log('');
    console.log('📊 Status & Information:');
    console.log('   node scripts/db-manager.js status    - Show database status and record counts');
    console.log('   node scripts/db-manager.js backup    - Instructions for database backup');
    console.log('');
    console.log('🔄 Data Management:');
    console.log('   node scripts/db-manager.js clean     - Instructions to clean database');
    console.log('   node scripts/db-manager.js seed      - Instructions to create demo users');
    console.log('   node scripts/db-manager.js migrate   - Instructions to run migrations');
    console.log('');
    console.log('🧪 Testing:');
    console.log('   node scripts/db-manager.js test      - Instructions to test functionality');
    console.log('');
    console.log('📋 Complete Reset Workflow:');
    console.log('   1. node scripts/clean-production-db.js --confirm-delete');
    console.log('   2. node scripts/create-demo-users.js');
    console.log('   3. node scripts/test-production-functionality.js');
  }
};

// Parse command line arguments
const command = process.argv[2] || 'help';

if (commands[command]) {
  commands[command]()
    .then(() => {
      if (command !== 'help') {
        console.log(`\n✅ ${command} operation completed`);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error(`❌ ${command} operation failed:`, error);
      process.exit(1);
    });
} else {
  console.log(`❌ Unknown command: ${command}`);
  console.log('📝 Available commands: status, backup, clean, seed, migrate, test, help');
  commands.help();
  process.exit(1);
}
