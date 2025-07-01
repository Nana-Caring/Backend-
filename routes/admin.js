const express = require('express');
const router = express.Router();
const { User, Account, Transaction } = require('../models');
const authenticate = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const { 
  blockUser, 
  unblockUser, 
  suspendUser, 
  getBlockedUsers 
} = require('../controllers/userController');

// Get all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
});

// Get all accounts
router.get('/accounts', authenticate, isAdmin, async (req, res) => {
  const accounts = await Account.findAll();
  res.json(accounts);
});

// Get all transactions
router.get('/transactions', authenticate, isAdmin, async (req, res) => {
  const transactions = await Transaction.findAll();
  res.json(transactions);
});

// Delete a user
router.delete('/users/:id', authenticate, isAdmin, async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

// Delete an account
router.delete('/accounts/:id', authenticate, isAdmin, async (req, res) => {
  await Account.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Account deleted' });
});

// Delete a transaction
router.delete('/transactions/:id', authenticate, isAdmin, async (req, res) => {
  await Transaction.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Transaction deleted' });
});

// Example: Get statistics
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  const userCount = await User.count();
  const accountCount = await Account.count();
  const transactionCount = await Transaction.count();
  res.json({ users: userCount, accounts: accountCount, transactions: transactionCount });
});

// User blocking routes
router.put('/users/:userId/block', authenticate, isAdmin, blockUser);
router.put('/users/:userId/unblock', authenticate, isAdmin, unblockUser);
router.put('/users/:userId/suspend', authenticate, isAdmin, suspendUser);
router.get('/blocked-users', authenticate, isAdmin, getBlockedUsers);

module.exports = router;