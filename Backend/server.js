require('dotenv').config(); // Loads environment variables from .env
const cookieParser = require('cookie-parser'); // For parsing cookies

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./models');
const stripeRoutes = require('./routes/stripeRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin');
const funderRoutes = require('./routes/funderRoutes');

const app = express();

// WARNING: Only use in development, not in production!
(async () => {
  try {
    await db.sequelize.sync({ alter: true });
    console.log('Database synced with models');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/funder', funderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
