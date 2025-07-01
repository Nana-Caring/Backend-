'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if profile fields already exist, if so skip this migration
      const tableDescription = await queryInterface.describeTable('Users');
      
      if (tableDescription.phoneNumber) {
        console.log('Profile fields already exist, skipping migration');
        return;
      }

      // Add phone number field for South African numbers
      await queryInterface.addColumn('Users', 'phoneNumber', {
        type: Sequelize.STRING(15),
        allowNull: true,
        validate: {
          is: /^(\+27|0)[0-9]{9}$/ // South African phone number format
        }
      });

      // Add postal address fields
      await queryInterface.addColumn('Users', 'postalAddressLine1', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'postalAddressLine2', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'postalCity', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'postalProvince', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'postalCode', {
        type: Sequelize.STRING(10),
        allowNull: true
      });

      // Add home address fields
      await queryInterface.addColumn('Users', 'homeAddressLine1', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'homeAddressLine2', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'homeCity', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'homeProvince', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.addColumn('Users', 'homeCode', {
        type: Sequelize.STRING(10),
        allowNull: true
      });
    } catch (error) {
      console.error('Migration error:', error);
      // Don't throw error if columns already exist
      if (error.message && error.message.includes('already exists')) {
        console.log('Columns already exist, skipping...');
        return;
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove phone number field
    await queryInterface.removeColumn('Users', 'phoneNumber');

    // Remove postal address fields
    await queryInterface.removeColumn('Users', 'postalAddressLine1');
    await queryInterface.removeColumn('Users', 'postalAddressLine2');
    await queryInterface.removeColumn('Users', 'postalCity');
    await queryInterface.removeColumn('Users', 'postalProvince');
    await queryInterface.removeColumn('Users', 'postalCode');

    // Remove home address fields
    await queryInterface.removeColumn('Users', 'homeAddressLine1');
    await queryInterface.removeColumn('Users', 'homeAddressLine2');
    await queryInterface.removeColumn('Users', 'homeCity');
    await queryInterface.removeColumn('Users', 'homeProvince');
    await queryInterface.removeColumn('Users', 'homeCode');
  }
};
