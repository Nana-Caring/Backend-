const sequelize = require('../config/database');

async function checkTransactionTable() {
  try {
    const desc = await sequelize.getQueryInterface().describeTable('Transactions');
    console.log('Transaction table columns:');
    Object.keys(desc).forEach(col => {
      console.log(`- ${col}: ${desc[col].type}`);
    });
    
    // Also show a sample transaction if any exist
    const sampleTxn = await sequelize.query('SELECT * FROM "Transactions" LIMIT 1', {
      type: sequelize.QueryTypes.SELECT
    });
    
    if (sampleTxn.length > 0) {
      console.log('\nSample transaction:');
      console.log(JSON.stringify(sampleTxn[0], null, 2));
    } else {
      console.log('\nNo transactions found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTransactionTable();
