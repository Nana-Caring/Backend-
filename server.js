require('dotenv').config(); // Loads environment variables from .env
const cookieParser = require('cookie-parser'); // For parsing cookies

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./models');
const stripeRoutes = require('./routes/stripeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/admin');
const funderRoutes = require('./routes/funderRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');
const statsRoutes = require('./routes/statsRoutes');
const accountRoutes = require('./routes/accountRoutes');
const paymentCardRoutes = require('./routes/paymentCardRoutes');
const transferRoutes = require('./routes/transferRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const categoryOrderRoutes = require('./routes/categoryOrders');
const categoryAccountRoutes = require('./routes/categoryAccounts');


const app = express();

// Database is managed through migrations, no need to sync in production
console.log('✅ Using migrations for database schema management');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve static files from assets folder (for logo in emails)
app.use('/assets', express.static('assets'));

// Serve static files from uploads folder (for product images)
app.use('/uploads', express.static('uploads'));

// Routes
const portalRoutes = require('./routes/portal');
app.use('/api/stripe', stripeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api/funder', funderRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/payment-cards', paymentCardRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/users', userRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/category-orders', categoryOrderRoutes);
app.use('/api/category-accounts', categoryAccountRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
