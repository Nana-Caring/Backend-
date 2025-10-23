const { DataTypes, Sequelize } = require('sequelize');

// We'll define the model function and export it for use in index.js
module.exports = (sequelize) => {

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  detailedDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  category: {
    type: DataTypes.ENUM('Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'),
    allowNull: false,
    comment: 'Product category matching dependent account types'
  },
  subcategory: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'More specific category like Books, Medicine, etc.'
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'Product SKU/ID for identification'
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Primary product image URL'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of additional product image URLs'
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Product ingredients or specifications'
  },
  weight: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Product weight or size'
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Search tags for the product'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the product is available for purchase'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 5
    },
    comment: 'Average product rating'
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  // Age restriction fields
  minAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 150
    },
    comment: 'Minimum age required to purchase this product'
  },
  maxAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 150,
    validate: {
      min: 0,
      max: 150
    },
    comment: 'Maximum age allowed to purchase this product'
  },
  ageCategory: {
    type: DataTypes.ENUM('Toddler', 'Child', 'Teen', 'Adult', 'Senior', 'All Ages'),
    allowNull: true,
    defaultValue: 'All Ages',
    comment: 'Target age category for the product'
  },
  requiresAgeVerification: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this product requires age verification before purchase'
  },
  // Admin tracking fields
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Admin user ID who created the product'
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Admin user ID who last updated the product'
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['brand']
    },
    {
      fields: ['sku']
    },
    {
      fields: ['isActive']
    }
  ]
});

return Product;
};
