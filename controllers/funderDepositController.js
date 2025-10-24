const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, Account, Transaction, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Create Stripe Payment Intent for Funder Deposit
 */
exports.createDepositIntent = async (req, res) => {
  try {
    const { amount, currency = 'zar' } = req.body;
    const funderId = req.user.id;

    // Validate amount (minimum R10.00)
    if (!amount || amount < 1000) { // Stripe uses cents, so 1000 = R10.00
      return res.status(400).json({
        success: false,
        message: 'Minimum deposit amount is R10.00'
      });
    }

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

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency,
      metadata: {
        funderId: funderId.toString(),
        accountId: funderAccount.id.toString(),
        type: 'funder_deposit'
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        accountId: funderAccount.id
      }
    });

  } catch (error) {
    console.error('Create deposit intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create deposit intent',
      error: error.message
    });
  }
};

/**
 * Confirm Deposit and Update Account Balance
 */
exports.confirmDeposit = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { paymentIntentId } = req.body;
    const funderId = req.user.id;

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Verify the payment belongs to this funder
    if (paymentIntent.metadata.funderId !== funderId.toString()) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Payment does not belong to this user'
      });
    }

    // Get funder's account
    const funderAccount = await Account.findByPk(
      paymentIntent.metadata.accountId,
      { transaction }
    );

    if (!funderAccount) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Calculate amount in Rand (Stripe amount is in cents)
    const depositAmount = paymentIntent.amount / 100;

    // Update account balance
    const newBalance = parseFloat(funderAccount.balance) + depositAmount;
    await funderAccount.update(
      { balance: newBalance },
      { transaction }
    );

    // Create transaction record (using existing Credit type)
    await Transaction.create({
      accountId: funderAccount.id,
      type: 'Credit',
      amount: depositAmount,
      description: `Stripe deposit - ${paymentIntentId}`,
      reference: paymentIntentId
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Deposit confirmed successfully',
      data: {
        amount: depositAmount,
        newBalance: newBalance,
        currency: 'ZAR',
        paymentIntentId: paymentIntentId
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

/**
 * Get Funder Account Balance and Transaction History
 */
exports.getFunderAccount = async (req, res) => {
  try {
    const funderId = req.user.id;

    // Get funder's main account with recent transactions
    const funderAccount = await Account.findOne({
      where: {
        userId: funderId,
        accountType: 'Main'
      },
      include: [
        {
          model: Transaction,
          as: 'transactions',
          limit: 10,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'type', 'amount', 'description', 'createdAt']
        }
      ]
    });

    if (!funderAccount) {
      return res.status(404).json({
        success: false,
        message: 'Funder account not found'
      });
    }

    res.json({
      success: true,
      data: {
        accountId: funderAccount.id,
        accountNumber: funderAccount.accountNumber,
        accountType: funderAccount.accountType,
        balance: `ZAR ${parseFloat(funderAccount.balance || 0).toFixed(2)}`,
        rawBalance: parseFloat(funderAccount.balance || 0),
        transactions: funderAccount.transactions || []
      }
    });

  } catch (error) {
    console.error('Get funder account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve account information',
      error: error.message
    });
  }
};
