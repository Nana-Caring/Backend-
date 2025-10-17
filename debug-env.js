require('dotenv').config();

console.log('🔍 Environment Variables Check:');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test the URL generation logic
const frontendUrl = (process.env.FRONTEND_URL || 'https://password-reset-29wr.onrender.com/').replace(/\/$/, '');
console.log('Generated frontendUrl:', frontendUrl);

const testToken = 'test123';
const testEmail = 'test@example.com';
const resetUrl = `${frontendUrl}/reset-password?token=${testToken}&email=${encodeURIComponent(testEmail)}`;
console.log('Generated resetUrl:', resetUrl);
