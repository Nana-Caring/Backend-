const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./models');
const stripeRoutes = require('./routes/stripeRoutes');
const authRoutes = require('./routes/authRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const addNewBeneficiaryRoutes = require('./routes/addNewBeneficiaryRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/add-beneficiary', addNewBeneficiaryRoutes);


const PORT = process.env.PORT || 5432;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
