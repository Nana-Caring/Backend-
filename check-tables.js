const { Sequelize } = require('sequelize');
const config = require('./config/config.json');

const sequelize = new Sequelize(config.development);

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Get all table names
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Existing tables:');
    results.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
    // Check specifically for Products table
    const hasProducts = results.some(row => row.table_name === 'Products');
    console.log(`\n🔍 Products table exists: ${hasProducts ? '✅ Yes' : '❌ No'}`);
    
    if (hasProducts) {
      // Get Products table structure
      const [productColumns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'Products' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Products table columns:');
      productColumns.forEach((col, index) => {
        console.log(`${index + 1}. ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
