const { Sequelize } = require('sequelize');
require('dotenv').config();


//Explicitly sets PostgreSQL as the dialect

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

sequelize.authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch(err => console.error("❌ Database connection error:", err));

module.exports = sequelize;
