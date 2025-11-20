// Load environment variables from single .env file// Load environment variables from single .env file

require('dotenv').config();require('dotenv').config();

const cookieParser = require('cookie-parser'); // For parsing cookiesconst cookieParser = require('cookie-parser'); // For parsing cookies



const express = require('express');const express = require('express');

const cors = require('cors');const cors = require('cors');

const helmet = require('helmet');const helmet = require('helmet');



const db = require('./models');const db = require('./models');

const stripeRoutes = require('./routes/stripeRoutes');const stripeRoutes = require('./routes/stripeRoutes');

const authRoutes = require('./routes/authRoutes');const authRoutes = require('./routes/authRoutes');

const userRoutes = require('./routes/userRoutes');const userRoutes = require('./routes/userRoutes');

const adminRoutes = require('./routes/admin');const adminRoutes = require('./routes/admin');

const funderRoutes = require('./routes/funderRoutes');const funderRoutes = require('./routes/funderRoutes');

const caregiverRoutes = require('./routes/caregiverRoutes');const caregiverRoutes = require('./routes/caregiverRoutes');

const statsRoutes = require('./routes/statsRoutes');const statsRoutes = require('./routes/statsRoutes');

const accountRoutes = require('./routes/accountRoutes');const accountRoutes = require('./routes/accountRoutes');

const paymentCardRoutes = require('./routes/paymentCardRoutes');const paymentCardRoutes = require('./routes/paymentCardRoutes');

const transferRoutes = require('./routes/transferRoutes');const transferRoutes = require('./routes/transferRoutes');

const productRoutes = require('./routes/productRoutes');const productRoutes = require('./routes/productRoutes');

const cartRoutes = require('./routes/cart');const cartRoutes = require('./routes/cart');

const orderRoutes = require('./routes/orders');const orderRoutes = require('./routes/orders');

const categoryOrderRoutes = require('./routes/categoryOrders');const categoryOrderRoutes = require('./routes/categoryOrders');

const categoryAccountRoutes = require('./routes/categoryAccounts');const categoryAccountRoutes = require('./routes/categoryAccounts');

const directDepositRoutes = require('./routes/bankAccountRoutes');const directDepositRoutes = require('./routes/bankAccountRoutes');

const transactionRoutes = require('./routes/transactions');const transactionRoutes = require('./routes/transactions');

const funderDepositRoutes = require('./routes/funderDepositRoutes');const funderDepositRoutes = require('./routes/funderDepositRoutes');

const funderTransferRoutes = require('./routes/funderTransferRoutes');const funderTransferRoutes = require('./routes/funderTransferRoutes');

const pregnancyRoutes = require('./routes/pregnancy');const pregnancyRoutes = require('./routes/pregnancy');

const notificationRoutes = require('./routes/notifications');const notificationRoutes = require('./routes/notifications');





const app = express();const app = express();



// Database is managed through migrations, no need to sync in production// Database is managed through migrations, no need to sync in production

console.log('✅ Using migrations for database schema management');console.log('✅ Using migrations for database schema management');



// Middleware// Middleware

app.use(helmet({app.use(helmet({

  contentSecurityPolicy: process.env.NODE_ENV === 'production',  contentSecurityPolicy: process.env.NODE_ENV === 'production',

  crossOriginEmbedderPolicy: false  crossOriginEmbedderPolicy: false

}));}));



const corsOptions = {const corsOptions = {

  origin: process.env.NODE_ENV === 'production'  origin: process.env.NODE_ENV === 'production' 

    ? (process.env.CORS_ORIGIN || '').split(',').map(url => url.trim())    ? (process.env.CORS_ORIGIN || '').split(',').map(url => url.trim())

    : true,    : true,

  credentials: true,  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']

};};

app.use(cors(corsOptions));app.use(cors(corsOptions));



app.use(express.json({ limit: '10mb' }));app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());app.use(cookieParser());



// Serve static files from assets folder (for logo in emails)// Serve static files from assets folder (for logo in emails)

app.use('/assets', express.static('assets'));app.use('/assets', express.static('assets'));



// Serve static files from uploads folder (for product images)// Serve static files from uploads folder (for product images)

app.use('/uploads', express.static('uploads'));app.use('/uploads', express.static('uploads'));



// Routes// Routes

const portalRoutes = require('./routes/portal');const portalRoutes = require('./routes/portal');

app.use('/api/stripe', stripeRoutes);app.use('/api/stripe', stripeRoutes);

app.use('/api/auth', authRoutes);app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);app.use('/api/users', userRoutes);

app.use('/admin', adminRoutes);app.use('/admin', adminRoutes);

app.use('/api/funder', funderRoutes);app.use('/api/funder', funderRoutes);

app.use('/api/caregiver', caregiverRoutes);app.use('/api/caregiver', caregiverRoutes);

app.use('/api/stats', statsRoutes);app.use('/api/stats', statsRoutes);

app.use('/api/accounts', accountRoutes);app.use('/api/accounts', accountRoutes);

app.use('/api/payment-cards', paymentCardRoutes);app.use('/api/payment-cards', paymentCardRoutes);

app.use('/api/transfers', transferRoutes);app.use('/api/transfers', transferRoutes);

app.use('/api/users', userRoutes);app.use('/api/users', userRoutes);

app.use('/api/portal', portalRoutes);app.use('/api/portal', portalRoutes);

app.use('/api/products', productRoutes);app.use('/api/products', productRoutes);

app.use('/api/cart', cartRoutes);app.use('/api/cart', cartRoutes);

app.use('/api/orders', orderRoutes);app.use('/api/orders', orderRoutes);

app.use('/api/category-orders', categoryOrderRoutes);app.use('/api/category-orders', categoryOrderRoutes);

app.use('/api/category-accounts', categoryAccountRoutes);app.use('/api/category-accounts', categoryAccountRoutes);

app.use('/api/direct-deposits', directDepositRoutes);app.use('/api/direct-deposits', directDepositRoutes);

app.use('/api/transactions', transactionRoutes);app.use('/api/transactions', transactionRoutes);

app.use('/api/funder/deposit', funderDepositRoutes);app.use('/api/funder/deposit', funderDepositRoutes);

app.use('/api/funder/transfer', funderTransferRoutes);app.use('/api/funder/transfer', funderTransferRoutes);

app.use('/api/pregnancy', pregnancyRoutes);app.use('/api/pregnancy', pregnancyRoutes);

app.use('/api/notifications', notificationRoutes);app.use('/api/notifications', notificationRoutes);



// Error handling middleware// Error handling middleware

app.use((err, req, res, next) => {app.use((err, req, res, next) => {

  console.error('Error:', err);  console.error('Error:', err);

  

  if (process.env.NODE_ENV === 'production') {  if (process.env.NODE_ENV === 'production') {

    res.status(500).json({    res.status(500).json({

      success: false,      success: false,

      message: 'Internal server error'      message: 'Internal server error'

    });    });

  } else {  } else {

    res.status(500).json({    res.status(500).json({

      success: false,      success: false,

      message: err.message,      message: err.message,

      stack: err.stack      stack: err.stack

    });    });

  }  }

});});



// Health check endpoint// Health check endpoint

app.get('/health', (req, res) => {app.get('/health', (req, res) => {

  res.json({  res.json({

    success: true,    success: true,

    message: 'Nana Caring Backend is healthy',    message: 'Nana Caring Backend is healthy',

    timestamp: new Date().toISOString(),    timestamp: new Date().toISOString(),

    environment: process.env.NODE_ENV || 'development',    environment: process.env.NODE_ENV || 'development',

    version: '1.0.0',    version: '1.0.0',

    features: {    features: {

      orderSystem: 'Enhanced with store codes',      orderSystem: 'Enhanced with store codes',

      transactionTracking: 'Complete history and analytics',      transactionTracking: 'Complete history and analytics',

      paymentProcessing: 'Stripe integration ready',      paymentProcessing: 'Stripe integration ready',

      userManagement: 'Multi-role system active',      userManagement: 'Multi-role system active'

      notifications: 'Email and push notifications enabled'    }

    }  });

  });});

});

const PORT = process.env.PORT || 5000;

const PORT = process.env.PORT || 5000;app.listen(PORT, () => {

app.listen(PORT, () => {    console.log(`🚀 Server running on port ${PORT}`);

    console.log(`🚀 Server running on port ${PORT}`);    console.log(`📄 Environment: ${process.env.NODE_ENV || 'development'}`);

    console.log(`📄 Environment: ${process.env.NODE_ENV || 'development'}`);    console.log(`🔗 Health check: http://localhost:${PORT}/health`);

    console.log(`🔗 Health check: http://localhost:${PORT}/health`);});

    console.log(`📧 Notifications: Email=${process.env.EMAIL_NOTIFICATIONS_ENABLED || 'true'}, Push=${process.env.PUSH_NOTIFICATIONS_ENABLED || 'true'}`);
});