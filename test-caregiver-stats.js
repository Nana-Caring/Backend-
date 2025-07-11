const { User, Account } = require('./models');

async function testCaregiverStats() {
    console.log('🧪 Testing Caregiver Stats Logic...\n');

    try {
        // Find a caregiver
        const caregiver = await User.findOne({
            where: { role: 'caregiver' }
        });

        if (!caregiver) {
            console.log('❌ No caregiver found for testing');
            return;
        }

        console.log(`👩‍⚕️ Testing with caregiver: ${caregiver.firstName} ${caregiver.surname}`);

        // Test the problematic query - simulate what getCaregiverStats does
        console.log('📊 Testing dependent count queries...');

        // Get total dependents count
        const totalDependents = await User.count({
            where: { role: 'dependent' },
            include: [
                {
                    model: Account,
                    as: 'accounts',
                    where: { caregiverId: caregiver.id },
                    required: true
                }
            ]
        });

        console.log(`Total dependents: ${totalDependents}`);

        // Test specific status counts
        const activeDependents = await User.count({
            where: { 
                role: 'dependent', 
                '$User.status$': 'active'  // Explicitly qualify the status column
            },
            include: [
                {
                    model: Account,
                    as: 'accounts',
                    where: { caregiverId: caregiver.id },
                    required: true
                }
            ]
        });

        console.log(`Active dependents: ${activeDependents}`);

        console.log('✅ All queries executed successfully');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error details:', error.message);
    }
}

// Run the test
if (require.main === module) {
    testCaregiverStats()
        .then(() => {
            console.log('\n✅ Caregiver stats test completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Caregiver stats test failed:', error);
            process.exit(1);
        });
}

module.exports = { testCaregiverStats };
