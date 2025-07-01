const { Sequelize } = require('sequelize');
require('dotenv').config();

// Get environment
const env = process.env.NODE_ENV || 'development';
console.log('Environment:', env);

// Load database config
const config = require('./config/config.json')[env];
console.log('Database config:', {
  host: config.host,
  database: config.database,
  username: config.username
});

// Create sequelize instance based on environment
let sequelize;
if (env === 'production' && process.env.DATABASE_URL) {
  // Use DATABASE_URL for production (Render)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Use config file for development
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: console.log,
    dialectOptions: config.dialectOptions || {}
  });
}

console.log('Script starting...');

async function addMissingColumns() {
  console.log('Function called...');
  try {
    console.log('Starting database schema fix...');
    console.log('Environment:', env);
    console.log('Database:', config.database);
    
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully to database');

    // Check current Users table schema
    console.log('\nChecking current Users table schema...');
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:', results.length, 'found');
    results.forEach(col => console.log(`- ${col.column_name}: ${col.data_type}`));

    // Add missing columns one by one
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

    console.log(`\nAdding ${columnsToAdd.length} columns...`);
    for (const column of columnsToAdd) {
      try {
        console.log(`Adding column ${column.name}...`);
        await sequelize.query(`
          ALTER TABLE "Users" 
          ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type}
        `);
        console.log(`✓ Added ${column.name}`);
      } catch (error) {
        console.log(`- Column ${column.name} error:`, error.message);
      }
    }

    // Check final schema
    console.log('\nChecking final Users table schema...');
    const [finalResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Final columns:', finalResults.length, 'found');
    finalResults.forEach(col => console.log(`- ${col.column_name}: ${col.data_type}`));

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

addMissingColumns();
