const db = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Account = db.Account;
const User = db.User;
const FunderDependent = db.FunderDependent;

// Create PaymentIntent endpoint
const createPaymentIntent = async (req, res) => {
  try {
    const funderId = req.user.id;
    const { amount, accountNumber, accountType } = req.body;

    // Find the account
    const account = await Account.findOne({
      where: {
        accountNumber,
        accountType
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Find the dependent linked to this account
    const dependent = await User.findOne({
      where: { role: 'dependent' },
      include: [{
        model: Account,
        as: 'accounts',
        where: { accountNumber }
      }]
    });

    if (!dependent) {
      return res.status(404).json({ error: 'Dependent not found for this account' });
    }

    // Check if funder is linked to this dependent
    const isLinked = await FunderDependent.findOne({
      where: {
        funderId: funderId,
        dependentId: dependent.id
      }
    });

    if (!isLinked) {
      return res.status(403).json({ error: 'You are not linked to this dependent' });
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'zar',
      metadata: {
        accountNumber: account.accountNumber,
        accountType: account.accountType
      }
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error('Payment Intent Error:', error.message);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Create SetupIntent endpoint
const createSetupIntent = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    
    // Check if user is a funder
    if (!user || user.role !== 'funder') {
      return res.status(403).json({ error: 'Only funders can save payment methods' });
    }
    
    // Create Stripe customer if doesn't exist
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.surname}`,
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }
    
    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
    });
    
    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('SetupIntent Error:', error.message);
    res.status(500).json({ error: 'Failed to create SetupIntent' });
  }
};

// List saved payment methods endpoint
const listPaymentMethods = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'Stripe customer not found for user' });
    }
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });
    res.json({ paymentMethods: paymentMethods.data });
  } catch (error) {
    console.error('ListPaymentMethods Error:', error.message);
    res.status(500).json({ error: 'Failed to list payment methods' });
  }
};

// Stripe webhook handler
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // Handle the event
        if(event.type === 'payment_intent.succeeded') {
            // Handle successful payment
            const paymentIntent = event.data.object;
            const accountNumber = paymentIntent.metadata.accountNumber;
            const accountType = paymentIntent.metadata.accountType;
            const amount = paymentIntent.amount / 100; // Convert cents to ZAR

            try {
                // Update the account balance in the database
                const account = await Account.findOne({ where: { accountNumber, accountType } });

                if (!account) {
                    console.error(`Account ${accountNumber} (${accountType}) not found.`);
                } else {
                    // update the account balance
                    account.balance += amount;
                    await account.save();

                    console.log(`Payment succeeded for account: ${accountNumber} (${accountType}), Amount: ${amount}`);
                }
            } catch (err) {
                console.error('Database error:', err.message);
            }
        } else {
            console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err.message);
        res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
};

module.exports = {
    createPaymentIntent,
    handleWebhook,
    createSetupIntent,
    listPaymentMethods
};








