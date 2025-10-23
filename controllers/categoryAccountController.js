const { Account, User } = require('../models');

// Get user's category account balances
const getCategoryBalances = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user with all accounts
    const user = await User.findOne({
      where: { id: userId, role: 'dependent', status: 'active' },
      include: [{
        model: Account,
        as: 'Accounts',
        attributes: ['id', 'balance', 'status', 'category', 'isMainAccount', 'accountName'],
        where: { status: 'active' }
      }]
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Only active dependents can view category balances'
      });
    }

    if (!user.Accounts || user.Accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No accounts found for user'
      });
    }

    // Separate main account from category accounts
    let mainAccount = null;
    const categoryAccounts = [];
    let totalCategoryBalance = 0;

    user.Accounts.forEach(account => {
      if (account.isMainAccount) {
        mainAccount = account;
      } else if (account.category) {
        categoryAccounts.push({
          id: account.id,
          category: account.category,
          balance: parseFloat(account.balance),
          accountName: account.accountName,
          status: account.status
        });
        totalCategoryBalance += parseFloat(account.balance);
      }
    });

    // Sort category accounts alphabetically
    categoryAccounts.sort((a, b) => a.category.localeCompare(b.category));

    res.json({
      success: true,
      data: {
        mainAccount: mainAccount ? {
          id: mainAccount.id,
          balance: parseFloat(mainAccount.balance),
          accountName: mainAccount.accountName,
          status: mainAccount.status
        } : null,
        categoryAccounts,
        summary: {
          totalCategoryBalance,
          totalAccounts: categoryAccounts.length,
          categories: categoryAccounts.map(acc => acc.category)
        }
      }
    });

  } catch (error) {
    console.error('Get category balances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category balances',
      error: error.message
    });
  }
};

// Get specific category account details
const getCategoryAccount = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.id;

    const account = await Account.findOne({
      where: { 
        userId, 
        category: category.toLowerCase(), 
        isMainAccount: false,
        status: 'active'
      },
      include: [{
        model: User,
        as: 'User',
        attributes: ['firstName', 'surname', 'email']
      }]
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: `${category} account not found`
      });
    }

    res.json({
      success: true,
      data: {
        id: account.id,
        category: account.category,
        balance: parseFloat(account.balance),
        accountName: account.accountName,
        status: account.status,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        user: account.User
      }
    });

  } catch (error) {
    console.error('Get category account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category account',
      error: error.message
    });
  }
};

// Transfer funds between category accounts
const transferBetweenCategories = async (req, res) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const { fromCategory, toCategory, amount, description } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!fromCategory || !toCategory || !amount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'From category, to category, and amount are required'
      });
    }

    if (fromCategory === toCategory) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same category'
      });
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Transfer amount must be greater than 0'
      });
    }

    // Get source account
    const fromAccount = await Account.findOne({
      where: { 
        userId, 
        category: fromCategory.toLowerCase(), 
        isMainAccount: false,
        status: 'active'
      },
      transaction
    });

    if (!fromAccount) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Source account (${fromCategory}) not found`
      });
    }

    // Get destination account
    const toAccount = await Account.findOne({
      where: { 
        userId, 
        category: toCategory.toLowerCase(), 
        isMainAccount: false,
        status: 'active'
      },
      transaction
    });

    if (!toAccount) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Destination account (${toCategory}) not found`
      });
    }

    // Check sufficient balance
    const fromBalance = parseFloat(fromAccount.balance);
    if (fromBalance < transferAmount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds in source account',
        data: {
          available: fromBalance,
          requested: transferAmount,
          shortfall: transferAmount - fromBalance
        }
      });
    }

    // Perform transfer
    const newFromBalance = fromBalance - transferAmount;
    const newToBalance = parseFloat(toAccount.balance) + transferAmount;

    await fromAccount.update({ balance: newFromBalance }, { transaction });
    await toAccount.update({ balance: newToBalance }, { transaction });

    // Create transaction records
    const transferRef = `TRANSFER_${Date.now()}`;
    const transferDescription = description || `Transfer from ${fromCategory} to ${toCategory}`;

    await require('../models').Transaction.bulkCreate([
      {
        userId,
        accountId: fromAccount.id,
        type: 'debit',
        amount: transferAmount,
        description: `${transferDescription} (Outgoing)`,
        category: 'transfer',
        status: 'completed',
        reference: transferRef,
        balanceAfter: newFromBalance
      },
      {
        userId,
        accountId: toAccount.id,
        type: 'credit',
        amount: transferAmount,
        description: `${transferDescription} (Incoming)`,
        category: 'transfer',
        status: 'completed',
        reference: transferRef,
        balanceAfter: newToBalance
      }
    ], { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        transfer: {
          from: {
            category: fromCategory,
            previousBalance: fromBalance,
            newBalance: newFromBalance
          },
          to: {
            category: toCategory,
            previousBalance: parseFloat(toAccount.balance) - transferAmount,
            newBalance: newToBalance
          },
          amount: transferAmount,
          reference: transferRef,
          description: transferDescription
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Transfer between categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process transfer',
      error: error.message
    });
  }
};

module.exports = {
  getCategoryBalances,
  getCategoryAccount,
  transferBetweenCategories
};
