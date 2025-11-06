const db = require('./models');

async function checkSchema() {
    try {
        const columns = await db.sequelize.query(
            "SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;",
            { type: db.sequelize.QueryTypes.SELECT }
        );
        
        console.log('📋 Products table schema:');
        columns.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
}

checkSchema();