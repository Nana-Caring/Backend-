const { Order } = require('../models');

// Generate unique 8-character store code
const generateStoreCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Backfill store codes for existing orders
const backfillStoreCodes = async () => {
  try {
    console.log('Starting store code backfill...');
    
    // Get all orders without store codes
    const ordersWithoutCodes = await Order.findAll({
      where: {
        storeCode: null
      }
    });

    console.log(`Found ${ordersWithoutCodes.length} orders without store codes`);

    if (ordersWithoutCodes.length === 0) {
      console.log('No orders need store code backfill');
      return;
    }

    // Generate unique store codes for each order
    const usedCodes = new Set();
    
    for (const order of ordersWithoutCodes) {
      let storeCode = generateStoreCode();
      
      // Ensure uniqueness
      while (usedCodes.has(storeCode) || await Order.findOne({ where: { storeCode } })) {
        storeCode = generateStoreCode();
      }
      
      usedCodes.add(storeCode);
      
      await order.update({ storeCode });
      console.log(`Order ${order.orderNumber} assigned store code: ${storeCode}`);
    }

    console.log('Store code backfill completed successfully!');
    
  } catch (error) {
    console.error('Error during store code backfill:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  backfillStoreCodes()
    .then(() => {
      console.log('Backfill script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Backfill script failed:', error);
      process.exit(1);
    });
}

module.exports = backfillStoreCodes;
