const Account = require('../models/Account');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
    try{


        const { account_number, amount } = req.body;

        if(!account_number || !amount){
            return res.status(400),json({ message: 'Account number and amount are required.' });
        }
    
        if( amount < 2000){
            return res.status(400).json({message: 'The minimum amount you can send is R20.00'});
        }
    
    

    //payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'ZAR',
        metadata: {
            account_number: account_number,
        },
        payment_method_types: ['card'],
        description: 'Payment for account number: ' + account_number,
        
    });
    res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        message: 'Payment intent created successfully',

    });

}catch(error){
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
}

   

};

// Handle Stripe Webhooks
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: R{err.message}`);
    }

    // Handling successful payment intent
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const accountNumber = paymentIntent.metadata.account_number;
        const amount = paymentIntent.amount / 100; // Convert cents to ZAR

        try {
            // Update the account balance in the database
            const account = await Account.findOne({ where: { accountNumber } });

            if (!account) {
                console.error(`Account ${accountNumber} not found.`);
                return res.status(404).end();
            }

            account.balance += amount;
            await account.save();

            console.log(`Payment succeeded for account: R{accountNumber}, Amount: R{amount}`);
        } catch (err) {
            console.error('Database error:', err.message);
        }
    }

    res.status(200).end();
};

module.exports = { createPaymentIntent, handleWebhook };