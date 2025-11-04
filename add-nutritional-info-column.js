const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  logging: console.log
});

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to products table...\n');

    const columnsToAdd = [
      { name: 'nutritionalInfo', type: 'TEXT' },
      { name: 'allergens', type: 'TEXT' },
      { name: 'dimensions', type: 'TEXT' }
    ];

    for (const column of columnsToAdd) {
      console.log(`Checking for ${column.name} column...`);
      let result = await sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'products' AND column_name = '${column.name}'`
      );

      if (result[0].length === 0) {
        console.log(`✅ ${column.name} column does not exist - adding it...`);
        await sequelize.query(
          `ALTER TABLE products ADD COLUMN "${column.name}" ${column.type}`
        );
        console.log(`✅ ${column.name} column added`);
      } else {
        console.log(`⚠️  ${column.name} column already exists`);
      }
    }

    console.log('\n✅ All missing columns added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    process.exit(1);
  }
}

addMissingColumns();
