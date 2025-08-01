const { PaymentCard, User, Account, Transaction } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper function to mask card number for display
function maskCardNumber(cardNumber) {
  if (!cardNumber || cardNumber.length < 4) return '****';
  return `****-****-****-${cardNumber.slice(-4)}`;
}

// Helper function to generate transaction reference
function generateTransactionRef() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp.slice(-6)}${random}`;
}

// Default allocation percentages for sub-accounts
const DEFAULT_SUB_ACCOUNT_ALLOCATIONS = {
  'Education': 25,      // 25%
  'Healthcare': 20,     // 20%
  'Savings': 20,        // 20%
  'Clothing': 15,       // 15%
  'Baby Care': 10,      // 10%
  'Entertainment': 5,   // 5%
  'Pregnancy': 5        // 5%
  // Total: 100%
};

// Helper function to split funds among sub-accounts
async function splitFundsAmongSubAccounts(mainAccountId, totalAmount, transactionRef, description, dbTransaction) {
  try {
    // Get all sub-accounts for this main account
    const subAccounts = await Account.findAll({
      where: {
        parentAccountId: mainAccountId,
        status: 'active'
      },
      order: [['accountType', 'ASC']],
      transaction: dbTransaction
    });

    if (subAccounts.length === 0) {
      // No sub-accounts, all money goes to main account
      return {
        splits: [],
        totalSplitAmount: 0,
        remainingAmount: totalAmount,
        message: 'No sub-accounts found, all funds allocated to main account'
      };
    }

    const splits = [];
    let totalSplitAmount = 0;
    let remainingToDistribute = totalAmount;

    // Calculate allocations based on account types
    const allocations = [];
    let totalPercentage = 0;

    for (const subAccount of subAccounts) {
      const percentage = DEFAULT_SUB_ACCOUNT_ALLOCATIONS[subAccount.accountType] || 0;
      totalPercentage += percentage;
      allocations.push({
        account: subAccount,
        percentage: percentage
      });
    }

    // If total percentage is less than 100%, adjust proportionally
    if (totalPercentage > 0 && totalPercentage < 100) {
      const adjustmentFactor = 100 / totalPercentage;
      allocations.forEach(allocation => {
        allocation.percentage *= adjustmentFactor;
      });
      totalPercentage = 100;
    }

    // If no allocations are defined for any account type, use equal split
    if (totalPercentage === 0) {
      const equalPercentage = 100 / subAccounts.length;
      allocations.forEach(allocation => {
        allocation.percentage = equalPercentage;
      });
      totalPercentage = 100;
    }

    // Calculate actual amounts (handle rounding by giving remainder to first account)
    for (let i = 0; i < allocations.length; i++) {
      const allocation = allocations[i];
      let amount;
      
      if (i === allocations.length - 1) {
        // Last account gets remaining amount to handle rounding
        amount = remainingToDistribute;
      } else {
        amount = Math.floor((totalAmount * allocation.percentage / 100) * 100) / 100; // Round to 2 decimal places
        remainingToDistribute -= amount;
      }

      if (amount > 0) {
        // Create transaction for this sub-account
        const splitTransaction = await Transaction.create({
          accountId: allocation.account.id,
          amount: amount,
          type: 'Credit',
          description: `${description} (${allocation.percentage.toFixed(1)}% split)`,
          reference: `${transactionRef}-SUB-${allocation.account.accountType.toUpperCase()}`,
          metadata: {
            splitFrom: mainAccountId,
            splitPercentage: allocation.percentage,
            originalTransactionRef: transactionRef,
            splitType: 'automatic_allocation'
          }
        }, { transaction: dbTransaction });

        // Update sub-account balance
        await allocation.account.increment('balance', {
          by: amount,
          transaction: dbTransaction
        });

        // Update last transaction date
        await allocation.account.update({
          lastTransactionDate: new Date()
        }, { transaction: dbTransaction });

        splits.push({
          accountId: allocation.account.id,
          accountType: allocation.account.accountType,
          accountNumber: allocation.account.accountNumber,
          amount: amount,
          percentage: allocation.percentage,
          transactionId: splitTransaction.id
        });

        totalSplitAmount += amount;
      }
    }

    return {
      splits: splits,
      totalSplitAmount: totalSplitAmount,
      remainingAmount: totalAmount - totalSplitAmount,
      message: `Funds split among ${splits.length} sub-accounts`
    };

  } catch (error) {
    console.error('Error splitting funds among sub-accounts:', error);
    throw new Error(`Fund splitting failed: ${error.message}`);
  }
}

// Send money from funder's card to beneficiary account
const sendMoneyToBeneficiary = async (req, res) => {
  try {
    const { cardId, beneficiaryId, amount, description } = req.body;
    const funderId = req.user.id;

    // Validate required fields
    if (!cardId || !beneficiaryId || !amount) {
      return res.status(400).json({
        message: 'All fields are required',
        required: {
          cardId: 'Payment card ID is required',
          beneficiaryId: 'Beneficiary ID is required',
          amount: 'Transfer amount is required'
        }
      });
    }

    // Validate amount
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({
        message: 'Amount must be a positive number'
      });
    }

    if (transferAmount < 10) {
      return res.status(400).json({
        message: 'Minimum transfer amount is R10.00'
      });
    }

    if (transferAmount > 5000) {
      return res.status(400).json({
        message: 'Maximum transfer amount is R5,000.00 per transaction'
      });
    }

    // Get funder's payment card
    const paymentCard = await PaymentCard.findOne({
      where: {
        id: cardId,
        userId: funderId,
        isActive: true
      }
    });

    if (!paymentCard) {
      return res.status(404).json({
        message: 'Payment card not found or inactive'
      });
    }

    // Get beneficiary user details
    const beneficiary = await User.findOne({
      where: {
        id: beneficiaryId,
        role: 'dependent'
      }
    });

    if (!beneficiary) {
      return res.status(404).json({
        message: 'Beneficiary not found'
      });
    }

    // Check if funder has relationship with beneficiary
    const { FunderDependent } = require('../models');
    const relationship = await FunderDependent.findOne({
      where: {
        funderId: funderId,
        dependentId: beneficiaryId
      }
    });

    if (!relationship) {
      return res.status(403).json({
        message: 'You are not authorized to send money to this beneficiary'
      });
    }

    // Get beneficiary's account
    const beneficiaryAccount = await Account.findOne({
      where: {
        userId: beneficiaryId,
        status: 'active'
      }
    });

    if (!beneficiaryAccount) {
      return res.status(404).json({
        message: 'Beneficiary account not found or inactive'
      });
    }

    // Get funder details for Stripe
    const funder = await User.findByPk(funderId);

    // Create payment intent with Stripe
    let paymentIntent;
    try {
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(transferAmount * 100);

      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'zar',
        payment_method: paymentCard.stripePaymentMethodId,
        customer: funder.stripeCustomerId,
        confirm: true,
        return_url: 'https://your-app.com/return',
        description: description || `Transfer to ${beneficiary.firstName} ${beneficiary.surname}`,
        metadata: {
          funderId: funderId.toString(),
          beneficiaryId: beneficiaryId.toString(),
          cardId: cardId,
          transferType: 'card_to_beneficiary'
        }
      });

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          message: 'Payment failed',
          error: 'Payment could not be processed at this time',
          paymentStatus: paymentIntent.status
        });
      }

    } catch (stripeError) {
      console.error('Stripe payment error:', stripeError);
      return res.status(400).json({
        message: 'Payment processing failed',
        error: stripeError.message || 'Card payment could not be processed'
      });
    }

    // Generate transaction reference
    const transactionRef = generateTransactionRef();

    try {
      // Start database transaction
      const dbTransaction = await require('../config/database').transaction();

      try {
        // Create credit transaction for beneficiary main account
        const creditTransaction = await Transaction.create({
          accountId: beneficiaryAccount.id,
          amount: transferAmount,
          type: 'Credit',
          description: `Received from ${funder.firstName} ${funder.surname}`,
          reference: transactionRef,
          metadata: {
            paymentIntentId: paymentIntent.id,
            funderId: funderId,
            cardId: cardId,
            transferType: 'received_from_card'
          }
        }, { transaction: dbTransaction });

        // Split the funds among sub-accounts
        const splitResult = await splitFundsAmongSubAccounts(
          beneficiaryAccount.id,
          transferAmount,
          transactionRef,
          `Split from transfer: ${funder.firstName} ${funder.surname}`,
          dbTransaction
        );

        // Update beneficiary main account balance (receives the remaining amount after splits)
        await beneficiaryAccount.increment('balance', {
          by: splitResult.remainingAmount,
          transaction: dbTransaction
        });

        // Update account last transaction date
        await beneficiaryAccount.update({
          lastTransactionDate: new Date()
        }, { transaction: dbTransaction });

        // Commit the transaction
        await dbTransaction.commit();

        // Prepare response data
        const responseData = {
          message: 'Money sent successfully',
          transfer: {
            transactionRef: transactionRef,
            amount: transferAmount,
            currency: 'ZAR',
            fromCard: {
              bankName: paymentCard.bankName,
              cardNumber: maskCardNumber(paymentCard.cardNumber),
              nickname: paymentCard.nickname
            },
            toBeneficiary: {
              name: `${beneficiary.firstName} ${beneficiary.surname}`,
              accountNumber: beneficiaryAccount.accountNumber
            },
            status: 'completed',
            timestamp: new Date(),
            description: description || `Transfer to ${beneficiary.firstName} ${beneficiary.surname}`
          },
          fundSplitting: {
            enabled: splitResult.splits.length > 0,
            totalSplitAmount: splitResult.totalSplitAmount,
            remainingToMainAccount: splitResult.remainingAmount,
            splits: splitResult.splits,
            message: splitResult.message
          },
          balanceUpdate: {
            beneficiaryNewBalance: parseFloat(beneficiaryAccount.balance) + splitResult.remainingAmount,
            totalDistributed: transferAmount
          }
        };

        res.status(201).json(responseData);

      } catch (dbError) {
        // Rollback database transaction
        await dbTransaction.rollback();
        
        console.error('Database transaction error details:', {
          error: dbError.message,
          stack: dbError.stack,
          name: dbError.name,
          sql: dbError.sql,
          cardId,
          beneficiaryId,
          amount: transferAmount,
          accountId: beneficiaryAccount.id
        });
        
        // Try to refund the Stripe payment if possible
        try {
          await stripe.refunds.create({
            payment_intent: paymentIntent.id,
            reason: 'requested_by_customer'
          });
          console.log('Stripe payment refunded due to database error');
        } catch (refundError) {
          console.error('Refund failed:', refundError);
        }

        throw dbError;
      }

    } catch (error) {
      console.error('Database transaction error:', error);
      return res.status(500).json({
        message: 'Transfer failed',
        error: 'Database error occurred during transfer',
        details: error.message,
        debug: {
          cardId,
          beneficiaryId,
          amount: transferAmount,
          hasAccount: !!beneficiaryAccount,
          accountId: beneficiaryAccount?.id
        }
      });
    }

  } catch (error) {
    console.error('Send money error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get transfer history for funder
const getTransferHistory = async (req, res) => {
  try {
    const funderId = req.user.id;
    const { page = 1, limit = 10, beneficiaryId } = req.query;

    // Get funder's beneficiaries
    const { FunderDependent } = require('../models');
    let beneficiaryFilter = {};
    
    if (beneficiaryId) {
      // Verify funder has relationship with this beneficiary
      const relationship = await FunderDependent.findOne({
        where: {
          funderId: funderId,
          dependentId: beneficiaryId
        }
      });

      if (!relationship) {
        return res.status(403).json({
          message: 'You are not authorized to view transfers for this beneficiary'
        });
      }

      beneficiaryFilter = { userId: beneficiaryId };
    } else {
      // Get all beneficiaries for this funder
      const relationships = await FunderDependent.findAll({
        where: { funderId: funderId }
      });
      
      const beneficiaryIds = relationships.map(rel => rel.dependentId);
      beneficiaryFilter = { userId: beneficiaryIds };
    }

    // Get accounts for beneficiaries
    const beneficiaryAccounts = await Account.findAll({
      where: beneficiaryFilter,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'surname', 'email']
      }]
    });

    const accountIds = beneficiaryAccounts.map(acc => acc.id);

    // Get transactions (transfers) to these accounts
    const offset = (page - 1) * limit;
    const transfers = await Transaction.findAndCountAll({
      where: {
        accountId: accountIds,
        type: 'Credit',
        metadata: {
          funderId: funderId.toString()
        }
      },
      include: [{
        model: Account,
        as: 'account',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'surname']
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Format response
    const formattedTransfers = transfers.rows.map(transfer => ({
      id: transfer.id,
      transactionRef: transfer.reference,
      amount: transfer.amount,
      currency: 'ZAR',
      beneficiary: {
        id: transfer.account.user.id,
        name: `${transfer.account.user.firstName} ${transfer.account.user.surname}`,
        accountNumber: transfer.account.accountNumber
      },
      status: 'completed',
      timestamp: transfer.createdAt,
      description: transfer.description
    }));

    const totalPages = Math.ceil(transfers.count / limit);

    res.json({
      message: 'Transfer history retrieved successfully',
      transfers: formattedTransfers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalTransfers: transfers.count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get transfer history error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get beneficiaries list for funder
const getBeneficiariesList = async (req, res) => {
  try {
    const funderId = req.user.id;

    // Get funder's beneficiaries with their account details
    const { FunderDependent } = require('../models');
    const relationships = await FunderDependent.findAll({
      where: { funderId: funderId },
      include: [{
        model: User,
        as: 'dependent',
        attributes: ['id', 'firstName', 'surname', 'email'],
        include: [{
          model: Account,
          as: 'accounts',
          where: { status: 'active' },
          required: false
        }]
      }]
    });

    const beneficiaries = relationships.map(rel => {
      const user = rel.dependent;
      const account = user.accounts && user.accounts[0];
      
      return {
        id: user.id,
        name: `${user.firstName} ${user.surname}`,
        email: user.email,
        account: account ? {
          id: account.id,
          accountNumber: account.accountNumber,
          balance: account.balance,
          currency: account.currency
        } : null,
        hasActiveAccount: !!account
      };
    });

    res.json({
      message: 'Beneficiaries retrieved successfully',
      beneficiaries: beneficiaries,
      totalBeneficiaries: beneficiaries.length
    });

  } catch (error) {
    console.error('Get beneficiaries error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get transfer limits and fees
const getTransferInfo = async (req, res) => {
  try {
    res.json({
      message: 'Transfer information retrieved successfully',
      limits: {
        minimum: 10.00,
        maximum: 5000.00,
        dailyLimit: 20000.00,
        currency: 'ZAR'
      },
      fees: {
        transferFee: 0.00, // No additional fees beyond Stripe processing
        stripeProcessingFee: '2.9% + R2.00', // Stripe's standard fee
        currency: 'ZAR'
      },
      processingTime: {
        standard: 'Instant',
        description: 'Transfers are processed immediately upon successful payment'
      }
    });
  } catch (error) {
    console.error('Get transfer info error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Debug endpoint - check transfer prerequisites
const debugTransferData = async (req, res) => {
  try {
    const { cardId, beneficiaryId } = req.query;
    const funderId = req.user.id;

    console.log('DEBUG: Checking transfer data for:', { cardId, beneficiaryId, funderId });

    const debug = {};

    // Check card
    if (cardId) {
      const card = await PaymentCard.findOne({
        where: {
          id: cardId,
          userId: funderId,
          isActive: true
        }
      });
      debug.card = card ? {
        id: card.id,
        bankName: card.bankName,
        isActive: card.isActive,
        stripePaymentMethodId: card.stripePaymentMethodId
      } : null;
    }

    // Check beneficiary
    if (beneficiaryId) {
      const beneficiary = await User.findOne({
        where: {
          id: beneficiaryId,
          role: 'dependent'
        }
      });
      debug.beneficiary = beneficiary ? {
        id: beneficiary.id,
        name: `${beneficiary.firstName} ${beneficiary.surname}`,
        role: beneficiary.role
      } : null;

      // Check relationship
      if (beneficiary) {
        const { FunderDependent } = require('../models');
        const relationship = await FunderDependent.findOne({
          where: {
            funderId: funderId,
            dependentId: beneficiaryId
          }
        });
        debug.relationship = !!relationship;

        // Check account
        const account = await Account.findOne({
          where: {
            userId: beneficiaryId,
            status: 'active'
          }
        });
        debug.account = account ? {
          id: account.id,
          accountNumber: account.accountNumber,
          balance: account.balance,
          status: account.status
        } : null;
      }
    }

    res.json({
      message: 'Transfer debug data',
      funderId,
      debug
    });

  } catch (error) {
    console.error('Debug transfer error:', error);
    res.status(500).json({
      message: 'Debug failed',
      error: error.message
    });
  }
};

module.exports = {
  sendMoneyToBeneficiary,
  getTransferHistory,
  getBeneficiariesList,
  getTransferInfo,
  debugTransferData,
  splitFundsAmongSubAccounts // Export for testing and reuse
};
