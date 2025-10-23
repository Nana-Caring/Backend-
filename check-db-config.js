require('dotenv').config();

console.log('🔍 CURRENT DATABASE CONFIGURATION:');
console.log('================================');
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('Port:', process.env.DB_PORT);
console.log('');

if (process.env.DB_HOST && process.env.DB_HOST.includes('render.com')) {
  console.log('📡 Connected to: PRODUCTION DATABASE (Render)');
  console.log('⚠️  This is why pgAdmin shows empty - you need to seed production!');
} else if (process.env.DB_HOST === 'localhost' || !process.env.DB_HOST) {
  console.log('💻 Connected to: LOCAL DEVELOPMENT DATABASE');
  console.log('✅ This should have the 65 products we seeded');
} else {
  console.log('🤔 Connected to: UNKNOWN DATABASE');
}

console.log('');
console.log('💡 SOLUTIONS:');
console.log('1. Seed the production database (recommended for production)');
console.log('2. Switch to local development database for testing');
console.log('3. Check pgAdmin connection settings');
