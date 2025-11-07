const { Pool } = require('pg');

async function updateEmmaAccountId() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('Updating Emma account ID from UUID to integer...');

    const oldId = '2fa479e0-953c-4b55-9137-fe418d9c5fb3';
    const newId = 101;

    // Check if the old UUID exists in Accounts
    const accountCheck = await pool.query(
      'SELECT * FROM "Accounts" WHERE id = $1',
      [oldId]
    );
    
    if (accountCheck.rows.length > 0) {
      console.log(`Found account with UUID ${oldId}, updating to integer ${newId}...`);
      
      // Update Transactions
      const transactionsResult = await pool.query(
        'UPDATE "Transactions" SET "accountId" = $1 WHERE "accountId"::text = $2',
        [newId, oldId]
      );
      console.log(`✅ Updated ${transactionsResult.rowCount} transactions`);

      // Update Users
      const usersResult = await pool.query(
        'UPDATE "Users" SET "accountId" = $1 WHERE "accountId"::text = $2',
        [newId, oldId]
      );
      console.log(`✅ Updated ${usersResult.rowCount} users`);

      // Update the account itself
      const accountResult = await pool.query(
        'UPDATE "Accounts" SET id = $1 WHERE id = $2',
        [newId, oldId]
      );
      console.log(`✅ Updated ${accountResult.rowCount} account records`);
      
    } else {
      console.log(`ℹ️  No account found with UUID ${oldId}, skipping update`);
    }

    console.log('✅ Emma account ID update completed!');
    
  } catch (error) {
    console.error('❌ Error updating Emma account ID:', error.message);
  } finally {
    await pool.end();
  }
}

updateEmmaAccountId();