const { Transaction, Account, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Simple transaction history for the user
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      type
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Get user's accounts first
    const userAccounts = await Account.findAll({
      where: { userId },
      attributes: ['id', 'accountName', 'category', 'isMainAccount']
    });
    
    if (userAccounts.length === 0) {
      return res.json({
        success: true,
        data: {
          transactions: [],
          accounts: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalTransactions: 0,
            hasMore: false
          }
        }
      });
    }

    const accountIds = userAccounts.map(acc => acc.id);
    
    // Build where clause for transactions
    const whereClause = {
      accountId: { [Op.in]: accountIds }
    };

    if (type) {
      whereClause.type = type === 'credit' ? 'Credit' : 'Debit';
    }

    // Get transactions
    const transactions = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'accountName', 'category', 'isMainAccount', 'balance']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      raw: false
    });

    // Format transactions for display
    const formattedTransactions = transactions.rows.map(txn => {
      const txnData = txn.toJSON();
      
      // Add display formatting
      txnData.displayInfo = {
        type: txnData.type === 'Credit' ? 'money_in' : 'purchase',
        icon: txnData.type === 'Credit' ? '💰' : '🛒',
        color: txnData.type === 'Credit' ? 'green' : 'red',
        category: txnData.account?.category || 'general'
      };

      // Add context based on reference
      if (txnData.reference?.startsWith('ORDER_')) {
        txnData.displayInfo.context = 'purchase';
        txnData.displayInfo.orderRef = txnData.reference;
      } else if (txnData.reference?.startsWith('DEPOSIT_')) {
        txnData.displayInfo.context = 'deposit';
      }

      return txnData;
    });

    res.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        accounts: userAccounts.map(acc => ({
          id: acc.id,
          name: acc.accountName,
          category: acc.category,
          balance: parseFloat(acc.balance || 0),
          isMain: acc.isMainAccount
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transactions.count / limit),
          totalTransactions: transactions.count,
          hasMore: offset + transactions.rows.length < transactions.count
        }
      }
    });

  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions',
      error: error.message
    });
  }
};

// Simple transaction summary
const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user's accounts
    const userAccounts = await Account.findAll({
      where: { userId },
      attributes: ['id', 'accountName', 'category', 'balance', 'isMainAccount']
    });
    
    if (userAccounts.length === 0) {
      return res.json({
        success: true,
        data: {
          period: `Last ${period} days`,
          totalDeposits: 0,
          totalSpending: 0,
          transactionCount: 0,
          accountBalances: []
        }
      });
    }

    const accountIds = userAccounts.map(acc => acc.id);

    // Get transaction totals by type
    const transactionSummary = await Transaction.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: {
        accountId: { [Op.in]: accountIds },
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: ['type'],
      raw: true
    });

    let totalDeposits = 0;
    let totalSpending = 0;
    let transactionCount = 0;

    transactionSummary.forEach(item => {
      const count = parseInt(item.count || 0);
      const total = parseFloat(item.total || 0);
      
      transactionCount += count;
      
      if (item.type === 'Credit') {
        totalDeposits += total;
      } else if (item.type === 'Debit') {
        totalSpending += total;
      }
    });

    const summary = {
      period: `Last ${period} days`,
      totalDeposits,
      totalSpending,
      transactionCount,
      netAmount: totalDeposits - totalSpending,
      accountBalances: userAccounts.map(acc => ({
        id: acc.id,
        name: acc.accountName,
        category: acc.category,
        balance: parseFloat(acc.balance || 0),
        isMain: acc.isMainAccount
      })),
      totalBalance: userAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0)
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction summary',
      error: error.message
    });
  }
};

// Get transaction details  
const getTransactionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get user's accounts to verify ownership
    const userAccounts = await Account.findAll({
      where: { userId },
      attributes: ['id']
    });
    
    const accountIds = userAccounts.map(acc => acc.id);
    
    const transaction = await Transaction.findOne({
      where: { 
        id: parseInt(id),
        accountId: { [Op.in]: accountIds }
      },
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'accountName', 'category', 'isMainAccount']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction details',
      error: error.message
    });
  }
};

module.exports = {
  getUserTransactions,
  getTransactionSummary,
  getTransactionDetails
};
