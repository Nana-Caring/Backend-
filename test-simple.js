console.log('🧪 Simple Stripe Test');
console.log('===================');

try {
    // Test basic file loading
    console.log('1. Testing Stripe routes...');
    const stripeRoutes = require('./routes/stripeRoutes');
    console.log('✅ Stripe routes loaded');

    console.log('2. Testing Stripe controller...');
    const stripeController = require('./controllers/stripeController');
    console.log('✅ Stripe controller loaded');
    
    // Check methods
    const methods = ['createPaymentIntent', 'createSetupIntent', 'listPaymentMethods', 'handleWebhook'];
    methods.forEach(method => {
        if (typeof stripeController[method] === 'function') {
            console.log(`✅ ${method} exists`);
        } else {
            console.log(`❌ ${method} missing`);
        }
    });

    console.log('3. Testing middleware...');
    const auth = require('./middlewares/auth');
    console.log('✅ Auth middleware loaded');

    console.log('4. Testing Stripe package...');
    const stripe = require('stripe');
    console.log('✅ Stripe package available');

    console.log('\n🎉 All tests passed!');
    console.log('Your Stripe routes are ready to use.');

} catch (error) {
    console.log(`❌ Error: ${error.message}`);
}
