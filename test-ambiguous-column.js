const { User, Account, Transaction } = require('./models');
const { Op, Sequelize } = require('sequelize');

async function findAmbiguousColumnError() {
    console.log('🔍 Looking for ambiguous column errors...\n');

    try {
        // Test various queries that might cause ambiguous column errors
        console.log('1. Testing User + Account join with status...');
        
        const result1 = await User.findAll({
            where: { role: 'dependent' },
            include: [
                {
                    model: Account,
                    as: 'accounts',
                    where: { caregiverId: 1 }, // Use a test caregiver ID
                    required: false
                }
            ],
            attributes: [
                'id', 
                'firstName', 
                'surname',
                'status', // This could be ambiguous
                [Sequelize.fn('COUNT', Sequelize.col('accounts.id')), 'accountCount']
            ],
            group: ['User.id', 'User.status'], // This might cause the issue
            raw: true
        });
        
        console.log('✅ Query 1 succeeded');

    } catch (error) {
        console.log('❌ Query 1 failed:', error.message);
        if (error.message.includes('ambiguous')) {
            console.log('🎯 Found ambiguous column error!');
            console.log('Error details:', error.message);
        }
    }

    try {
        console.log('\n2. Testing aggregation query...');
        
        const result2 = await User.findAll({
            where: { role: 'dependent' },
            include: [
                {
                    model: Account,
                    as: 'accounts',
                    where: { caregiverId: 1 },
                    required: true
                }
            ],
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('User.id')), 'count']
            ],
            group: ['status'], // This is likely the issue - which status?
            raw: true
        });
        
        console.log('✅ Query 2 succeeded');

    } catch (error) {
        console.log('❌ Query 2 failed:', error.message);
        if (error.message.includes('ambiguous')) {
            console.log('🎯 Found ambiguous column error in aggregation!');
            console.log('Error details:', error.message);
            
            console.log('\n🔧 Suggested fix: Qualify the column names');
            console.log('Change: group: [\'status\']');
            console.log('To: group: [\'User.status\'] or group: [Sequelize.col(\'User.status\')]');
        }
    }

    try {
        console.log('\n3. Testing fixed query...');
        
        const result3 = await User.findAll({
            where: { role: 'dependent' },
            include: [
                {
                    model: Account,
                    as: 'accounts',
                    where: { caregiverId: 1 },
                    required: true
                }
            ],
            attributes: [
                [Sequelize.col('User.status'), 'userStatus'],
                [Sequelize.fn('COUNT', Sequelize.col('User.id')), 'count']
            ],
            group: [Sequelize.col('User.status')], // Properly qualified
            raw: true
        });
        
        console.log('✅ Query 3 (fixed) succeeded');

    } catch (error) {
        console.log('❌ Query 3 failed:', error.message);
    }

    console.log('\n📊 Testing complete');
}

// Run the test
if (require.main === module) {
    findAmbiguousColumnError()
        .then(() => {
            console.log('\n✅ Ambiguous column test completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { findAmbiguousColumnError };
