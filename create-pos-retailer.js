#!/usr/bin/env node

require('dotenv').config();
const bcrypt = require('bcryptjs');
const models = require('./models');
const { sequelize, User } = models;

async function createRetailer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = process.env.RETAILER_ADMIN_EMAIL || 'retailer_admin@clicksstore.com';
    const password = process.env.RETAILER_ADMIN_PASSWORD || 'retailer_admin2025';
    const firstName = 'Clicks';
    const surname = 'Retailer Store';

    // Check if retailer already exists
    let retailer = await User.findOne({ where: { email } });

    if (retailer) {
      console.log(`✅ Retailer already exists: ${email}`);
      console.log(`   ID: ${retailer.id}`);
      console.log(`   Role: ${retailer.role}`);
      return;
    }

    // Create retailer user
    const hashedPassword = await bcrypt.hash(password, 10);

    retailer = await User.create({
      firstName,
      surname,
      email,
      password: hashedPassword,
      role: 'retailer', // Use retailer role for POS staff
      Idnumber: '8012011234567', // Valid 13-digit retailer ID
      phoneNumber: null,
      postalAddressLine1: null,
      postalAddressLine2: null,
      postalCity: null,
      postalProvince: null,
      postalCode: null,
      homeAddressLine1: null,
      homeAddressLine2: null,
      homeCity: null,
      homeProvince: null,
      homeCode: null
    });

    console.log('✅ Retailer account created successfully!');
    console.log(`\n📝 Retailer Details:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${firstName} ${surname}`);
    console.log(`   Role: retailer`);
    console.log(`   User ID: ${retailer.id}`);
    console.log(`\n✨ Ready to use with POS Terminal!\n`);

  } catch (error) {
    console.error('❌ Error creating retailer:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`   - ${err.message}`);
      });
    }
  } finally {
    await sequelize.close();
  }
}

createRetailer();
