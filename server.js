const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const stripeRoutes = require('./routes/stripeRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stripe', stripeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
