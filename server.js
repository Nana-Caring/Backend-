// Load environment variables from single .env file
require('dotenv').config();
const cookieParser = require('cookie-parser');

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
const directDepositRoutes = require('./routes/bankAccountRoutes');
const transactionRoutes = require('./routes/transactions');
const funderDepositRoutes = require('./routes/funderDepositRoutes');
const funderTransferRoutes = require('./routes/funderTransferRoutes');
const pregnancyRoutes = require('./routes/pregnancy');
const notificationRoutes = require('./routes/notifications');

const app = express();

console.log('✅ Using migrations for database schema management');

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || '').split(',').map(url => url.trim())
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/assets', express.static('assets'));
app.use('/uploads', express.static('uploads'));

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
app.use('/api/portal', portalRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/category-orders', categoryOrderRoutes);
app.use('/api/category-accounts', categoryAccountRoutes);
app.use('/api/direct-deposits', directDepositRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/funder/deposit', funderDepositRoutes);
app.use('/api/funder/transfer', funderTransferRoutes);
app.use('/api/pregnancy', pregnancyRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } else {
    res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Nana Caring Backend is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    features: {
      orderSystem: 'Enhanced with store codes',
      transactionTracking: 'Complete history and analytics',
      paymentProcessing: 'Stripe integration ready',
      userManagement: 'Multi-role system active',
      notifications: 'Email and push notifications enabled'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
    console.log('📄 Environment: ' + (process.env.NODE_ENV || 'development'));
    console.log('🔗 Health check: http://localhost:' + PORT + '/health');
    console.log('📧 Notifications enabled');
});
