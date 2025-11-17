const db = require('./models');
const sequelize = db.sequelize;

async function addCustomNameColumn() {
  try {
    console.log('🔧 Adding customName column to FunderDependents table...');
    
    // First check if column already exists
    const [existingColumn] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'FunderDependents' 
      AND column_name = 'customName';
    `);

    if (existingColumn.length > 0) {
      console.log('✅ customName column already exists!');
      return;
    }

    // Add the customName column
    await sequelize.query(`
      ALTER TABLE "FunderDependents" 
      ADD COLUMN "customName" VARCHAR(100);
    `);

    console.log('✅ SUCCESS: customName column added successfully!');

    // Verify the column was added
    const [verification] = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'FunderDependents' 
      AND column_name = 'customName';
    `);

    if (verification.length > 0) {
      console.log('✅ VERIFIED: Column details:', verification[0]);
      console.log('\n🚀 You can now test the custom name functionality with Postman!');
      
      // Show updated table structure
      console.log('\n📋 Updated FunderDependents table structure:');
      const [allColumns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'FunderDependents' 
        ORDER BY ordinal_position;
      `);
      
      allColumns.forEach(col => {
        const status = col.column_name === 'customName' ? ' ← NEW!' : '';
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}${status}`);
      });

    } else {
      console.log('❌ ERROR: Could not verify column was added');
    }

  } catch (error) {
    console.error('❌ Error adding column:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('✅ Column already exists - you can proceed with testing!');
    } else {
      console.log('\n🔧 You may need to add the column manually via pgAdmin:');
      console.log('ALTER TABLE "FunderDependents" ADD COLUMN "customName" VARCHAR(100);');
    }
  } finally {
    await sequelize.close();
  }
}

addCustomNameColumn();