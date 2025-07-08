const db = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = db.User;
const BankAccount = db.BankAccount;

// Create or get Stripe customer for user
const createStripeCustomer = async (user) => {
  try {
    if (user.stripeCustomerId) {
      // Verify customer exists in Stripe
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        return customer;
      } catch (error) {
        console.log('Stripe customer not found, creating new one');
      }
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.surname}`,
      metadata: {
        userId: user.id.toString(),
        role: user.role
      }
    });

    // Update user with Stripe customer ID
    await user.update({ stripeCustomerId: customer.id });

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create Stripe customer');
  }
};

// Add bank account or card
const addBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      accountName, 
      bankName, 
      accountNumber, 
      accountType, 
      routingNumber,
      cardNumber,
      expiryDate,
      ccv
    } = req.body;

    // Validate required fields based on account type
    if (!accountName) {
      return res.status(400).json({ 
        error: 'Account name is required' 
      });
    }

    // Check if it's a card or bank account
    const isCard = accountType === 'card' || cardNumber;
    
    if (isCard) {
      // Card validation
      if (!cardNumber || !expiryDate || !ccv) {
        return res.status(400).json({ 
          error: 'Card number, expiry date, and CCV are required for card payments' 
        });
      }
      
      // Validate expiry date format (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        return res.status(400).json({ 
          error: 'Expiry date must be in MM/YY format' 
        });
      }
      
      // Check if card already exists
      const existingCard = await BankAccount.findOne({
        where: {
          userId,
          cardNumber: cardNumber.slice(-4), // Store only last 4 digits
          accountType: 'card'
        }
      });

      if (existingCard) {
        return res.status(409).json({ 
          error: 'Card already exists' 
        });
      }
    } else {
      // Bank account validation
      if (!bankName || !accountNumber) {
        return res.status(400).json({ 
          error: 'Bank name and account number are required for bank accounts' 
        });
      }
      
      // Check if bank account already exists
      const existingAccount = await BankAccount.findOne({
        where: {
          userId,
          accountNumber,
          bankName
        }
      });

      if (existingAccount) {
        return res.status(409).json({ 
          error: 'Bank account already exists' 
        });
      }
    }

    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or get Stripe customer
    const stripeCustomer = await createStripeCustomer(user);

    // Create bank account/card record
    const paymentMethodData = {
      userId,
      accountName,
      accountType: isCard ? 'card' : (accountType || 'checking'),
      verificationStatus: 'pending'
    };

    if (isCard) {
      // For cards, store only last 4 digits of card number
      paymentMethodData.cardNumber = cardNumber.slice(-4);
      paymentMethodData.expiryDate = expiryDate;
      // Don't store CCV for security
      paymentMethodData.bankName = 'Card Payment';
    } else {
      paymentMethodData.bankName = bankName;
      paymentMethodData.accountNumber = accountNumber;
      paymentMethodData.routingNumber = routingNumber;
    }

    const bankAccount = await BankAccount.create(paymentMethodData);

    // If this is the first payment method, make it default
    const userPaymentMethods = await BankAccount.findAll({ where: { userId } });
    if (userPaymentMethods.length === 1) {
      await bankAccount.update({ isDefault: true });
    }

    // Prepare response
    const response = {
      id: bankAccount.id,
      accountName: bankAccount.accountName,
      accountType: bankAccount.accountType,
      isDefault: bankAccount.isDefault,
      verificationStatus: bankAccount.verificationStatus,
      createdAt: bankAccount.createdAt
    };

    if (isCard) {
      response.cardNumber = `****${bankAccount.cardNumber}`;
      response.expiryDate = bankAccount.expiryDate;
      response.bankName = 'Card Payment';
    } else {
      response.bankName = bankAccount.bankName;
      response.accountNumber = `****${accountNumber.slice(-4)}`;
    }

    res.status(201).json({
      message: `${isCard ? 'Card' : 'Bank account'} added successfully`,
      bankAccount: response
    });

  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
};

// Get user's payment methods (bank accounts and cards)
const getBankAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const paymentMethods = await BankAccount.findAll({
      where: { 
        userId,
        isActive: true 
      },
      order: [['isDefault', 'DESC'], ['createdAt', 'ASC']]
    });

    const maskedPaymentMethods = paymentMethods.map(method => {
      const baseResponse = {
        id: method.id,
        accountName: method.accountName,
        accountType: method.accountType,
        isDefault: method.isDefault,
        verificationStatus: method.verificationStatus,
        createdAt: method.createdAt
      };

      if (method.accountType === 'card') {
        return {
          ...baseResponse,
          cardNumber: `****${method.cardNumber}`,
          expiryDate: method.expiryDate,
          bankName: 'Card Payment',
          type: 'card'
        };
      } else {
        return {
          ...baseResponse,
          bankName: method.bankName,
          accountNumber: `****${method.accountNumber.slice(-4)}`,
          type: 'bank_account'
        };
      }
    });

    res.json({
      paymentMethods: maskedPaymentMethods,
      total: maskedPaymentMethods.length
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to retrieve payment methods' });
  }
};

// Set default bank account
const setDefaultBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bankAccountId } = req.params;

    // Verify bank account belongs to user
    const bankAccount = await BankAccount.findOne({
      where: { 
        id: bankAccountId,
        userId 
      }
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // Remove default from all other accounts
    await BankAccount.update(
      { isDefault: false },
      { where: { userId } }
    );

    // Set this account as default
    await bankAccount.update({ isDefault: true });

    res.json({ 
      message: 'Default bank account updated successfully',
      bankAccount: {
        id: bankAccount.id,
        accountName: bankAccount.accountName,
        bankName: bankAccount.bankName,
        isDefault: true
      }
    });

  } catch (error) {
    console.error('Set default bank account error:', error);
    res.status(500).json({ error: 'Failed to set default bank account' });
  }
};

// Delete bank account
const deleteBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bankAccountId } = req.params;

    // Verify bank account belongs to user
    const bankAccount = await BankAccount.findOne({
      where: { 
        id: bankAccountId,
        userId 
      }
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // If deleting the default account, set another as default
    if (bankAccount.isDefault) {
      const otherAccount = await BankAccount.findOne({
        where: { 
          userId,
          id: { [db.Sequelize.Op.ne]: bankAccountId },
          isActive: true
        }
      });

      if (otherAccount) {
        await otherAccount.update({ isDefault: true });
      }
    }

    // Remove from Stripe if connected
    if (bankAccount.stripePaymentMethodId) {
      try {
        await stripe.paymentMethods.detach(bankAccount.stripePaymentMethodId);
      } catch (stripeError) {
        console.log('Stripe payment method detach error:', stripeError.message);
      }
    }

    // Soft delete - mark as inactive
    await bankAccount.update({ isActive: false });

    res.json({ 
      message: 'Bank account removed successfully' 
    });

  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ error: 'Failed to delete bank account' });
  }
};

// Create payment intent with selected bank account
const createPaymentIntentWithBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, accountNumber, accountType, bankAccountId } = req.body;

    // Validate required fields
    if (!amount || !accountNumber || !accountType) {
      return res.status(400).json({ 
        error: 'Amount, account number, and account type are required' 
      });
    }

    // Find the target account
    const account = await db.Account.findOne({
      where: {
        accountNumber,
        accountType
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Target account not found' });
    }

    // Find the dependent linked to this account
    const dependent = await User.findOne({
      where: { role: 'dependent' },
      include: [{
        model: db.Account,
        as: 'accounts',
        where: { accountNumber }
      }]
    });

    if (!dependent) {
      return res.status(404).json({ error: 'Dependent not found for this account' });
    }

    // Check if funder is linked to this dependent
    const isLinked = await db.FunderDependent.findOne({
      where: {
        funderId: userId,
        dependentId: dependent.id
      }
    });

    if (!isLinked) {
      return res.status(403).json({ error: 'You are not linked to this dependent' });
    }

    // Get bank account if specified
    let selectedBankAccount = null;
    if (bankAccountId) {
      selectedBankAccount = await BankAccount.findOne({
        where: { 
          id: bankAccountId,
          userId,
          isActive: true 
        }
      });

      if (!selectedBankAccount) {
        return res.status(404).json({ error: 'Selected bank account not found' });
      }
    }

    // Get user and ensure Stripe customer exists
    const user = await User.findByPk(userId);
    const stripeCustomer = await createStripeCustomer(user);

    // Create payment intent
    const paymentIntentData = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'zar',
      customer: stripeCustomer.id,
      metadata: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        dependentId: dependent.id.toString(),
        funderId: userId.toString()
      }
    };

    // Add payment method if bank account is specified
    if (selectedBankAccount && selectedBankAccount.stripePaymentMethodId) {
      paymentIntentData.payment_method = selectedBankAccount.stripePaymentMethodId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      selectedBankAccount: selectedBankAccount ? {
        id: selectedBankAccount.id,
        accountName: selectedBankAccount.accountName,
        bankName: selectedBankAccount.bankName,
        accountNumber: `****${selectedBankAccount.accountNumber.slice(-4)}`
      } : null
    });

  } catch (error) {
    console.error('Create payment intent with bank account error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

module.exports = {
  addBankAccount,
  getBankAccounts,
  setDefaultBankAccount,
  deleteBankAccount,
  createPaymentIntentWithBankAccount,
  createStripeCustomer
};
