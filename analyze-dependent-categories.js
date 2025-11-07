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

console.log('🧑‍🤝‍🧑 DEPENDENT CATEGORIES & ASSOCIATED PRODUCTS ANALYSIS');
console.log('=' .repeat(80));

async function analyzeDependentCategories() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully\n');

    // Define models
    const User = sequelize.define('User', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: Sequelize.STRING, allowNull: false },
      surname: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('funder', 'dependent', 'caregiver'), allowNull: false },
      Idnumber: { type: Sequelize.STRING, allowNull: true },
      isBlocked: { type: Sequelize.BOOLEAN, defaultValue: false }
    }, { tableName: 'Users', timestamps: true });

    const Account = sequelize.define('Account', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      accountNumber: { type: Sequelize.STRING, allowNull: false },
      accountType: { 
        type: Sequelize.ENUM('main', 'savings', 'Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'), 
        allowNull: false 
      },
      balance: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      parentAccountId: { type: Sequelize.INTEGER, allowNull: true }
    }, { tableName: 'Accounts', timestamps: true });

    const Product = sequelize.define('Product', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      brand: { type: Sequelize.STRING, allowNull: false },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      category: { 
        type: Sequelize.ENUM('Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'), 
        allowNull: false 
      },
      subcategory: { type: Sequelize.STRING, allowNull: true },
      sku: { type: Sequelize.STRING, allowNull: false },
      shop: { type: Sequelize.STRING, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      minAge: { type: Sequelize.INTEGER, defaultValue: 0 },
      maxAge: { type: Sequelize.INTEGER, defaultValue: 100 },
      ageCategory: { 
        type: Sequelize.ENUM('infant', 'toddler', 'child', 'teen', 'adult', 'all_ages'), 
        allowNull: true 
      }
    }, { tableName: 'products', timestamps: true });

    // Get all dependents
    console.log('📋 FETCHING ALL DEPENDENTS:\n');
    const dependents = await User.findAll({
      where: { 
        role: 'dependent',
        isBlocked: false
      },
      attributes: ['id', 'firstName', 'surname', 'email', 'Idnumber'],
      order: [['id', 'ASC']]
    });

    if (dependents.length === 0) {
      console.log('❌ No dependents found in the system');
      return;
    }

    console.log(`✅ Found ${dependents.length} dependents:\n`);

    // Analyze each dependent
    for (const dependent of dependents) {
      console.log(`👤 DEPENDENT: ${dependent.firstName} ${dependent.surname}`);
      console.log(`   📧 Email: ${dependent.email}`);
      console.log(`   🆔 ID: ${dependent.id}`);
      console.log(`   📄 ID Number: ${dependent.Idnumber || 'Not provided'}`);

      // Calculate age if ID number is provided
      let age = null;
      let ageCategory = null;
      
      if (dependent.Idnumber && dependent.Idnumber.length >= 6) {
        const yearDigits = dependent.Idnumber.substring(0, 2);
        const monthDigits = dependent.Idnumber.substring(2, 4);
        const dayDigits = dependent.Idnumber.substring(4, 6);
        
        let birthYear = parseInt(yearDigits);
        birthYear = birthYear > 25 ? 1900 + birthYear : 2000 + birthYear;
        
        const birthDate = new Date(birthYear, parseInt(monthDigits) - 1, parseInt(dayDigits));
        const currentDate = new Date();
        age = currentDate.getFullYear() - birthDate.getFullYear();
        
        // Determine age category
        if (age < 2) ageCategory = 'infant';
        else if (age < 5) ageCategory = 'toddler';
        else if (age < 13) ageCategory = 'child';
        else if (age < 18) ageCategory = 'teen';
        else ageCategory = 'adult';
        
        console.log(`   🎂 Age: ${age} years (${ageCategory})`);
      } else {
        console.log('   🎂 Age: Unable to determine (no valid ID number)');
      }

      // Get dependent's accounts and their categories
      console.log('\n   💳 DEPENDENT ACCOUNTS:');
      const accounts = await Account.findAll({
        where: { userId: dependent.id },
        attributes: ['id', 'accountNumber', 'accountType', 'balance', 'parentAccountId'],
        order: [['accountType', 'ASC']]
      });

      if (accounts.length === 0) {
        console.log('      ❌ No accounts found for this dependent');
      } else {
        const categoryAccounts = accounts.filter(acc => 
          ['Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'].includes(acc.accountType)
        );
        const mainAccounts = accounts.filter(acc => acc.accountType === 'main');
        
        console.log(`      📊 Total Accounts: ${accounts.length}`);
        console.log(`      🏠 Main Accounts: ${mainAccounts.length}`);
        console.log(`      📂 Category Accounts: ${categoryAccounts.length}`);

        // Show category accounts
        if (categoryAccounts.length > 0) {
          console.log('\n      📂 CATEGORY ACCOUNTS:');
          for (const account of categoryAccounts) {
            console.log(`         ${account.accountType}: R${parseFloat(account.balance).toFixed(2)} (${account.accountNumber})`);
          }
        }
      }

      // Get products available for this dependent based on age and categories
      console.log('\n   🛍️  AVAILABLE PRODUCTS BY CATEGORY:');
      
      // Get all product categories
      const categories = ['Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'];
      
      for (const category of categories) {
        let whereClause = {
          category: category,
          isActive: true
        };
        
        // Add age filtering if we have the dependent's age
        if (age !== null) {
          whereClause.minAge = { [Sequelize.Op.lte]: age };
          whereClause.maxAge = { [Sequelize.Op.gte]: age };
        }
        
        const categoryProducts = await Product.findAll({
          where: whereClause,
          attributes: ['id', 'name', 'brand', 'price', 'shop', 'sku', 'minAge', 'maxAge'],
          order: [['name', 'ASC']],
          limit: 10 // Limit to first 10 products per category
        });

        console.log(`\n      📂 ${category.toUpperCase()} (${categoryProducts.length} products available):`);
        
        if (categoryProducts.length === 0) {
          console.log('         ❌ No products available in this category');
        } else {
          categoryProducts.forEach((product, index) => {
            const ageRange = `${product.minAge}-${product.maxAge}`;
            const shop = product.shop ? ` @ ${product.shop}` : '';
            console.log(`         ${index + 1}. ${product.name} - R${parseFloat(product.price).toFixed(2)}${shop}`);
            console.log(`            Brand: ${product.brand} | SKU: ${product.sku} | Age: ${ageRange}`);
          });
          
          if (categoryProducts.length === 10) {
            console.log('         ... (showing first 10 products only)');
          }
        }
      }

      console.log('\n' + '─'.repeat(80) + '\n');
    }

    // Summary statistics
    console.log('📊 SYSTEM SUMMARY:');
    console.log('─'.repeat(40));
    
    const totalProducts = await Product.count({ where: { isActive: true } });
    console.log(`📦 Total Active Products: ${totalProducts}`);
    
    // Products by category
    console.log('\n📂 Products by Category:');
    for (const category of ['Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other']) {
      const count = await Product.count({ 
        where: { 
          category: category, 
          isActive: true 
        } 
      });
      console.log(`   ${category}: ${count} products`);
    }

    // Account types summary
    console.log('\n💳 Account Types Summary:');
    const accountStats = await sequelize.query(`
      SELECT "accountType", COUNT(*) as count
      FROM "Accounts" 
      WHERE "userId" IN (SELECT id FROM "Users" WHERE role = 'dependent')
      GROUP BY "accountType"
      ORDER BY count DESC
    `, { type: Sequelize.QueryTypes.SELECT });

    accountStats.forEach(stat => {
      console.log(`   ${stat.accountType}: ${stat.count} accounts`);
    });

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the analysis
analyzeDependentCategories();