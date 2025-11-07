const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.production' });

const config = require('../config/config.json').production;
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: false
});

(async () => {
  try {
    console.log('🧹 Cleaning up demo users...');
    
    // Delete demo users
    await sequelize.query(`DELETE FROM "Users" WHERE email IN ('funder@demo.com', 'dependent@demo.com', 'caregiver@demo.com')`);
    console.log('✅ Demo users cleaned up');
    
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
