const { Transaction, Account, User, Order, OrderItem, Product } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get user's transaction history with detailed information
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      type,           // 'credit' (money-in) or 'debit' (purchases)
      category,       // account category filter
      startDate,      // filter by date range
      endDate,
      accountId       // specific account filter
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId };

    // Add filters
    if (type) {
      whereClause.type = type;
    }

    if (category) {
      whereClause.category = category;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    if (accountId) {
      whereClause.accountId = accountId;
    }

    // Get transactions with account details (adjusted for actual table structure)
    const accountWhereClause = { userId };
    
    // Get user's accounts first
    const userAccounts = await Account.findAll({
      where: accountWhereClause,
      attributes: ['id']
    });
    
    const accountIds = userAccounts.map(acc => acc.id);
    
    if (accountIds.length === 0) {
      return res.json({
        success: true,
        data: {
          transactions: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalTransactions: 0,
            hasMore: false
          }
        }
      });
    }

    // Build where clause for transactions based on actual table structure
    const txnWhereClause = {
      accountId: { [Op.in]: accountIds }
    };

    if (type) {
      txnWhereClause.type = type === 'credit' ? 'Credit' : 'Debit';
    }

    if (startDate || endDate) {
      txnWhereClause.createdAt = {};
      if (startDate) {
        txnWhereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        txnWhereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    if (accountId && accountIds.includes(parseInt(accountId))) {
      txnWhereClause.accountId = parseInt(accountId);
    }

    const transactions = await Transaction.findAndCountAll({
      where: txnWhereClause,
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'accountName', 'category', 'isMainAccount']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Enhance transaction data with additional context
    const enhancedTransactions = await Promise.all(
      transactions.rows.map(async (transaction) => {
        const txnData = transaction.toJSON();
        
        // Add contextual information based on transaction type
        if (txnData.reference?.startsWith('ORDER_')) {
          // This is a purchase transaction - get order details
          const orderId = txnData.reference.replace('ORDER_', '');
          try {
            const order = await Order.findByPk(orderId, {
              attributes: ['id', 'orderNumber', 'storeCode', 'orderStatus'],
              include: [
                {
                  model: OrderItem,
                  as: 'orderItems',
                  attributes: ['quantity', 'priceAtOrder'],
                  include: [
                    {
                      model: Product,
                      as: 'product',
                      attributes: ['name', 'brand', 'image', 'category']
                    }
                  ]
                }
              ]
            });

            if (order) {
              txnData.orderDetails = {
                orderNumber: order.orderNumber,
                storeCode: order.storeCode,
                status: order.orderStatus,
                itemCount: order.orderItems?.length || 0,
                items: order.orderItems?.map(item => ({
                  name: item.product?.name,
                  brand: item.product?.brand,
                  quantity: item.quantity,
                  price: item.priceAtOrder,
                  image: item.product?.image
                })) || []
              };
            }
          } catch (error) {
            console.warn('Could not fetch order details for transaction:', txnData.id);
          }
        } else if (txnData.reference?.startsWith('DEPOSIT_')) {
          // This is a deposit from funder
          txnData.depositInfo = {
            type: 'funder_deposit',
            message: 'Money received from funder'
          };
        } else if (txnData.reference?.startsWith('TRANSFER_')) {
          // This is an inter-category transfer
          txnData.transferInfo = {
            type: 'category_transfer',
            message: 'Money moved between categories'
          };
        }

        return txnData;
      })
    );

    res.json({
      success: true,
      data: {
        transactions: enhancedTransactions,
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

// Get transaction summary/analytics for the user
const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // Default to last 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user's accounts first
    const userAccounts = await Account.findAll({
      where: { userId },
      attributes: ['id']
    });
    
    const accountIds = userAccounts.map(acc => acc.id);
    
    if (accountIds.length === 0) {
      return res.json({
        success: true,
        data: {
          period: `Last ${period} days`,
          totalDeposits: 0,
          totalSpending: 0,
          transactionCount: 0,
          categoryBreakdown: {},
          accountBalances: []
        }
      });
    }

    // Get transaction summary statistics (adjusted for actual table structure)
    const summaryData = await Transaction.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('AVG', sequelize.col('amount')), 'avgAmount']
      ],
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['category'],
          where: { userId }
        }
      ],
      where: {
        accountId: { [Op.in]: accountIds },
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: ['type', 'account.category'],
      raw: true
    });

    // Get recent account balances
    const accounts = await Account.findAll({
      where: { userId, status: 'active' },
      attributes: ['id', 'accountName', 'category', 'balance', 'isMainAccount'],
      order: [['isMainAccount', 'DESC'], ['category', 'ASC']]
    });

    // Process summary data
    const summary = {
      period: `Last ${period} days`,
      totalDeposits: 0,
      totalSpending: 0,
      transactionCount: 0,
      categoryBreakdown: {},
      accountBalances: accounts.map(acc => ({
        id: acc.id,
        name: acc.accountName,
        category: acc.category,
        balance: parseFloat(acc.balance || 0),
        isMain: acc.isMainAccount
      }))
    };

    summaryData.forEach(item => {
      const amount = parseFloat(item.totalAmount || 0);
      const count = parseInt(item.count || 0);
      
      summary.transactionCount += count;
      
      if (item.type === 'credit') {
        summary.totalDeposits += amount;
      } else if (item.type === 'debit') {
        summary.totalSpending += amount;
      }

      // Category breakdown
      const categoryKey = item.category || 'general';
      if (!summary.categoryBreakdown[categoryKey]) {
        summary.categoryBreakdown[categoryKey] = {
          deposits: 0,
          spending: 0,
          count: 0
        };
      }

      summary.categoryBreakdown[categoryKey].count += count;
      if (item.type === 'credit') {
        summary.categoryBreakdown[categoryKey].deposits += amount;
      } else {
        summary.categoryBreakdown[categoryKey].spending += amount;
      }
    });

    // Calculate totals
    summary.netAmount = summary.totalDeposits - summary.totalSpending;
    summary.totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

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

// Get specific transaction details
const getTransactionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get user's accounts first to ensure user owns this transaction
    const userAccounts = await Account.findAll({
      where: { userId },
      attributes: ['id']
    });
    
    const accountIds = userAccounts.map(acc => acc.id);
    
    const transaction = await Transaction.findOne({
      where: { 
        id,
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

    const txnData = transaction.toJSON();

    // Add detailed context based on transaction reference
    if (txnData.reference?.startsWith('ORDER_')) {
      const orderId = txnData.reference.replace('ORDER_', '');
      try {
        const order = await Order.findByPk(orderId, {
          include: [
            {
              model: OrderItem,
              as: 'orderItems',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'brand', 'image', 'category', 'sku']
                }
              ]
            }
          ]
        });

        if (order) {
          txnData.orderDetails = {
            orderNumber: order.orderNumber,
            storeCode: order.storeCode,
            status: order.orderStatus,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            items: order.orderItems.map(item => {
              let productSnapshot = {};
              try {
                productSnapshot = JSON.parse(item.productSnapshot || '{}');
              } catch (e) {
                // Ignore parsing errors
              }

              return {
                productId: item.productId,
                name: productSnapshot.name || item.product?.name,
                brand: productSnapshot.brand || item.product?.brand,
                image: productSnapshot.image || item.product?.image,
                sku: productSnapshot.sku || item.product?.sku,
                quantity: item.quantity,
                priceAtOrder: item.priceAtOrder,
                subtotal: item.subtotal
              };
            })
          };
        }
      } catch (error) {
        console.warn('Could not fetch detailed order information:', error.message);
      }
    }

    res.json({
      success: true,
      data: txnData
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

// Get monthly spending report
const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;
    
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // JavaScript months are 0-indexed
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    // Get user's accounts first
    const userAccounts = await Account.findAll({
      where: { userId },
      attributes: ['id']
    });
    
    const accountIds = userAccounts.map(acc => acc.id);
    
    // Get all transactions for the month
    const monthlyTransactions = await Transaction.findAll({
      where: {
        accountId: { [Op.in]: accountIds },
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['accountName', 'category', 'isMainAccount']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Process data for report
    const report = {
      period: {
        year: targetYear,
        month: targetMonth + 1,
        monthName: startDate.toLocaleString('default', { month: 'long' })
      },
      summary: {
        totalDeposits: 0,
        totalSpending: 0,
        transactionCount: monthlyTransactions.length,
        netAmount: 0
      },
      categorySpending: {},
      dailySpending: {},
      topPurchases: []
    };

    // Process each transaction
    monthlyTransactions.forEach(txn => {
      const amount = parseFloat(txn.amount);
      const day = txn.createdAt.getDate();
      const category = txn.account?.category || 'general';

      if (txn.type === 'credit') {
        report.summary.totalDeposits += amount;
      } else if (txn.type === 'debit') {
        report.summary.totalSpending += amount;

        // Category spending
        if (!report.categorySpending[category]) {
          report.categorySpending[category] = 0;
        }
        report.categorySpending[category] += amount;

        // Daily spending
        if (!report.dailySpending[day]) {
          report.dailySpending[day] = 0;
        }
        report.dailySpending[day] += amount;

        // Track for top purchases
        if (txn.reference?.startsWith('ORDER_')) {
          report.topPurchases.push({
            date: txn.createdAt,
            amount: amount,
            description: txn.description,
            category: category,
            reference: txn.reference
          });
        }
      }
    });

    // Calculate net amount
    report.summary.netAmount = report.summary.totalDeposits - report.summary.totalSpending;

    // Sort top purchases by amount
    report.topPurchases.sort((a, b) => b.amount - a.amount);
    report.topPurchases = report.topPurchases.slice(0, 10); // Top 10

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly report',
      error: error.message
    });
  }
};

module.exports = {
  getUserTransactions,
  getTransactionSummary,
  getTransactionDetails,
  getMonthlyReport
};
