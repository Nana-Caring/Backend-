require('dotenv').config();
const pool = require('./db');

async function checkEnums() {
  let client;
  
  try {
    console.log('🔍 CHECKING DATABASE ENUMS\n');
    
    client = await pool.connect();
    console.log('✅ Database connected successfully\n');
    
    // Get enum values for category
    const enumResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_products_category'
      )
    `);
    
    console.log('📂 VALID CATEGORY VALUES:');
    console.log('═════════════════════════');
    enumResult.rows.forEach(row => {
      console.log(`  "${row.enumlabel}"`);
    });
    
    // Check age category enum too
    const ageEnumResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_products_agecategory'
      )
    `);
    
    console.log('\n👶 VALID AGE CATEGORY VALUES:');
    console.log('═════════════════════════════');
    ageEnumResult.rows.forEach(row => {
      console.log(`  "${row.enumlabel}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    process.exit(0);
  }
}

checkEnums();