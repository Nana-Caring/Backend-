const express = require('express');
const router = express.Router();
const { User, Account, Transaction } = require('../models');
const authenticate = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
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
  checkExpiredSuspensions
} = require('../controllers/adminTransactionController');

// ========================================
// USER MANAGEMENT ROUTES
// ========================================

// Get all users with filtering
router.get('/users', authenticate, isAdmin, getAllUsers);

// Get user statistics
router.get('/users/stats', authenticate, isAdmin, getUserStats);

// Check and process expired suspensions
router.post('/users/check-expired-suspensions', authenticate, isAdmin, checkExpiredSuspensions);

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

module.exports = router;