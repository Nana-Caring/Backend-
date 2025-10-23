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

// Create order from cart (checkout)
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
      where: { id: userId, role: 'dependent', isBlocked: false },
      include: [{
        model: Account,
        as: 'Accounts',
        attributes: ['id', 'balance', 'status']
      }]
    });

    if (!user) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Only active dependents can place orders'
      });
    }

    if (!user.Accounts || user.Accounts.length === 0 || user.Accounts[0].status !== 'active') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Account not found or inactive'
      });
    }

    // Get active cart items
    const cartItems = await Cart.findAll({
      where: { userId, status: 'active' },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'brand', 'price', 'inStock', 'isActive']
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

    // Validate cart items and calculate total
    let totalAmount = 0;
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

      // Use current product price for calculation
      const currentPrice = parseFloat(item.product.price);
      const itemTotal = currentPrice * item.quantity;
      
      validItems.push({
        cartItem: item,
        currentPrice,
        itemTotal
      });
      
      totalAmount += itemTotal;
    }

    if (validItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No valid items in cart',
        unavailableItems
      });
    }

    // Check account balance
    const account = user.Accounts[0];
    const accountBalance = parseFloat(account.balance);
    if (accountBalance < totalAmount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient account balance',
        data: {
          required: totalAmount,
          available: accountBalance,
          shortfall: totalAmount - accountBalance
        }
      });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId,
      accountId: account.id,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'processing',
      shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null
    }, { transaction });

    // Create order items
    const orderItemsData = validItems.map(({ cartItem, currentPrice }) => ({
      orderId: order.id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      priceAtOrder: currentPrice,
      subtotal: currentPrice * cartItem.quantity,
      productSnapshot: JSON.stringify({
        name: cartItem.product.name,
        brand: cartItem.product.brand,
        image: cartItem.product.image
      })
    }));

    const orderItems = await OrderItem.bulkCreate(orderItemsData, { transaction });

    // Deduct amount from account balance
    const newBalance = accountBalance - totalAmount;
    await account.update({ balance: newBalance }, { transaction });

    // Create transaction record
    await Transaction.create({
      userId,
      accountId: account.id,
      type: 'debit',
      amount: totalAmount,
      description: `Purchase - Order ${orderNumber}`,
      category: 'purchase',
      status: 'completed',
      reference: `ORDER_${order.id}`,
      balanceAfter: newBalance
    }, { transaction });

    // Update order payment status
    await order.update({ 
      paymentStatus: 'completed',
      paidAt: new Date()
    }, { transaction });

    // Clear cart items that were ordered
    const cartItemIds = validItems.map(item => item.cartItem.id);
    await Cart.destroy({
      where: { id: { [Op.in]: cartItemIds } },
      transaction
    });

    await transaction.commit();

    // Fetch complete order data
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['name', 'brand', 'image']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: completeOrder,
        unavailableItems: unavailableItems.length > 0 ? unavailableItems : undefined
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process order',
      error: error.message
    });
  }
};

// Get user's orders
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
            attributes: ['name', 'brand', 'image']
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

// Get specific order details
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
            attributes: ['id', 'name', 'brand', 'image', 'category']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
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

// Cancel order (if still processing)
const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [{
        model: User,
        as: 'user',
        include: [{
          model: Account,
          as: 'Accounts'
        }]
      }],
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

    // Refund amount to account
    if (order.paymentStatus === 'completed') {
      const userAccount = order.user.Accounts[0];
      const newBalance = parseFloat(userAccount.balance) + parseFloat(order.totalAmount);
      
      await userAccount.update({ balance: newBalance }, { transaction });

      // Create refund transaction record
      await Transaction.create({
        userId,
        accountId: userAccount.id,
        type: 'credit',
        amount: order.totalAmount,
        description: `Refund - Order ${order.orderNumber} cancelled`,
        category: 'refund',
        status: 'completed',
        reference: `REFUND_${order.id}`,
        balanceAfter: newBalance
      }, { transaction });
    }

    // Update order status
    await order.update({
      orderStatus: 'cancelled',
      cancelledAt: new Date()
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
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
