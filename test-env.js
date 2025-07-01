console.log('Test script running...');
require('dotenv').config();
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('Script completed');
