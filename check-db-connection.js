const { Sequelize } = require('sequelize');
require('dotenv').config();

// Check which database configuration is being used
console.log('🔍 DATABASE CONNECTION CHECK\n');

console.log('Environment Variables from .env:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_USER: ${process.env.DB_USER}`);

console.log('\nConfig.json Settings:');
const config = require('./config/config.json');
const env = process.env.NODE_ENV || 'development';
console.log(`Current environment: ${env}`);
console.log(`Config for ${env}:`, config[env]);

console.log('\nActual Sequelize Connection:');
const { sequelize } = require('./models');
console.log(`Connected to: ${sequelize.config.host}`);
console.log(`Database: ${sequelize.config.database}`);
console.log(`Username: ${sequelize.config.username}`);

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('\n✅ Connection to database successful');
    
    // Check if products table exists and count products
    const [results] = await sequelize.query("SELECT COUNT(*) FROM products");
    console.log(`📦 Products in this database: ${results[0].count}`);
    
  } catch (error) {
    console.log('\n❌ Connection failed:', error.message);
  }
  
  process.exit(0);
}

testConnection();
