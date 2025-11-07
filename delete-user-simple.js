const { User, Account, Transaction, PaymentCard, Cart, FunderDependent } = require('./models');
const { Op } = require('sequelize');
const db = require('./db');

async function deleteUserSimple() {
  const targetEmail = 'princengwakomashumu@gmail.com';
  const client = await db.connect();
  
  try {
    console.log('🔍 Starting simple user deletion process...');
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

    const userId = user.id;

    console.log('\n🗑️  Starting deletion process...');

    // Use raw SQL to avoid model schema issues
    // 1. Delete order items first
    const deleteOrderItemsQuery = `
      DELETE FROM "OrderItems" 
      WHERE "orderId" IN (
        SELECT id FROM "Orders" WHERE "userId" = $1
      );
    `;
    const orderItemsResult = await client.query(deleteOrderItemsQuery, [userId]);
    console.log(`✅ Deleted ${orderItemsResult.rowCount} order items`);

    // 2. Delete orders
    const deleteOrdersQuery = `DELETE FROM "Orders" WHERE "userId" = $1;`;
    const ordersResult = await client.query(deleteOrdersQuery, [userId]);
    console.log(`✅ Deleted ${ordersResult.rowCount} orders`);

    // 3. Delete cart items using Sequelize
    const deletedCartItems = await Cart.destroy({
      where: { userId: userId }
    });
    console.log(`✅ Deleted ${deletedCartItems} cart items`);

    // 4. Delete payment cards using Sequelize
    const deletedPaymentCards = await PaymentCard.destroy({
      where: { userId: userId }
    });
    console.log(`✅ Deleted ${deletedPaymentCards} payment cards`);

    // 5. Delete transactions from user's accounts
    const deleteTransactionsQuery = `
      DELETE FROM "Transactions" 
      WHERE "accountId" IN (
        SELECT id FROM "Accounts" WHERE "userId" = $1
      );
    `;
    const transactionsResult = await client.query(deleteTransactionsQuery, [userId]);
    console.log(`✅ Deleted ${transactionsResult.rowCount} transactions`);

    // 6. Delete funder-dependent relationships using Sequelize
    const deletedFunderLinks = await FunderDependent.destroy({
      where: { 
        [Op.or]: [
          { funderId: userId },
          { dependentId: userId }
        ]
      }
    });
    console.log(`✅ Deleted ${deletedFunderLinks} funder-dependent relationships`);

    // 7. Delete accounts using Sequelize
    const deletedOwnedAccounts = await Account.destroy({
      where: { userId: userId }
    });
    console.log(`✅ Deleted ${deletedOwnedAccounts} owned accounts`);

    const deletedCaregiverAccounts = await Account.destroy({
      where: { caregiverId: userId }
    });
    console.log(`✅ Deleted ${deletedCaregiverAccounts} caregiver-managed accounts`);

    // 8. Finally, delete the user using Sequelize
    const deletedUser = await User.destroy({
      where: { id: userId }
    });
    console.log(`✅ Deleted ${deletedUser} user record`);

    console.log('\n🎉 User deletion completed successfully!');
    console.log(`✅ User "${targetEmail}" and all associated data have been permanently removed.`);

  } catch (error) {
    console.error('❌ Error during user deletion:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await client.end();
  }
}

// Run the deletion
deleteUserSimple().then(() => {
  console.log('\n🏁 Script completed.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});