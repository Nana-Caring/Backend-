const db = require('../models');
const sequelize = db.sequelize;
const { createFundTransfer, createEnhancedTransaction } = require('../utils/enhancedTransactionUtils');

exports.linkDependent = async (req, res) => {
  try {
    const funderId = req.user.id;
    console.log("Request body:", req.body);
    
    const { customName, accountNumber } = req.body;
    console.log("Custom name:", customName);
    console.log("Account number:", accountNumber);
    
    // Find dependent by name and account number - completely avoid Sequelize associations
    const nameParts = dependentName.split(' ');
    const firstName = nameParts[0];
    const surname = nameParts[nameParts.length - 1];
    
    console.log('Searching for user with firstName:', firstName, 'surname:', surname);
    console.log('Looking for account number:', accountNumber);
    
    // Use raw SQL to avoid Sequelize association issues completely
    const userQuery = `
      SELECT u.* FROM "Users" u 
      WHERE u."firstName" = ? AND u."surname" = ? AND u."role" = 'dependent'
    `;
    
    const users = await sequelize.query(userQuery, {
      replacements: [firstName, surname],
      type: sequelize.QueryTypes.SELECT
    });

    if (users.length === 0) {
      console.log('User not found with name:', dependentName);
      return res.status(404).json({ message: `User with name ${dependentName} not found` });
    }

    const dependent = users[0];
    console.log('Found user:', dependent.id, dependent.firstName, dependent.surname);

    // Find the account using raw SQL
    const accountQuery = `
      SELECT a.* FROM "Accounts" a 
      WHERE a."userId" = ? AND a."accountNumber" = ?
    `;
    
    const accounts = await sequelize.query(accountQuery, {
      replacements: [dependent.id, accountNumber],
      type: sequelize.QueryTypes.SELECT
    });

    if (accounts.length === 0) {
      console.log('Account not found for user with account number:', accountNumber);
      return res.status(404).json({ message: `Account number ${accountNumber} not found for this user` });
    }

    const account = accounts[0];
    console.log('Found account:', account.id, account.accountNumber, account.accountType);

    // Check if already linked
    const existingLinkQuery = `
      SELECT * FROM "FunderDependents" 
      WHERE "funderId" = ? AND "dependentId" = ?
    `;
    
    const existingLinks = await sequelize.query(existingLinkQuery, {
      replacements: [funderId, dependent.id],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingLinks.length > 0) {
      return res.status(400).json({ message: 'This dependent is already linked to your account' });
    }

    // Check if already linked
    const existingLink = await db.FunderDependent.findOne({
      where: {
        funderId: funderId,
        dependentId: dependent.id
      }
    });

    if (existingLink) {
      return res.status(400).json({ 
        success: false,
        message: 'This dependent is already linked to your account',
        data: {
          customName: existingLink.customName,
          dependentName: `${dependent.firstName} ${dependent.surname}`,
          accountNumber: accountNumber
        }
      });
    }

    // Create link with custom name
    const newLink = await db.FunderDependent.create({
      funderId: funderId,
      dependentId: dependent.id,
      customName: customName
    });

    res.json({ 
      success: true,
      message: 'Dependent linked successfully with custom name',
      data: {
        linkId: newLink.id,
        customName: customName,
        dependentName: `${dependent.firstName} ${dependent.surname}`,
        accountNumber: accountNumber
      }
    });

  } catch (error) {
    console.error('Link dependent error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Search dependent by custom name for transfers
exports.searchDependentByCustomName = async (req, res) => {
  try {
    const funderId = req.user.id;
    const { customName } = req.query;

    if (!customName) {
      return res.status(400).json({
        success: false,
        message: 'Custom name is required for search'
      });
    }

    // Find dependent by custom name in FunderDependent relationship
    const relationship = await db.FunderDependent.findOne({
      where: {
        funderId: funderId,
        customName: customName
      },
      include: [{
        model: db.User,
        as: 'dependent',
        attributes: ['id', 'firstName', 'surname', 'email'],
        include: [{
          model: db.Account,
          as: 'accounts',
          attributes: ['id', 'accountNumber', 'accountType', 'balance']
        }]
      }]
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: `No dependent found with custom name "${customName}"`
      });
    }

    const dependent = relationship.dependent;
    
    res.json({
      success: true,
      message: 'Dependent found by custom name',
      data: {
        customName: relationship.customName,
        dependent: {
          id: dependent.id,
          firstName: dependent.firstName,
          surname: dependent.surname,
          email: dependent.email,
          accounts: dependent.accounts.map(account => ({
            id: account.id,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            balance: parseFloat(account.balance || 0).toFixed(2)
          }))
        }
      }
    });

  } catch (error) {
    console.error('Search dependent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Transfer funds to beneficiary with smart distribution
exports.transferToBeneficiary = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const funderId = req.user.id;
    const { beneficiaryUserId, accountType, amount, currency = 'ZAR', description } = req.body;

    console.log('🧠 Smart Transfer Request:', { beneficiaryUserId, accountType, amount, description });

    // Validate required fields
    if (!beneficiaryUserId || !accountType || !amount) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Missing required fields: beneficiaryUserId, accountType, amount' 
      });
    }

    // Validate amount
    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Transfer amount must be greater than 0' 
      });
    }

    // Check if beneficiary is linked to this funder
    const linkExists = await sequelize.query(
      'SELECT * FROM "FunderDependents" WHERE "funderId" = ? AND "dependentId" = ?',
      {
        replacements: [funderId, beneficiaryUserId],
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    res.json({ message: 'Dependent linked successfully! Emergency fund system activated with 20% allocation.' });
  } catch (error) {
    console.error('Link dependent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Transfer funds to beneficiary with smart distribution
exports.transferToBeneficiary = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const funderId = req.user.id;
    const { beneficiaryUserId, accountType, amount, currency = 'ZAR', description } = req.body;

    console.log('🧠 Smart Transfer Request:', { beneficiaryUserId, accountType, amount, description });

    // Validate required fields
    if (!beneficiaryUserId || !accountType || !amount) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Missing required fields: beneficiaryUserId, accountType, amount' 
      });
    }

    // Validate amount
    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Transfer amount must be greater than 0' 
      });
    }

    // Check if beneficiary is linked to this funder
    const linkExists = await sequelize.query(
      'SELECT * FROM "FunderDependents" WHERE "funderId" = ? AND "dependentId" = ?',
      {
        replacements: [funderId, beneficiaryUserId],
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    if (linkExists.length === 0) {
      await transaction.rollback();
      return res.status(403).json({ 
        message: 'You are not authorized to transfer to this beneficiary' 
      });
    }

    // Get funder's account
    const funderAccount = await db.Account.findOne({
      where: { userId: funderId, accountType: 'Main' },
      transaction
    });

    if (!funderAccount) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: 'Funder account not found' 
      });
    }

    // Check sufficient balance
    if (parseFloat(funderAccount.balance) < transferAmount) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Insufficient funds. Available: R${parseFloat(funderAccount.balance).toFixed(2)}` 
      });
    }

    // Generate unique transfer reference
    const baseReference = `TRF-${Date.now()}-${funderId}-${beneficiaryUserId}`;
    
    let distributionDetails = null;

    // SMART DISTRIBUTION LOGIC: Main account triggers auto-distribution
    if (accountType === 'Main') {
      console.log('🧠 Main account transfer detected - activating smart distribution');
      
      // Get beneficiary's Main account
      const mainAccount = await db.Account.findOne({
        where: { userId: beneficiaryUserId, accountType: 'Main' },
        transaction
      });

      if (!mainAccount) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: 'Beneficiary Main account not found' 
        });
      }

      // Get all category accounts for distribution
      const categoryAccounts = await db.Account.findAll({
        where: {
          userId: beneficiaryUserId,
          accountType: {
            [db.Sequelize.Op.in]: ['Healthcare', 'Education', 'Groceries', 'Transport', 'Entertainment', 'Clothing', 'Baby Care', 'Pregnancy']
          },
          status: 'active'
        },
        transaction
      });

      console.log(`📊 Found ${categoryAccounts.length} category accounts for distribution`);

      // Distribution percentages (80% distributed, 20% emergency fund)
      const emergencyFundPercentage = 0.20; // 20% stays in Main account
      const categoryAllocations = {
        'Healthcare': 0.20,    // 20% of total transfer
        'Groceries': 0.16,     // 16% of total transfer  
        'Education': 0.16,     // 16% of total transfer
        'Transport': 0.08,     // 8% of total transfer
        'Pregnancy': 0.08,     // 8% of total transfer
        'Entertainment': 0.04, // 4% of total transfer
        'Clothing': 0.04,      // 4% of total transfer
        'Baby Care': 0.04      // 4% of total transfer
      };

      // Calculate emergency fund (stays in Main account)
      const emergencyFundAmount = Math.round(transferAmount * emergencyFundPercentage * 100) / 100;
      
      // Deduct from funder
      await funderAccount.decrement('balance', { 
        by: transferAmount, 
        transaction 
      });

      // Add emergency fund to Main account
      await mainAccount.increment('balance', { 
        by: emergencyFundAmount, 
        transaction 
      });

      // Create fund transfer transaction for emergency fund
      await createFundTransfer({
        fromAccountId: funderAccount.id,
        toAccountId: mainAccount.id,
        amount: emergencyFundAmount,
        description: `Emergency fund allocation (${Math.round(emergencyFundPercentage * 100)}%)`,
        category: 'emergency_fund',
        baseReference: `${baseReference}-EMERGENCY`
      }, transaction);

      // Distribute to category accounts
      const distributions = [];
      let totalDistributed = emergencyFundAmount;

      for (const categoryAccount of categoryAccounts) {
        const percentage = categoryAllocations[categoryAccount.accountType] || 0;
        if (percentage > 0) {
          const allocatedAmount = Math.round(transferAmount * percentage * 100) / 100;
          
          // Add to category account
          await categoryAccount.increment('balance', { 
            by: allocatedAmount, 
            transaction 
          });

          // Create transfer transaction
          await createFundTransfer({
            fromAccountId: funderAccount.id,
            toAccountId: categoryAccount.id,
            amount: allocatedAmount,
            description: `Smart distribution to ${categoryAccount.accountType} (${Math.round(percentage * 100)}%)`,
            category: 'smart_distribution',
            baseReference: `${baseReference}-${categoryAccount.accountType.toUpperCase()}`
          }, transaction);

          distributions.push({
            category: categoryAccount.accountType,
            accountId: categoryAccount.id,
            percentage: Math.round(percentage * 100),
            amount: allocatedAmount,
            newBalance: parseFloat(categoryAccount.balance) + allocatedAmount
          });

          totalDistributed += allocatedAmount;
        }
      }

      distributionDetails = {
        enabled: true,
        totalAmount: transferAmount,
        totalDistributed,
        emergencyFund: {
          amount: emergencyFundAmount,
          percentage: Math.round(emergencyFundPercentage * 100),
          newMainBalance: parseFloat(mainAccount.balance) + emergencyFundAmount
        },
        distributionReference: `${baseReference}-AUTODIST`,
        categories: distributions
      };

    } else {
      // DIRECT TRANSFER: Transfer directly to specified category account
      console.log(`💰 Direct transfer to ${accountType} account`);
      
      const targetAccount = await db.Account.findOne({
        where: { 
          userId: beneficiaryUserId, 
          accountType: accountType 
        },
        transaction
      });

      if (!targetAccount) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: `${accountType} account not found for beneficiary` 
        });
      }

      // Simple transfer using enhanced transaction utils
      
      // Deduct from funder
      await funderAccount.decrement('balance', { 
        by: transferAmount, 
        transaction 
      });

      // Add to target account
      await targetAccount.increment('balance', { 
        by: transferAmount, 
        transaction 
      });

      // Create transfer transactions
      await createFundTransfer({
        fromAccountId: funderAccount.id,
        toAccountId: targetAccount.id,
        amount: transferAmount,
        description: description || `Direct transfer to ${accountType} account`,
        category: 'fund_transfer',
        baseReference: baseReference
      }, transaction);
    }

    await transaction.commit();

    // Fetch updated balances
    await funderAccount.reload();
    
    res.json({ 
      success: true,
      message: accountType === 'Main' ? 
        'Transfer completed successfully with automatic distribution' : 
        'Transfer completed successfully',
      data: {
        transferReference: baseReference,
        amount: transferAmount,
        currency: currency,
        targetAccountType: accountType,
        funder: {
          userId: funderId,
          name: req.user.name || 'Funder',
          newBalance: parseFloat(funderAccount.balance)
        },
        beneficiary: {
          userId: beneficiaryUserId,
          accountType: accountType
        },
        autoDistribution: distributionDetails
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Transfer error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Transfer failed', 
      error: error.message 
    });
  }
};

// Get funder balance
exports.getBalance = async (req, res) => {
  try {
    const funderId = req.user.id;

    const funderAccount = await db.Account.findOne({
      where: { userId: funderId, accountType: 'Main' }
    });

    if (!funderAccount) {
      return res.status(404).json({ 
        message: 'Funder account not found' 
      });
    }

    res.json({
      success: true,
      balance: parseFloat(funderAccount.balance),
      currency: funderAccount.currency || 'ZAR',
      accountNumber: funderAccount.accountNumber
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Failed to get balance', error: error.message });
  }
};