const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🚀 PRODUCTION DATABASE SCHEMA UPDATE SCRIPT');
console.log('==============================================');

// Force production environment
process.env.NODE_ENV = 'production';

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
  process.exit(1);
}

console.log('✅ DATABASE_URL found');
console.log('🔗 Connecting to production database...');

// Create sequelize instance for production
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: (msg) => console.log('📝 SQL:', msg),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function updateProductionDatabase() {
  try {
    console.log('\n🔄 Starting production database update...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to production database successfully');

    // Check current schema
    console.log('\n📊 Checking current Users table schema...');
    const [currentColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Users'
      ORDER BY ordinal_position
    `);

    console.log(`📋 Current columns: ${currentColumns.length} found`);
    currentColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Define columns to add
    const columnsToAdd = [
      { name: 'phoneNumber', type: 'VARCHAR(15)' },
      { name: 'postalAddressLine1', type: 'VARCHAR(255)' },
      { name: 'postalAddressLine2', type: 'VARCHAR(255)' },
      { name: 'postalCity', type: 'VARCHAR(255)' },
      { name: 'postalProvince', type: 'VARCHAR(255)' },
      { name: 'postalCode', type: 'VARCHAR(10)' },
      { name: 'homeAddressLine1', type: 'VARCHAR(255)' },
      { name: 'homeAddressLine2', type: 'VARCHAR(255)' },
      { name: 'homeCity', type: 'VARCHAR(255)' },
      { name: 'homeProvince', type: 'VARCHAR(255)' },
      { name: 'homeCode', type: 'VARCHAR(10)' }
    ];

    console.log(`\n🔧 Adding ${columnsToAdd.length} columns to production...`);

    // Add each column
    for (const column of columnsToAdd) {
      try {
        console.log(`   Adding ${column.name}...`);
        await sequelize.query(`
          ALTER TABLE "Users"
          ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type}
        `);
        console.log(`   ✅ Added ${column.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Column ${column.name} already exists, skipping`);
        } else {
          console.error(`   ❌ Error adding ${column.name}:`, error.message);
        }
      }
    }

    // Verify final schema
    console.log('\n🔍 Verifying final schema...');
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Users'
      ORDER BY ordinal_position
    `);

    console.log(`📋 Final columns: ${finalColumns.length} found`);
    finalColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n🎉 Production database update completed successfully!');
    console.log('✅ All personal detail columns are now available');
    console.log('🚀 Your application should now work correctly in production');

  } catch (error) {
    console.error('\n❌ Production database update failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the update
updateProductionDatabase();
