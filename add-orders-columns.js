const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  logging: false
});

async function addOrdersColumns() {
  try {
    console.log('🔧 Adding missing columns to orders table...\n');

    const columnsToCheck = [
      { name: 'cancelledAt', type: 'TIMESTAMP', table: 'Orders' },
      { name: 'completedAt', type: 'TIMESTAMP', table: 'Orders' },
      { name: 'shippedAt', type: 'TIMESTAMP', table: 'Orders' },
      { name: 'deliveredAt', type: 'TIMESTAMP', table: 'Orders' }
    ];

    for (const column of columnsToCheck) {
      console.log(`Checking for ${column.name} in ${column.table}...`);
      let result = await sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = '${column.table}' AND column_name = '${column.name}'`
      );

      if (result[0].length === 0) {
        console.log(`✅ ${column.name} does not exist - adding...`);
        await sequelize.query(
          `ALTER TABLE "${column.table}" ADD COLUMN "${column.name}" ${column.type}`
        );
        console.log(`✅ ${column.name} added`);
      } else {
        console.log(`⚠️  ${column.name} already exists`);
      }
    }

    console.log('\n✅ All columns checked');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addOrdersColumns();
