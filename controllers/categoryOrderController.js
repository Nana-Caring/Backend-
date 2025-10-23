const { Order, OrderItem, Cart, Product, User, Account, Transaction } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Helper function to group cart items by product category
const groupCartItemsByCategory = (cartItems) => {
  const grouped = {};
  
  cartItems.forEach(item => {
    const category = item.product.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  return grouped;
};

// Helper function to calculate total for category items
const calculateCategoryTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (parseFloat(item.priceAtTime) * item.quantity);
  }, 0);
};

// Create order from cart with category-based payment (checkout)
const checkout = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { shippingAddress, paymentMethod = 'account_balance' } = req.body;
    const userId = req.user.id;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user is a dependent
    const user = await User.findOne({
      where: { id: userId, role: 'dependent', status: 'active' },
      include: [{
        model: Account,
        as: 'Accounts',
        attributes: ['id', 'balance', 'status', 'category', 'isMainAccount', 'accountName']
      }],
      transaction
    });

    if (!user) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Only active dependents can place orders'
      });
    }

    if (!user.Accounts || user.Accounts.length === 0) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'No accounts found for user'
      });
    }

    // Get active cart items with product details
    const cartItems = await Cart.findAll({
      where: { userId, status: 'active' },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'brand', 'price', 'category', 'inStock', 'isActive']
      }],
      transaction
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate cart items and filter available ones
    const validItems = [];
    const unavailableItems = [];

    for (const item of cartItems) {
      if (!item.product || !item.product.isActive || !item.product.inStock) {
        unavailableItems.push({
          name: item.product?.name || 'Unknown Product',
          reason: 'Product unavailable or out of stock'
        });
        continue;
      }
      validItems.push(item);
    }

    if (validItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No valid items in cart',
        unavailableItems
      });
    }

    // Group cart items by product category
    const itemsByCategory = groupCartItemsByCategory(validItems);
    
    // Create account lookup for faster access
    const accountsByCategory = {};
    let mainAccount = null;
    
    user.Accounts.forEach(account => {
      if (account.isMainAccount) {
        mainAccount = account;
      } else if (account.category) {
        accountsByCategory[account.category] = account;
      }
    });

    // Validate sufficient funds for each category
    const paymentPlan = [];
    let totalOrderAmount = 0;
    const insufficientCategories = [];

    for (const [category, items] of Object.entries(itemsByCategory)) {
      const categoryTotal = calculateCategoryTotal(items);
      totalOrderAmount += categoryTotal;
      
      const categoryAccount = accountsByCategory[category];
      
      if (!categoryAccount) {
        // If no category account exists, try to use main account
        if (!mainAccount) {
          insufficientCategories.push({
            category,
            required: categoryTotal,
            available: 0,
            reason: `No ${category} account found and no main account available`
          });
          continue;
        }
        
        paymentPlan.push({
          category,
          account: mainAccount,
          amount: categoryTotal,
          items: items.length
        });
      } else {
        const availableBalance = parseFloat(categoryAccount.balance);
        
        if (availableBalance < categoryTotal) {
          insufficientCategories.push({
            category,
            required: categoryTotal,
            available: availableBalance,
            shortfall: categoryTotal - availableBalance,
            reason: `Insufficient funds in ${category} account`
          });
          continue;
        }
        
        paymentPlan.push({
          category,
          account: categoryAccount,
          amount: categoryTotal,
          items: items.length
        });
      }
    }

    if (insufficientCategories.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds for some categories',
        data: {
          totalRequired: totalOrderAmount,
          insufficientCategories,
          paymentBreakdown: paymentPlan
        }
      });
    }

    // Create the order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId,
      accountId: mainAccount?.id || paymentPlan[0].account.id, // Primary account for order tracking
      totalAmount: totalOrderAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'processing',
      shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null
    }, { transaction });

    // Create order items and process payments by category
    const orderItemsData = [];
    const transactionRecords = [];

    for (const [category, items] of Object.entries(itemsByCategory)) {
      const categoryAccount = paymentPlan.find(p => p.category === category)?.account;
      const categoryTotal = calculateCategoryTotal(items);
      
      // Create order items for this category
      for (const cartItem of items) {
        const itemTotal = parseFloat(cartItem.priceAtTime) * cartItem.quantity;
        
        orderItemsData.push({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          priceAtOrder: cartItem.priceAtTime,
          subtotal: itemTotal,
          productSnapshot: JSON.stringify({
            name: cartItem.product.name,
            brand: cartItem.product.brand,
            category: cartItem.product.category
          })
        });
      }

      // Deduct amount from category account
      const newBalance = parseFloat(categoryAccount.balance) - categoryTotal;
      await categoryAccount.update({ balance: newBalance }, { transaction });

      // Create transaction record for this category
      transactionRecords.push({
        userId,
        accountId: categoryAccount.id,
        type: 'debit',
        amount: categoryTotal,
        description: `Purchase - Order ${orderNumber} (${category})`,
        category: 'purchase',
        status: 'completed',
        reference: `ORDER_${order.id}_${category.toUpperCase()}`,
        balanceAfter: newBalance
      });
    }

    // Bulk create order items and transaction records
    await OrderItem.bulkCreate(orderItemsData, { transaction });
    await Transaction.bulkCreate(transactionRecords, { transaction });

    // Update order payment status
    await order.update({ 
      paymentStatus: 'completed',
      paidAt: new Date()
    }, { transaction });

    // Clear cart items that were ordered
    const cartItemIds = validItems.map(item => item.id);
    await Cart.destroy({
      where: { id: { [Op.in]: cartItemIds } },
      transaction
    });

    await transaction.commit();

    // Fetch complete order data for response
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['name', 'brand', 'category']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'surname', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully with category-based payment',
      data: {
        order: completeOrder,
        paymentBreakdown: paymentPlan.map(plan => ({
          category: plan.category,
          accountName: plan.account.accountName,
          amount: plan.amount,
          items: plan.items
        })),
        unavailableItems: unavailableItems.length > 0 ? unavailableItems : undefined
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Category-based checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process order',
      error: error.message
    });
  }
};

// Get user's orders (unchanged)
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId };

    if (status) {
      whereClause.orderStatus = status;
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['name', 'brand', 'category']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        orders: orders.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(orders.count / limit),
          totalOrders: orders.count,
          hasMore: offset + orders.rows.length < orders.count
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
};

// Get specific order details (unchanged)
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'brand', 'category']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'surname', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details',
      error: error.message
    });
  }
};

// Cancel order with category-based refunds
const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['category']
          }]
        },
        {
          model: User,
          as: 'user',
          include: [{
            model: Account,
            as: 'Accounts'
          }]
        }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'processing') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only processing orders can be cancelled'
      });
    }

    if (order.paymentStatus === 'completed') {
      // Group order items by category for refund
      const refundsByCategory = {};
      
      order.orderItems.forEach(item => {
        const category = item.product.category;
        if (!refundsByCategory[category]) {
          refundsByCategory[category] = 0;
        }
        refundsByCategory[category] += parseFloat(item.subtotal);
      });

      // Create account lookup
      const accountsByCategory = {};
      let mainAccount = null;
      
      order.user.Accounts.forEach(account => {
        if (account.isMainAccount) {
          mainAccount = account;
        } else if (account.category) {
          accountsByCategory[account.category] = account;
        }
      });

      // Process refunds by category
      for (const [category, refundAmount] of Object.entries(refundsByCategory)) {
        const categoryAccount = accountsByCategory[category] || mainAccount;
        
        if (categoryAccount) {
          const newBalance = parseFloat(categoryAccount.balance) + refundAmount;
          await categoryAccount.update({ balance: newBalance }, { transaction });

          // Create refund transaction record
          await Transaction.create({
            userId,
            accountId: categoryAccount.id,
            type: 'credit',
            amount: refundAmount,
            description: `Refund - Order ${order.orderNumber} cancelled (${category})`,
            category: 'refund',
            status: 'completed',
            reference: `REFUND_${order.id}_${category.toUpperCase()}`,
            balanceAfter: newBalance
          }, { transaction });
        }
      }
    }

    // Update order status
    await order.update({
      orderStatus: 'cancelled',
      cancelledAt: new Date()
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Order cancelled successfully with category-based refunds'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

module.exports = {
  checkout,
  getOrders,
  getOrderDetails,
  cancelOrder
};
