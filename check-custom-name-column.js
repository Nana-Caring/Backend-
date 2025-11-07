const { Sequelize } = require('sequelize');

// Use production database config
const sequelize = new Sequelize({
  username: "nana_caring_ts9m_user",
  password: "hJVRlGcNxewOc0PdKIWtyI7ou1zjXOoy",
  database: "nana_caring_ts9m",
  host: "dpg-d04muamuk2gs73drrong-a.oregon-postgres.render.com",
  port: 5432,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function checkCustomNameColumn() {
  try {
    console.log('🔍 Checking if customName column exists...');
    
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'FunderDependents' 
      AND column_name = 'customName'
    `);
    
    if (results.length > 0) {
      console.log('✅ customName column already exists!');
      console.log('Your custom name functionality should work without migration.');
    } else {
      console.log('❌ customName column does not exist.');
      console.log('You need to run the manual SQL to add it.');
    }
    
    // Also check table structure
    const [structure] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'FunderDependents' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Current FunderDependents table structure:');
    structure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkCustomNameColumn();