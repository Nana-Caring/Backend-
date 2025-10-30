const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

console.log('🔍 CHECKING DATABASE STRUCTURE AND ADDING SHOP COLUMNS\n');

async function checkAndAddShopColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');

    // Check current table structure
    console.log('\n📋 Checking current products table structure...');
    
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position;
    `);

    console.log('\n🗂️ CURRENT PRODUCTS TABLE COLUMNS:');
    console.log('================================================');
    results.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'Nullable' : 'Not Null'}`);
    });

    // Check if shop columns exist
    const shopColumn = results.find(col => col.column_name === 'shop');
    const shopCategoryColumn = results.find(col => col.column_name === 'shopCategory');

    console.log(`\n🏪 Shop column exists: ${shopColumn ? '✅ Yes' : '❌ No'}`);
    console.log(`🏪 ShopCategory column exists: ${shopCategoryColumn ? '✅ Yes' : '❌ No'}`);

    // Add shop columns if they don't exist
    if (!shopColumn) {
      console.log('\n➕ Adding shop column...');
      await sequelize.query('ALTER TABLE products ADD COLUMN shop VARCHAR(255);');
      console.log('✅ Shop column added successfully');
    }

    if (!shopCategoryColumn) {
      console.log('➕ Adding shopCategory column...');
      await sequelize.query('ALTER TABLE products ADD COLUMN "shopCategory" VARCHAR(255);');
      console.log('✅ ShopCategory column added successfully');
    }

    if (!shopColumn || !shopCategoryColumn) {
      console.log('\n✅ Shop columns have been added to the products table');
      console.log('🔄 You can now run the expand-shop-products.js script');
    } else {
      console.log('\n✅ Shop columns already exist in the products table');
    }

    // Show updated structure
    console.log('\n📋 Updated products table structure:');
    const [updatedResults] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position;
    `);

    updatedResults.forEach((col, index) => {
      const isNew = (col.column_name === 'shop' || col.column_name === 'shopCategory');
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) ${isNew ? '🆕 NEW' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAndAddShopColumns();