const sequelize = require('./config/database');

async function markMigrationsComplete() {
  try {
    // List of migrations that should be marked as complete 
    // because the database already has the required structure
    const migrations = [
      '20250702230416-add-stripeCustomerId-to-user.js',
      '20250703000001-create-bank-accounts.js',
      '20250709000001-create-payment-cards.js', 
      '20250709000002-enhance-transactions.js',
      '20250805123718-add-reset-token-fields-to-users.js'
    ];

    for (const migration of migrations) {
      try {
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
          {
            replacements: [migration],
            type: sequelize.QueryTypes.INSERT
          }
        );
        console.log('✅ Marked as complete:', migration);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log('ℹ️  Already marked as complete:', migration);
        } else {
          console.error('❌ Error marking migration:', migration, error.message);
        }
      }
    }

    console.log('\n🎉 Production migration state updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating migration state:', error);
    process.exit(1);
  }
}

markMigrationsComplete();
