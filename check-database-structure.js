const { Sequelize } = require('sequelize');
require('dotenv').config();

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

async function checkDatabaseStructure() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check available categories
    console.log('\n📂 CHECKING AVAILABLE CATEGORIES:');
    const [categoryResults] = await sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_products_category'
      );
    `);
    
    console.log('Available categories:');
    categoryResults.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.enumlabel}`);
    });

    // Check age categories
    console.log('\n👶 CHECKING AVAILABLE AGE CATEGORIES:');
    const [ageResults] = await sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_products_ageCategory'
      );
    `);
    
    console.log('Available age categories:');
    ageResults.forEach((age, index) => {
      console.log(`${index + 1}. ${age.enumlabel}`);
    });

    // Check some existing products to understand the structure
    console.log('\n📋 SAMPLE EXISTING PRODUCTS:');
    const [productResults] = await sequelize.query(`
      SELECT name, brand, category, subcategory, price, shop, "shopCategory"
      FROM products 
      LIMIT 5;
    `);
    
    productResults.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Brand: ${product.brand || 'NULL'}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Shop: ${product.shop || 'NULL'}`);
      console.log(`   Shop Category: ${product.shopCategory || 'NULL'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabaseStructure();