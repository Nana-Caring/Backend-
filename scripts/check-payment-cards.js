const { PaymentCard, User } = require('../models');

async function checkPaymentCards() {
  try {
    console.log('Checking existing payment cards...');

    const cards = await PaymentCard.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'email', 'role']
      }]
    });

    console.log(`Found ${cards.length} payment cards:`);
    
    cards.forEach(card => {
      console.log(`- Card ${card.id}: ${card.bankName} ending in ${card.cardNumber}`);
      console.log(`  Stripe Payment Method ID: ${card.stripePaymentMethodId}`);
      console.log(`  User: ${card.user.firstName} (${card.user.email}) - Role: ${card.user.role}`);
      console.log(`  Active: ${card.isActive}, Default: ${card.isDefault}`);
      console.log('');
    });

    // Check for test cards with fake Stripe IDs
    const testCards = cards.filter(card => card.stripePaymentMethodId.startsWith('pm_test_'));
    console.log(`Found ${testCards.length} cards with fake test Stripe IDs that need fixing.`);

  } catch (error) {
    console.error('Error checking payment cards:', error);
  }
}

checkPaymentCards()
  .then(() => {
    console.log('Check completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Check failed:', error);
    process.exit(1);
  });
