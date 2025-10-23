const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.production' });

// UUID generation function
function generateUUID() {
  return crypto.randomUUID();
}

// Initialize database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false // Set to console.log to see SQL queries
});

async function createDemoUsers() {
  try {
    console.log('🚀 CREATING DEMO USERS FOR PRODUCTION');
    console.log('🗄️  Database:', process.env.DATABASE_URL.split('@')[1]);
    
    const saltRounds = 12;
    
    console.log('\n👥 Creating demo users...');

    // 1. Create Demo Funder
    console.log('💼 Creating Demo Funder...');
    const funderPassword = await bcrypt.hash('funder123', saltRounds);
    const [funderResult] = await sequelize.query(`
      INSERT INTO "Users" (
        "firstName", "lastName", "username", "email", "password", 
        "userType", "phoneNumber", "idNumber", "dateOfBirth", 
        "isActive", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
      ) RETURNING id
    `, {
      bind: [
        'Demo', 'Funder', 'demofunder', 'funder@nanacaring.com',
        funderPassword, 'funder', '0812345601', '8001011234567',
        '1980-01-01', true
      ]
    });
    const funderId = funderResult[0].id;
    console.log(`   ✅ Funder created with ID: ${funderId}`);

    // 2. Create Demo Dependent
    console.log('👨‍👩‍👧‍👦 Creating Demo Dependent...');
    const dependentPassword = await bcrypt.hash('dependent123', saltRounds);
    const [dependentResult] = await sequelize.query(`
      INSERT INTO "Users" (
        "firstName", "lastName", "username", "email", "password", 
        "userType", "phoneNumber", "idNumber", "dateOfBirth", 
        "isActive", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
      ) RETURNING id
    `, {
      bind: [
        'Demo', 'Dependent', 'demodependent', 'dependent@nanacaring.com',
        dependentPassword, 'dependent', '0812345602', '0001011234568',
        '2000-01-01', true
      ]
    });
    const dependentId = dependentResult[0].id;
    console.log(`   ✅ Dependent created with ID: ${dependentId}`);

    // 3. Create Demo Caregiver
    console.log('👩‍⚕️ Creating Demo Caregiver...');
    const caregiverPassword = await bcrypt.hash('caregiver123', saltRounds);
    const [caregiverResult] = await sequelize.query(`
      INSERT INTO "Users" (
        "firstName", "lastName", "username", "email", "password", 
        "userType", "phoneNumber", "idNumber", "dateOfBirth", 
        "isActive", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
      ) RETURNING id
    `, {
      bind: [
        'Demo', 'Caregiver', 'democaregiver', 'caregiver@nanacaring.com',
        caregiverPassword, 'caregiver', '0812345603', '7501011234569',
        '1975-01-01', true
      ]
    });
    const caregiverId = caregiverResult[0].id;
    console.log(`   ✅ Caregiver created with ID: ${caregiverId}`);

    console.log('\n🏦 Creating demo accounts...');

    // 4. Create Funder's Main Account
    const funderAccountId = generateUUID();
    await sequelize.query(`
      INSERT INTO "Accounts" (
        "id", "accountName", "accountNumber", "accountType", "balance", 
        "currency", "userId", "status", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      )
    `, {
      bind: [
        funderAccountId, 'Demo Funder Main Account', '1000000001',
        'main', 50000.00, 'ZAR', funderId, 'active'
      ]
    });
    console.log(`   💳 Funder account created: ${funderAccountId}`);

    // 5. Create Dependent's Account (linked to funder)
    const dependentAccountId = generateUUID();
    await sequelize.query(`
      INSERT INTO "Accounts" (
        "id", "accountName", "accountNumber", "accountType", "balance", 
        "currency", "userId", "parentAccountId", "status", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
    `, {
      bind: [
        dependentAccountId, 'Demo Dependent Account', '2000000001',
        'dependent', 5000.00, 'ZAR', dependentId, funderAccountId, 'active'
      ]
    });
    console.log(`   👨‍👩‍👧‍👦 Dependent account created: ${dependentAccountId}`);

    // 6. Create Caregiver's Account
    const caregiverAccountId = generateUUID();
    await sequelize.query(`
      INSERT INTO "Accounts" (
        "id", "accountName", "accountNumber", "accountType", "balance", 
        "currency", "userId", "status", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      )
    `, {
      bind: [
        caregiverAccountId, 'Demo Caregiver Account', '3000000001',
        'caregiver', 2000.00, 'ZAR', caregiverId, 'active'
      ]
    });
    console.log(`   👩‍⚕️ Caregiver account created: ${caregiverAccountId}`);

    console.log('\n🔗 Creating relationships...');

    // 7. Link Funder and Dependent
    await sequelize.query(`
      INSERT INTO "FunderDependents" (
        "funderId", "dependentId", "relationship", "isActive", 
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, NOW(), NOW()
      )
    `, {
      bind: [funderId, dependentId, 'parent', true]
    });
    console.log(`   🔗 Funder-Dependent relationship created`);

    console.log('\n💰 Creating sample transactions...');

    // 8. Create sample transactions
    const transactions = [
      {
        type: 'deposit',
        amount: 50000.00,
        accountId: funderAccountId,
        description: 'Initial funding deposit',
        category: 'deposit'
      },
      {
        type: 'transfer',
        amount: 5000.00,
        accountId: dependentAccountId,
        description: 'Monthly allowance transfer',
        category: 'transfer'
      },
      {
        type: 'deposit',
        amount: 2000.00,
        accountId: caregiverAccountId,
        description: 'Service payment received',
        category: 'payment'
      },
      {
        type: 'spending',
        amount: 150.00,
        accountId: dependentAccountId,
        description: 'Grocery purchase - Pick n Pay',
        category: 'Groceries'
      },
      {
        type: 'spending',
        amount: 89.99,
        accountId: dependentAccountId,
        description: 'Educational books purchase',
        category: 'Education'
      }
    ];

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      await sequelize.query(`
        INSERT INTO "Transactions" (
          "type", "amount", "accountId", "description", "category", 
          "status", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        )
      `, {
        bind: [tx.type, tx.amount, tx.accountId, tx.description, tx.category, 'completed']
      });
    }
    console.log(`   ✅ Created ${transactions.length} sample transactions`);

    console.log('\n📊 Demo data summary:');
    console.log('👥 Users Created:');
    console.log(`   👨‍💼 Funder: demofunder / funder123`);
    console.log(`   👨‍👩‍👧‍👦 Dependent: demodependent / dependent123`);
    console.log(`   👩‍⚕️ Caregiver: democaregiver / caregiver123`);
    console.log('\n💳 Accounts Created:');
    console.log(`   💼 Funder Account: R50,000.00 balance`);
    console.log(`   👨‍👩‍👧‍👦 Dependent Account: R4,860.01 balance (after purchases)`);
    console.log(`   👩‍⚕️ Caregiver Account: R2,000.00 balance`);
    console.log('\n💰 Sample Transactions: 5 transactions created');
    
    return {
      funder: { id: funderId, username: 'demofunder', accountId: funderAccountId },
      dependent: { id: dependentId, username: 'demodependent', accountId: dependentAccountId },
      caregiver: { id: caregiverId, username: 'democaregiver', accountId: caregiverAccountId }
    };

  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the script
createDemoUsers()
  .then((users) => {
    console.log('\n🎉 Demo users created successfully!');
    console.log('\n🧪 Ready for testing with:');
    console.log('   - Enhanced order system with store codes');
    console.log('   - Transaction tracking for dependents');
    console.log('   - Payment processing capabilities');
    console.log('   - User authentication and authorization');
    console.log('\n📝 Next: Use the testing scripts to verify functionality');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to create demo users:', error);
    process.exit(1);
  });
