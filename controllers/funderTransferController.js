const { User, Account, Transaction, FunderDependent, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Transfer funds from funder account to beneficiary account
 */
exports.transferToBeneficiary = async (req, res) => {
  // Check validation results from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const transaction = await sequelize.transaction();
  
  try {
    const { beneficiaryId, accountNumber, amount, description = '' } = req.body;
    const funderId = req.user.id;

    // Log the request body for debugging
    console.log('Transfer request received:', {
      beneficiaryId,
      accountNumber,
      amount,
      description,
      funderId
    });

    // Validate beneficiaryId
    if (!beneficiaryId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Beneficiary ID is required'
      });
    }

    // Validate accountNumber
    if (!accountNumber) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Account number is required'
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid transfer amount'
      });
    }

    // Verify beneficiary relationship
    const relationship = await FunderDependent.findOne({
      where: {
        funderId: funderId,
        dependentId: beneficiaryId
      }
    });

    if (!relationship) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to transfer to this beneficiary'
      });
    }

    // Get funder's main account
    const funderAccount = await Account.findOne({
      where: {
        userId: funderId,
        accountType: 'Main'
      },
      transaction
    });

    if (!funderAccount) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Funder account not found'
      });
    }

    // Check sufficient balance
    const funderBalance = parseFloat(funderAccount.balance);
    if (funderBalance < amount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Available: ZAR ${funderBalance.toFixed(2)}, Requested: ZAR ${amount.toFixed(2)}`
      });
    }

    // Get target beneficiary account by account number
    // We already verified the funder-beneficiary relationship above
    const beneficiaryAccount = await Account.findOne({
      where: {
        accountNumber: accountNumber,
        userId: beneficiaryId
      },
      transaction
    });

    if (!beneficiaryAccount) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Beneficiary account not found'
      });
    }

    // Perform the transfer
    const newFunderBalance = funderBalance - amount;
    const newBeneficiaryBalance = parseFloat(beneficiaryAccount.balance) + amount;

    // Update balances
    await funderAccount.update(
      { balance: newFunderBalance },
      { transaction }
    );

    await beneficiaryAccount.update(
      { balance: newBeneficiaryBalance },
      { transaction }
    );

    // Create transaction records with unique references
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const baseReference = `TRF-${timestamp}-${randomSuffix}`;
    const debitReference = `${baseReference}-OUT`;
    const creditReference = `${baseReference}-IN`;

    // Funder debit transaction (using existing Debit type)
    await Transaction.create({
      accountId: funderAccount.id,
      type: 'Debit',
      amount: amount, // Keep amount positive for now
      description: `Transfer to ${beneficiaryAccount.accountType} account - ${description}`,
      reference: debitReference
    }, { transaction });

    // Beneficiary credit transaction (using existing Credit type)
    await Transaction.create({
      accountId: beneficiaryAccount.id,
      type: 'Credit',
      amount: amount,
      description: `Transfer from funder - ${description}`,
      reference: creditReference
    }, { transaction });

    // Check if we should auto-distribute funds to category accounts
    let distributionDetails = null;
    if (beneficiaryAccount.accountType === 'Main') {
      try {
        distributionDetails = await distributeToCategories(
          beneficiaryAccount, 
          amount, 
          funderId, 
          baseReference, 
          transaction
        );
      } catch (distributionError) {
        console.error('Auto-distribution failed:', distributionError);
        // Continue without distribution - transfer still succeeded
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        transferReference: baseReference,
        debitReference: debitReference,
        creditReference: creditReference,
        amount: amount,
        currency: 'ZAR',
        funder: {
          accountId: funderAccount.id,
          newBalance: newFunderBalance
        },
        beneficiary: {
          accountId: beneficiaryAccount.id,
          accountName: beneficiaryAccount.accountType, // Account name same as account type
          accountType: beneficiaryAccount.accountType,
          newBalance: newBeneficiaryBalance
        },
        autoDistribution: distributionDetails
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Transfer to beneficiary error:', error);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to complete transfer';
    if (error.name === 'SequelizeValidationError') {
      errorMessage = 'Data validation failed: ' + error.errors.map(e => e.message).join(', ');
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Duplicate reference error - please try again';
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      errorMessage = 'Invalid account reference';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        stack: error.stack
      } : undefined
    });
  }
};

/**
 * Get transfer history for a funder
 */
exports.getTransferHistory = async (req, res) => {
  // Check validation results from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const funderId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // Get funder's main account
    const funderAccount = await Account.findOne({
      where: {
        userId: funderId,
        accountType: 'Main'
      }
    });

    if (!funderAccount) {
      return res.status(404).json({
        success: false,
        message: 'Funder account not found'
      });
    }

    // Get transfer transactions (using existing types)
    const offset = (page - 1) * limit;
    const transfers = await Transaction.findAndCountAll({
      where: {
        accountId: funderAccount.id,
        type: ['Debit', 'Credit']
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      attributes: ['id', 'type', 'amount', 'description', 'reference', 'createdAt']
    });

    res.json({
      success: true,
      data: {
        transfers: transfers.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transfers.count / limit),
          totalTransfers: transfers.count,
          hasMore: offset + transfers.rows.length < transfers.count
        }
      }
    });

  } catch (error) {
    console.error('Get transfer history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transfer history',
      error: error.message
    });
  }
};

/**
 * Helper function to distribute funds to category accounts automatically
 * This ensures consistent allocation across all income sources
 */
const distributeToCategories = async (mainAccount, amount, funderId, transferReference, transaction) => {
  try {
    // Get all category accounts for this user (using accountType instead of category field)
    const categoryAccounts = await Account.findAll({
      where: {
        userId: mainAccount.userId,
        accountType: {
          [Op.in]: ['Healthcare', 'Education', 'Entertainment', 'Groceries', 'Transport', 'Clothing', 'Baby Care', 'Pregnancy']
        },
        status: 'active'
      },
      transaction
    });

    if (categoryAccounts.length === 0) {
      return null; // No category accounts to distribute to
    }

    // Define distribution percentages based on importance/priority
    // 80% distributed to categories, 20% kept in Main account as emergency savings
    const categoryAllocations = {
      'Healthcare': 0.20,    // 20% - Medical needs (highest priority)
      'Groceries': 0.16,     // 16% - Food & essentials (survival needs)
      'Education': 0.16,     // 16% - Learning & development (future)
      'Transport': 0.08,     // 8%  - Mobility & access (daily needs)
      'Entertainment': 0.04, // 4%  - Recreation & quality of life
      'Clothing': 0.04,      // 4%  - Clothing & personal items
      'Baby Care': 0.04,     // 4%  - Baby/child care needs
      'Pregnancy': 0.08      // 8%  - Pregnancy-related expenses (increased)
    };
    
    // Emergency fund: 20% stays in Main account
    const emergencyFundPercentage = 0.20;

    // Distribute funds to each category
    const distributions = [];
    let totalDistributed = 0;
    
    for (const categoryAccount of categoryAccounts) {
      const percentage = categoryAllocations[categoryAccount.accountType] || 0;
      if (percentage > 0) {
        const allocatedAmount = Math.round(amount * percentage * 100) / 100;
        const newCategoryBalance = parseFloat(categoryAccount.balance) + allocatedAmount;

        // Update category account balance
        await categoryAccount.update({ 
          balance: newCategoryBalance,
          lastTransactionDate: new Date()
        }, { transaction });

        // Create transaction record for category allocation
        const distributionReference = `${transferReference}-DIST-${categoryAccount.accountType.toUpperCase()}-${Date.now()}`;
        await Transaction.create({
          accountId: categoryAccount.id,
          type: 'Credit',
          amount: allocatedAmount,
          description: `Auto-allocation from transfer (${Math.round(percentage * 100)}%) - ${transferReference}`,
          reference: distributionReference
        }, { transaction });

        distributions.push({
          category: categoryAccount.accountType,
          accountId: categoryAccount.id,
          percentage: Math.round(percentage * 100),
          amount: allocatedAmount,
          newBalance: newCategoryBalance
        });

        totalDistributed += allocatedAmount;
      }
    }

    // Calculate emergency fund amount (20% stays in Main account)
    const emergencyFundAmount = Math.round(amount * emergencyFundPercentage * 100) / 100;
    const newMainBalance = parseFloat(mainAccount.balance) + emergencyFundAmount;
    
    // Update main account balance to keep emergency fund
    await mainAccount.update({ 
      balance: newMainBalance,
      lastTransactionDate: new Date()
    }, { transaction });
    
    // Create transaction record for emergency fund
    const emergencyFundReference = `${transferReference}-EMERGENCY-${Date.now()}`;
    await Transaction.create({
      accountId: mainAccount.id,
      type: 'Credit',
      amount: emergencyFundAmount,
      description: `Emergency fund allocation (${Math.round(emergencyFundPercentage * 100)}%) - ${transferReference}`,
      reference: emergencyFundReference
    }, { transaction });

    return {
      enabled: true,
      totalAmount: amount,
      totalDistributed: totalDistributed,
      emergencyFund: {
        amount: emergencyFundAmount,
        percentage: Math.round(emergencyFundPercentage * 100),
        newMainBalance: newMainBalance
      },
      distributionReference: `${transferReference}-AUTODIST`,
      categories: distributions
    };

  } catch (error) {
    console.error('Error in distributeToCategories:', error);
    throw error;
  }
};
