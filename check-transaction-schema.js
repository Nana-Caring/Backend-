const { sequelize } = require('./models');

async function checkTransactionSchema() {
    try {
        const [results] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Transactions' 
            ORDER BY ordinal_position;
        `);
        
        console.log('Transaction table columns:');
        results.forEach(r => console.log('- ' + r.column_name));
        
        // Check if enhanced fields exist
        const enhancedFields = ['senderName', 'recipientName', 'senderAccountNumber', 'recipientAccountNumber', 'transactionCategory', 'merchantName'];
        const existingColumns = results.map(r => r.column_name);
        
        console.log('\nEnhanced field status:');
        enhancedFields.forEach(field => {
            const exists = existingColumns.includes(field);
            console.log(`- ${field}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkTransactionSchema();