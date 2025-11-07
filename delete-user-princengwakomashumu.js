const { User, Account, Transaction, PaymentCard, Cart, Order, OrderItem, FunderDependent } = require('./models');
const { Op } = require('sequelize');

async function deleteUserSafely() {
  const targetEmail = 'princengwakomashumu@gmail.com';
  
  try {
    console.log('🔍 Starting safe user deletion process...');
    console.log(`Target email: ${targetEmail}`);
    
    // Find the user first
    const user = await User.findOne({ 
      where: { email: targetEmail }
    });

    if (!user) {
      console.log('❌ User not found with email:', targetEmail);
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.firstName} ${user.surname}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${user.createdAt}`);

    // Check for accounts and transactions
    const userAccounts = await Account.findAll({ where: { userId: user.id } });
    const caregiverAccounts = await Account.findAll({ where: { caregiverId: user.id } });
    
    console.log(`\n📊 User has ${userAccounts.length} accounts as owner`);
    console.log(`📊 User has ${caregiverAccounts.length} accounts as caregiver`);

    // Check for transactions
    let totalTransactions = 0;
    for (const account of userAccounts) {
      const transactions = await Transaction.findAll({ where: { accountId: account.id } });
      totalTransactions += transactions.length;
    }
    
    console.log(`📊 Total transactions across user's accounts: ${totalTransactions}`);

    // Check for dependencies
    const funderLinks = await FunderDependent.findAll({ 
      where: { 
        [Op.or]: [
          { funderId: user.id },
          { dependentId: user.id }
        ]
      }
    });
    
    console.log(`📊 Funder-Dependent relationships: ${funderLinks.length}`);

    // Check for cart items
    const cartItems = await Cart.findAll({ where: { userId: user.id } });
    console.log(`📊 Cart items: ${cartItems.length}`);

    // Check for orders
    const orders = await Order.findAll({ where: { userId: user.id } });
    console.log(`📊 Orders: ${orders.length}`);

    // Check for payment cards
    const paymentCards = await PaymentCard.findAll({ where: { userId: user.id } });
    console.log(`📊 Payment cards: ${paymentCards.length}`);

    // Confirm deletion
    console.log('\n⚠️  DELETION PLAN:');
    console.log('1. Delete all order items for user\'s orders');
    console.log('2. Delete all orders');
    console.log('3. Delete all cart items');
    console.log('4. Delete all payment cards');
    console.log('5. Delete all transactions from user\'s accounts');
    console.log('6. Delete all funder-dependent relationships');
    console.log('7. Delete all accounts (owned and managed)');
    console.log('8. Delete the user record');

    console.log('\n🚨 This action is IRREVERSIBLE!');
    console.log('Starting deletion in 3 seconds...');
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🗑️  Starting deletion process...');

    // 1. Delete order items for user's orders
    if (orders.length > 0) {
      const orderIds = orders.map(order => order.id);
      const deletedOrderItems = await OrderItem.destroy({
        where: { orderId: orderIds }
      });
      console.log(`✅ Deleted ${deletedOrderItems} order items`);
    }

    // 2. Delete orders
    const deletedOrders = await Order.destroy({
      where: { userId: user.id }
    });
    console.log(`✅ Deleted ${deletedOrders} orders`);

    // 3. Delete cart items
    const deletedCartItems = await Cart.destroy({
      where: { userId: user.id }
    });
    console.log(`✅ Deleted ${deletedCartItems} cart items`);

    // 4. Delete payment cards
    const deletedPaymentCards = await PaymentCard.destroy({
      where: { userId: user.id }
    });
    console.log(`✅ Deleted ${deletedPaymentCards} payment cards`);

    // 5. Delete transactions from user's accounts
    if (userAccounts.length > 0) {
      const accountIds = userAccounts.map(acc => acc.id);
      const deletedTransactions = await Transaction.destroy({
        where: { accountId: accountIds }
      });
      console.log(`✅ Deleted ${deletedTransactions} transactions`);
    }

    // 6. Delete funder-dependent relationships
    const deletedFunderLinks = await FunderDependent.destroy({
      where: { 
        [Op.or]: [
          { funderId: user.id },
          { dependentId: user.id }
        ]
      }
    });
    console.log(`✅ Deleted ${deletedFunderLinks} funder-dependent relationships`);

    // 7. Delete accounts (both owned and managed as caregiver)
    const deletedOwnedAccounts = await Account.destroy({
      where: { userId: user.id }
    });
    console.log(`✅ Deleted ${deletedOwnedAccounts} owned accounts`);

    const deletedCaregiverAccounts = await Account.destroy({
      where: { caregiverId: user.id }
    });
    console.log(`✅ Deleted ${deletedCaregiverAccounts} caregiver-managed accounts`);

    // 8. Finally, delete the user
    const deletedUser = await User.destroy({
      where: { id: user.id }
    });
    console.log(`✅ Deleted ${deletedUser} user record`);

    console.log('\n🎉 User deletion completed successfully!');
    console.log(`✅ User "${targetEmail}" and all associated data have been permanently removed.`);

  } catch (error) {
    console.error('❌ Error during user deletion:', error);
    console.error('Stack trace:', error.stack);
    
    // Log the specific error details
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error('🔗 Foreign key constraint error - there may be additional references to clean up');
    }
  }
}

// Run the deletion
deleteUserSafely().then(() => {
  console.log('\n🏁 Script completed.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});