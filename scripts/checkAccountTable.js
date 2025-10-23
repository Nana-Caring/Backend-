const sequelize = require('../config/database');

async function checkAccountTable() {
  try {
    const desc = await sequelize.getQueryInterface().describeTable('Accounts');
    console.log('Account table columns:');
    Object.keys(desc).forEach(col => {
      console.log(`- ${col}: ${desc[col].type}`);
    });
    
    // Also show a sample account if any exist
    const sampleAcc = await sequelize.query('SELECT * FROM "Accounts" LIMIT 1', {
      type: sequelize.QueryTypes.SELECT
    });
    
    if (sampleAcc.length > 0) {
      console.log('\nSample account:');
      console.log(JSON.stringify(sampleAcc[0], null, 2));
    } else {
      console.log('\nNo accounts found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAccountTable();
