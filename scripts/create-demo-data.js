const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// UUID v4 generator using crypto
function generateUUID() {
  return crypto.randomUUID();
}st { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.production' });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

function generateAccountNumber() {
  const prefix = 'NANA';
  const randomNum = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${prefix}${randomNum}`;
}

(async () => {
  try {
    console.log('🏦 Creating accounts for demo users...');
    
    // Get existing users
    const [users] = await sequelize.query('SELECT id, email, role FROM "Users"');
    
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email} (${user.role})`);
      
      if (user.role === 'funder') {
        // Create main account for funder
        const accountId = uuidv4();
        const accountNumber = generateAccountNumber();
        
        await sequelize.query(`
          INSERT INTO "Accounts" (
            id, "userId", "accountName", "accountNumber", 
            balance, currency, status, "accountType", 
            "createdAt", "updatedAt"
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [accountId, user.id, 'Main Funder Account', accountNumber, 5000.00, 'ZAR', 'active', 'funder']);
        
        console.log(`  ✅ Created funder account: ${accountNumber} with R5,000.00`);
        
      } else if (user.role === 'dependent') {
        // Create spending account for dependent
        const accountId = uuidv4();
        const accountNumber = generateAccountNumber();
        
        await sequelize.query(`
          INSERT INTO "Accounts" (
            id, "userId", "accountName", "accountNumber", 
            balance, currency, status, "accountType", 
            "createdAt", "updatedAt"
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [accountId, user.id, 'Spending Account', accountNumber, 500.00, 'ZAR', 'active', 'spending']);
        
        console.log(`  ✅ Created dependent account: ${accountNumber} with R500.00`);
        
        // Create some sample transactions for the dependent
        const transactionId1 = generateUUID();
        const transactionId2 = generateUUID();
        
        // Deposit transaction
        await sequelize.query(`
          INSERT INTO "Transactions" (
            id, "accountId", type, amount, description, 
            status, "createdAt", "updatedAt"
          ) VALUES (?, ?, ?, ?, ?, ?, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
        `, [transactionId1, accountId, 'deposit', 300.00, 'Weekly allowance from funder', 'completed']);
        
        // Purchase transaction
        await sequelize.query(`
          INSERT INTO "Transactions" (
            id, "accountId", type, amount, description, 
            status, "createdAt", "updatedAt"
          ) VALUES (?, ?, ?, ?, ?, ?, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
        `, [transactionId2, accountId, 'purchase', -50.00, 'School supplies purchase', 'completed']);
        
        console.log(`  📊 Created 2 sample transactions`);
        
      } else if (user.role === 'caregiver') {
        // Create monitoring account for caregiver
        const accountId = uuidv4();
        const accountNumber = generateAccountNumber();
        
        await sequelize.query(`
          INSERT INTO "Accounts" (
            id, "userId", "accountName", "accountNumber", 
            balance, currency, status, "accountType", 
            "createdAt", "updatedAt"
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [accountId, user.id, 'Monitoring Account', accountNumber, 0.00, 'ZAR', 'active', 'caregiver']);
        
        console.log(`  ✅ Created caregiver account: ${accountNumber}`);
      }
    }
    
    // Create some demo products
    console.log('\n🛍️ Creating demo products...');
    
    const products = [
      {
        name: 'School Notebook Set',
        brand: 'EduTools',
        description: 'Complete set of notebooks for school',
        price: 45.99,
        category: 'Education',
        sku: 'EDU001',
        stockQuantity: 50
      },
      {
        name: 'Healthy Lunch Box',
        brand: 'NutriKids',
        description: 'Nutritious lunch box with fruits and snacks',
        price: 35.50,
        category: 'Groceries',
        sku: 'GRC001',
        stockQuantity: 25
      },
      {
        name: 'Basic First Aid Kit',
        brand: 'HealthCare Plus',
        description: 'Essential first aid supplies',
        price: 125.00,
        category: 'Healthcare',
        sku: 'HLT001',
        stockQuantity: 15
      }
    ];
    
    for (const product of products) {
      await sequelize.query(`
        INSERT INTO products (
          name, brand, description, price, category, sku, 
          "stockQuantity", "inStock", "isActive", "createdAt", "updatedAt"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, true, true, NOW(), NOW())
      `, [product.name, product.brand, product.description, product.price, product.category, product.sku, product.stockQuantity]);
      
      console.log(`  ✅ Created product: ${product.name} - R${product.price}`);
    }
    
    console.log('\n🎉 Demo data creation completed!');
    console.log('\n📋 Summary:');
    console.log('  - 3 Demo users created with accounts');
    console.log('  - Sample transactions for dependent');
    console.log('  - 3 Demo products in catalog');
    console.log('\n🔐 Demo Login Credentials:');
    console.log('  Funder: funder@demo.com / DemoPassword123!');
    console.log('  Dependent: dependent@demo.com / DemoPassword123!');
    console.log('  Caregiver: caregiver@demo.com / DemoPassword123!');
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
