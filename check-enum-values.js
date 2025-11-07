require('dotenv').config();
const { sequelize } = require('./models');

async function checkEnumValues() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check enum values
    const result = await sequelize.query(
      'SELECT unnest(enum_range(NULL::"enum_Users_role")) as role_values',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Current role enum values:', result.map(r => r.role_values));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkEnumValues();