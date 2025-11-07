const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: envFile });

const config = require('../config/config.json');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false
    });
}

function generateUUID() {
    return crypto.randomUUID();
}

function generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

async function createDemoUsers() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to production database');

        const hashedPassword = await bcrypt.hash('demo123', 10);

        // Create Funder User
        const funderUserResult = await sequelize.query(`
            INSERT INTO "Users" (
                "firstName", "surname", "middleName", "email", "password", "role", 
                "Idnumber", "phoneNumber", "dateOfBirth", "status",
                "postalAddressLine1", "postalCity", "postalProvince", "postalCode",
                "homeAddressLine1", "homeCity", "homeProvince", "homeCode",
                "createdAt", "updatedAt"
            ) VALUES (
                'John', 'Smith', 'Michael', 'funder@demo.com', :password, 'funder',
                '8501015000001', '+27123456789', '1985-01-01', 'active',
                '123 Demo Street', 'Cape Town', 'Western Cape', '8000',
                '123 Demo Street', 'Cape Town', 'Western Cape', '8000',
                NOW(), NOW()
            ) RETURNING id;
        `, {
            replacements: { password: hashedPassword },
            type: Sequelize.QueryTypes.SELECT
        });
        const funderId = funderUserResult[0].id;

        // Create Dependent User
        const dependentUserResult = await sequelize.query(`
            INSERT INTO "Users" (
                "firstName", "surname", "middleName", "email", "password", "role", 
                "Idnumber", "phoneNumber", "dateOfBirth", "status", "relation",
                "postalAddressLine1", "postalCity", "postalProvince", "postalCode",
                "homeAddressLine1", "homeCity", "homeProvince", "homeCode",
                "createdAt", "updatedAt"
            ) VALUES (
                'Emma', 'Smith', 'Grace', 'dependent@demo.com', :password, 'dependent',
                '0505015000002', '+27123456790', '2005-05-01', 'active', 'daughter',
                '123 Demo Street', 'Cape Town', 'Western Cape', '8000',
                '123 Demo Street', 'Cape Town', 'Western Cape', '8000',
                NOW(), NOW()
            ) RETURNING id;
        `, {
            replacements: { password: hashedPassword },
            type: Sequelize.QueryTypes.SELECT
        });
        const dependentId = dependentUserResult[0].id;

        // Create Caregiver User
        const caregiverUserResult = await sequelize.query(`
            INSERT INTO "Users" (
                "firstName", "surname", "middleName", "email", "password", "role", 
                "Idnumber", "phoneNumber", "dateOfBirth", "status",
                "postalAddressLine1", "postalCity", "postalProvince", "postalCode",
                "homeAddressLine1", "homeCity", "homeProvince", "homeCode",
                "createdAt", "updatedAt"
            ) VALUES (
                'Sarah', 'Johnson', 'Marie', 'caregiver@demo.com', :password, 'caregiver',
                '7803125000003', '+27123456791', '1978-03-12', 'active',
                '456 Care Avenue', 'Johannesburg', 'Gauteng', '2000',
                '456 Care Avenue', 'Johannesburg', 'Gauteng', '2000',
                NOW(), NOW()
            ) RETURNING id;
        `, {
            replacements: { password: hashedPassword },
            type: Sequelize.QueryTypes.SELECT
        });
        const caregiverId = caregiverUserResult[0].id;

        console.log('✅ Created demo users:');
        console.log(`   - Funder: ID ${funderId}`);
        console.log(`   - Dependent: ID ${dependentId}`);
        console.log(`   - Caregiver: ID ${caregiverId}`);

        // Create Accounts for Users
        const funderAccountId = generateUUID();
        const dependentAccountId = generateUUID();

        // Create Funder Account
        await sequelize.query(`
            INSERT INTO "Accounts" (
                "id", "userId", "accountType", "balance", "accountName", 
                "accountNumber", "currency", "status", "creationDate",
                "createdAt", "updatedAt"
            ) VALUES (
                :funderAccountId, :funderUserId, 'Funder', 5000.00, 'Demo Funder Account',
                :funderAccountNumber, 'ZAR', 'active', NOW(),
                NOW(), NOW()
            );
        `, {
            replacements: {
                funderAccountId,
                funderUserId: funderId,
                funderAccountNumber: generateAccountNumber()
            },
            type: Sequelize.QueryTypes.INSERT
        });

        // Create Dependent Account
        await sequelize.query(`
            INSERT INTO "Accounts" (
                "id", "userId", "accountType", "balance", "accountName", 
                "accountNumber", "currency", "status", "creationDate", "parentAccountId",
                "createdAt", "updatedAt"
            ) VALUES (
                :dependentAccountId, :dependentUserId, 'Dependent', 500.00, 'Demo Dependent Account',
                :dependentAccountNumber, 'ZAR', 'active', NOW(), :parentAccountId,
                NOW(), NOW()
            );
        `, {
            replacements: {
                dependentAccountId,
                dependentUserId: dependentId,
                dependentAccountNumber: generateAccountNumber(),
                parentAccountId: funderAccountId
            },
            type: Sequelize.QueryTypes.INSERT
        });

        console.log('✅ Created demo accounts:');
        console.log(`   - Funder Account: ${funderAccountId} (Balance: R5000)`);
        console.log(`   - Dependent Account: ${dependentAccountId} (Balance: R500)`);

        // Create Funder-Dependent Relationship
        await sequelize.query(`
            INSERT INTO "FunderDependents" (
                "funderId", "dependentId", "status", "createdAt", "updatedAt"
            ) VALUES (
                :funderId, :dependentId, 'active', NOW(), NOW()
            );
        `, {
            replacements: {
                funderId: funderId,
                dependentId: dependentId
            },
            type: Sequelize.QueryTypes.INSERT
        });

        console.log('✅ Created funder-dependent relationship');

        // Create some sample transactions
        const transactions = [
            {
                accountId: dependentAccountId,
                amount: 100.00,
                type: 'deposit',
                description: 'Weekly allowance from parent',
                category: 'Transfer'
            },
            {
                accountId: dependentAccountId,
                amount: -25.50,
                type: 'purchase',
                description: 'School lunch',
                category: 'Education'
            },
            {
                accountId: dependentAccountId,
                amount: -15.00,
                type: 'purchase',
                description: 'Bus fare',
                category: 'Transport'
            }
        ];

        for (const tx of transactions) {
            await sequelize.query(`
                INSERT INTO "Transactions" (
                    "accountId", "amount", "type", "description", "category",
                    "createdAt", "updatedAt"
                ) VALUES (
                    :accountId, :amount, :type, :description, :category,
                    NOW(), NOW()
                );
            `, {
                replacements: tx,
                type: Sequelize.QueryTypes.INSERT
            });
        }

        console.log('✅ Created sample transactions');

        console.log('\n🎉 Demo users created successfully!');
        console.log('\n📋 Demo User Credentials:');
        console.log('========================================');
        console.log('🔹 Funder:');
        console.log('   Email: funder@demo.com');
        console.log('   Password: demo123');
        console.log('   Role: funder');
        console.log('   Balance: R5000');
        console.log('');
        console.log('🔹 Dependent:');
        console.log('   Email: dependent@demo.com');
        console.log('   Password: demo123');
        console.log('   Role: dependent');
        console.log('   Balance: R500');
        console.log('   Parent: Funder Account');
        console.log('');
        console.log('🔹 Caregiver:');
        console.log('   Email: caregiver@demo.com');
        console.log('   Password: demo123');
        console.log('   Role: caregiver');
        console.log('========================================');

    } catch (error) {
        console.error('❌ Error creating demo users:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Run the script
if (require.main === module) {
    createDemoUsers()
        .then(() => {
            console.log('✅ Demo user creation completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Demo user creation failed:', error);
            process.exit(1);
        });
}

module.exports = createDemoUsers;
