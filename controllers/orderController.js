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

// Generate unique 8-character store code
const generateStoreCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create order from cart (checkout)
const checkout = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { shippingAddress, address, fulfillmentType = 'pickup', paymentMethod = 'account_balance' } = req.body;
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

    // Get active cart items with complete product details
    const cartItems = await Cart.findAll({
      where: { userId, status: 'active' },
      include: [{
        model: Product,
        as: 'product',
        attributes: [
          'id', 'name', 'brand', 'price', 'inStock', 'isActive', 
          'description', 'detailedDescription', 'category', 'subcategory',
          'image', 'images', 'sku', 'ingredients', 'nutritionalInfo',
          'allergens', 'weight', 'dimensions', 'manufacturer'
        ]
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

    // Prepare shipping/collection address (pickup-first)
    let computedShipping = shippingAddress || null;
    if (!computedShipping) {
      // If flat address provided, map it
      if (address && typeof address === 'string') {
        computedShipping = {
          fullName: `${req.user.firstName || user.firstName || ''} ${req.user.surname || user.surname || req.user.lastName || user.lastName || ''}`.trim(),
          address1: address
        };
      } else {
        // Fallback to user's saved addresses (home first, then postal)
        const addrLine1 = user.homeAddressLine1 || user.postalAddressLine1 || null;
        const addrLine2 = user.homeAddressLine2 || user.postalAddressLine2 || null;
        const city = user.homeCity || user.postalCity || null;
        const province = user.homeProvince || user.postalProvince || null;
        const code = user.homeCode || user.postalCode || null;
        if (addrLine1 || city || province || code) {
          computedShipping = {
            fullName: `${user.firstName} ${user.surname || user.lastName || ''}`.trim(),
            address1: addrLine1 || undefined,
            address2: addrLine2 || undefined,
            city: city || undefined,
            province: province || undefined,
            postalCode: code || undefined
          };
        }
      }
    }
    // Always embed fulfillmentType for clarity (even though we store in shippingAddress column)
    if (computedShipping) {
      computedShipping.fulfillmentType = fulfillmentType || 'pickup';
    }

    // Create order
    const orderNumber = generateOrderNumber();
    let storeCode = generateStoreCode();
    
    // Ensure storeCode is unique
    while (await Order.findOne({ where: { storeCode }, transaction })) {
      storeCode = generateStoreCode();
    }
    
    const order = await Order.create({
      orderNumber,
      storeCode,
      userId,
      accountId: account.id,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'processing',
      shippingAddress: computedShipping ? JSON.stringify(computedShipping) : null
    }, { transaction });

    // Create order items with detailed product snapshots
    const orderItemsData = validItems.map(({ cartItem, currentPrice }) => ({
      orderId: order.id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      priceAtTime: currentPrice,
      totalPrice: currentPrice * cartItem.quantity,
      productSnapshot: JSON.stringify({
        id: cartItem.product.id,
        name: cartItem.product.name,
        brand: cartItem.product.brand,
        description: cartItem.product.description,
        detailedDescription: cartItem.product.detailedDescription,
        category: cartItem.product.category,
        subcategory: cartItem.product.subcategory,
        sku: cartItem.product.sku,
        image: cartItem.product.image,
        images: cartItem.product.images || [],
        ingredients: cartItem.product.ingredients,
        nutritionalInfo: cartItem.product.nutritionalInfo,
        allergens: cartItem.product.allergens,
        weight: cartItem.product.weight,
        dimensions: cartItem.product.dimensions,
        manufacturer: cartItem.product.manufacturer,
        priceAtTime: currentPrice
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
      type: 'Debit',
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
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['name', 'brand', 'image']
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
      message: 'Order placed successfully',
      data: {
        order: completeOrder,
        collection: {
          mode: fulfillmentType || 'pickup',
          pickupHint: computedShipping ? [computedShipping.city, computedShipping.province].filter(Boolean).join(', ') : null
        },
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
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: [
              'id', 'name', 'brand', 'category', 'subcategory',
              'image', 'images', 'sku', 'description'
            ]
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
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: [
              'id', 'name', 'brand', 'category', 'subcategory',
              'image', 'images', 'sku', 'description', 'detailedDescription',
              'ingredients', 'nutritionalInfo', 'allergens', 'weight',
              'dimensions', 'manufacturer', 'inStock', 'isActive'
            ]
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

    // Parse product snapshots and merge with current product data
    const enhancedOrderItems = order.items.map(item => {
      let productSnapshot = {};
      try {
        productSnapshot = JSON.parse(item.productSnapshot || '{}');
      } catch (e) {
        console.warn('Failed to parse product snapshot for order item:', item.id);
      }

      return {
        ...item.toJSON(),
        productAtOrderTime: productSnapshot,
        currentProduct: item.product,
        displayProduct: {
          ...productSnapshot,
          // Use current product data if snapshot is incomplete
          image: productSnapshot.image || item.product?.image,
          images: productSnapshot.images || item.product?.images || [],
          name: productSnapshot.name || item.product?.name,
          brand: productSnapshot.brand || item.product?.brand,
          description: productSnapshot.description || item.product?.description,
          detailedDescription: productSnapshot.detailedDescription || item.product?.detailedDescription,
          category: productSnapshot.category || item.product?.category,
          subcategory: productSnapshot.subcategory || item.product?.subcategory,
          sku: productSnapshot.sku || item.product?.sku
        }
      };
    });

    const orderWithDetails = {
      ...order.toJSON(),
      orderItems: enhancedOrderItems,
      collection: (() => {
        let s = {};
        try { s = JSON.parse(order.shippingAddress || '{}'); } catch {}
        return {
          mode: s.fulfillmentType || 'pickup',
          pickupHint: [s.city, s.province].filter(Boolean).join(', ') || null
        };
      })(),
      storeInstructions: {
        code: order.storeCode,
        message: `Present this code at checkout: ${order.storeCode}`,
        note: 'This code verifies your order for in-store pickup'
      }
    };

    res.json({
      success: true,
      data: orderWithDetails
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

// Get order by store code (for in-store verification)
const getOrderByStoreCode = async (req, res) => {
  try {
    const { storeCode } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { 
        storeCode: storeCode.toUpperCase(),
        userId // Ensure user can only access their own orders
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: [
              'id', 'name', 'brand', 'category', 'subcategory',
              'image', 'images', 'sku', 'description', 'detailedDescription'
            ]
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
        message: 'Order not found with provided store code'
      });
    }

    // Parse product snapshots for detailed display
    const enhancedOrderItems = order.items.map(item => {
      let productSnapshot = {};
      try {
        productSnapshot = JSON.parse(item.productSnapshot || '{}');
      } catch (e) {
        console.warn('Failed to parse product snapshot for order item:', item.id);
      }

      return {
        ...item.toJSON(),
        displayProduct: {
          ...productSnapshot,
          image: productSnapshot.image || item.product?.image,
          images: productSnapshot.images || item.product?.images || [],
          name: productSnapshot.name || item.product?.name,
          brand: productSnapshot.brand || item.product?.brand,
          description: productSnapshot.description || item.product?.description,
          sku: productSnapshot.sku || item.product?.sku
        }
      };
    });

    // Basic validity checks for in-store verification
    const isValid = order.paymentStatus === 'completed'
      && order.orderStatus !== 'cancelled'
      && parseFloat(order.totalAmount) > 0
      && enhancedOrderItems.length > 0;

    const shipping = (() => { try { return JSON.parse(order.shippingAddress || '{}'); } catch { return {}; } })();

    const orderForStore = {
      ...order.toJSON(),
      orderItems: enhancedOrderItems,
      verificationInfo: {
        storeCode: order.storeCode,
        customerName: `${order.user.firstName} ${order.user.surname || ''}`.trim(),
        orderDate: order.createdAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        isValid,
        reasons: isValid ? [] : [
          order.paymentStatus !== 'completed' ? 'Payment not completed' : null,
          order.orderStatus === 'cancelled' ? 'Order cancelled' : null,
          !(parseFloat(order.totalAmount) > 0) ? 'Invalid order amount' : null,
          enhancedOrderItems.length === 0 ? 'No items in order' : null
        ].filter(Boolean)
      },
      collection: {
        mode: (shipping && shipping.fulfillmentType) || 'pickup',
        pickupHint: [shipping?.city, shipping?.province].filter(Boolean).join(', ') || null
      }
    };

    res.json({
      success: true,
      data: orderForStore,
      message: 'Order verified successfully'
    });

  } catch (error) {
    console.error('Get order by store code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify order',
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

// POS: Confirm order is picked/packed and ready for collection
const confirmPickup = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const { staffId, notes } = req.body;

    // Find order
    const order = await Order.findOne({
      where: { id: orderId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'surname', 'email']
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

    // Only processing orders can be confirmed
    if (order.orderStatus !== 'processing') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Order status is ${order.orderStatus}, cannot confirm. Expected: processing`
      });
    }

    // Update order status
    await order.update({
      orderStatus: 'ready_for_pickup',
      confirmedAt: new Date(),
      fulfillmentNotes: notes || `Confirmed by staff: ${staffId}`
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Order confirmed and ready for pickup',
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          storeCode: order.storeCode,
          orderStatus: 'ready_for_pickup',
          confirmedAt: order.confirmedAt,
          customerName: `${order.user.firstName} ${order.user.surname}`,
          notes: notes
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Confirm pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm pickup',
      error: error.message
    });
  }
};

// POS: Mark order as collected by dependent
const markCollected = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const { collectionMethod = 'in_store_pickup', notes, staffId } = req.body;

    // Find order
    const order = await Order.findOne({
      where: { id: orderId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'surname', 'email']
      }, {
        model: OrderItem,
        as: 'items',
        attributes: ['quantity', 'priceAtTime', 'totalPrice', 'productSnapshot']
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

    // Only ready_for_pickup orders can be marked as collected
    if (order.orderStatus !== 'ready_for_pickup' && order.orderStatus !== 'processing') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Order status is ${order.orderStatus}, cannot collect. Expected: ready_for_pickup or processing`
      });
    }

    // Update order status
    await order.update({
      orderStatus: 'delivered',
      collectedAt: new Date(),
      fulfillmentMethod: collectionMethod,
      fulfillmentNotes: notes || `Collected by staff: ${staffId}`
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Order marked as collected',
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          storeCode: order.storeCode,
          orderStatus: 'delivered',
          collectedAt: order.collectedAt,
          collectionMethod: collectionMethod,
          customerName: `${order.user.firstName} ${order.user.surname}`,
          totalAmount: order.totalAmount,
          itemCount: order.items?.length || 0,
          notes: notes
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Mark collected error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark order as collected',
      error: error.message
    });
  }
};

// List pending orders (for POS/retailer to see all orders waiting for pickup)
const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        orderStatus: ['processing', 'ready_for_pickup']
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'surname', 'Idnumber']
      }, {
        model: OrderItem,
        as: 'items',
        attributes: ['quantity', 'priceAtTime', 'productSnapshot']
      }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      message: 'Pending orders retrieved',
      data: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        storeCode: order.storeCode,
        customerName: `${order.user.firstName} ${order.user.surname}`,
        customerAge: calculateAge(order.user.Idnumber),
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        confirmedAt: order.confirmedAt
      }))
    });

  } catch (error) {
    console.error('Get pending orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending orders',
      error: error.message
    });
  }
};

// Helper: calculate age from Idnumber
const calculateAge = (idnumber) => {
  if (!idnumber || idnumber.length < 6) return null;
  const year = parseInt(idnumber.substring(0, 2));
  const month = parseInt(idnumber.substring(2, 4));
  const day = parseInt(idnumber.substring(4, 6));
  const fullYear = year <= new Date().getFullYear() % 100 ? 2000 + year : 1900 + year;
  const birthDate = new Date(fullYear, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

module.exports = {
  checkout,
  getOrders,
  getOrderDetails,
  getOrderByStoreCode,
  cancelOrder,
  confirmPickup,
  markCollected,
  getPendingOrders
};
