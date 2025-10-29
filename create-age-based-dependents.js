const { User, Account } = require('./models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { generateUniqueAccountNumber } = require('./utils/generateUniqueAccountNumber');

// Generate South African ID number based on age
function generateSAIdNumber(age, gender = 'M') {
  // Calculate birth date based on age
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  
  // Random month (01-12) and day (01-28 for simplicity)
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  // Year (last 2 digits)
  const yearDigits = String(birthYear).slice(-2);
  
  // Gender digit (0-4 for female, 5-9 for male)
  const genderDigit = gender === 'F' ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 5) + 5;
  
  // Citizenship (0 for SA citizen) + Random digit
  const citizenshipDigits = '0' + String(Math.floor(Math.random() * 10));
  
  // First 12 digits
  const firstTwelve = yearDigits + month + day + String(genderDigit) + citizenshipDigits;
  
  // Calculate Luhn check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(firstTwelve[i]);
    if (i % 2 === 1) { // Odd positions (0-indexed)
      digit *= 2;
      if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return firstTwelve + checkDigit;
}

// Generate realistic email based on name and age
function generateEmail(firstName, surname, age) {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanSurname = surname.toLowerCase().replace(/[^a-z]/g, '');
  
  if (age <= 5) {
    // Baby/toddler - parent manages email
    return `${cleanFirst}.${cleanSurname}.baby@example.com`;
  } else if (age <= 12) {
    // Child - simple email
    return `${cleanFirst}${cleanSurname}@kidsemail.com`;
  } else if (age <= 17) {
    // Teen - trendy email
    return `${cleanFirst}_${cleanSurname}${age}@teenmail.com`;
  } else {
    // Youth - professional email
    return `${cleanFirst}.${cleanSurname}@youthmail.com`;
  }
}

async function createDependentsWithAges() {
  console.log('🎯 Creating Age-Based Test Dependents...\n');

  // Find a caregiver to assign these dependents to
  let caregiver = await User.findOne({ where: { role: 'caregiver' } });
  
  if (!caregiver) {
    // Create a test caregiver if none exists
    console.log('📝 Creating test caregiver...');
    const caregiverPassword = 'TestCaregiver2024!';
    const hashedPassword = await bcrypt.hash(caregiverPassword, 10);
    
    caregiver = await User.create({
      firstName: 'Sarah',
      middleName: 'Jane',
      surname: 'Williams',
      email: 'sarah.williams@caregiver.com',
      password: hashedPassword,
      Idnumber: '8505150123087', // 40-year-old female
      role: 'caregiver'
    });
    
    console.log(`✅ Created caregiver: ${caregiver.firstName} ${caregiver.surname} (${caregiver.email})`);
    console.log(`   Password: ${caregiverPassword}\n`);
  }

  // Define test dependents with different ages
  const dependentsData = [
    // Baby (0-2 years)
    {
      firstName: 'Amara',
      surname: 'Johnson',
      age: 1,
      gender: 'F',
      relation: 'daughter',
      category: '👶 Baby'
    },
    {
      firstName: 'Lwazi',
      surname: 'Mthembu',
      age: 2,
      gender: 'M',
      relation: 'son',
      category: '👶 Toddler'
    },
    
    // Child (3-12 years)
    {
      firstName: 'Thandiwe',
      surname: 'Ndaba',
      age: 7,
      gender: 'F',
      relation: 'niece',
      category: '🧒 Child'
    },
    {
      firstName: 'Sipho',
      surname: 'Zulu',
      age: 10,
      gender: 'M',
      relation: 'nephew',
      category: '🧒 Child'
    },
    
    // Teen (13-17 years)
    {
      firstName: 'Nomsa',
      surname: 'Dlamini',
      age: 14,
      gender: 'F',
      relation: 'sister',
      category: '👦 Teen'
    },
    {
      firstName: 'Tebogo',
      surname: 'Mokwena',
      age: 16,
      gender: 'M',
      relation: 'brother',
      category: '👦 Teen'
    },
    
    // Youth (18-20 years)
    {
      firstName: 'Keabetswe',
      surname: 'Motaung',
      age: 18,
      gender: 'F',
      relation: 'cousin',
      category: '👩 Youth'
    },
    {
      firstName: 'Mandla',
      surname: 'Khumalo',
      age: 20,
      gender: 'M',
      relation: 'cousin',
      category: '👨 Youth'
    }
  ];

  const createdDependents = [];

  for (const data of dependentsData) {
    try {
      console.log(`👤 Creating ${data.category}: ${data.firstName} ${data.surname} (${data.age} years old)`);
      
      // Generate ID number and email
      const idNumber = generateSAIdNumber(data.age, data.gender);
      const email = generateEmail(data.firstName, data.surname, data.age);
      const password = `${data.firstName}${data.age}Test!`;
      
      // Check if email or ID already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { Idnumber: idNumber }]
        }
      });
      
      if (existingUser) {
        console.log(`   ⚠️  User already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create dependent user
      const dependent = await User.create({
        firstName: data.firstName,
        middleName: null,
        surname: data.surname,
        email: email,
        password: hashedPassword,
        Idnumber: idNumber,
        relation: data.relation,
        role: 'dependent'
      });

      // Generate unique account number for main account
      const mainAccountNumber = await generateUniqueAccountNumber();

      // Create main account (Emergency Fund/Savings)
      const mainAccount = await Account.create({
        userId: dependent.id,
        caregiverId: caregiver.id,
        accountType: 'Main',
        balance: 0,
        parentAccountId: null,
        accountNumber: mainAccountNumber,
      });

      // Create 7 sub-accounts (Basic Needs Coverage)
      const subAccountTypes = [
        'Healthcare',     // Medical services, medications
        'Groceries',      // Food security and essentials
        'Education',      // School fees, books, materials  
        'Clothing',       // Clothing and personal items
        'Baby Care',      // Baby products and childcare
        'Entertainment',  // Recreation and development
        'Pregnancy'       // Pregnancy-related expenses
      ];
      
      const subAccounts = await Promise.all(
        subAccountTypes.map(async (type) => {
          const subAccountNumber = await generateUniqueAccountNumber();
          return Account.create({
            userId: dependent.id,
            caregiverId: caregiver.id,
            accountType: type,
            balance: 0,
            parentAccountId: mainAccount.id,
            accountNumber: subAccountNumber,
          });
        })
      );

      // Store created dependent info
      createdDependents.push({
        ...dependent.toJSON(),
        password: password, // Store original password for display
        accounts: [mainAccount, ...subAccounts].map(acc => acc.toJSON()),
        category: data.category,
        age: data.age
      });

      console.log(`   ✅ Created ${data.firstName} ${data.surname}`);
      console.log(`      📧 Email: ${email}`);
      console.log(`      🆔 ID Number: ${idNumber}`);
      console.log(`      🔑 Password: ${password}`);
      console.log(`      💳 Main Account: ${mainAccountNumber}`);
      console.log(`      📊 Total Accounts: ${subAccounts.length + 1} (1 Main + ${subAccounts.length} Sub-accounts)`);
      console.log('');

    } catch (error) {
      console.error(`❌ Error creating ${data.firstName} ${data.surname}:`, error.message);
    }
  }

  // Display summary
  console.log('\n📋 SUMMARY OF CREATED DEPENDENTS:');
  console.log('=' .repeat(60));
  
  const ageGroups = {
    '👶 Babies/Toddlers (0-2)': createdDependents.filter(d => d.age <= 2),
    '🧒 Children (3-12)': createdDependents.filter(d => d.age >= 3 && d.age <= 12),
    '👦 Teens (13-17)': createdDependents.filter(d => d.age >= 13 && d.age <= 17),
    '👨 Youth (18-20)': createdDependents.filter(d => d.age >= 18 && d.age <= 20)
  };

  Object.entries(ageGroups).forEach(([group, dependents]) => {
    if (dependents.length > 0) {
      console.log(`\n${group}:`);
      dependents.forEach(dep => {
        console.log(`  • ${dep.firstName} ${dep.surname} (${dep.age}) - ${dep.email}`);
      });
    }
  });

  console.log(`\n✅ Total Created: ${createdDependents.length} dependents`);
  console.log(`👥 Assigned Caregiver: ${caregiver.firstName} ${caregiver.surname} (${caregiver.email})`);
  console.log('\n🎯 Each dependent has 8 accounts total:');
  console.log('   • 1 Main Account (Emergency Fund/Savings)');
  console.log('   • 7 Sub-Accounts (Healthcare, Groceries, Education, Clothing, Baby Care, Entertainment, Pregnancy)');
  
  console.log('\n🚀 You can now test the frontend with these age-diverse dependents!');
  
  process.exit(0);
}

// Handle errors and cleanup
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  createDependentsWithAges().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createDependentsWithAges, generateSAIdNumber, generateEmail };