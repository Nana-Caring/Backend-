require('dotenv').config();
const pool = require('./db');

async function checkDbSchema() {
  let client;
  
  try {
    console.log('🔍 CHECKING DATABASE SCHEMA FOR CLICKS MVP\n');
    
    client = await pool.connect();
    console.log('✅ Database connected successfully\n');
    
    // Get table structure
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 PRODUCTS TABLE STRUCTURE:');
    console.log('═══════════════════════════════');
    schemaResult.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
    });
    
    console.log('\n📦 SAMPLE EXISTING PRODUCTS:');
    console.log('════════════════════════════════');
    
    const sampleResult = await client.query(`
      SELECT * FROM products LIMIT 3
    `);
    
    if (sampleResult.rows.length > 0) {
      console.log('Found existing products:');
      sampleResult.rows.forEach((product, index) => {
        console.log(`\n${index + 1}. Product ID: ${product.id}`);
        Object.keys(product).forEach(key => {
          if (product[key] !== null) {
            console.log(`   ${key}: ${product[key]}`);
          }
        });
      });
    } else {
      console.log('No existing products found.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    process.exit(0);
  }
}

checkDbSchema();