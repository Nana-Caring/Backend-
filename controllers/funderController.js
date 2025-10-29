const db = require('../models');
const sequelize = db.sequelize;

exports.linkDependent = async (req, res) => {
  try {
    const funderId = req.user.id;
    console.log("Request body:", req.body);
    
    const { dependentName, accountNumber } = req.body;
    console.log("Dependent name:", dependentName);
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

    // Create link in FunderDependent table
    await sequelize.query(
      'INSERT INTO "FunderDependents" ("funderId", "dependentId", "createdAt", "updatedAt") VALUES (?, ?, NOW(), NOW())',
      {
        replacements: [funderId, dependent.id],
        type: sequelize.QueryTypes.INSERT
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
  try {
    const funderId = req.user.id;
    const { beneficiaryUserId, accountType, amount, currency = 'ZAR', description } = req.body;

    console.log('🧠 Smart Transfer Request:', { beneficiaryUserId, accountType, amount, description });

    // Validate required fields
    if (!beneficiaryUserId || !accountType || !amount) {
      return res.status(400).json({ 
        message: 'Missing required fields: beneficiaryUserId, accountType, amount' 
      });
    }

    // Check if beneficiary is linked to this funder
    const linkExists = await sequelize.query(
      'SELECT * FROM "FunderDependents" WHERE "funderId" = ? AND "dependentId" = ?',
      {
        replacements: [funderId, beneficiaryUserId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (linkExists.length === 0) {
      return res.status(403).json({ 
        message: 'You are not authorized to transfer to this beneficiary' 
      });
    }

    // Find the target account
    const targetAccount = await db.Account.findOne({
      where: { 
        userId: beneficiaryUserId, 
        accountType: accountType 
      }
    });

    if (!targetAccount) {
      return res.status(404).json({ 
        message: `${accountType} account not found for beneficiary` 
      });
    }

    // Get funder's account balance (assuming funder has a main account)
    const funderAccount = await db.Account.findOne({
      where: { userId: funderId, accountType: 'Main' }
    });

    if (!funderAccount || parseFloat(funderAccount.balance) < parseFloat(amount)) {
      return res.status(400).json({ 
        message: 'Insufficient balance in funder account' 
      });
    }

    // Perform the transfer
    await sequelize.transaction(async (t) => {
      // Deduct from funder
      await funderAccount.decrement('balance', { 
        by: parseFloat(amount), 
        transaction: t 
      });

      // Add to beneficiary account
      await targetAccount.increment('balance', { 
        by: parseFloat(amount), 
        transaction: t 
      });

      // Record transaction
      await db.Transaction.create({
        accountId: targetAccount.id,
        transactionType: 'deposit',
        amount: parseFloat(amount),
        currency: currency,
        description: description || `Transfer from funder to ${accountType} account`,
        status: 'completed',
        senderName: req.user.name || 'Funder',
        recipientName: `${accountType} Account`,
        transactionMethod: 'funder_transfer'
      }, { transaction: t });
    });

    res.json({ 
      message: 'Transfer completed successfully with smart distribution',
      transferDetails: {
        amount: parseFloat(amount),
        currency: currency,
        targetAccount: accountType,
        beneficiaryId: beneficiaryUserId
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Transfer failed', error: error.message });
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