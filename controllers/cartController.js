const { Cart, Product, User, Account } = require('../models');
const { calculateAgeFromSAId, canAccessProduct } = require('../utils/ageCalculator');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Add product to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user is a dependent
    const user = await User.findOne({
      where: { id: userId, role: 'dependent', isBlocked: false }
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Only dependents can add items to cart'
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({
      where: { id: productId, isActive: true, inStock: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or out of stock'
      });
    }

    // Verify age restrictions
    const ageInfo = calculateAgeFromSAId(user.Idnumber);
    if (!ageInfo.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID number - cannot verify age'
      });
    }

    const canAccess = canAccessProduct(ageInfo.age, {
      minAge: product.minAge,
      maxAge: product.maxAge
    });

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: `Product not available for your age group (${product.minAge}-${product.maxAge} years)`
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({
      where: { userId, productId, status: 'active' }
    });

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + parseInt(quantity);
      if (newQuantity > 50) {
        return res.status(400).json({
          success: false,
          message: 'Maximum quantity per item is 50'
        });
      }

      await existingCartItem.update({ quantity: newQuantity });
      
      const updatedItem = await Cart.findByPk(existingCartItem.id, {
        include: [{
          model: Product,
          as: 'product',
          attributes: ['name', 'image', 'brand']
        }]
      });

      return res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: updatedItem
      });
    }

    // Add new item to cart
    const cartItem = await Cart.create({
      userId,
      productId,
      quantity: parseInt(quantity),
      priceAtTime: product.price,
      status: 'active'
    });

    const newCartItem = await Cart.findByPk(cartItem.id, {
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'image', 'brand']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Product added to cart successfully',
      data: newCartItem
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart',
      error: error.message
    });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { userId, status: 'active' },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'brand', 'image', 'images', 'price', 'inStock', 'isActive']
      }],
      order: [['addedAt', 'DESC']]
    });

    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;
    const validItems = [];

    for (const item of cartItems) {
      if (item.product && item.product.isActive && item.product.inStock) {
        validItems.push(item);
        totalItems += item.quantity;
        totalAmount += parseFloat(item.priceAtTime) * item.quantity;
      }
    }

    res.json({
      success: true,
      data: {
        items: validItems,
        summary: {
          totalItems,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          itemCount: validItems.length
        }
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: error.message
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1 || quantity > 50) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 50'
      });
    }

    const cartItem = await Cart.findOne({
      where: { id, userId, status: 'active' }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await cartItem.update({ quantity: parseInt(quantity) });

    const updatedItem = await Cart.findByPk(id, {
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'image', 'brand']
      }]
    });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({
      where: { id, userId }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: error.message
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await Cart.destroy({
      where: { userId, status: 'active' }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Save item for later
const saveForLater = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({
      where: { id, userId, status: 'active' }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await cartItem.update({ status: 'saved_for_later' });

    res.json({
      success: true,
      message: 'Item saved for later'
    });

  } catch (error) {
    console.error('Save for later error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save item for later',
      error: error.message
    });
  }
};

// Move saved item back to cart
const moveToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({
      where: { id, userId, status: 'saved_for_later' }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Saved item not found'
      });
    }

    await cartItem.update({ status: 'active' });

    res.json({
      success: true,
      message: 'Item moved back to cart'
    });

  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move item to cart',
      error: error.message
    });
  }
};

// Get saved items
const getSavedItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedItems = await Cart.findAll({
      where: { userId, status: 'saved_for_later' },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'brand', 'image', 'images', 'price', 'inStock', 'isActive']
      }],
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: savedItems
    });

  } catch (error) {
    console.error('Get saved items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved items',
      error: error.message
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  saveForLater,
  moveToCart,
  getSavedItems
};
