const { PaymentCard, User } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper function to mask card number for display
function maskCardNumber(cardNumber) {
  if (!cardNumber || cardNumber.length < 4) return '****';
  return `****-****-****-${cardNumber.slice(-4)}`;
}

// Helper function to create or get Stripe customer
async function createStripeCustomer(user) {
  try {
    if (user.stripeCustomerId) {
      // Verify customer exists in Stripe
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        return customer.id;
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
    await User.update(
      { stripeCustomerId: customer.id },
      { where: { id: user.id } }
    );

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create Stripe customer');
  }
}

// Add a new payment card
const addPaymentCard = async (req, res) => {
  try {
    const { bankName, cardNumber, expiryDate, ccv, nickname, isDefault } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!bankName || !cardNumber || !expiryDate || !ccv) {
      return res.status(400).json({
        message: 'All card fields are required',
        required: {
          bankName: 'Bank Name is required',
          cardNumber: 'Card Number is required',
          expiryDate: 'Expiry Date (MM/YY) is required',
          ccv: 'CCV is required'
        }
      });
    }

    // Validate expiry date format (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiryDate)) {
      return res.status(400).json({
        message: 'Expiry date must be in MM/YY format (e.g., 12/25)'
      });
    }

    // Validate card number (basic check)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanCardNumber)) {
      return res.status(400).json({
        message: 'Card number must be 13-19 digits'
      });
    }

    // Validate CCV
    if (!/^\d{3,4}$/.test(ccv)) {
      return res.status(400).json({
        message: 'CCV must be 3-4 digits'
      });
    }

    // Check if card already exists for this user (last 4 digits)
    const lastFourDigits = cleanCardNumber.slice(-4);
    const existingCard = await PaymentCard.findOne({
      where: {
        userId,
        cardNumber: { [require('sequelize').Op.like]: `%${lastFourDigits}` }
      }
    });

    if (existingCard) {
      return res.status(400).json({
        message: 'A card with these last 4 digits is already added to your account'
      });
    }

    // Get user for Stripe customer creation
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await PaymentCard.update(
        { isDefault: false },
        { where: { userId, isDefault: true } }
      );
    }

    // Create Stripe customer if needed
    let stripeCustomerId;
    try {
      stripeCustomerId = await createStripeCustomer(user);
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to set up payment processing',
        error: error.message
      });
    }

    // For security, we'll create a test token instead of sending raw card data
    // In production, the frontend should tokenize cards using Stripe.js
    let stripePaymentMethodId = null;
    try {
      // Create a test token for development (this simulates frontend tokenization)
      const testToken = await stripe.tokens.create({
        card: {
          number: cleanCardNumber,
          exp_month: parseInt(expiryDate.split('/')[0]),
          exp_year: parseInt(`20${expiryDate.split('/')[1]}`),
          cvc: ccv,
        },
      });

      // Create payment method from token
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: testToken.id,
        },
      });

      // Attach to customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: stripeCustomerId,
      });

      stripePaymentMethodId = paymentMethod.id;
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      
      // Handle specific Stripe errors
      if (stripeError.message.includes('raw card data')) {
        return res.status(400).json({
          message: 'Card tokenization required',
          error: 'For security, card details must be tokenized on the frontend using Stripe.js',
          hint: 'In development, use Stripe test tokens or enable raw card data in your Stripe dashboard'
        });
      }
      
      return res.status(400).json({
        message: 'Invalid card details',
        error: stripeError.message
      });
    }

    // Create payment card record (store only last 4 digits for security)
    const paymentCard = await PaymentCard.create({
      userId,
      bankName,
      cardNumber: lastFourDigits, // Store only last 4 digits
      expiryDate,
      ccv, // Note: In production, consider not storing CCV at all
      nickname,
      isDefault: isDefault || false,
      stripePaymentMethodId
    });

    // Return card data with masked number
    const responseCard = {
      id: paymentCard.id,
      bankName: paymentCard.bankName,
      cardNumber: maskCardNumber(paymentCard.cardNumber),
      expiryDate: paymentCard.expiryDate,
      nickname: paymentCard.nickname,
      isDefault: paymentCard.isDefault,
      isActive: paymentCard.isActive,
      createdAt: paymentCard.createdAt
    };

    res.status(201).json({
      message: 'Payment card added successfully',
      card: responseCard
    });

  } catch (error) {
    console.error('Add payment card error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all payment cards for user
const getPaymentCards = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if payment_cards table exists
    try {
      const cards = await PaymentCard.findAll({
        where: {
          userId,
          isActive: true
        },
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
      });

      // Mask card numbers for security
      const maskedCards = cards.map(card => ({
        id: card.id,
        bankName: card.bankName,
        cardNumber: maskCardNumber(card.cardNumber),
        expiryDate: card.expiryDate,
        nickname: card.nickname,
        isDefault: card.isDefault,
        isActive: card.isActive,
        createdAt: card.createdAt
      }));

      res.json({
        message: 'Payment cards retrieved successfully',
        cards: maskedCards,
        totalCards: maskedCards.length
      });

    } catch (dbError) {
      // Handle case where payment_cards table doesn't exist
      if (dbError.original && dbError.original.code === '42P01') {
        return res.status(503).json({
          message: 'Payment cards feature is not available yet',
          error: 'Database table not created. Please run migrations or contact administrator.',
          hint: 'Run: npx sequelize-cli db:migrate or execute the SQL script to create payment_cards table'
        });
      }
      throw dbError; // Re-throw other database errors
    }

  } catch (error) {
    console.error('Get payment cards error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Set default payment card
const setDefaultCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;

    // Check if card exists and belongs to user
    const card = await PaymentCard.findOne({
      where: {
        id: cardId,
        userId,
        isActive: true
      }
    });

    if (!card) {
      return res.status(404).json({
        message: 'Payment card not found'
      });
    }

    // Unset all other default cards for this user
    await PaymentCard.update(
      { isDefault: false },
      { where: { userId, isDefault: true } }
    );

    // Set this card as default
    await card.update({ isDefault: true });

    res.json({
      message: 'Default payment card updated successfully',
      cardId: card.id,
      bankName: card.bankName,
      cardNumber: maskCardNumber(card.cardNumber)
    });

  } catch (error) {
    console.error('Set default card error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete payment card
const deletePaymentCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;

    const card = await PaymentCard.findOne({
      where: {
        id: cardId,
        userId
      }
    });

    if (!card) {
      return res.status(404).json({
        message: 'Payment card not found'
      });
    }

    // Delete from Stripe if exists
    if (card.stripePaymentMethodId) {
      try {
        await stripe.paymentMethods.detach(card.stripePaymentMethodId);
      } catch (stripeError) {
        console.error('Stripe deletion error:', stripeError);
        // Continue with local deletion even if Stripe fails
      }
    }

    // Soft delete (mark as inactive)
    await card.update({ isActive: false, isDefault: false });

    res.json({
      message: 'Payment card removed successfully'
    });

  } catch (error) {
    console.error('Delete payment card error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete all cards for user (cleanup endpoint)
const deleteAllCards = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all cards for this user
    const allCards = await PaymentCard.findAll({
      where: { userId }
    });

    if (allCards.length === 0) {
      return res.json({
        message: 'No cards found to delete',
        deletedCount: 0
      });
    }

    // Delete all cards
    const deletedCount = await PaymentCard.destroy({
      where: { userId }
    });

    res.json({
      message: `All cards deleted successfully`,
      deletedCount: deletedCount,
      cardIds: allCards.map(card => card.id)
    });

  } catch (error) {
    console.error('Delete all cards error:', error);
    res.status(500).json({
      message: 'Failed to delete cards',
      error: error.message
    });
  }
};

// Create payment intent with selected card
const createPaymentIntentWithCard = async (req, res) => {
  try {
    const { amount, cardId, description } = req.body;
    const userId = req.user.id;

    if (!amount || !cardId) {
      return res.status(400).json({
        message: 'Amount and card ID are required'
      });
    }

    // Get the payment card
    const card = await PaymentCard.findOne({
      where: {
        id: cardId,
        userId,
        isActive: true
      }
    });

    if (!card) {
      return res.status(404).json({
        message: 'Payment card not found'
      });
    }

    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure Stripe customer exists (auto-create if missing)
    try {
      if (!user.stripeCustomerId) {
        const customerId = await createStripeCustomer(user); // helper defined above
        // Persist on the user instance if needed for downstream use
        user.stripeCustomerId = customerId;
      }
    } catch (e) {
      return res.status(500).json({
        message: 'Failed to set up Stripe customer',
        error: e.message
      });
    }

    // Ensure this card is linked to Stripe (has payment method)
    if (!card.stripePaymentMethodId) {
      return res.status(400).json({
        message: 'This card is not set up for Stripe payments',
        hint: 'Add a card using /payment-cards/add or /payment-cards/add-stripe to create and attach a Stripe payment method.'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'zar',
      customer: user.stripeCustomerId,
      payment_method: card.stripePaymentMethodId,
      confirm: false, // frontend will confirm
      description: description || 'Payment via NANA platform',
      metadata: {
        userId: userId.toString(),
        cardId: String(cardId)
      }
    });

    res.json({
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      card: {
        bankName: card.bankName,
        cardNumber: maskCardNumber(card.cardNumber)
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// TEST ONLY: Add payment card without Stripe validation (for development)
const addPaymentCardTest = async (req, res) => {
  try {
    const { bankName, cardNumber, expiryDate, ccv, nickname, isDefault } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!bankName || !cardNumber || !expiryDate || !ccv) {
      return res.status(400).json({
        message: 'All card fields are required',
        required: {
          bankName: 'Bank Name is required',
          cardNumber: 'Card Number is required',
          expiryDate: 'Expiry Date (MM/YY) is required',
          ccv: 'CCV is required'
        }
      });
    }

    // Validate expiry date format (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiryDate)) {
      return res.status(400).json({
        message: 'Expiry date must be in MM/YY format (e.g., 12/25)'
      });
    }

    // Validate card number (basic check)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanCardNumber)) {
      return res.status(400).json({
        message: 'Card number must be 13-19 digits'
      });
    }

    // Validate CCV
    if (!/^\d{3,4}$/.test(ccv)) {
      return res.status(400).json({
        message: 'CCV must be 3-4 digits'
      });
    }

    // Check if card already exists for this user (last 4 digits)
    const lastFourDigits = cleanCardNumber.slice(-4);
    const existingCard = await PaymentCard.findOne({
      where: {
        userId,
        cardNumber: lastFourDigits
      }
    });

    if (existingCard) {
      return res.status(400).json({
        message: 'A card with these last 4 digits is already added to your account'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await PaymentCard.update(
        { isDefault: false },
        { where: { userId, isDefault: true } }
      );
    }

    // Create a mock Stripe payment method ID for testing
    const mockStripePaymentMethodId = `pm_test_${Date.now()}_${lastFourDigits}`;

    // Create payment card record (store only last 4 digits for security)
    const paymentCard = await PaymentCard.create({
      userId,
      bankName,
      cardNumber: lastFourDigits, // Store only last 4 digits
      expiryDate,
      ccv, // Note: In production, consider not storing CCV at all
      nickname,
      isDefault: isDefault || false,
      stripePaymentMethodId: mockStripePaymentMethodId
    });

    // Return card data with masked number
    const responseCard = {
      id: paymentCard.id,
      bankName: paymentCard.bankName,
      cardNumber: maskCardNumber(lastFourDigits),
      expiryDate: paymentCard.expiryDate,
      nickname: paymentCard.nickname,
      isDefault: paymentCard.isDefault,
      isActive: paymentCard.isActive,
      createdAt: paymentCard.createdAt
    };

    res.status(201).json({
      message: 'Payment card added successfully (TEST MODE)',
      card: responseCard,
      note: 'This is a test endpoint - Stripe validation bypassed for development'
    });

  } catch (error) {
    console.error('Add payment card test error:', error);
    
    // Handle case where table doesn't exist
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('relation') && error.message.includes('does not exist')) {
      return res.status(503).json({
        message: 'Payment cards feature is not available yet',
        error: 'Database table not created. Please run migrations or contact administrator.',
        hint: 'Run: npx sequelize-cli db:migrate or execute the SQL script to create payment_cards table'
      });
    }
    
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Add a payment card using Stripe Payment Method ID (for production/testing)
const addPaymentCardWithStripeMethod = async (req, res) => {
  try {
    const { payment_method_id, user_id, is_default = false } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!payment_method_id) {
      return res.status(400).json({
        message: 'Stripe payment method ID is required',
        example: {
          payment_method_id: 'pm_card_visa',
          user_id: userId,
          is_default: true
        }
      });
    }

    // Get user for Stripe customer creation
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or get Stripe customer
    let stripeCustomerId;
    try {
      stripeCustomerId = await createStripeCustomer(user);
    } catch (error) {
      return res.status(500).json({
        message: 'Failed to set up payment processing',
        error: error.message
      });
    }

    // Retrieve payment method from Stripe to get card details
    let paymentMethod;
    try {
      paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);
      
      // Attach payment method to customer
      await stripe.paymentMethods.attach(payment_method_id, {
        customer: stripeCustomerId,
      });

    } catch (stripeError) {
      console.error('Stripe payment method error:', stripeError);
      return res.status(400).json({
        message: 'Invalid payment method ID',
        error: stripeError.message,
        availableTestMethods: [
          'pm_card_visa',
          'pm_card_mastercard', 
          'pm_card_amex',
          'pm_card_discover'
        ]
      });
    }

    // Extract card information from Stripe
    const card = paymentMethod.card;
    const bankName = `${card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} Card`;
    const last4 = card.last4;
    const expiryMonth = card.exp_month.toString().padStart(2, '0');
    const expiryYear = card.exp_year.toString().slice(-2);

    // Check if card already exists for this user
    const existingCard = await PaymentCard.findOne({
      where: {
        userId,
        cardNumber: { [require('sequelize').Op.like]: `%${last4}` }
      }
    });

    if (existingCard) {
      return res.status(400).json({
        message: `A ${card.brand} card ending in ${last4} is already added to your account`
      });
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await PaymentCard.update(
        { isDefault: false },
        { where: { userId, isDefault: true } }
      );
    }

    // Create payment card record
    const paymentCard = await PaymentCard.create({
      userId,
      bankName,
      cardNumber: last4, // Store only last 4 digits
      expiryDate: `${expiryMonth}/${expiryYear}`,
      ccv: '000', // Numeric placeholder since we don't have access to real CCV with Stripe payment methods
      nickname: `${bankName} ending in ${last4}`,
      isDefault: is_default,
      isActive: true,
      stripePaymentMethodId: payment_method_id,
      stripeCustomerId: stripeCustomerId
    });

    // Return success response
    res.status(201).json({
      message: 'Payment card added successfully with Stripe integration',
      card: {
        id: paymentCard.id,
        bankName: paymentCard.bankName,
        cardNumber: `****-****-****-${last4}`, // Format for display
        expiryDate: paymentCard.expiryDate,
        nickname: paymentCard.nickname,
        isDefault: paymentCard.isDefault,
        isActive: paymentCard.isActive,
        brand: card.brand,
        last_four: last4,
        createdAt: paymentCard.createdAt
      },
      stripe: {
        payment_method_id: payment_method_id,
        customer_id: stripeCustomerId,
        ready_for_transfers: true
      }
    });

  } catch (error) {
    console.error('Error adding payment card with Stripe method:', error);
    
    // Handle table missing error
    if (error.message && error.message.includes('relation "payment_cards" does not exist')) {
      return res.status(500).json({
        message: 'Payment cards table not found',
        error: 'Database table missing - run migrations or setup scripts',
        solutions: [
          'Run: npx sequelize-cli db:migrate',
          'Run: node setup-production-payment-cards.js',
          'Check database connection'
        ]
      });
    }

    res.status(500).json({
      message: 'Failed to add payment card',
      error: error.message
    });
  }
};

// Debug endpoint - get all cards including inactive (for troubleshooting)
const getAllCardsDebug = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('DEBUG: Fetching cards for user ID:', userId);

    // Get ALL cards for this user (including inactive)
    const allCards = await PaymentCard.findAll({
      where: {
        userId
      },
      order: [['createdAt', 'DESC']]
    });

    console.log('DEBUG: Found', allCards.length, 'total cards');

    // Get active cards only
    const activeCards = await PaymentCard.findAll({
      where: {
        userId,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });

    console.log('DEBUG: Found', activeCards.length, 'active cards');

    const debugInfo = {
      userId: userId,
      totalCardsInDB: allCards.length,
      activeCards: activeCards.length,
      allCards: allCards.map(card => ({
        id: card.id,
        bankName: card.bankName,
        cardNumber: maskCardNumber(card.cardNumber),
        isActive: card.isActive,
        isDefault: card.isDefault,
        stripePaymentMethodId: card.stripePaymentMethodId,
        createdAt: card.createdAt
      })),
      activeCardsOnly: activeCards.map(card => ({
        id: card.id,
        bankName: card.bankName,
        cardNumber: maskCardNumber(card.cardNumber),
        isDefault: card.isDefault,
        createdAt: card.createdAt
      }))
    };

    res.json({
      message: 'Debug info retrieved',
      debug: debugInfo
    });

  } catch (error) {
    console.error('Debug cards error:', error);
    res.status(500).json({
      message: 'Debug failed',
      error: error.message,
      userId: req.user.id
    });
  }
};

// Reactivate an inactive card
const reactivateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.id;

    // Find the card
    const card = await PaymentCard.findOne({
      where: {
        id: cardId,
        userId: userId
      }
    });

    if (!card) {
      return res.status(404).json({
        message: 'Card not found'
      });
    }

    // Reactivate the card
    await card.update({
      isActive: true
    });

    res.json({
      message: 'Card reactivated successfully',
      card: {
        id: card.id,
        bankName: card.bankName,
        cardNumber: maskCardNumber(card.cardNumber),
        isActive: card.isActive,
        isDefault: card.isDefault
      }
    });

  } catch (error) {
    console.error('Reactivate card error:', error);
    res.status(500).json({
      message: 'Failed to reactivate card',
      error: error.message
    });
  }
};

module.exports = {
  addPaymentCard,
  getPaymentCards,
  setDefaultCard,
  deletePaymentCard,
  deleteAllCards,
  createPaymentIntentWithCard,
  addPaymentCardTest,
  addPaymentCardWithStripeMethod,
  getAllCardsDebug,
  reactivateCard
};
