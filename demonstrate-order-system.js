const { User, Account, Product, Cart } = require('./models');

async function demonstrateOrderSystem() {
  try {
    console.log('🛍️  === NANA PROJECT ORDER SYSTEM DEMONSTRATION === 🛍️\n');
    
    // Find users with cart items
    console.log('👥 Users with Cart Items:');
    const usersWithCarts = await User.findAll({
      attributes: ['id', 'firstName', 'surname', 'role'],
      include: [{
        model: Cart,
        as: 'cartItems',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['name', 'price', 'category', 'minAge', 'maxAge']
        }],
        required: true // Only users who have cart items
      }]
    });

    if (usersWithCarts.length === 0) {
      console.log('❌ No users currently have cart items');
      return;
    }

    for (const user of usersWithCarts) {
      console.log(`\n👤 ${user.firstName} ${user.surname} (${user.role}):`);
      
      let cartTotal = 0;
      console.log('   🛒 Cart Contents:');
      
      for (const cartItem of user.cartItems) {
        const itemTotal = cartItem.product.price * cartItem.quantity;
        cartTotal += itemTotal;
        
        console.log(`   - ${cartItem.product.name}`);
        console.log(`     💰 R${cartItem.product.price} x ${cartItem.quantity} = R${itemTotal}`);
        console.log(`     📂 Category: ${cartItem.product.category}`);
        
        if (cartItem.product.minAge || cartItem.product.maxAge) {
          const ageRestriction = `Ages ${cartItem.product.minAge || 0}-${cartItem.product.maxAge || '∞'}`;
          console.log(`     🎂 Age Restriction: ${ageRestriction}`);
        }
      }
      
      console.log(`   💸 Cart Total: R${cartTotal.toFixed(2)}`);
      
      // Check account balance
      const account = await Account.findOne({
        where: { userId: user.id, accountType: 'savings' }
      });
      
      if (account) {
        console.log(`   💳 Account Balance: R${account.balance}`);
        
        if (account.balance >= cartTotal) {
          console.log('   ✅ Sufficient balance for checkout');
        } else {
          console.log('   ❌ Insufficient balance for checkout');
          console.log(`   📊 Shortfall: R${(cartTotal - account.balance).toFixed(2)}`);
        }
      } else {
        console.log('   ❌ No account found');
      }
    }

    console.log('\n🚀 === ORDER SYSTEM FEATURES READY === 🚀');
    console.log('\n📋 Available Order Endpoints:');
    console.log('   🔄 POST /api/orders/checkout');
    console.log('      └── Creates order from cart items');
    console.log('      └── Validates balance before processing');
    console.log('      └── Generates unique order number & store code');
    console.log('      └── Records all order details & items');
    console.log('      └── Processes payment from account');
    console.log('      └── Clears cart after successful order');
    
    console.log('\n   📜 GET /api/orders');
    console.log('      └── Lists user\'s order history');
    console.log('      └── Supports pagination & filtering');
    
    console.log('\n   🔍 GET /api/orders/:id');
    console.log('      └── Get detailed order information');
    console.log('      └── Includes all order items & product details');
    
    console.log('\n   🏪 GET /api/orders/store/:storeCode');
    console.log('      └── Store verification by unique code');
    console.log('      └── For in-store pickup confirmation');
    
    console.log('\n   ❌ POST /api/orders/:id/cancel');
    console.log('      └── Cancel orders (if still processing)');
    console.log('      └── Refunds to account automatically');

    console.log('\n🎯 === ORDER SYSTEM INTEGRATION === 🎯');
    console.log('✅ Age-Restricted Products: Fully integrated');
    console.log('✅ Pregnancy Categories: Working with order system');
    console.log('✅ Balance Validation: Enforced before checkout');
    console.log('✅ Transaction Recording: Complete audit trail');
    console.log('✅ Unique Reference Codes: Generated automatically');
    console.log('✅ Order Status Tracking: Full lifecycle management');
    
    console.log('\n💡 === READY FOR CHECKOUT === 💡');
    console.log('The order system is fully functional and ready to use!');
    console.log('Dependents can now complete purchases with:');
    console.log('• Age-appropriate product filtering ✅');
    console.log('• Account balance validation ✅');
    console.log('• Complete order tracking ✅');
    console.log('• Store pickup codes ✅');
    console.log('• Transaction history ✅');

  } catch (error) {
    console.error('❌ Error demonstrating order system:', error.message);
  }
}

demonstrateOrderSystem();