const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

const BASE_URL = process.env.API_BASE_URL + '/api';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to prompt user
const prompt = (question) => {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
};

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}=== ${msg} ===${colors.reset}\n`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// POS Terminal class
class POSTerminal {
  constructor() {
    this.staffId = 'POS_TERMINAL_001';
    this.retailerToken = null;
    this.currentOrder = null;
  }

  // Login as retailer/POS
  async authenticate() {
    try {
      log.title('RETAILER/POS LOGIN');

      const email = await prompt(`Retailer Email (default: ${process.env.RETAILER_EMAIL}): `) || process.env.RETAILER_EMAIL;
      const password = await prompt('Retailer Password: ') || process.env.RETAILER_PASSWORD;

      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password
      });

      this.retailerToken = loginRes.data.accessToken || loginRes.data.jwt;
      const user = loginRes.data.user || loginRes.data.data?.user;

      if (!this.retailerToken) {
        log.error('No token received from login');
        return false;
      }

      log.success(`Logged in as: ${user.firstName} (${user.role})`);
      return true;

    } catch (error) {
      log.error(`Login failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  // Get headers with auth
  getHeaders() {
    return {
      Authorization: `Bearer ${this.retailerToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Scan order code
  async scanOrderCode() {
    try {
      log.title('SCAN ORDER CODE');

      const storeCode = await prompt('Enter Store Code (e.g., DM9QL5MF): ');

      if (!storeCode || storeCode.length !== 8) {
        log.error('Invalid store code format (must be 8 characters)');
        return false;
      }

      log.info(`Scanning: ${storeCode}...`);

      const orderRes = await axios.get(`${BASE_URL}/orders/store/${storeCode}`, {
        headers: this.getHeaders()
      });

      const verifyInfo = orderRes.data.data?.verificationInfo;
      const orderItems = orderRes.data.data?.orderItems || [];

      if (!verifyInfo) {
        log.error('Order not found');
        return false;
      }

      this.currentOrder = {
        storeCode,
        verifyInfo,
        orderItems,
        orderId: orderRes.data.data?.id
      };

      // Display order
      console.log(`\n${colors.bright}📋 ORDER FOUND${colors.reset}`);
      console.log(`   Customer: ${verifyInfo.customerName}`);
      console.log(`   Order Date: ${new Date(verifyInfo.orderDate).toLocaleString()}`);
      console.log(`   Total: R${verifyInfo.totalAmount}`);
      console.log(`   Status: ${verifyInfo.orderStatus}`);
      console.log(`   Payment: ${verifyInfo.paymentStatus}`);
      console.log(`   Valid: ${verifyInfo.isValid ? '✅ YES' : '❌ NO'}`);

      console.log(`\n${colors.bright}📦 ITEMS (${orderItems.length})${colors.reset}`);
      orderItems.forEach((item, idx) => {
        const snap = item.productSnapshot ? JSON.parse(item.productSnapshot) : {};
        console.log(`   ${idx + 1}. ${snap.name || 'Unknown'}`);
        console.log(`      SKU: ${snap.sku || 'N/A'} | Qty: ${item.quantity} @ R${item.priceAtTime}`);
      });

      return true;

    } catch (error) {
      log.error(`Scan failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  // Confirm order is ready (after picking/packing)
  async confirmReady() {
    if (!this.currentOrder) {
      log.error('No order scanned. Scan an order first.');
      return false;
    }

    try {
      log.title('CONFIRM ORDER READY FOR PICKUP');

      const notes = await prompt('Staff notes (or press Enter to skip): ') || 'Order verified and packed';

      log.info(`Confirming order ${this.currentOrder.storeCode}...`);

      const confirmRes = await axios.post(
        `${BASE_URL}/orders/${this.currentOrder.orderId}/confirm-pickup`,
        {
          staffId: this.staffId,
          notes
        },
        { headers: this.getHeaders() }
      );

      const order = confirmRes.data.data?.order;

      log.success(`Order status changed: processing → ${order.orderStatus}`);
      console.log(`\n${colors.bright}✓ Order is now READY FOR PICKUP${colors.reset}`);
      console.log(`   Confirmed At: ${new Date(order.confirmedAt).toLocaleString()}`);

      return true;

    } catch (error) {
      log.error(`Confirmation failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  // Mark order as collected (when dependent picks up)
  async markCollected() {
    if (!this.currentOrder) {
      log.error('No order scanned. Scan an order first.');
      return false;
    }

    try {
      log.title('MARK ORDER AS COLLECTED');

      const notes = await prompt('Collection notes (or press Enter to skip): ') || 'Order collected by customer';

      log.info(`Marking order ${this.currentOrder.storeCode} as collected...`);

      const collectRes = await axios.post(
        `${BASE_URL}/orders/${this.currentOrder.orderId}/mark-collected`,
        {
          collectionMethod: 'in_store_pickup',
          staffId: this.staffId,
          notes
        },
        { headers: this.getHeaders() }
      );

      const order = collectRes.data.data?.order;

      log.success(`Order status changed: ready_for_pickup → ${order.orderStatus}`);
      console.log(`\n${colors.bright}✓ Order COLLECTED${colors.reset}`);
      console.log(`   Collected At: ${new Date(order.collectedAt).toLocaleString()}`);
      console.log(`   Customer: ${order.customerName}`);
      console.log(`   Items: ${order.itemCount}`);
      console.log(`   Total: R${order.totalAmount}`);

      return true;

    } catch (error) {
      log.error(`Collection failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  // View all pending orders
  async viewPendingOrders() {
    try {
      log.title('PENDING ORDERS');

      log.info('Fetching pending orders...');

      const ordersRes = await axios.get(`${BASE_URL}/orders/pos/pending`, {
        headers: this.getHeaders()
      });

      const orders = ordersRes.data.data || [];

      if (orders.length === 0) {
        log.warn('No pending orders');
        return;
      }

      console.log(`\n${colors.bright}📦 PENDING ORDERS (${orders.length})${colors.reset}`);
      orders.forEach((order, idx) => {
        console.log(`\n   ${idx + 1}. ${order.customerName}`);
        console.log(`      Code: ${colors.bright}${order.storeCode}${colors.reset}`);
        console.log(`      Items: ${order.itemCount} | Total: R${order.totalAmount}`);
        console.log(`      Status: ${order.orderStatus}`);
        console.log(`      Created: ${new Date(order.createdAt).toLocaleTimeString()}`);
      });

    } catch (error) {
      log.error(`Failed to fetch pending orders: ${error.response?.data?.message || error.message}`);
    }
  }

  // Main menu
  async showMenu() {
    log.title('🏪 POS TERMINAL - PICKUP ORDER SYSTEM');

    console.log('Options:');
    console.log(`  1. Scan Order Code`);
    console.log(`  2. Confirm Order Ready (after packing)`);
    console.log(`  3. Mark Order Collected (when customer arrives)`);
    console.log(`  4. View All Pending Orders`);
    console.log(`  5. Exit\n`);

    const choice = await prompt('Select option (1-5): ');

    switch (choice) {
      case '1':
        await this.scanOrderCode();
        break;
      case '2':
        await this.confirmReady();
        break;
      case '3':
        await this.markCollected();
        break;
      case '4':
        await this.viewPendingOrders();
        break;
      case '5':
        log.info('Goodbye!');
        rl.close();
        return false;
      default:
        log.error('Invalid option');
    }

    return true;
  }

  // Run terminal
  async run() {
    try {
      // Authenticate
      const authenticated = await this.authenticate();
      if (!authenticated) {
        log.error('Failed to authenticate. Exiting.');
        rl.close();
        return;
      }

      // Main loop
      let running = true;
      while (running) {
        running = await this.showMenu();
      }

    } catch (error) {
      log.error(`Terminal error: ${error.message}`);
      rl.close();
    }
  }
}

// Start terminal
const pos = new POSTerminal();
pos.run();
