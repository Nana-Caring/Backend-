require('dotenv').config();
const { sequelize } = require('./models');

async function addRetailerRole() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Try to add the retailer role directly
    try {
      await sequelize.query('ALTER TYPE "enum_Users_role" ADD VALUE \'retailer\'');
      console.log('✅ Successfully added "retailer" role to enum');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ "retailer" role already exists');
      } else {
        console.error('❌ Error adding retailer role:', error.message);
      }
    }

    // Check enum values after addition
    const result = await sequelize.query(
      'SELECT unnest(enum_range(NULL::"enum_Users_role")) as role_values',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Updated role enum values:', result.map(r => r.role_values));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

addRetailerRole();