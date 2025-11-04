require('dotenv').config();
const { sequelize } = require('./models');

async function addReadyForPickupStatus() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Try to add the ready_for_pickup status directly
    try {
      await sequelize.query('ALTER TYPE "enum_Orders_orderStatus" ADD VALUE \'ready_for_pickup\' BEFORE \'shipped\'');
      console.log('✅ Successfully added "ready_for_pickup" status to enum');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ "ready_for_pickup" status already exists');
      } else {
        console.error('❌ Error adding ready_for_pickup status:', error.message);
      }
    }

    // Check enum values after addition
    const result = await sequelize.query(
      'SELECT unnest(enum_range(NULL::"enum_Orders_orderStatus")) as status_values',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Updated order status enum values:', result.map(r => r.status_values));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

addReadyForPickupStatus();