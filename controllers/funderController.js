const db = require('../models');
const sequelize = db.sequelize;

exports.linkDependent = async (req, res) => {
  try {
    const funderId = req.user.id;
    console.log("Request body:", req.body);
    
    const { customName, accountNumber } = req.body;
    console.log("Custom name:", customName);
    console.log("Account number:", accountNumber);
    
    // Find dependent by account number (more reliable than name matching)
    const dependent = await db.User.findOne({
      where: { role: 'dependent' },
      include: [{
        model: db.Account,
        as: 'accounts',
        where: { accountNumber }
      }]
    });

    if (!dependent) {
      return res.status(404).json({ 
        success: false,
        message: 'Dependent not found with that account number' 
      });
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

    // Check balance
    if (parseFloat(funderAccount.balance) < transferAmount) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Insufficient funds' 
      });
    }

    // Get beneficiary account
    const beneficiaryAccount = await db.Account.findOne({
      where: { userId: beneficiaryUserId, accountType: accountType },
      transaction
    });

    if (!beneficiaryAccount) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: 'Beneficiary account not found' 
      });
    }

    // Perform transfer
    await funderAccount.decrement('balance', { 
      by: transferAmount, 
      transaction 
    });
    
    await beneficiaryAccount.increment('balance', { 
      by: transferAmount, 
      transaction 
    });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        amount: transferAmount,
        currency: currency,
        targetAccountType: accountType,
        funder: {
          userId: funderId,
          newBalance: parseFloat(funderAccount.balance) - transferAmount
        },
        beneficiary: {
          userId: beneficiaryUserId,
          accountType: accountType
        }
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

// Get funder account balance
exports.getBalance = async (req, res) => {
  try {
    const funderId = req.user.id;

    const funderAccount = await db.Account.findOne({
      where: { userId: funderId, accountType: 'Main' }
    });

    if (!funderAccount) {
      return res.status(404).json({ message: 'Funder account not found' });
    }

    res.json({
      balance: parseFloat(funderAccount.balance),
      currency: 'ZAR',
      accountNumber: funderAccount.accountNumber
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};