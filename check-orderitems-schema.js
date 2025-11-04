const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  logging: false
});

async function checkOrderItemsSchema() {
  try {
    console.log('📋 === OrderItems Table Schema ===\n');

    const result = await sequelize.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = 'OrderItems' 
       ORDER BY ordinal_position`
    );

    console.log('Existing columns:');
    result[0].forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkOrderItemsSchema();
