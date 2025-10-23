const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the table if it exists to recreate it cleanly
    await queryInterface.dropTable('products', { cascade: true });
    
    // Create the products table fresh
    await queryInterface.createTable('products', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
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
        allowNull: false
      },
      category: {
        type: DataTypes.ENUM('Education', 'Healthcare', 'Groceries', 'Transport', 'Entertainment', 'Other'),
        allowNull: false
      },
      subcategory: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sku: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      inStock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      ingredients: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      weight: {
        type: DataTypes.STRING,
        allowNull: true
      },
      manufacturer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
      },
      reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      minAge: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      maxAge: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 150
      },
      ageCategory: {
        type: DataTypes.ENUM('Toddler', 'Child', 'Teen', 'Adult', 'Senior', 'All Ages'),
        allowNull: true,
        defaultValue: 'All Ages'
      },
      requiresAgeVerification: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('products', ['category']);
    await queryInterface.addIndex('products', ['brand']);
    await queryInterface.addIndex('products', ['sku']);
    await queryInterface.addIndex('products', ['isActive']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
  }
};
