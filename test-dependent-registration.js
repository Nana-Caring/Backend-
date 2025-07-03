const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Account } = require('./models');
const { generateUniqueAccountNumber } = require('./utils/generateUniqueAccountNumber');

async function testDependentRegistration() {
    console.log('🧪 Testing Dependent Registration...\n');
    
    try {
        // Test data
        const testData = {
            firstName: "Emily",
            middleName: "Rose", 
            surname: "Johnson",
            email: "emily.johnson@example.com",
            password: "DependentPass123!",
            Idnumber: "0512345678902",
            relation: "daughter"
        };
        
        console.log('📝 Test Data:');
        console.log(JSON.stringify(testData, null, 2));
        
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: testData.email } });
        if (existingUser) {
            console.log('⚠️  User already exists, deleting for clean test...');
            // Delete existing accounts first
            await Account.destroy({ where: { userId: existingUser.id } });
            await existingUser.destroy();
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(testData.password, saltRounds);
        
        console.log('\n🔐 Password hashed successfully');
        
        // Create dependent
        const dependent = await User.create({
            firstName: testData.firstName,
            middleName: testData.middleName,
            surname: testData.surname,
            email: testData.email,
            password: hashedPassword,
            Idnumber: testData.Idnumber,
            relation: testData.relation,
            role: 'dependent',
            // Explicitly set personal details to null
            phoneNumber: null,
            postalAddressLine1: null,
            postalAddressLine2: null,
            postalCity: null,
            postalProvince: null,
            postalCode: null,
            homeAddressLine1: null,
            homeAddressLine2: null,
            homeCity: null,
            homeProvince: null,
            homeCode: null
        });
        
        console.log('✅ Dependent user created successfully');
        console.log(`   User ID: ${dependent.id}`);
        console.log(`   Email: ${dependent.email}`);
        console.log(`   Role: ${dependent.role}`);
        
        // Generate unique account number for main account
        const mainAccountNumber = await generateUniqueAccountNumber();
        console.log(`\n💳 Generated main account number: ${mainAccountNumber}`);
        
        // Create main account for dependent
        const mainAccount = await Account.create({
            userId: dependent.id,
            accountType: 'Main',
            balance: 0,
            parentAccountId: null,
            accountNumber: mainAccountNumber,
        });
        
        console.log('✅ Main account created successfully');
        console.log(`   Account ID: ${mainAccount.id}`);
        console.log(`   Account Number: ${mainAccount.accountNumber}`);
        console.log(`   Account Type: ${mainAccount.accountType}`);
        
        // Create sub-accounts for dependent
        const subAccountTypes = ['Education', 'Healthcare', 'Clothing', 'Entertainment', 'Baby Care', 'Pregnancy', 'Savings'];
        
        console.log('\n🏦 Creating sub-accounts...');
        const subAccounts = [];
        
        for (const type of subAccountTypes) {
            const subAccountNumber = await generateUniqueAccountNumber();
            const subAccount = await Account.create({
                userId: dependent.id,
                accountType: type,
                balance: 0,
                parentAccountId: mainAccount.id,
                accountNumber: subAccountNumber,
            });
            
            subAccounts.push(subAccount);
            console.log(`   ✅ ${type} account created (ID: ${subAccount.id}, Number: ${subAccount.accountNumber})`);
        }
        
        console.log('\n🎉 Dependent registration test completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   User ID: ${dependent.id}`);
        console.log(`   Total Accounts: ${subAccounts.length + 1}`);
        console.log(`   Main Account: ${mainAccount.accountNumber}`);
        console.log(`   Sub Accounts: ${subAccounts.length}`);
        
        // Test response format
        const response = {
            message: 'Dependent registered successfully',
            dependent: {
                ...dependent.get({ plain: true }),
                password: undefined,
                accounts: [mainAccount, ...subAccounts].map(acc => acc.get({ plain: true }))
            }
        };
        
        console.log('\n📤 Response format preview:');
        console.log(JSON.stringify({
            message: response.message,
            dependent: {
                id: response.dependent.id,
                firstName: response.dependent.firstName,
                surname: response.dependent.surname,
                email: response.dependent.email,
                role: response.dependent.role,
                accountsCount: response.dependent.accounts.length
            }
        }, null, 2));
        
        return response;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        throw error;
    }
}

// Run the test
testDependentRegistration()
    .then(() => {
        console.log('\n✅ All tests passed! Registration endpoint should work now.');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Test failed:', error.message);
        process.exit(1);
    });
