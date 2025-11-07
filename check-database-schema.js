const { Client } = require('pg');
require('dotenv').config();

async function checkDatabaseSchema() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'prince123',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nanapocket',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 COMPLETE DATABASE SCHEMA ANALYSIS\n');

    await client.connect();

    // Check all tables
    console.log('📋 STEP 1: All Tables in Database');
    console.log('-' .repeat(50));
    
    const tables = await client.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Available tables:');
    tables.rows.forEach(table => {
      console.log(`   📊 ${table.table_name} (${table.table_type})`);
    });

    // Look for product-related tables
    console.log('\n🛍️ STEP 2: Product-Related Tables');
    console.log('-' .repeat(50));
    
    const productTables = tables.rows.filter(table => 
      table.table_name.toLowerCase().includes('product')
    );

    for (const table of productTables) {
      console.log(`\n📦 Table: ${table.table_name}`);
      
      const columns = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [table.table_name]);

      console.log(`   Columns (${columns.rows.length}):`);
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`     • ${col.column_name}: ${col.data_type} (${nullable})`);
      });

      // Get sample data
      try {
        const sampleData = await client.query(`SELECT * FROM public."${table.table_name}" LIMIT 2`);
        if (sampleData.rows.length > 0) {
          console.log(`   Sample data (${sampleData.rows.length} rows):`);
          sampleData.rows.forEach((row, index) => {
            console.log(`     Row ${index + 1}: ${JSON.stringify(row, null, 2).substring(0, 200)}...`);
          });
        } else {
          console.log('   No data found in this table');
        }
      } catch (error) {
        console.log(`   Error reading sample data: ${error.message}`);
      }
    }

    // Check Users table for dependent info
    console.log('\n👥 STEP 3: Users Table (for dependents)');
    console.log('-' .repeat(50));
    
    const usersExists = tables.rows.find(t => t.table_name === 'Users');
    if (usersExists) {
      const userColumns = await client.query(`
        SELECT 
          column_name,
          data_type
        FROM information_schema.columns 
        WHERE table_name = 'Users'
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);

      console.log('Users table columns:');
      userColumns.rows.forEach(col => {
        console.log(`   • ${col.column_name}: ${col.data_type}`);
      });

      // Check for dependents
      const dependentCount = await client.query(`
        SELECT 
          role, 
          COUNT(*) as count 
        FROM public."Users" 
        GROUP BY role
        ORDER BY count DESC
      `);

      console.log('\nUser roles distribution:');
      dependentCount.rows.forEach(role => {
        console.log(`   👤 ${role.role}: ${role.count} users`);
      });

    } else {
      console.log('❌ Users table not found');
    }

    // Look for any age-related tables or columns across all tables
    console.log('\n🎯 STEP 4: Age-Related Fields Across All Tables');
    console.log('-' .repeat(50));
    
    const ageRelatedColumns = await client.query(`
      SELECT 
        table_name,
        column_name,
        data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND (
        LOWER(column_name) LIKE '%age%' 
        OR LOWER(column_name) LIKE '%category%'
        OR LOWER(column_name) LIKE '%min%'
        OR LOWER(column_name) LIKE '%max%'
        OR LOWER(column_name) LIKE '%restrict%'
      )
      ORDER BY table_name, column_name
    `);

    if (ageRelatedColumns.rows.length > 0) {
      console.log('Found age/category related fields:');
      ageRelatedColumns.rows.forEach(col => {
        console.log(`   📊 ${col.table_name}.${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ No age-related fields found in any table');
    }

    // Check if there are any enum types for categories
    console.log('\n📂 STEP 5: Custom Types (Enums)');
    console.log('-' .repeat(50));
    
    const enums = await client.query(`
      SELECT 
        t.typname as enum_name,
        STRING_AGG(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname LIKE '%category%' OR t.typname LIKE '%age%'
      GROUP BY t.typname
      ORDER BY t.typname
    `);

    if (enums.rows.length > 0) {
      console.log('Age/Category enums found:');
      enums.rows.forEach(enumType => {
        console.log(`   📂 ${enumType.enum_name}: ${enumType.enum_values}`);
      });
    } else {
      console.log('❌ No age/category related enums found');
    }

    console.log('\n✅ DATABASE SCHEMA ANALYSIS COMPLETE');

  } catch (error) {
    console.error('❌ Error during schema analysis:', error);
  } finally {
    await client.end();
  }
}

checkDatabaseSchema().catch(console.error);