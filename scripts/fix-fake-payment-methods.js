const { PaymentCard, User } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper function to create or get Stripe customer
async function createStripeCustomer(user) {
  try {
    if (user.stripeCustomerId) {
      // Verify customer exists in Stripe
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        return customer.id;
      } catch (error) {
        console.log(`Stripe customer ${user.stripeCustomerId} not found, creating new one`);
      }
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.surname}`,
      metadata: {
        userId: user.id.toString()
      }
    });

    // Update user with Stripe customer ID
    await user.update({ stripeCustomerId: customer.id });
    
    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

async function fixFakePaymentMethods() {
  try {
    console.log('Fixing fake payment method IDs...');

    // Find cards with fake Stripe payment method IDs
    const fakeCards = await PaymentCard.findAll({
      where: {
        stripePaymentMethodId: {
          [require('sequelize').Op.like]: 'pm_test_%'
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'surname', 'email', 'stripeCustomerId']
      }]
    });

    console.log(`Found ${fakeCards.length} cards with fake payment method IDs`);

    for (const card of fakeCards) {
      try {
        console.log(`\nFixing card ${card.id} for user ${card.user.firstName}...`);

        // Ensure user has Stripe customer ID
        let stripeCustomerId = card.user.stripeCustomerId;
        if (!stripeCustomerId) {
          stripeCustomerId = await createStripeCustomer(card.user);
          console.log(`Created Stripe customer: ${stripeCustomerId}`);
        }

        // Create a real test payment method using Stripe test token
        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            token: 'tok_visa', // Use Stripe test token instead of raw card data
          },
        });

        // Attach the payment method to the customer
        await stripe.paymentMethods.attach(paymentMethod.id, {
          customer: stripeCustomerId,
        });

        // Update the card record with the real Stripe payment method ID
        await card.update({
          stripePaymentMethodId: paymentMethod.id
        });

        console.log(`✅ Fixed card ${card.id}: ${card.stripePaymentMethodId} → ${paymentMethod.id}`);

      } catch (error) {
        console.error(`❌ Failed to fix card ${card.id}:`, error.message);
      }
    }

    console.log('\nFix completed!');

  } catch (error) {
    console.error('Error fixing payment methods:', error);
  }
}

fixFakePaymentMethods()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
