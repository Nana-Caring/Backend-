const { Pool } = require('pg');

async function addBasicNeedsCategoryToEnum() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('🔧 UPDATING DATABASE SCHEMA TO ADD "BASIC NEEDS" CATEGORY\n');
    
    // First, let's check current enum values
    const currentEnums = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'enum_products_category'
      )
      ORDER BY enumsortorder
    `);

    console.log('📋 Current category enum values:');
    currentEnums.rows.forEach(row => {
      console.log(`  • ${row.enumlabel}`);
    });

    // Add "Basic Needs" to the enum if it doesn't exist
    try {
      await pool.query(`
        ALTER TYPE enum_products_category ADD VALUE 'Basic Needs'
      `);
      console.log('\n✅ Successfully added "Basic Needs" to category enum');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('\nℹ️  "Basic Needs" category already exists in enum');
      } else {
        console.log('\n⚠️  Error adding enum value:', error.message);
        
        // Alternative: Just rename "Other" to "Basic Needs" in existing products
        console.log('\n🔄 Alternative: Renaming "Other" category to "Basic Needs"...');
        
        const renameResult = await pool.query(`
          UPDATE "products" 
          SET category = 'Basic Needs'
          WHERE category = 'Other'
        `);
        
        console.log(`✅ Renamed ${renameResult.rowCount} products from "Other" to "Basic Needs"`);
      }
    }

    // Verify the update
    const updatedEnums = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'enum_products_category'
      )
      ORDER BY enumsortorder
    `);

    console.log('\n📋 Updated category enum values:');
    updatedEnums.rows.forEach(row => {
      console.log(`  • ${row.enumlabel}`);
    });

    console.log('\n✅ Database schema updated successfully!');

  } catch (error) {
    console.error('❌ Error updating database schema:', error.message);
  } finally {
    await pool.end();
  }
}

addBasicNeedsCategoryToEnum();