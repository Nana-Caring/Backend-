const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, Account, Transaction, FunderDependent } = require('../models');
const sequelize = require('../config/database');

// Create payment intent for direct deposit without storing payment method
const createDirectDepositIntent = async (req, res) => {
  try {
    const { dependentId, amount, description, currency = 'zar' } = req.body;
    const funderId = req.user.id;

    // Validate input
    if (!dependentId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Dependent ID and valid amount are required'
      });
    }

    // Verify funder-dependent relationship
    const relationship = await FunderDependent.findOne({
      where: { funderId, dependentId },
      include: [{
        model: User,
        as: 'dependent',
        attributes: ['id', 'firstName', 'surname', 'email']
      }]
    });

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to deposit to this dependent'
      });
    }

    // Get dependent's main account (or create if doesn't exist)
    let dependentAccount = await Account.findOne({
      where: { 
        userId: dependentId, 
        isMainAccount: true,
        status: 'active'
      }
    });

    if (!dependentAccount) {
      return res.status(404).json({
        success: false,
        message: 'Dependent account not found'
      });
    }

    // Create Stripe payment intent with one-time payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        funderId: funderId.toString(),
        dependentId: dependentId.toString(),
        accountId: dependentAccount.id.toString(),
        description: description || 'Direct deposit to dependent account',
        type: 'direct_deposit'
      },
      description: `Deposit to ${relationship.dependent.firstName} ${relationship.dependent.surname}`,
      receipt_email: req.user.email,
      setup_future_usage: null, // Explicitly no future usage to avoid storing payment method
    });

    res.json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency.toUpperCase(),
        recipient: {
          id: dependentId,
          name: `${relationship.dependent.firstName} ${relationship.dependent.surname}`,
          email: relationship.dependent.email
        },
        accountDetails: {
          id: dependentAccount.id,
          accountNumber: dependentAccount.accountNumber,
          currentBalance: parseFloat(dependentAccount.balance)
        }
      }
    });

  } catch (error) {
    console.error('Create deposit intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Confirm direct deposit after successful payment
const confirmDirectDeposit = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { paymentIntentId } = req.body;
    const funderId = req.user.id;

    if (!paymentIntentId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify payment was successful
    if (paymentIntent.status !== 'succeeded') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed successfully',
        paymentStatus: paymentIntent.status
      });
    }

    // Verify this payment belongs to the authenticated funder
    if (paymentIntent.metadata.funderId !== funderId.toString()) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to payment intent'
      });
    }

    // Check if this deposit has already been processed
    const existingTransaction = await Transaction.findOne({
      where: { 
        reference: `STRIPE_${paymentIntentId}`,
        status: 'completed'
      },
      transaction
    });

    if (existingTransaction) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'This deposit has already been processed'
      });
    }

    // Get account and update balance
    const account = await Account.findByPk(paymentIntent.metadata.accountId, { transaction });
    
    if (!account) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const depositAmount = paymentIntent.amount / 100; // Convert from cents
    const newBalance = parseFloat(account.balance) + depositAmount;

    await account.update({ 
      balance: newBalance,
      lastTransactionDate: new Date()
    }, { transaction });

    // Create transaction record
    const transactionRecord = await Transaction.create({
      userId: parseInt(paymentIntent.metadata.dependentId),
      accountId: account.id,
      type: 'credit',
      amount: depositAmount,
      description: paymentIntent.metadata.description || 'Direct deposit from funder',
      category: 'deposit',
      status: 'completed',
      reference: `STRIPE_${paymentIntentId}`,
      balanceAfter: newBalance,
      metadata: JSON.stringify({
        stripePaymentIntentId: paymentIntentId,
        funderId: funderId,
        paymentMethod: 'stripe_direct_deposit',
        currency: paymentIntent.currency.toUpperCase()
      })
    }, { transaction });

    // If this is a main account with category accounts, distribute the funds
    if (account.isMainAccount) {
      await distributeToCategories(account, depositAmount, funderId, paymentIntentId, transaction);
    }

    await transaction.commit();

    // Get updated account with user info for response
    const updatedAccount = await Account.findByPk(account.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'surname', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Deposit completed successfully',
      data: {
        transaction: {
          id: transactionRecord.id,
          amount: depositAmount,
          currency: paymentIntent.currency.toUpperCase(),
          description: transactionRecord.description,
          reference: transactionRecord.reference,
          createdAt: transactionRecord.createdAt
        },
        account: {
          id: account.id,
          accountNumber: account.accountNumber,
          previousBalance: parseFloat(account.balance) - depositAmount,
          newBalance: newBalance,
          recipient: updatedAccount.user ? {
            name: `${updatedAccount.user.firstName} ${updatedAccount.user.surname}`,
            email: updatedAccount.user.email
          } : null
        },
        paymentDetails: {
          paymentIntentId: paymentIntentId,
          stripeStatus: paymentIntent.status
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Confirm deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm deposit',
      error: error.message
    });
  }
};

// Helper function to distribute funds to category accounts
const distributeToCategories = async (mainAccount, amount, funderId, paymentIntentId, transaction) => {
  try {
    // Get all category accounts for this user
    const categoryAccounts = await Account.findAll({
      where: {
        userId: mainAccount.userId,
        isMainAccount: false,
        category: { [require('sequelize').Op.ne]: null },
        status: 'active'
      },
      transaction
    });

    if (categoryAccounts.length === 0) {
      return; // No category accounts to distribute to
    }

    // Define distribution percentages
    const categoryAllocations = {
      'healthcare': 0.25,    // 25%
      'groceries': 0.30,     // 30%
      'education': 0.20,     // 20%
      'transport': 0.15,     // 15%
      'entertainment': 0.05, // 5%
      'other': 0.05          // 5%
    };

    // Distribute funds to each category
    let distributionTransactions = [];
    
    for (const categoryAccount of categoryAccounts) {
      const percentage = categoryAllocations[categoryAccount.category] || 0;
      if (percentage > 0) {
        const allocatedAmount = Math.round(amount * percentage * 100) / 100;
        const newCategoryBalance = parseFloat(categoryAccount.balance) + allocatedAmount;

        await categoryAccount.update({ 
          balance: newCategoryBalance,
          lastTransactionDate: new Date()
        }, { transaction });

        // Create transaction record for category allocation
        distributionTransactions.push({
          userId: mainAccount.userId,
          accountId: categoryAccount.id,
          type: 'credit',
          amount: allocatedAmount,
          description: `Auto-allocation from deposit (${Math.round(percentage * 100)}%)`,
          category: 'allocation',
          status: 'completed',
          reference: `ALLOC_${paymentIntentId}_${categoryAccount.category.toUpperCase()}`,
          balanceAfter: newCategoryBalance,
          metadata: JSON.stringify({
            sourcePaymentIntent: paymentIntentId,
            funderId: funderId,
            allocationType: 'automatic',
            percentage: percentage,
            mainAccountId: mainAccount.id
          })
        });
      }
    }

    // Bulk create distribution transactions
    if (distributionTransactions.length > 0) {
      await Transaction.bulkCreate(distributionTransactions, { transaction });
    }

    // Update main account to show total of all category accounts
    const totalCategoryBalance = distributionTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    await mainAccount.update({ balance: totalCategoryBalance }, { transaction });

  } catch (error) {
    console.error('Error distributing to categories:', error);
    throw error;
  }
};

// Get deposit history for funder
const getDepositHistory = async (req, res) => {
  try {
    const funderId = req.user.id;
    const { page = 1, limit = 10, dependentId } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for transactions
    const whereClause = {
      type: 'credit',
      category: 'deposit',
      reference: { [require('sequelize').Op.like]: 'STRIPE_%' },
      status: 'completed'
    };

    // Filter by dependent if specified
    if (dependentId) {
      whereClause.userId = dependentId;
    }

    const transactions = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Account,
          as: 'account',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'surname', 'email'],
            include: [{
              model: User,
              as: 'Funders',
              where: { id: funderId },
              attributes: [],
              through: { attributes: [] }
            }]
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const deposits = transactions.rows.map(transaction => {
      const metadata = transaction.metadata ? JSON.parse(transaction.metadata) : {};
      return {
        id: transaction.id,
        amount: parseFloat(transaction.amount),
        currency: metadata.currency || 'ZAR',
        description: transaction.description,
        reference: transaction.reference,
        balanceAfter: parseFloat(transaction.balanceAfter),
        createdAt: transaction.createdAt,
        recipient: transaction.account?.user ? {
          id: transaction.account.user.id,
          name: `${transaction.account.user.firstName} ${transaction.account.user.surname}`,
          email: transaction.account.user.email
        } : null,
        account: {
          id: transaction.account?.id,
          accountNumber: transaction.account?.accountNumber
        },
        stripePaymentIntentId: metadata.stripePaymentIntentId
      };
    });

    res.json({
      success: true,
      data: {
        deposits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transactions.count / limit),
          totalDeposits: transactions.count,
          hasMore: offset + transactions.rows.length < transactions.count
        }
      }
    });

  } catch (error) {
    console.error('Get deposit history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve deposit history',
      error: error.message
    });
  }
};

// Get available payment methods from Stripe (for UI display only)
const getAvailablePaymentMethods = async (req, res) => {
  try {
    // Return supported payment methods without storing any customer data
    const paymentMethods = {
      cards: [
        { type: 'visa', name: 'Visa', icon: 'visa' },
        { type: 'mastercard', name: 'Mastercard', icon: 'mastercard' },
        { type: 'amex', name: 'American Express', icon: 'amex' }
      ],
      banks: [
        { type: 'eft', name: 'EFT Bank Transfer', icon: 'bank' },
        { type: 'instant_eft', name: 'Instant EFT', icon: 'instant_bank' }
      ],
      digital: [
        { type: 'apple_pay', name: 'Apple Pay', icon: 'apple_pay' },
        { type: 'google_pay', name: 'Google Pay', icon: 'google_pay' }
      ]
    };

    res.json({
      success: true,
      message: 'Available payment methods retrieved',
      data: {
        paymentMethods,
        currency: 'ZAR',
        minimumAmount: 10.00,
        maximumAmount: 50000.00,
        processingNote: 'Payments are processed securely through Stripe. No payment information is stored on our servers.'
      }
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
      error: error.message
    });
  }
};

module.exports = {
  createDirectDepositIntent,
  confirmDirectDeposit,
  getDepositHistory,
  getAvailablePaymentMethods
};
