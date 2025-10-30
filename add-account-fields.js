const { Pool } = require('pg');

async function addAccountFields() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Nana Caring',
    user: 'postgres',
    password: 'Prince@082',
  });

  try {
    console.log('Adding account fields...');

    // Check and add category column
    const categoryCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Accounts' AND column_name = 'category'
    `);
    
    if (categoryCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE "Accounts" 
        ADD COLUMN "category" VARCHAR(50) 
        COMMENT 'Account category for budget allocation'
      `);
      console.log('✅ Added category column');
    } else {
      console.log('ℹ️  Category column already exists');
    }

    // Check and add isMainAccount column
    const mainAccountCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Accounts' AND column_name = 'isMainAccount'
    `);
    
    if (mainAccountCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE "Accounts" 
        ADD COLUMN "isMainAccount" BOOLEAN DEFAULT false 
        COMMENT 'Whether this is the main account for the user'
      `);
      console.log('✅ Added isMainAccount column');
    } else {
      console.log('ℹ️  isMainAccount column already exists');
    }

    console.log('✅ Account fields update completed!');
    
  } catch (error) {
    console.error('❌ Error adding account fields:', error.message);
  } finally {
    await pool.end();
  }
}

addAccountFields();