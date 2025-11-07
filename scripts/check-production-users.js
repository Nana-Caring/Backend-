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

(async () => {
  try {
    console.log('🔍 Checking current users in production database...');
    
    const [users] = await sequelize.query('SELECT id, email, role FROM "Users"');
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    const [accounts] = await sequelize.query('SELECT COUNT(*) as count FROM "Accounts"');
    console.log(`\nFound ${accounts[0].count} accounts`);
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
