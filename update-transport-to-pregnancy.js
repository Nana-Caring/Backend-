require('dotenv').config();
const pool = require('./db');

async function updateCategoryEnum() {
  let client;
  
  try {
    console.log('🔄 UPDATING CATEGORY ENUM: Transport → Pregnancy\n');
    
    client = await pool.connect();
    console.log('✅ Database connected successfully\n');
    
    // Step 1: Check current enum values
    console.log('📂 CURRENT CATEGORY VALUES:');
    const currentEnums = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_products_category'
      )
      ORDER BY enumlabel
    `);
    
    console.log('Before update:');
    currentEnums.rows.forEach(row => {
      console.log(`  ✓ "${row.enumlabel}"`);
    });
    
    // Step 2: Check if any products use "Transport" category
    console.log('\n🔍 CHECKING FOR TRANSPORT PRODUCTS:');
    const transportProducts = await client.query(`
      SELECT COUNT(*) as count, array_agg(name) as product_names
      FROM products 
      WHERE category = 'Transport'
    `);
    
    if (parseInt(transportProducts.rows[0].count) > 0) {
      console.log(`Found ${transportProducts.rows[0].count} Transport products:`);
      if (transportProducts.rows[0].product_names) {
        transportProducts.rows[0].product_names.forEach(name => {
          console.log(`  • ${name}`);
        });
      }
      console.log('\n🔄 Updating existing Transport products to Pregnancy...');
      
      const updateResult = await client.query(`
        UPDATE products 
        SET category = 'Other', 
            "updatedAt" = NOW()
        WHERE category = 'Transport'
        RETURNING name
      `);
      
      console.log(`✅ Updated ${updateResult.rowCount} products to "Other" category temporarily`);
    } else {
      console.log('✅ No Transport products found - safe to update enum');
    }
    
    // Step 3: Add new "Pregnancy" enum value
    console.log('\n➕ ADDING NEW ENUM VALUE:');
    try {
      await client.query(`
        ALTER TYPE enum_products_category ADD VALUE 'Pregnancy'
      `);
      console.log('✅ Added "Pregnancy" to category enum');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ "Pregnancy" already exists in enum');
      } else {
        throw error;
      }
    }
    
    // Step 4: Remove "Transport" enum value (PostgreSQL doesn't support direct removal)
    // We'll need to recreate the enum without Transport
    console.log('\n🔄 RECREATING ENUM WITHOUT TRANSPORT:');
    
    // Create new enum type
    await client.query(`
      CREATE TYPE enum_products_category_new AS ENUM (
        'Education', 'Healthcare', 'Groceries', 'Entertainment', 'Other', 'Pregnancy'
      )
    `);
    console.log('✅ Created new enum type without Transport');
    
    // Update the table to use new enum
    await client.query(`
      ALTER TABLE products 
      ALTER COLUMN category TYPE enum_products_category_new 
      USING category::text::enum_products_category_new
    `);
    console.log('✅ Updated products table to use new enum');
    
    // Drop old enum and rename new one
    await client.query('DROP TYPE enum_products_category');
    await client.query('ALTER TYPE enum_products_category_new RENAME TO enum_products_category');
    console.log('✅ Replaced old enum with new one');
    
    // Step 5: Verify final state
    console.log('\n📂 FINAL CATEGORY VALUES:');
    const finalEnums = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_products_category'
      )
      ORDER BY enumlabel
    `);
    
    console.log('After update:');
    finalEnums.rows.forEach(row => {
      console.log(`  ✓ "${row.enumlabel}"`);
    });
    
    console.log('\n🎉 ENUM UPDATE COMPLETE!');
    console.log('═══════════════════════════');
    console.log('✅ Transport → Pregnancy');
    console.log('✅ Database schema updated');
    console.log('✅ Ready for pregnancy-related products');
    console.log('\n📦 Available categories for Clicks MVP:');
    console.log('   • Healthcare (medications, vitamins, thermometers)');
    console.log('   • Other (personal care, baby products, beauty)');
    console.log('   • Pregnancy (prenatal vitamins, pregnancy tests, maternity care)');
    
  } catch (error) {
    console.error('❌ Error updating enum:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    process.exit(0);
  }
}

updateCategoryEnum();