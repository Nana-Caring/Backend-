const { Client } = require('pg');
require('dotenv').config();

async function checkProductTableStructure() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'prince123',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nanapocket',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 CHECKING PRODUCT TABLE STRUCTURE FOR AGE FILTERING\n');

    await client.connect();

    // Check Products table structure
    console.log('📋 STEP 1: Products Table Structure');
    console.log('-' .repeat(50));
    
    const tableStructure = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'Products' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    console.log('Products table columns:');
    tableStructure.rows.forEach(col => {
      console.log(`   📊 ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      if (col.column_default) {
        console.log(`      Default: ${col.column_default}`);
      }
    });

    // Check for age-related columns specifically
    console.log('\n🎯 STEP 2: Age-Related Columns');
    console.log('-' .repeat(50));
    
    const ageColumns = tableStructure.rows.filter(col => 
      col.column_name.toLowerCase().includes('age') || 
      col.column_name.toLowerCase().includes('category') ||
      col.column_name.toLowerCase().includes('min') ||
      col.column_name.toLowerCase().includes('max')
    );

    if (ageColumns.length > 0) {
      console.log('Found age/category related columns:');
      ageColumns.forEach(col => {
        console.log(`   ✅ ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ No age-related columns found');
    }

    // Check sample data
    console.log('\n📊 STEP 3: Sample Product Data');
    console.log('-' .repeat(50));
    
    const sampleProducts = await client.query(`
      SELECT * FROM public."Products" 
      LIMIT 3
    `);

    if (sampleProducts.rows.length > 0) {
      console.log('Sample product structure:');
      const firstProduct = sampleProducts.rows[0];
      Object.keys(firstProduct).forEach(key => {
        console.log(`   📋 ${key}: ${typeof firstProduct[key]} = ${firstProduct[key]}`);
      });

      console.log('\nAll sample products:');
      sampleProducts.rows.forEach((product, index) => {
        console.log(`\n   Product ${index + 1}:`);
        console.log(`     ID: ${product.id}`);
        console.log(`     Name: ${product.name}`);
        console.log(`     Price: ${product.price}`);
        
        // Check for age-related fields
        const ageFields = ['minAge', 'maxAge', 'ageCategory', 'categories', 'category'];
        ageFields.forEach(field => {
          if (product.hasOwnProperty(field)) {
            console.log(`     ${field}: ${product[field]}`);
          }
        });
      });
    }

    // Count total products
    console.log('\n📈 STEP 4: Product Statistics');
    console.log('-' .repeat(50));
    
    const totalCount = await client.query(`SELECT COUNT(*) as total FROM public."Products"`);
    console.log(`Total products: ${totalCount.rows[0].total}`);

    const activeCount = await client.query(`
      SELECT COUNT(*) as active 
      FROM public."Products" 
      WHERE "isActive" = true
    `);
    console.log(`Active products: ${activeCount.rows[0].active}`);

    // Check Users table for dependents
    console.log('\n👥 STEP 5: Dependents Sample');
    console.log('-' .repeat(50));
    
    const dependentSample = await client.query(`
      SELECT id, "firstName", "surname", "Idnumber", role, "isBlocked"
      FROM public."Users" 
      WHERE role = 'dependent' 
      AND "isBlocked" = false
      LIMIT 3
    `);

    console.log('Sample dependents:');
    dependentSample.rows.forEach(dep => {
      console.log(`   👤 ${dep.firstName} ${dep.surname} (ID: ${dep.id})`);
      console.log(`      ID Number: ${dep.Idnumber}`);
      console.log(`      Role: ${dep.role} | Blocked: ${dep.isBlocked}`);
    });

    console.log('\n✅ TABLE STRUCTURE CHECK COMPLETE');

  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  } finally {
    await client.end();
  }
}

checkProductTableStructure().catch(console.error);