const { Product, User } = require('../models');
const { validationResult } = require('express-validator');
const { calculateAgeFromSAId, canAccessProduct } = require('../utils/ageCalculator');
const { processAndSaveImage, deleteImageFiles, generateFileName } = require('../middlewares/imageUpload');

// Get all products with filtering
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      inStock,
      isActive = true,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Fix isActive parsing - if no query param, default to true
    let isActiveValue = true;
    if (req.query.hasOwnProperty('isActive')) {
      isActiveValue = req.query.isActive === 'true';
    }

    const where = {
      isActive: isActiveValue
    };

    // Apply filters
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (inStock !== undefined) where.inStock = inStock === 'true';

    // Search functionality
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { exclude: ['createdBy', 'updatedBy'] } // Hide admin tracking from public
    });

    res.json({
      success: true,
      data: products.rows,
      pagination: {
        total: products.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(products.count / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get product by ID or SKU
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the id parameter is numeric (actual ID) or string (SKU)
    const isNumericId = !isNaN(parseInt(id)) && parseInt(id).toString() === id;
    
    let whereClause;
    if (isNumericId) {
      // Search by actual database ID
      whereClause = { 
        id: parseInt(id), 
        isActive: true 
      };
    } else {
      // Search by SKU
      whereClause = { 
        sku: id, 
        isActive: true 
      };
    }
    
    const product = await Product.findOne({
      where: whereClause,
      attributes: { exclude: ['createdBy', 'updatedBy'] }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with ${isNumericId ? 'ID' : 'SKU'}: ${id}`
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Admin: Create new product
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = {
      ...req.body,
      createdBy: req.user.id, // Admin user ID
      sku: req.body.sku || `SKU${Date.now()}` // Auto-generate SKU if not provided
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists',
        error: 'Duplicate SKU'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Admin: Update product
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const [updatedRows] = await Product.update(updateData, {
      where: { id },
      returning: true
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await Product.findByPk(id);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Admin: Delete product (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [updatedRows] = await Product.update(
      { 
        isActive: false,
        updatedBy: req.user.id
      },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Admin: Get products by category (for account management)
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const products = await Product.findAll({
      where: { 
        category,
        isActive: true
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: products,
      category: category
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category',
      error: error.message
    });
  }
};

// Admin: Get product statistics
const getProductStats = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    const stats = await Product.findAll({
      attributes: [
        'category',
        [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'count'],
        [Product.sequelize.fn('AVG', Product.sequelize.col('price')), 'avgPrice'],
        [Product.sequelize.fn('SUM', Product.sequelize.col('stockQuantity')), 'totalStock']
      ],
      where: { isActive: true },
      group: ['category'],
      raw: true
    });

    const totalProducts = await Product.count({ where: { isActive: true } });
    const totalInStock = await Product.count({ 
      where: { 
        isActive: true, 
        inStock: true 
      } 
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalInStock,
        outOfStock: totalProducts - totalInStock,
        categoryStats: stats
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: error.message
    });
  }
};

// Get age-appropriate products for dependent
const getProductsForDependent = async (req, res) => {
  try {
    const { dependentId } = req.params;
    const {
      category,
      brand,
      search,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    // Get dependent user details
    const dependent = await User.findOne({
      where: { 
        id: dependentId,
        role: 'dependent',
        isBlocked: false
      },
      attributes: ['id', 'firstName', 'surname', 'Idnumber', 'role']
    });

    if (!dependent) {
      return res.status(404).json({
        success: false,
        message: 'Dependent not found or access denied'
      });
    }

    // Calculate age from ID number
    const ageInfo = calculateAgeFromSAId(dependent.Idnumber);
    
    if (!ageInfo.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID number - cannot determine age',
        error: ageInfo.error
      });
    }

    const userAge = ageInfo.age;

    // Build where conditions
    const where = {
      isActive: true,
      inStock: true
    };

    // Age-based filtering
    const { Op } = require('sequelize');
    where[Op.and] = [
      {
        [Op.or]: [
          { minAge: null },
          { minAge: { [Op.lte]: userAge } }
        ]
      },
      {
        [Op.or]: [
          { maxAge: null },
          { maxAge: { [Op.gte]: userAge } }
        ]
      }
    ];

    // Apply additional filters
    if (category) where.category = category;
    if (brand) where.brand = brand;

    // Search functionality
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { exclude: ['createdBy', 'updatedBy'] }
    });

    res.json({
      success: true,
      data: products.rows,
      dependent: {
        id: dependent.id,
        name: `${dependent.firstName} ${dependent.surname}`,
        age: userAge,
        ageCategory: ageInfo.ageCategory
      },
      pagination: {
        total: products.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(products.count / limit)
      }
    });

  } catch (error) {
    console.error('Get products for dependent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch age-appropriate products',
      error: error.message
    });
  }
};

// Validate if dependent can purchase a specific product
const validateProductAccess = async (req, res) => {
  try {
    const { dependentId, productId } = req.params;

    // Get dependent details
    const dependent = await User.findOne({
      where: { 
        id: dependentId,
        role: 'dependent',
        isBlocked: false
      },
      attributes: ['id', 'firstName', 'surname', 'Idnumber']
    });

    if (!dependent) {
      return res.status(404).json({
        success: false,
        message: 'Dependent not found'
      });
    }

    // Get product details
    const product = await Product.findOne({
      where: { 
        id: productId,
        isActive: true 
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate age and check access
    const ageInfo = calculateAgeFromSAId(dependent.Idnumber);
    
    if (!ageInfo.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID number - cannot verify age',
        error: ageInfo.error
      });
    }

    const canAccess = canAccessProduct(ageInfo.age, {
      minAge: product.minAge,
      maxAge: product.maxAge
    });

    res.json({
      success: true,
      data: {
        canAccess,
        dependentAge: ageInfo.age,
        productAgeRestriction: {
          minAge: product.minAge,
          maxAge: product.maxAge,
          ageCategory: product.ageCategory,
          requiresVerification: product.requiresAgeVerification
        },
        message: canAccess ? 
          'Product is available for this dependent' : 
          `Product not available - age restriction (${product.minAge}-${product.maxAge} years)`
      }
    });

  } catch (error) {
    console.error('Validate product access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate product access',
      error: error.message
    });
  }
};

// Upload main product image
const uploadMainImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete old main image if exists
    if (product.mainImage) {
      await deleteImageFiles(product.mainImage);
    }

    // Process and save new image
    const filename = generateFileName(req.file.originalname);
    const imageData = await processAndSaveImage(req.file.buffer, filename);

    // Update product with new main image
    await product.update({
      mainImage: imageData,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Main image uploaded successfully',
      data: {
        mainImage: imageData
      }
    });

  } catch (error) {
    console.error('Upload main image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload main image',
      error: error.message
    });
  }
};

// Upload thumbnail images
const uploadThumbnailImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Process each uploaded file
    const newThumbnails = [];
    for (const file of req.files) {
      const filename = generateFileName(file.originalname);
      const imageData = await processAndSaveImage(file.buffer, filename);
      newThumbnails.push(imageData);
    }

    // Get current thumbnails and add new ones
    const currentThumbnails = product.thumbnailImages || [];
    const updatedThumbnails = [...currentThumbnails, ...newThumbnails];

    // Limit to maximum 4 thumbnails
    if (updatedThumbnails.length > 4) {
      // Delete excess images
      const excessImages = updatedThumbnails.slice(4);
      for (const imageData of excessImages) {
        await deleteImageFiles(imageData);
      }
      updatedThumbnails.splice(4);
    }

    // Update product
    await product.update({
      thumbnailImages: updatedThumbnails,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Thumbnail images uploaded successfully',
      data: {
        thumbnailImages: updatedThumbnails,
        totalThumbnails: updatedThumbnails.length
      }
    });

  } catch (error) {
    console.error('Upload thumbnail images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload thumbnail images',
      error: error.message
    });
  }
};

// Delete specific thumbnail image
const deleteThumbnailImage = async (req, res) => {
  try {
    const { id, thumbnailIndex } = req.params;
    const index = parseInt(thumbnailIndex);

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const thumbnails = product.thumbnailImages || [];
    if (index < 0 || index >= thumbnails.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid thumbnail index'
      });
    }

    // Delete the image files
    await deleteImageFiles(thumbnails[index]);

    // Remove from array
    thumbnails.splice(index, 1);

    // Update product
    await product.update({
      thumbnailImages: thumbnails,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Thumbnail image deleted successfully',
      data: {
        thumbnailImages: thumbnails,
        totalThumbnails: thumbnails.length
      }
    });

  } catch (error) {
    console.error('Delete thumbnail image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete thumbnail image',
      error: error.message
    });
  }
};

// Get product images
const getProductImages = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id },
      attributes: ['id', 'name', 'mainImage', 'thumbnailImages', 'image', 'images'] // Include legacy fields
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        image: product.image,
        images: product.images || []
      }
    });

  } catch (error) {
    console.error('Get product images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product images',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductStats,
  getProductsForDependent,
  validateProductAccess,
  uploadMainImage,
  uploadThumbnailImages,
  deleteThumbnailImage,
  getProductImages
};
