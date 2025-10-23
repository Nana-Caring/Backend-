'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash password for all demo users
    const hashedPassword = await bcrypt.hash('Demo123!', 10);

    // Insert demo users
    const users = await queryInterface.bulkInsert('Users', [
      {
        // Funder user
        firstName: 'John',
        surname: 'Smith',
        middleName: 'David',
        email: 'john.funder@example.com',
        password: hashedPassword,
        role: 'funder',
        Idnumber: '8501151234567', // Born 1985-01-15 (40 years old)
        phoneNumber: '0821234567',
        address: '123 Main Street, Cape Town',
        homeProvince: 'Western Cape',
        status: 'active',
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        // Caregiver user
        firstName: 'Sarah',
        surname: 'Johnson',
        middleName: 'Marie',
        email: 'sarah.caregiver@example.com',
        password: hashedPassword,
        role: 'caregiver',
        Idnumber: '9203251234568', // Born 1992-03-25 (33 years old)
        phoneNumber: '0827654321',
        address: '456 Oak Avenue, Johannesburg',
        homeProvince: 'Gauteng',
        status: 'active',
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        // Dependent user - Child
        firstName: 'Emma',
        surname: 'Williams',
        middleName: 'Grace',
        email: 'emma.dependent@example.com',
        password: hashedPassword,
        role: 'dependent',
        Idnumber: '1405121234569', // Born 2014-05-12 (10 years old)
        phoneNumber: '0823456789',
        address: '789 Pine Road, Durban',
        homeProvince: 'KwaZulu-Natal',
        status: 'active',
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        // Dependent user - Teen
        firstName: 'Michael',
        surname: 'Brown',
        middleName: 'James',
        email: 'michael.teen@example.com',
        password: hashedPassword,
        role: 'dependent',
        Idnumber: '0712081234570', // Born 2007-12-08 (17 years old)
        phoneNumber: '0829876543',
        address: '321 Elm Street, Pretoria',
        homeProvince: 'Gauteng',
        status: 'active',
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        // Dependent user - Adult
        firstName: 'Lisa',
        surname: 'Davis',
        middleName: 'Ann',
        email: 'lisa.adult@example.com',
        password: hashedPassword,
        role: 'dependent',
        Idnumber: '9508201234571', // Born 1995-08-20 (30 years old)
        phoneNumber: '0824567890',
        address: '654 Maple Lane, Port Elizabeth',
        homeProvince: 'Eastern Cape',
        status: 'active',
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      returning: true
    });

    console.log('✅ Demo users created successfully');
    
    // Get user IDs (they will be sequential starting from the last existing ID)
    const userIds = users.map(user => user.id);
    
    // Create accounts for users
    const accounts = [];
    
    // Funder account with high balance
    accounts.push({
      userId: userIds[0], // John (Funder)
      accountName: 'John Smith - Primary Account',
      accountNumber: 'ACC001001',
      accountType: 'primary',
      balance: 50000.00,
      status: 'active',
      parentAccountId: null,
      caregiverId: null,
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Caregiver account
    accounts.push({
      userId: userIds[1], // Sarah (Caregiver)
      accountName: 'Sarah Johnson - Primary Account',
      accountNumber: 'ACC002001',
      accountType: 'primary',
      balance: 25000.00,
      status: 'active',
      parentAccountId: null,
      caregiverId: null,
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Child dependent account (managed by caregiver)
    accounts.push({
      userId: userIds[2], // Emma (Child)
      accountName: 'Emma Williams - Child Account',
      accountNumber: 'ACC003001',
      accountType: 'dependent',
      balance: 500.00,
      status: 'active',
      parentAccountId: null,
      caregiverId: userIds[1], // Managed by Sarah
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Teen dependent account (managed by funder)
    accounts.push({
      userId: userIds[3], // Michael (Teen)
      accountName: 'Michael Brown - Teen Account',
      accountNumber: 'ACC004001',
      accountType: 'dependent',
      balance: 1500.00,
      status: 'active',
      parentAccountId: userIds[0], // Funded by John
      caregiverId: null,
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Adult dependent account
    accounts.push({
      userId: userIds[4], // Lisa (Adult)
      accountName: 'Lisa Davis - Adult Account',
      accountNumber: 'ACC005001',
      accountType: 'dependent',
      balance: 2500.00,
      status: 'active',
      parentAccountId: userIds[0], // Funded by John
      caregiverId: null,
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await queryInterface.bulkInsert('Accounts', accounts);
    console.log('✅ Demo accounts created successfully');

    // Create funder-dependent relationships
    await queryInterface.bulkInsert('FunderDependents', [
      {
        funderId: userIds[0], // John funds Michael
        dependentId: userIds[3],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        funderId: userIds[0], // John funds Lisa
        dependentId: userIds[4],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        funderId: userIds[1], // Sarah manages Emma
        dependentId: userIds[2],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log('✅ Funder-dependent relationships created successfully');
    console.log('');
    console.log('📋 Demo Users Created:');
    console.log('======================');
    console.log('👨‍💼 Funder: john.funder@example.com (Password: Demo123!)');
    console.log('   - Role: Funder');
    console.log('   - Age: 40 years old');
    console.log('   - Balance: R50,000');
    console.log('   - Funds: Michael (Teen) and Lisa (Adult)');
    console.log('');
    console.log('👩‍⚕️ Caregiver: sarah.caregiver@example.com (Password: Demo123!)');
    console.log('   - Role: Caregiver');
    console.log('   - Age: 33 years old');
    console.log('   - Balance: R25,000');
    console.log('   - Manages: Emma (Child)');
    console.log('');
    console.log('👧 Child Dependent: emma.dependent@example.com (Password: Demo123!)');
    console.log('   - Role: Dependent');
    console.log('   - Age: 10 years old');
    console.log('   - Balance: R500');
    console.log('   - Can buy: Child products (ages 3-12)');
    console.log('');
    console.log('🧑‍🎓 Teen Dependent: michael.teen@example.com (Password: Demo123!)');
    console.log('   - Role: Dependent');
    console.log('   - Age: 17 years old');
    console.log('   - Balance: R1,500');
    console.log('   - Can buy: Teen products (ages 13-17)');
    console.log('');
    console.log('👩‍💼 Adult Dependent: lisa.adult@example.com (Password: Demo123!)');
    console.log('   - Role: Dependent');
    console.log('   - Age: 30 years old');
    console.log('   - Balance: R2,500');
    console.log('   - Can buy: Adult products (ages 18-64)');
  },

  async down(queryInterface, Sequelize) {
    // Remove demo data in reverse order
    await queryInterface.bulkDelete('FunderDependents', {
      funderId: { [Sequelize.Op.in]: [1, 2] }
    });
    
    await queryInterface.bulkDelete('Accounts', {
      accountNumber: { 
        [Sequelize.Op.in]: ['ACC001001', 'ACC002001', 'ACC003001', 'ACC004001', 'ACC005001'] 
      }
    });
    
    await queryInterface.bulkDelete('Users', {
      email: { 
        [Sequelize.Op.in]: [
          'john.funder@example.com',
          'sarah.caregiver@example.com', 
          'emma.dependent@example.com',
          'michael.teen@example.com',
          'lisa.adult@example.com'
        ] 
      }
    });

    console.log('✅ Demo users and related data removed');
  }
};
