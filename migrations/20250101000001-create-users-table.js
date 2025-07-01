'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Create Users table
      await queryInterface.createTable('Users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        middleName: {
          type: Sequelize.STRING,
          allowNull: true
        },
        surname: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        role: {
          type: Sequelize.ENUM('funder', 'caregiver', 'dependent'),
          allowNull: false
        },
        Idnumber: {
          type: Sequelize.STRING(13),
          allowNull: false,
          unique: true
        },
        relation: {
          type: Sequelize.STRING,
          allowNull: true
        },
        // Personal details - these remain null until user explicitly edits them
        phoneNumber: {
          type: Sequelize.STRING(15),
          allowNull: true
        },
        // Postal Address fields
        postalAddressLine1: {
          type: Sequelize.STRING,
          allowNull: true
        },
        postalAddressLine2: {
          type: Sequelize.STRING,
          allowNull: true
        },
        postalCity: {
          type: Sequelize.STRING,
          allowNull: true
        },
        postalProvince: {
          type: Sequelize.STRING,
          allowNull: true
        },
        postalCode: {
          type: Sequelize.STRING(10),
          allowNull: true
        },
        // Home Address fields
        homeAddressLine1: {
          type: Sequelize.STRING,
          allowNull: true
        },
        homeAddressLine2: {
          type: Sequelize.STRING,
          allowNull: true
        },
        homeCity: {
          type: Sequelize.STRING,
          allowNull: true
        },
        homeProvince: {
          type: Sequelize.STRING,
          allowNull: true
        },
        homeCode: {
          type: Sequelize.STRING(10),
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      console.log('Users table created successfully');
    } catch (error) {
      console.error('Error creating Users table:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.dropTable('Users');
      console.log('Users table dropped successfully');
    } catch (error) {
      console.error('Error dropping Users table:', error);
      throw error;
    }
  }
};
