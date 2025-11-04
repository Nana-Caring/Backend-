const express = require('express');
const router = express.Router();
const { User, Account, Transaction, FunderDependent } = require('../models');
const authenticate = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const { check } = require('express-validator');
const {
  getAllTransactions,
  getTransactionById,
  createManualTransaction,
  updateTransaction,
  reverseTransaction,
  deleteTransaction,
  getTransactionStats,
  bulkOperations
} = require('../controllers/portalController');
const {
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getUserStats,
  checkExpiredSuspensions,
  adminRegisterFunder,
  adminRegisterCaregiver
} = require('../controllers/adminTransactionController');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductStats,
  getProductsForDependent,
  validateProductAccess
} = require('../controllers/productController');

// ========================================
// USER MANAGEMENT ROUTES
// ========================================

// Get all users with filtering
router.get('/users', authenticate, isAdmin, getAllUsers);

// Get user statistics
router.get('/users/stats', authenticate, isAdmin, getUserStats);

// Check and process expired suspensions
router.post('/users/check-expired-suspensions', authenticate, isAdmin, checkExpiredSuspensions);

// Admin register funder
router.post('/users/register-funder', authenticate, isAdmin, [
  check('firstName', 'First name is required').not().isEmpty(),
  check('surname', 'Surname is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('Idnumber', 'Valid 13-digit numeric ID number required').isLength({ min: 13, max: 13 }).isNumeric(),
], adminRegisterFunder);

// Admin register caregiver
router.post('/users/register-caregiver', authenticate, isAdmin, [
  check('firstName', 'First name is required').not().isEmpty(),
  check('surname', 'Surname is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('Idnumber', 'Valid 13-digit numeric ID number required').isLength({ min: 13, max: 13 }).isNumeric(),
], adminRegisterCaregiver);

// Get specific user by ID
router.get('/users/:id', authenticate, isAdmin, getUserById);

// Block user
router.put('/users/:id/block', authenticate, isAdmin, blockUser);

// Unblock user
router.put('/users/:id/unblock', authenticate, isAdmin, unblockUser);

// Suspend user
router.put('/users/:id/suspend', authenticate, isAdmin, suspendUser);

// Unsuspend user (lift suspension)
router.put('/users/:id/unsuspend', authenticate, isAdmin, unsuspendUser);

// Delete user permanently
router.delete('/users/:id', authenticate, isAdmin, deleteUser);

// Get all accounts
router.get('/accounts', authenticate, isAdmin, async (req, res) => {
  const accounts = await Account.findAll();
  res.json(accounts);
});

// ========================================
// TRANSACTION MANAGEMENT ROUTES
// ========================================

// Get all transactions with advanced filtering
router.get('/transactions', authenticate, isAdmin, getAllTransactions);

// Get transaction statistics
router.get('/transactions/stats', authenticate, isAdmin, getTransactionStats);

// Get specific transaction by ID
router.get('/transactions/:id', authenticate, isAdmin, getTransactionById);

// Create manual transaction (admin only)
router.post('/transactions', authenticate, isAdmin, createManualTransaction);

// Update transaction (limited fields for safety)
router.put('/transactions/:id', authenticate, isAdmin, updateTransaction);

// Reverse/void a transaction
router.post('/transactions/:id/reverse', authenticate, isAdmin, reverseTransaction);

// Delete transaction (hard delete with confirmation)
router.delete('/transactions/:id', authenticate, isAdmin, deleteTransaction);

// Bulk operations on transactions
router.post('/transactions/bulk', authenticate, isAdmin, bulkOperations);

// ========================================
// PRODUCT MANAGEMENT ROUTES
// ========================================

// Get all products with filtering (Admin view - includes inactive products)
router.get('/products', authenticate, isAdmin, getAllProducts);

// Get product statistics
router.get('/products/stats', authenticate, isAdmin, getProductStats);

// Get products by category (for account type management)
router.get('/products/category/:category', authenticate, isAdmin, getProductsByCategory);

// Get specific product by ID
router.get('/products/:id', authenticate, isAdmin, getProductById);

// Create new product
router.post('/products', authenticate, isAdmin, [
  check('name', 'Product name is required').not().isEmpty(),
  check('brand', 'Brand is required').not().isEmpty(),
  check('price', 'Valid price is required').isDecimal({ decimal_digits: '0,2' }),
  check('category', 'Valid category is required').isIn(['Education', 'Healthcare', 'Groceries', 'Entertainment', 'Other', 'Pregnancy']),
  check('sku', 'SKU is required').optional().not().isEmpty(),
  check('image', 'Valid image URL required').optional().isURL(),
  check('stockQuantity', 'Stock quantity must be a number').optional().isInt({ min: 0 }),
  check('minAge', 'Minimum age must be between 0 and 150').optional().isInt({ min: 0, max: 150 }),
  check('maxAge', 'Maximum age must be between 0 and 150').optional().isInt({ min: 0, max: 150 }),
  check('ageCategory', 'Valid age category required').optional().isIn(['Toddler', 'Child', 'Teen', 'Adult', 'Senior', 'All Ages']),
  check('requiresAgeVerification', 'Age verification must be boolean').optional().isBoolean()
], createProduct);

// Update product
router.put('/products/:id', authenticate, isAdmin, [
  check('name', 'Product name is required').optional().not().isEmpty(),
  check('brand', 'Brand is required').optional().not().isEmpty(),
  check('price', 'Valid price is required').optional().isDecimal({ decimal_digits: '0,2' }),
  check('category', 'Valid category is required').optional().isIn(['Education', 'Healthcare', 'Groceries', 'Entertainment', 'Other', 'Pregnancy']),
  check('image', 'Valid image URL required').optional().isURL(),
  check('stockQuantity', 'Stock quantity must be a number').optional().isInt({ min: 0 }),
  check('minAge', 'Minimum age must be between 0 and 150').optional().isInt({ min: 0, max: 150 }),
  check('maxAge', 'Maximum age must be between 0 and 150').optional().isInt({ min: 0, max: 150 }),
  check('ageCategory', 'Valid age category required').optional().isIn(['Toddler', 'Child', 'Teen', 'Adult', 'Senior', 'All Ages']),
  check('requiresAgeVerification', 'Age verification must be boolean').optional().isBoolean()
], updateProduct);

// Delete product (soft delete)
router.delete('/products/:id', authenticate, isAdmin, deleteProduct);

// Age-based product management
// Get age-appropriate products for a specific dependent
router.get('/dependents/:dependentId/products', authenticate, isAdmin, getProductsForDependent);

// Validate if a dependent can access a specific product
router.get('/dependents/:dependentId/products/:productId/validate', authenticate, isAdmin, validateProductAccess);

// ========================================
// LEGACY SIMPLE ROUTES (kept for compatibility)
// ========================================

// Simple get all transactions (legacy)
router.get('/transactions/simple', authenticate, isAdmin, async (req, res) => {
  const transactions = await Transaction.findAll();
  res.json(transactions);
});

// Delete an account
router.delete('/accounts/:id', authenticate, isAdmin, async (req, res) => {
  await Account.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Account deleted' });
});

// Delete a transaction (simple legacy method)
router.delete('/transactions/:id/simple', authenticate, isAdmin, async (req, res) => {
  await Transaction.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Transaction deleted' });
});

// Example: Get statistics (legacy)
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  const userCount = await User.count();
  const accountCount = await Account.count();
  const transactionCount = await Transaction.count();
  res.json({ users: userCount, accounts: accountCount, transactions: transactionCount });
});

// TEMPORARY: Fix caregiver-dependent relationship
router.post('/fix-caregiver-relationship', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('🔧 Fixing caregiver-dependent relationship...');
    
    // Get caregiver and dependent users
    const caregiver = await User.findOne({ where: { email: 'caregiver@demo.com' } });
    const dependent = await User.findOne({ where: { email: 'dependent@demo.com' } });
    
    if (!caregiver || !dependent) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver or dependent not found'
      });
    }
    
    // Update all dependent's accounts to link to caregiver
    const [updatedCount] = await Account.update(
      { caregiverId: caregiver.id },
      { where: { userId: dependent.id } }
    );
    
    console.log(`✅ Updated ${updatedCount} accounts with caregiverId`);
    
    // Verify the update
    const linkedAccounts = await Account.findAll({
      where: { 
        userId: dependent.id,
        caregiverId: caregiver.id
      }
    });
    
    res.json({
      success: true,
      message: 'Caregiver-dependent relationship fixed successfully',
      data: {
        caregiverId: caregiver.id,
        dependentId: dependent.id,
        updatedAccounts: updatedCount,
        linkedAccounts: linkedAccounts.length,
        accountTypes: linkedAccounts.map(acc => acc.accountType)
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix relationship',
      error: error.message
    });
  }
});

// FUNDER-DEPENDENT RELATIONSHIP MANAGEMENT
router.post('/link-funder-dependent', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('🔗 Linking funder with dependent...');
    
    const { funderEmail, dependentEmail } = req.body;
    
    // Default to demo users if no emails provided
    const fEmail = funderEmail || 'funder@demo.com';
    const dEmail = dependentEmail || 'dependent@demo.com';
    
    // Get funder and dependent users
    const funder = await User.findOne({ where: { email: fEmail, role: 'funder' } });
    const dependent = await User.findOne({ where: { email: dEmail, role: 'dependent' } });
    
    if (!funder) {
      return res.status(404).json({
        success: false,
        message: `Funder not found with email: ${fEmail}`
      });
    }
    
    if (!dependent) {
      return res.status(404).json({
        success: false,
        message: `Dependent not found with email: ${dEmail}`
      });
    }
    
    // Check if relationship already exists
    const existingLink = await FunderDependent.findOne({
      where: {
        funderId: funder.id,
        dependentId: dependent.id
      }
    });
    
    if (existingLink) {
      return res.json({
        success: true,
        message: 'Funder-dependent relationship already exists',
        data: {
          linkId: existingLink.id,
          funderId: funder.id,
          funderName: `${funder.firstName} ${funder.surname}`,
          dependentId: dependent.id,
          dependentName: `${dependent.firstName} ${dependent.surname}`,
          alreadyLinked: true
        }
      });
    }
    
    // Create the relationship
    const newLink = await FunderDependent.create({
      funderId: funder.id,
      dependentId: dependent.id
    });
    
    console.log(`✅ Created funder-dependent link: ${funder.id} → ${dependent.id}`);
    
    res.json({
      success: true,
      message: 'Funder-dependent relationship created successfully',
      data: {
        linkId: newLink.id,
        funderId: funder.id,
        funderName: `${funder.firstName} ${funder.surname}`,
        dependentId: dependent.id,
        dependentName: `${dependent.firstName} ${dependent.surname}`,
        createdAt: newLink.createdAt,
        alreadyLinked: false
      }
    });
    
  } catch (error) {
    console.error('❌ Error linking funder-dependent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link funder with dependent',
      error: error.message
    });
  }
});

// GET funder-dependent relationships
router.get('/funder-dependent-links', authenticate, isAdmin, async (req, res) => {
  try {
    const links = await FunderDependent.findAll({
      include: [
        {
          model: User,
          as: 'funder',
          attributes: ['id', 'firstName', 'surname', 'email', 'role']
        },
        {
          model: User,
          as: 'dependent',
          attributes: ['id', 'firstName', 'surname', 'email', 'role']
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Funder-dependent relationships retrieved successfully',
      data: {
        linksCount: links.length,
        links: links.map(link => ({
          id: link.id,
          funder: {
            id: link.funder.id,
            name: `${link.funder.firstName} ${link.funder.surname}`,
            email: link.funder.email
          },
          dependent: {
            id: link.dependent.id,
            name: `${link.dependent.firstName} ${link.dependent.surname}`,
            email: link.dependent.email
          },
          createdAt: link.createdAt
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting funder-dependent links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve funder-dependent relationships',
      error: error.message
    });
  }
});

module.exports = router;