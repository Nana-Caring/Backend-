const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function createRetailerAccount() {
  try {
    console.log('🏪 Creating Retailer Account...\n');

    // Create retailer as a funder (for now, since the system only has funder/caregiver roles)
    const retailerData = {
      firstName: 'Store',
      surname: 'Retailer',
      email: 'retailer@store.com',
      password: 'Retailer123!',
      role: 'funder', // Using funder role for retailer access
      Idnumber: '9901011234567' // Fake ID for testing
    };

    console.log('📝 Registering retailer account...');
    const response = await axios.post(`${BASE_URL}/auth/register`, retailerData);
    
    if (response.data.user) {
      console.log('✅ Retailer account created successfully!');
      console.log(`\n📌 Retailer Login Credentials:`);
      console.log(`   Email: ${retailerData.email}`);
      console.log(`   Password: ${retailerData.password}`);
      console.log(`   User ID: ${response.data.user.id}`);
      console.log(`\nYou can now use these credentials in the POS terminal simulator.`);
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Retailer account already exists!');
      console.log(`\n📌 Retailer Login Credentials:`);
      console.log(`   Email: retailer@store.com`);
      console.log(`   Password: Retailer123!`);
    } else {
      console.error('❌ Error creating retailer account:', error.response?.data?.message || error.message);
    }
  }
}

createRetailerAccount();
