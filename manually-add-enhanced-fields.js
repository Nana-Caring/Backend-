const { sequelize } = require('./models');

async function manuallyAddEnhancedFields() {
    try {
        console.log('🔧 Manually adding enhanced transaction fields...');

        // Add the fields one by one with error handling
        const fieldsToAdd = [
            {
                name: 'senderName',
                sql: 'ALTER TABLE "Transactions" ADD COLUMN "senderName" VARCHAR(255);'
            },
            {
                name: 'senderAccountNumber',
                sql: 'ALTER TABLE "Transactions" ADD COLUMN "senderAccountNumber" VARCHAR(255);'
            },
            {
                name: 'recipientName',
                sql: 'ALTER TABLE "Transactions" ADD COLUMN "recipientName" VARCHAR(255);'
            },
            {
                name: 'recipientAccountNumber',
                sql: 'ALTER TABLE "Transactions" ADD COLUMN "recipientAccountNumber" VARCHAR(255);'
            },
            {
                name: 'merchantName',
                sql: 'ALTER TABLE "Transactions" ADD COLUMN "merchantName" VARCHAR(255);'
            }
        ];

        for (const field of fieldsToAdd) {
            try {
                await sequelize.query(field.sql);
                console.log(`✅ Added ${field.name}`);
            } catch (error) {
                if (error.original && error.original.code === '42701') {
                    console.log(`⚠️  ${field.name} already exists`);
                } else {
                    console.log(`❌ Error adding ${field.name}:`, error.message);
                }
            }
        }

        // Add the enum field separately
        try {
            await sequelize.query(`
                CREATE TYPE transaction_category_enum AS ENUM (
                    'fund_transfer', 
                    'purchase', 
                    'allowance', 
                    'emergency_fund',
                    'smart_distribution', 
                    'manual_transfer', 
                    'refund', 
                    'fee',
                    'deposit',
                    'withdrawal'
                );
            `);
            console.log('✅ Created transaction category enum');
        } catch (error) {
            if (error.original && error.original.code === '42710') {
                console.log('⚠️  Transaction category enum already exists');
            } else {
                console.log('❌ Error creating enum:', error.message);
            }
        }

        try {
            await sequelize.query('ALTER TABLE "Transactions" ADD COLUMN "transactionCategory" transaction_category_enum;');
            console.log('✅ Added transactionCategory');
        } catch (error) {
            if (error.original && error.original.code === '42701') {
                console.log('⚠️  transactionCategory already exists');
            } else {
                console.log('❌ Error adding transactionCategory:', error.message);
            }
        }

        // Verify the fields were added
        console.log('\n🔍 Verifying enhanced fields...');
        const [results] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Transactions' 
            ORDER BY ordinal_position;
        `);
        
        const enhancedFields = ['senderName', 'recipientName', 'senderAccountNumber', 'recipientAccountNumber', 'transactionCategory', 'merchantName'];
        const existingColumns = results.map(r => r.column_name);
        
        console.log('Enhanced field verification:');
        let allFieldsExist = true;
        enhancedFields.forEach(field => {
            const exists = existingColumns.includes(field);
            console.log(`- ${field}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
            if (!exists) allFieldsExist = false;
        });

        if (allFieldsExist) {
            console.log('\n🎉 All enhanced fields successfully added!');
        } else {
            console.log('\n❌ Some fields are still missing');
        }

    } catch (error) {
        console.error('❌ Error in manual field addition:', error);
    }
}

manuallyAddEnhancedFields();