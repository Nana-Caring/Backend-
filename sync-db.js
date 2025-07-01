const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully!');
    
    // Check Users table schema
    const usersSchema = await sequelize.getQueryInterface().describeTable('Users');
    console.log('Users table columns:');
    Object.keys(usersSchema).forEach(column => {
      console.log(`- ${column}: ${usersSchema[column].type}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Sync error:', error);
    process.exit(1);
  }
}

syncDatabase();
